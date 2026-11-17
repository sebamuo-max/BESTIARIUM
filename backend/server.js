const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'creatures.json');

app.use(cors({ origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : true }));
app.use(express.json());

async function readCreatures() {
  const content = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(content);
}
async function saveCreatures(creatures) {
  await fs.writeFile(DATA_FILE, JSON.stringify(creatures, null, 2), 'utf8');
}

app.get('/', (req, res) => res.json({ message: 'API del Bestiario funcionando', endpoints: ['/api/creatures', '/api/categories'] }));
app.get('/api/creatures', async (req, res) => {
  try {
    let creatures = await readCreatures();
    const { search, category } = req.query;
    if (search) {
      const term = search.toLowerCase();
      creatures = creatures.filter(c => `${c.name} ${c.description} ${c.region}`.toLowerCase().includes(term));
    }
    if (category && category !== 'Todas') creatures = creatures.filter(c => c.category === category);
    res.json(creatures);
  } catch (error) { res.status(500).json({ error: 'No se pudieron consultar las criaturas.' }); }
});
app.get('/api/creatures/:id', async (req, res) => {
  try {
    const creature = (await readCreatures()).find(c => c.id === Number(req.params.id));
    if (!creature) return res.status(404).json({ error: 'Criatura no encontrada.' });
    res.json(creature);
  } catch (error) { res.status(500).json({ error: 'Error al consultar la criatura.' }); }
});
app.get('/api/categories', async (req, res) => {
  try { res.json([...new Set((await readCreatures()).map(c => c.category))]); }
  catch (error) { res.status(500).json({ error: 'No se pudieron consultar las categorias.' }); }
});
app.post('/api/creatures', async (req, res) => {
  try {
    const { name, category, danger, region, description } = req.body;
    if (![name, category, danger, region, description].every(v => typeof v === 'string' && v.trim())) {
      return res.status(400).json({ error: 'Nombre, categoria, peligro, region y descripcion son obligatorios.' });
    }
    const creatures = await readCreatures();
    const creature = {
      id: Date.now(), name: name.trim(), category: category.trim(), danger: danger.trim(),
      region: region.trim(), description: description.trim(),
      abilities: Array.isArray(req.body.abilities) ? req.body.abilities.filter(a => typeof a === 'string').slice(0, 5) : [],
      color: /^#[0-9a-fA-F]{6}$/.test(req.body.color) ? req.body.color : '#c49a5a',
      symbol: typeof req.body.symbol === 'string' ? req.body.symbol.slice(0, 3) : '✧'
    };
    creatures.push(creature);
    await saveCreatures(creatures);
    res.status(201).json({ message: 'Criatura registrada correctamente.', creature });
  } catch (error) { res.status(500).json({ error: 'No se pudo guardar la criatura.' }); }
});
app.put('/api/creatures/:id', async (req, res) => {
  try {
    const creatures = await readCreatures();
    const index = creatures.findIndex(c => c.id === Number(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Criatura no encontrada.' });
    const current = creatures[index];
    const fields = ['name', 'category', 'danger', 'region', 'description'];
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== 'string' || !req.body[field].trim()) return res.status(400).json({ error: `El campo ${field} no puede estar vacio.` });
        current[field] = req.body[field].trim();
      }
    }
    if (Array.isArray(req.body.abilities)) current.abilities = req.body.abilities.filter(a => typeof a === 'string').slice(0, 5);
    if (typeof req.body.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(req.body.color)) current.color = req.body.color;
    if (typeof req.body.symbol === 'string') current.symbol = req.body.symbol.slice(0, 3);
    creatures[index] = current;
    await saveCreatures(creatures);
    res.json({ message: 'Criatura actualizada correctamente.', creature: current });
  } catch (error) { res.status(500).json({ error: 'No se pudo actualizar la criatura.' }); }
});
app.delete('/api/creatures/:id', async (req, res) => {
  try {
    const creatures = await readCreatures();
    const filtered = creatures.filter(c => c.id !== Number(req.params.id));
    if (filtered.length === creatures.length) return res.status(404).json({ error: 'Criatura no encontrada.' });
    await saveCreatures(filtered);
    res.json({ message: 'Criatura eliminada correctamente.' });
  } catch (error) { res.status(500).json({ error: 'No se pudo eliminar la criatura.' }); }
});

app.listen(PORT, () => console.log(`Bestiario API disponible en http://localhost:${PORT}`));
