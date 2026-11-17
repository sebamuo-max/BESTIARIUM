# Bestiario fantastico

Aplicacion web tipo enciclopedia de criaturas fantasticas. Proyecto academico construido con React, Vite, Tailwind CSS, Three.js (React Three Fiber), Node.js y Express.

## Requisitos
- Node.js 20 o superior recomendado
- npm

## Estructura
- `frontend/`: interfaz React, Tailwind y escena 3D.
- `backend/`: API REST Express y almacenamiento JSON persistente.

## Ejecutar localmente
Abre dos terminales desde la carpeta raiz.

Terminal 1:
```bash
cd backend
npm install
npm run dev
```

Terminal 2:
```bash
cd frontend
npm install
npm run dev
```
Abre la URL que indique Vite (normalmente http://localhost:5173).

## API
- `GET /api/creatures`: listar criaturas (acepta `?search=` y `?category=`)
- `GET /api/creatures/:id`: consultar una criatura
- `GET /api/categories`: listar categorias
- `POST /api/creatures`: crear registro
- `PUT /api/creatures/:id`: editar registro
- `DELETE /api/creatures/:id`: eliminar registro

Los datos se guardan en `backend/data/creatures.json`. Para una entrega en produccion, ten en cuenta que algunos servicios de hosting tienen disco efimero: habria que habilitar almacenamiento persistente o conectar una base de datos si el profesor lo exige.

## Publicacion
- Frontend: desplegar `frontend/` en Vercel o Netlify y definir `VITE_API_URL` con la URL publica del backend.
- Backend: desplegar `backend/` en Render u otro servicio Node y configurar `FRONTEND_URL` con el dominio del frontend.

## Nota sobre Three.js
La escena 3D usa geometria procedural sencilla (icosaedros), luces, particulas y controles de orbita. No requiere modelar criaturas. El usuario puede interactuar con el objeto arrastrando el mouse o el dedo.
