// app.js
const express = require('express');
const path = require('path');

const indexRouter = require('./routes/index');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/', indexRouter);

// 404 simple en JSON
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Manejador de errores simple
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

module.exports = app;