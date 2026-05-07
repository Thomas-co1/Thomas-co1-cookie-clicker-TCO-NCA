var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var db = require('../db');

/* GET registration page */
router.get('/register', function (req, res) {
  res.render('register', { title: 'Inscription', error: null });
});

/* POST registration */
router.post('/register', function (req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.render('register', { title: 'Inscription', error: 'Veuillez remplir tous les champs.' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    stmt.run(username, hashedPassword);
    res.redirect('/users/login');
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.render('register', { title: 'Inscription', error: 'Ce nom d\'utilisateur est déjà pris.' });
    }
    res.render('register', { title: 'Inscription', error: 'Une erreur est survenue.' });
  }
});
/* GET login page */
router.get('/login', function (req, res) {
  res.render('login', { title: 'Connexion', error: null });
});

/* POST login */
router.post('/login', function (req, res) {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.userId = user.id;
    req.session.username = user.username;
    res.redirect('/');
  } else {
    res.render('login', { title: 'Connexion', error: 'Identifiants invalides.' });
  }
});


/* POST logout */
router.post('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});

/* POST update score */
router.post('/score', function (req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const { score, cookiesPerSecond, upgrades } = req.body;
  try {
    const stmt = db.prepare('UPDATE users SET score = ?, cookies_per_second = ?, upgrades = ? WHERE id = ?');
    stmt.run(score, cookiesPerSecond || 0, JSON.stringify(upgrades || {}), req.session.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
  }
});

/* GET current score */
router.get('/score', function (req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const user = db.prepare('SELECT score, cookies_per_second, upgrades FROM users WHERE id = ?').get(req.session.userId);
  res.json({ 
    score: user ? user.score : 0,
    cookiesPerSecond: user ? user.cookies_per_second : 0,
    upgrades: user ? JSON.parse(user.upgrades || '{}') : {}
  });
});


module.exports = router;
