require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Load users
let users = [];
try { users = JSON.parse(fs.readFileSync('users.json','utf8')); } 
catch(e){ console.log('No users.json found'); }

// Load cards
let cards = [];
try { cards = JSON.parse(fs.readFileSync('cards.json','utf8')); } 
catch(e){ console.log('No cards.json found'); }

// Load transactions
let transactions = [];
try { transactions = JSON.parse(fs.readFileSync('transactions.json','utf8')); } 
catch(e){ console.log('No transactions.json found'); }

// Save helpers
function saveUsers(){ fs.writeFileSync('users.json', JSON.stringify(users,null,2)); }
function saveCards(){ fs.writeFileSync('cards.json', JSON.stringify(cards,null,2)); }
function saveTransactions(){ fs.writeFileSync('transactions.json', JSON.stringify(transactions,null,2)); }

// Auth middleware
function ensureAuth(req,res,next){
  if(req.session && req.session.user) return next();
  res.status(401).send({error:'Not logged in'});
}

// Login
app.post('/login', (req,res)=>{
  const {username,password} = req.body;
  const user = users.find(u=>u.username===username && u.password===password);
  if(user){
    req.session.user = { username:user.username, isAdmin:user.isAdmin||false };
    res.redirect('/dashboard.html');
  } else res.status(401).send('Invalid credentials');
});

// Logout
app.post('/logout', (req,res)=>{
  req.session.destroy(()=>res.redirect('/'));
});

// Current user
app.get('/api/me', ensureAuth, (req,res)=>{
  const user = users.find(u=>u.username===req.session.user.username);
  res.json({ username:user.username, balance:user.balance||0, isAdmin:user.isAdmin||false });
});

// Admin: all users
app.get('/api/users', ensureAuth, (req,res)=>{
  if(!req.session.user.isAdmin) return res.status(403).send({error:'Forbidden'});
  res.json(users.map(u=>({username:u.username,balance:u.balance||0})));
});

// Transfer money
app.post('/api/transfer', ensureAuth, (req,res)=>{
  const fromUser = users.find(u=>u.username===req.session.user.username);
  const {toUsername, iban, amount, reason} = req.body;
  if(!toUsername || !amount || !reason) return res.json({success:false,error:'Missing fields'});

  const toUser = users.find(u=>u.username===toUsername);
  if(!toUser) return res.json({success:false,error:'User not found'});
  if((fromUser.balance||0)<amount) return res.json({success:false,error:'Insufficient balance'});

  fromUser.balance -= amount;
  toUser.balance = (toUser.balance||0)+amount;

  // Save transaction
  transactions.push({
    from: fromUser.username,
    to: toUser.username,
    iban,
    amount,
    reason,
    date: new Date().toISOString()
  });
  saveUsers();
  saveTransactions();
  res.json({success:true});
});

// Transfer to IBAN only
app.post('/api/iban', ensureAuth, (req,res)=>{
  const fromUser = users.find(u=>u.username===req.session.user.username);
  const {iban, amount, reason} = req.body;
  if(!iban || !amount || !reason) return res.json({success:false,error:'Missing fields'});
  if((fromUser.balance||0)<amount) return res.json({success:false,error:'Insufficient balance'});

  fromUser.balance -= amount;
  transactions.push({
    from: fromUser.username,
    to: iban,
    amount,
    reason,
    date: new Date().toISOString()
  });
  saveUsers();
  saveTransactions();
  res.json({success:true});
});

// Virtual cards
app.get('/api/cards', ensureAuth, (req,res)=>{
  const userCards = cards.filter(c=>c.owner===req.session.user.username);
  res.json(userCards);
});

app.post('/api/cards', ensureAuth, (req,res)=>{
  const userCards = cards.filter(c=>c.owner===req.session.user.username);
  if(userCards.length>=3) return res.json({success:false,error:'Max 3 cards allowed'});
  const cardNumber = 'VC'+Math.floor(Math.random()*1000000);
  const card = { owner:req.session.user.username, cardNumber, balance:0 };
  cards.push(card);
  saveCards();
  res.json({success:true, card});
});

// Get transactions
app.get('/api/transactions', ensureAuth, (req,res)=>{
  const user = req.session.user;
  if(user.isAdmin) res.json(transactions);
  else {
    const userTx = transactions.filter(t=>t.from===user.username || t.to===user.username);
    res.json(userTx);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`Transfer app listening on port ${PORT}`));
