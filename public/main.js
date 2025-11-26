async function loadDashboard(){
  const r = await fetch('/api/me',{credentials:'same-origin'});
  const user = await r.json();
  document.getElementById('balance').textContent = `$${user.balance}`;
  if(user.isAdmin){
    const usersRes = await fetch('/api/users',{credentials:'same-origin'});
    if(usersRes.ok){
      const usersList = await usersRes.json();
      document.getElementById('adminSection').style.display='block';
      const ul = document.getElementById('userList'); ul.innerHTML='';
      usersList.forEach(u=>{ 
        const li=document.createElement('li'); 
        li.textContent=`${u.username}: $${u.balance}`; 
        ul.appendChild(li);
      });
    }
  }

  // Virtual cards
  const cardsRes = await fetch('/api/cards',{credentials:'same-origin'});
  const cards = await cardsRes.json();
  const cardList = document.getElementById('cardList');
  cardList.innerHTML = '';
  cards.forEach(c => {
  const div = document.createElement('div');
  div.className = 'real-card';

  div.innerHTML = `
    <div class="card-chip"></div>

    <div class="card-number">
      ${c.cardNumber.replace(/(.{4})/g, "$1 ")}
    </div>

    <div class="card-info-row">
      <div>
        <div class="card-label">VALID THRU</div>
        <div>${c.expiry}</div>
      </div>
      <div>
        <div class="card-label">CVV</div>
        <div>${c.cvv}</div>
      </div>
    </div>

    <div class="card-info-row">
      <div class="card-label">BALANCE</div>
      <div>$${c.balance}</div>
    </div>

    <div class="card-logo">TransferCard</div>
  `;

  cardList.appendChild(div);
});


  // Transactions
  const txnsRes = await fetch('/api/transactions',{credentials:'same-origin'});
  const txns = await txnsRes.json();
  const ulTxns = document.getElementById('txnList'); ulTxns.innerHTML='';
  txns.forEach(t=>{
    const li = document.createElement('li');
    li.textContent = `${t.date.split('T')[0]} | From: ${t.from} To: ${t.to} | $${t.amount} | Reason: ${t.reason}`;
    ulTxns.appendChild(li);
  });
}

document.getElementById('sendForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const form = e.target;
  const res = await fetch('/api/transfer',{
    method:'POST',
    credentials:'same-origin',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      toUsername: form.username.value,
      iban: form.iban.value,
      amount: parseFloat(form.amount.value),
      reason: form.reason.value
    })
  });
  const data = await res.json();
  if(data.success) alert('Transfer successful'); else alert('Error: '+data.error);
  loadDashboard();
});

document.getElementById('createCardBtn').addEventListener('click',async ()=>{
  const res = await fetch('/api/cards',{method:'POST',credentials:'same-origin'});
  const data = await res.json();
  if(data.success) alert('Card created: '+data.card.cardNumber); else alert('Error: '+data.error);
  loadDashboard();
});

loadDashboard();

