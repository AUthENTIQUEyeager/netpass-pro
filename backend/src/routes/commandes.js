const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { PrismaClient } = require('@prisma/client');
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

    // Vérifier que le forfait existe et est actif
    const forfait = await prisma.forfait.findUnique({
      where: { id: forfait_id, actif: true }
    });
    if (!forfait) {
      return res.status(404).json({ error: 'Forfait introuvable ou inactif' });
    }

    // Vérifier que le routeur existe et est actif
    const routeur = await prisma.routeur.findUnique({
      where: { id: routeur_id }
    });
    if (!routeur) {
      return res.status(404).json({ error: 'Site WiFi introuvable' });
    }
    if (routeur.statut === 'hors_ligne') {
      return res.status(503).json({ error: 'Ce réseau WiFi est temporairement indisponible' });
    }

    // Créer la commande en base
    const commande = await prisma.commande.create({
      data: {
        forfait_id,
        routeur_id,
        montant: forfait.prix,
        statut: 'en_attente',
        client_tel: client_tel || null
      }
    });

    // Créer le lien de paiement Wave
    const waveSession = await createCheckoutSession({
      amount: forfait.prix,
      commande_id: commande.id,
      forfait_nom: forfait.nom
    });

    res.json({
      commande_id: commande.id,
      checkout_url: waveSession.checkout_url,
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
