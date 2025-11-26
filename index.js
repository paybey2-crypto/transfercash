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

// SIMPLE SESSION
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change_me',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);

// LOAD USERS
let users = [];
try {
  users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));
} catch (err) {
  console.log("users.json missing — creating new.");
  fs.writeFileSync('users.json', '[]');
  users = [];
}

// LOAD CARDS
let cards = [];
try {
  cards = JSON.parse(fs.readFileSync('cards.json', 'utf-8'));
} catch (err) {
  console.log("cards.json missing — creating new.");
  fs.writeFileSync('cards.json', '[]');
  cards = [];
}

// LOAD TRANSACTIONS
let transactions = [];
try {
  transactions = JSON.parse(fs.readFileSync('transactions.json', 'utf-8'));
} catch (err) {
  console.log("transactions.json missing — creating new.");
  fs.writeFileSync('transactions.json', '[]');
  transactions = [];
}

// AUTH MIDDLEWARE
function ensureAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  return res.redirect('/login.html');
}

// SERVE PUBLIC
app.use(express.static(path.join(__dirname, 'public')));

// ROOT → LOGIN
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// LOGIN
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const found = users.find(u => u.username === username && u.password === password);
  if (!found) {
    return res.send("Invalid credentials. <a href='/login.html'>Back</a>");
  }

  req.session.authenticated = true;
  req.session.user = found;
  res.redirect('/dashboard.html');
});

// GET USER DATA
app.get('/api/me', ensureAuth, (req, res) => {
  res.json({
    username: req.session.user.username,
    balance: req.session.user.balance
  });
});

// SEND MONEY TO USER
app.post('/api/send-user', ensureAuth, (req, res) => {
  const { recipient, amount, reason } = req.body;

  const sender = users.find(u => u.username === req.session.user.username);
  const receiver = users.find(u => u.username === recipient);

  if (!receiver) {
    return res.json({ error: "User not found" });
  }

  if (sender.balance < amount) {
    return res.json({ error: "Insufficient funds" });
  }

  sender.balance -= Number(amount);
  receiver.balance += Number(amount);

  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));

  transactions.push({
    type: "user-transfer",
    from: sender.username,
    to: receiver.username,
    amount,
    reason,
    date: new Date()
  });

  fs.writeFileSync('transactions.json', JSON.stringify(transactions, null, 2));

  res.json({ success: true });
});

// SEND MONEY TO IBAN
app.post('/api/send-iban', ensureAuth, (req, res) => {
  const { iban, amount, reason } = req.body;

  const sender = users.find(u => u.username === req.session.user.username);

  if (sender.balance < amount) {
    return res.json({ error: "Insufficient funds" });
  }

  sender.balance -= Number(amount);

  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));

  transactions.push({
    type: "iban-transfer",
    from: sender.username,
    iban,
    amount,
    reason,
    date: new Date()
  });

  fs.writeFileSync('transactions.json', JSON.stringify(transactions, null, 2));

  res.json({ success: true });
});

// CREATE VIRTUAL CARD
app.post('/api/create-card', ensureAuth, (req, res) => {
  const username = req.session.user.username;

  const userCards = cards.filter(c => c.username === username);
  if (userCards.length >= 3) {
    return res.json({ error: "You already have 3 cards" });
  }

  const card = {
    id: Date.now(),
    username,
    cardNumber: 4000 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)},
    cvv: ${Math.floor(100 + Math.random() * 900)},
    expiry: 0${Math.floor(1 + Math.random() * 8)}/${25 + Math.floor(Math.random() * 5)},
    created: new Date()
  };

  cards.push(card);
  fs.writeFileSync('cards.json', JSON.stringify(cards, null, 2));

  res.json({ success: true, card });
});

// GET USER CARDS
app.get('/api/cards', ensureAuth, (req, res) => {
  const username = req.session.user.username;
  res.json(cards.filter(c => c.username === username));
});

// LOGOUT
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// SERVER START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(Transfer app running on port ${PORT});
});
