require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const helmet = require('helmet');
const fs = require('fs');

const app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, sameSite: 'lax' }
}));

// Load users
let users = [];
try {
  users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8'));
} catch (err) {
  console.error('Error loading users.json:', err);
}

// Auth middleware
function ensureAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  return res.redirect('/?next=' + encodeURIComponent(req.originalUrl));
}

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const next = req.query.next || '/dashboard.html';

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.authenticated = true;
    req.session.user = { username: user.username };
    return res.redirect(next);
  }

  return res.status(401).send('Invalid credentials. <a href="/">Back</a>');
});

// Current user
app.get('/api/me', ensureAuth, (req, res) => {
  res.json({ username: req.session.user.username });
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Dashboard
app.get('/dashboard.html', ensureAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Admin: list users
app.get('/api/users', ensureAuth, (req, res) => {
  if (req.session.user.username !== 'admin') return res.status(403).send('Forbidden');

  const list = users.map(u => ({
    username: u.username,
    balance: u.balance,
    cardCount: (u.cards || []).length
  }));

  res.json(list);
});

// Money transfer
app.post('/api/transfer', ensureAuth, (req, res) => {
  const { toUsername, amount } = req.body;
  const sender = users.find(u => u.username === req.session.user.username);
  const receiver = users.find(u => u.username === toUsername);

  if (!sender || !receiver) return res.status(400).send('Invalid user');
  if (sender.balance < amount) return res.status(400).send('Insufficient balance');

  sender.balance -= amount;
  receiver.balance += amount;

  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  res.json({ success: true });
});

// Simulated IBAN transfer
app.post('/api/iban', ensureAuth, (req, res) => {
  const { iban, amount } = req.body;
  const user = users.find(u => u.username === req.session.user.username);

  if (!iban || iban.length < 10) return res.status(400).send('Invalid IBAN');
  if (user.balance < amount) return res.status(400).send('Insufficient balance');

  user.balance -= amount;

  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  res.json({ success: true });
});

// Create virtual card (max 3)
app.post('/api/createCard', ensureAuth, (req, res) => {
  const user = users.find(u => u.username === req.session.user.username);
  if (!user) return res.status(400).send('User not found');

  if (!user.cards) user.cards = [];

  if (user.cards.length >= 3) {
    return res.status(400).send('Maximum number of cards reached (3)');
  }

  const newCard = {
    id: 'card_' + (user.cards.length + 1),
    number: "4111 1111 1111 11" + (10 + user.cards.length), // fake number
    expiry: "12/28",
    cvv: "10" + (user.cards.length + 1)
  };

  user.cards.push(newCard);

  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  res.json({ success: true, card: newCard });
});

// Get user cards
app.get('/api/cards', ensureAuth, (req, res) => {
  const user = users.find(u => u.username === req.session.user.username);
  res.json(user.cards || []);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Transfer app listening on port ${PORT}`);
});
