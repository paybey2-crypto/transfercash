require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const helmet = require('helmet');
const fs = require('fs-extra');

const app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Load or initialize users
let users = [];
try {
  users = fs.readJsonSync('users.json');
} catch (e) {
  users = [
    {username:'admin', password:'admin', balance:1000, isAdmin:true},
    {username:'user1', password:'1234', balance:500}
  ];
  fs.writeJsonSync('users.json', users, {spaces:2});
}

// Load or initialize cards
let cards = [];
try { cards = fs.readJsonSync('cards.json'); } 
catch(e){ fs.writeJsonSync('cards.json', cards); }

// Load or initialize transactions
let transactions = [];
try { transactions = fs.readJsonSync('transactions.json'); } 
catch(e){ fs.writeJsonSync('transactions.json', transactions); }

function saveUsers(){ fs.writeJsonSync('users.json', users,{spaces:2}); }
function saveCards(){ fs.writeJsonSync('cards.json', cards,{spaces:2}); }
function saveTransactions(){ fs.writeJsonSync('transactions.json', transactions,{spaces:2}); }

function ensureAuth(req,res,next){
  if(req.session && req.session.authenticated) return next();
  return res.redirect('/login.html');
}

// Serve static files
app.use(express.static(path.join(__dirname,'public')));
app.get('/', (req,res)=>res.sendFile(path.join(__dirname,'public','login.html')));

// Login
app.post('/login',(req,res)=>{
  const {username,password} = req.body;
  const user = users.find(u=>u.username===username && u.password===password);
  if(user){
    req.session.authenticated = true;
    req.session.user = {username:user.username};
    return res.redirect('/dashboard.html');
  }
  return res.status(401).send('Invalid credentials. <a href="/login.html">Back</a>');
});

// Logout
app.post('/logout',(req,res)=>{
  req.session.destroy(()=>res.redirect('/login.html'));
});

// API: get current user
app.get('/api/me',ensureAuth,(req,res)=>{
  const user = users.find(u=>u.username===req.session.user.username);
  res.json(user);
});

// API: get all users (admin)
app.get('/api/users',ensureAuth,(req,res)=>{
  const currentUser = users.find(u=>u.username===req.session.user.username);
  if(!currentUser.isAdmin) return res.status(403).json({error:'Forbidden'});
  res.json(users);
});

// API: get transactions
app.get('/api/transactions',ensureAuth,(req,res)=>{
  const currentUser = users.find(u=>u.username===req.session.user.username);
  let userTxns = transactions.filter(t=>t.from===currentUser.username || t.to===currentUser.username);
  if(currentUser.isAdmin) userTxns = transactions; // admin sees all
  res.json(userTxns);
});

// API: transfer money
app.post('/api/transfer',ensureAuth,(req,res)=>{
  const {toUsername, iban, amount, reason} = req.body;
  const fromUser = users.find(u=>u.username===req.session.user.username);
  if(!amount || !reason) return res.json({success:false,error:'Missing fields'});
  if((fromUser.balance||0)<amount) return res.json({success:false,error:'Insufficient balance'});

  if(toUsername){
    const toUser = users.find(u=>u.username===toUsername);
    if(!toUser) return res.json({success:false,error:'User not found'});
    toUser.balance += amount;
    transactions.push({from:fromUser.username,to:toUser.username,amount,reason,date:new Date().toISOString()});
  } else if(iban){
    transactions.push({from:fromUser.username,to:iban,amount,reason,date:new Date().toISOString()});
  } else return res.json({success:false,error:'Provide username or IBAN'});

  fromUser.balance -= amount;
  saveUsers();
  saveTransactions();
  res.json({success:true});
});

// API: get/create virtual cards
app.get('/api/cards',ensureAuth,(req,res)=>{
  const userCards = cards.filter(c=>c.owner===req.session.user.username);
  res.json(userCards);
});

app.post('/api/cards',ensureAuth,(req,res)=>{
  const userCards = cards.filter(c=>c.owner===req.session.user.username);
  if(userCards.length>=3) return res.json({success:false,error:'Max 3 cards'});
  
  const newCard = {
    owner: req.session.user.username,
    cardNumber: 4000 ${Math.floor(1000+Math.random()*9000)} ${Math.floor(1000+Math.random()*9000)} ${Math.floor(1000+Math.random()*9000)},
    cvv: Math.floor(100+Math.random()*900),
    expire: ${Math.floor(1+Math.random()*12).toString().padStart(2,'0')}/${Math.floor(25+Math.random()*5)},
    balance: 0
  };
  cards.push(newCard);
  saveCards();
  res.json({success:true,card:newCard});
});

const PORT = process.env.PORT||3000;
app.listen(PORT,()=>console.log(Transfer app listening on port ${PORT}));
