const express = require('express');
const forfaitsRouter = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth');
const prisma = new PrismaClient();

forfaitsRouter.get('/', async (req, res) => {
  const forfaits = await prisma.forfait.findMany({
    where: { actif: true },
    orderBy: { prix: 'asc' }
  });
  res.json(forfaits);
});

forfaitsRouter.post('/', auth, async (req, res) => {
  try {
    const { nom, duree_heures, prix, vitesse, description, wave_link } = req.body;
    const forfait = await prisma.forfait.create({
      data: { nom, duree_heures: parseInt(duree_heures), prix: parseInt(prix), vitesse, description, wave_link: wave_link || null }
    });
    res.json(forfait);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

forfaitsRouter.put('/:id', auth, async (req, res) => {
  try {
    const { nom, duree_heures, prix, vitesse, description, wave_link, actif } = req.body;
    const data = {};
    if (nom !== undefined) data.nom = nom;
    if (duree_heures !== undefined) data.duree_heures = parseInt(duree_heures);
    if (prix !== undefined) data.prix = parseInt(prix);
    if (vitesse !== undefined) data.vitesse = vitesse;
    if (description !== undefined) data.description = description;
    if (wave_link !== undefined) data.wave_link = wave_link || null;
    if (actif !== undefined) data.actif = actif;
    const forfait = await prisma.forfait.update({ where: { id: req.params.id }, data });
    res.json(forfait);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

forfaitsRouter.delete('/:id', auth, async (req, res) => {
  await prisma.forfait.update({ where: { id: req.params.id }, data: { actif: false } });
  res.json({ message: 'Forfait désactivé' });
});

module.exports = forfaitsRouter;
