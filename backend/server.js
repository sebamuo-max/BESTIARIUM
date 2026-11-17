
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : true
}));

app.use(express.json());

// Normalizar el ID para conservar el formato numerico
function normalizeCreature(creature) {
  return {
    ...creature,
    id: Number(creature.id)
  };
}

// Comprobar la conexion
app.get('/', (req, res) => {
  res.json({
    message: 'API del Bestiario funcionando con PostgreSQL',
    database: 'Neon',
    endpoints: [
      '/api/creatures',
      '/api/categories'
    ]
  });
});
// PRUEBA TEMPORAL DE CONEXION CON NEON
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT current_database(), current_user, NOW()'
    );

    res.json({
      connection: 'OK',
      database: result.rows[0].current_database,
      user: result.rows[0].current_user,
      time: result.rows[0].now
    });

  } catch (error) {
    console.error('ERROR DE CONEXION CON NEON:', error);

    res.status(500).json({
      connection: 'ERROR',
      message: error.message,
      code: error.code
    });
  }
});

// CONSULTAR TODAS LAS CRIATURAS
app.get('/api/creatures', async (req, res) => {
  try {
    const { search, category } = req.query;

    let sql = 'SELECT * FROM creatures WHERE 1=1';
    const values = [];

    if (search) {
      values.push(`%${search.toLowerCase()}%`);
      sql += ` AND LOWER(name || ' ' || description || ' ' || region) LIKE $${values.length}`;
    }

    if (category && category !== 'Todas') {
      values.push(category);
      sql += ` AND category = $${values.length}`;
    }

    sql += ' ORDER BY id ASC';

    const result = await pool.query(sql);

    res.json(result.rows.map(normalizeCreature));

  } catch (error) {
    console.error('Error consultando criaturas:', error);
    res.status(500).json({
      error: 'No se pudieron consultar las criaturas.'
    });
  }
});

// CONSULTAR UNA CRIATURA POR ID
app.get('/api/creatures/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'Identificador no valido.'
      });
    }

    const result = await pool.query(
      'SELECT * FROM creatures WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Criatura no encontrada.'
      });
    }

    res.json(normalizeCreature(result.rows[0]));

  } catch (error) {
    console.error('Error consultando criatura:', error);
    res.status(500).json({
      error: 'Error al consultar la criatura.'
    });
  }
});

// CONSULTAR CATEGORIAS
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT category FROM creatures ORDER BY category ASC'
    );

    res.json(result.rows.map(row => row.category));

  } catch (error) {
    console.error('Error consultando categorias:', error);
    res.status(500).json({
      error: 'No se pudieron consultar las categorias.'
    });
  }
});

// REGISTRAR UNA CRIATURA
app.post('/api/creatures', async (req, res) => {
  try {
    const {
      name,
      category,
      danger,
      region,
      description
    } = req.body;

    if (![name, category, danger, region, description].every(
      value => typeof value === 'string' && value.trim()
    )) {
      return res.status(400).json({
        error: 'Nombre, categoria, peligro, region y descripcion son obligatorios.'
      });
    }

    const abilities = Array.isArray(req.body.abilities)
      ? req.body.abilities
          .filter(a => typeof a === 'string')
          .slice(0, 5)
      : [];

    const color = /^#[0-9a-fA-F]{6}$/.test(req.body.color)
      ? req.body.color
      : '#c49a5a';

    const symbol = typeof req.body.symbol === 'string'
      ? req.body.symbol.slice(0, 3)
      : '✧';

    const result = await pool.query(
  `INSERT INTO creatures
  (name, category, danger, region, description, abilities, color, symbol)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *`,
  [
    name.trim(),
    category.trim(),
    danger.trim(),
    region.trim(),
    description.trim(),
    JSON.stringify(abilities),
    color,
    symbol
  ]
);

    res.status(201).json({
      message: 'Criatura registrada correctamente.',
      creature: normalizeCreature(result.rows[0])
    });

  } catch (error) {
    console.error('Error registrando criatura:', error);
    res.status(500).json({
      error: 'No se pudo guardar la criatura.'
    });
  }
});

// ACTUALIZAR UNA CRIATURA
app.put('/api/creatures/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'Identificador no valido.'
      });
    }

    const fields = [
      'name',
      'category',
      'danger',
      'region',
      'description'
    ];

    const updates = [];
    const values = [];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        if (
          typeof req.body[field] !== 'string' ||
          !req.body[field].trim()
        ) {
          return res.status(400).json({
            error: `El campo ${field} no puede estar vacio.`
          });
        }

        values.push(req.body[field].trim());
        updates.push(`${field} = $${values.length}`);
      }
    }

    if (req.body.abilities !== undefined) {
      if (!Array.isArray(req.body.abilities)) {
        return res.status(400).json({
          error: 'Las habilidades deben enviarse como una lista.'
        });
      }

      const abilities = req.body.abilities
        .filter(a => typeof a === 'string')
        .slice(0, 5);

      values.push(JSON.stringify(abilities));
      updates.push(`abilities = $${values.length}`);
    }

    if (req.body.color !== undefined) {
      if (
        typeof req.body.color !== 'string' ||
        !/^#[0-9a-fA-F]{6}$/.test(req.body.color)
      ) {
        return res.status(400).json({
          error: 'El color no tiene un formato valido.'
        });
      }

      values.push(req.body.color);
      updates.push(`color = $${values.length}`);
    }

    if (req.body.symbol !== undefined) {
      if (typeof req.body.symbol !== 'string') {
        return res.status(400).json({
          error: 'El simbolo no es valido.'
        });
      }

      values.push(req.body.symbol.slice(0, 3));
      updates.push(`symbol = $${values.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No se enviaron campos para actualizar.'
      });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE creatures
       SET ${updates.join(', ')}
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Criatura no encontrada.'
      });
    }

    res.json({
      message: 'Criatura actualizada correctamente.',
      creature: normalizeCreature(result.rows[0])
    });

  } catch (error) {
    console.error('Error actualizando criatura:', error);
    res.status(500).json({
      error: 'No se pudo actualizar la criatura.'
    });
  }
});

// ELIMINAR UNA CRIATURA
app.delete('/api/creatures/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'Identificador no valido.'
      });
    }

    const result = await pool.query(
      'DELETE FROM creatures WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Criatura no encontrada.'
      });
    }

    res.json({
      message: 'Criatura eliminada correctamente.'
    });

  } catch (error) {
    console.error('Error eliminando criatura:', error);
    res.status(500).json({
      error: 'No se pudo eliminar la criatura.'
    });
  }
});

// INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`Bestiarium API disponible en http://localhost:${PORT}`);
});
