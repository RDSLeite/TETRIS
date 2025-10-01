// routes/scores.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET todas as scores
router.get('/', (req, res) => {
  db.query('SELECT * FROM scores', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// GET scores por ID
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM scores WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results[0]);
  });
});

// Filtrar o scores por game 
router.get('/bygame/:game', (req, res) => {
  db.query('SELECT * FROM scores WHERE game = ?', [req.params.game], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


// POST criar scores
router.post('/', (req, res) => {
  const { datascore, nickname, score, game} = req.body;
  db.query('INSERT INTO scores ( datascore, nickname, score, game) VALUES (?, ? , ?, ?)', [ datascore, nickname, score, game], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, datascore, nickname, score, game});
  });
});

// PUT atualizar scores
router.put('/:id', (req, res) => {
  const { datascore, nickname, score, game} = req.body;
  db.query('UPDATE scores SET datascore = ?, nickname = ?, score = ?, game = ? WHERE id = ?', [ datascore, nickname, score, game,req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ id: req.params.id,  datascore, nickname, score, game});
  });
});

// DELETE scores
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM scores WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ status: 'scores removido' });
  });
});

// DELETE Score’s de determinado Game
router.delete('/bygame/:game', (req, res) => {
  db.query('DELETE FROM scores WHERE game = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ status: 'game removido removido' });
  });
});

module.exports = router;