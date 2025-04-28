const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

// Configuración CORS y JSON
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta para servir el HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Ruta del archivo JSON
const DATA_PATH = path.join(__dirname, 'repertorio.json');


app.get('/canciones', (req, res) => {
  try {
    const canciones = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    res.json(canciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer canciones' });
  }
});

app.post('/canciones', (req, res) => {
  try {
    const nuevaCancion = req.body;
    if (!nuevaCancion.titulo || !nuevaCancion.artista || !nuevaCancion.tono) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const canciones = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    canciones.push(nuevaCancion);
    fs.writeFileSync(DATA_PATH, JSON.stringify(canciones, null, 2));
    res.status(201).json({ message: 'Canción agregada!', cancion: nuevaCancion });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar canción' });
  }
});

app.put('/canciones/:id', (req, res) => {
  try {
    const { id } = req.params;
    const cancionActualizada = req.body;
    if (cancionActualizada.id != id) {
      return res.status(400).json({ error: 'ID de URL no coincide con body' });
    }
    let canciones = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    canciones = canciones.map(c => c.id == id ? cancionActualizada : c);
    fs.writeFileSync(DATA_PATH, JSON.stringify(canciones, null, 2));
    res.json({ message: 'Canción actualizada!', cancion: cancionActualizada });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar canción' });
  }
});

app.delete('/canciones/:id', (req, res) => {
  try {
    const { id } = req.params;
    let canciones = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    const inicialLength = canciones.length;
    canciones = canciones.filter(c => c.id != id);
    if (canciones.length === inicialLength) {
      return res.status(404).json({ error: 'Canción no encontrada' });
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(canciones, null, 2));
    res.json({ message: 'Canción eliminada!' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar canción' });
  }
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend y Frontend integrados en http://localhost:${PORT}`);
});