const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth');
const { createCheckoutSession } = require('../services/wave');

const prisma = new PrismaClient();

const commandeSchema = z.object({
  forfait_id: z.string().uuid(),
  routeur_id: z.string().uuid(),
  client_tel: z.string().optional()
});

// ── POST /api/commandes — Créer une commande + lien Wave ──────────────────────
router.post('/', async (req, res) => {
  try {
    const { forfait_id, routeur_id, client_tel } = commandeSchema.parse(req.body);

    const forfait = await prisma.forfait.findUnique({
      where: { id: forfait_id, actif: true }
    });
    if (!forfait) {
      return res.status(404).json({ error: 'Forfait introuvable ou inactif' });
    }

    const routeur = await prisma.routeur.findUnique({ where: { id: routeur_id } });
    if (!routeur) {
      return res.status(404).json({ error: 'Site WiFi introuvable' });
    }
    if (routeur.statut === 'hors_ligne') {
      return res.status(503).json({ error: 'Ce réseau WiFi est temporairement indisponible' });
    }

    const commande = await prisma.commande.create({
      data: {
        forfait_id,
        routeur_id,
        montant: forfait.prix,
        statut: 'en_attente',
        client_tel: client_tel || null
      }
    });

    // Si le forfait a un wave_link direct, on l'utilise (mode simple)
    // Sinon on crée une session Wave dynamique
    let checkout_url = forfait.wave_link || null;

    if (!checkout_url) {
      const waveSession = await createCheckoutSession({
        amount: forfait.prix,
        commande_id: commande.id,
        forfait_nom: forfait.nom
      });
      checkout_url = waveSession.checkout_url;

      await prisma.commande.update({
        where: { id: commande.id },
        data: { wave_checkout_id: waveSession.session_id }
      });
    }

    res.json({
      commande_id: commande.id,
      checkout_url,
      forfait: {
        nom: forfait.nom,
        prix: forfait.prix,
        duree: forfait.duree_heures,
        vitesse: forfait.vitesse
      },
      site: routeur.site
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Données invalides', details: error.errors });
    }
    console.error('[Commande] Erreur:', error.message);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// ── GET /api/commandes/client/:tel — Client vérifie son ticket ────────────────
router.get('/client/:tel', async (req, res) => {
  try {
    const tel = req.params.tel.replace(/\s/g, '');

    const commande = await prisma.commande.findFirst({
      where: {
        client_tel: { contains: tel },
        ticket: { isNot: null }
      },
      include: {
        forfait: { select: { nom: true, duree_heures: true, vitesse: true } },
        routeur: { select: { site: true, nom: true } },
        ticket: {
          select: { username: true, password: true, date_expiration: true, statut: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    if (!commande || !commande.ticket) {
      return res.status(404).json({ error: 'Aucun ticket trouvé pour ce numéro' });
    }

    res.json({
      forfait: commande.forfait.nom,
      vitesse: commande.forfait.vitesse,
      duree: commande.forfait.duree_heures,
      site: commande.routeur.site,
      username: commande.ticket.username,
      password: commande.ticket.password,
      date_expiration: commande.ticket.date_expiration,
      statut: commande.ticket.statut
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── GET /api/commandes — Liste commandes (admin) ───────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const commandes = await prisma.commande.findMany({
      include: {
        forfait: { select: { nom: true, prix: true } },
        routeur: { select: { site: true, nom: true } }
      },
      orderBy: { created_at: 'desc' },
      take: 100
    });
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── GET /api/commandes/:id — Statut d'une commande ───────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const commande = await prisma.commande.findUnique({
      where: { id: req.params.id },
      include: {
        forfait: true,
        routeur: { select: { nom: true, site: true } },
        ticket: true
      }
    });

    if (!commande) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }

    res.json({
      id: commande.id,
      statut: commande.statut,
      montant: commande.montant,
      forfait: commande.forfait,
      site: commande.routeur.site,
      ticket: commande.ticket ? {
        username: commande.ticket.username,
        password: commande.ticket.password,
        date_expiration: commande.ticket.date_expiration,
        statut: commande.ticket.statut
      } : null,
      created_at: commande.created_at
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
