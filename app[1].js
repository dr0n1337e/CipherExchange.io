// Polished brand-safe inspired demo
const BRANDS = ["Chrome Hearts","Rick Owens","Gallery Dept","ERD","Supreme"];
const FEE_BUYER = 0.05;
const FEE_SELLER = 0.05;

const items = [
  { id:"1", title:"Chrome Hearts Hoodie – Cross Patch", brand:"Chrome Hearts", condition:"Like New", size:"L", price:2450, img:"https://images.unsplash.com/photo-1520975777850-7f61d90dddf1?q=80&w=1600&auto=format&fit=crop" },
  { id:"2", title:"Rick Owens Geobasket", brand:"Rick Owens", condition:"Used", size:"42", price:1850, img:"https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop" },
  { id:"3", title:"Gallery Dept Paint-Splatter Tee", brand:"Gallery Dept", condition:"New", size:"M", price:620, img:"https://images.unsplash.com/photo-1520974657285-85f1c3b51c9a?q=80&w=1600&auto=format&fit=crop" },
  { id:"4", title:"ERD Distressed Denim", brand:"ERD", condition:"Like New", size:"32", price:980, img:"https://images.unsplash.com/photo-1503342394121-7a2ae83f1d3f?q=80&w=1600&auto=format&fit=crop" },
  { id:"5", title:"Supreme Box Logo Hoodie FW17", brand:"Supreme", condition:"Used", size:"M", price:1100, img:"https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1600&auto=format&fit=crop" },
];

const state = {
  q:"", brand:"", cond:"", view:"grid",
  wallet: 2500, seller: 0, platform: 0,
  escrow: {}, log: [],
  bids: [1220, 1180, 1120, 1080],
  asks: [1350, 1400, 1490, 1600],
  waitlist: JSON.parse(localStorage.getItem("cx_waitlist")||"[]")
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const fmt = (n) => n.toLocaleString(undefined,{style:"currency",currency:"USD"});
const log = (m) => { state.log.unshift(m); render.log(); };

const ui = {
  setView(v){ state.view = v; $("#tabGrid").classList.toggle("tab--active", v==="grid"); $("#tabList").classList.toggle("tab--active", v==="list"); render.market(); },
  openDeposit(){
    modal.open("Deposit Funds", `<div class='muted small'>Add to your on‑site wallet (simulated)</div>
      <div class='fee'>
        <label class='small muted'>Amount (USD)</label>
        <input id='depAmt' class='input' value='500' />
      </div>`, [{label:"Cancel", ghost:true}, {label:"Deposit", primary:true, onClick:()=>{
        const amt = parseFloat($("#depAmt").value||"0"); if(isNaN(amt)||amt<=0) return;
        state.wallet += amt; render.balances(); log(`Wallet credited ${fmt(amt)}.`); modal.close();
      }}]);
  },
  quickBuy(){ ui.openCheckout("5"); },
  openCheckout(id){
    const it = items.find(x=>x.id===id);
    const buyerFee = it.price * FEE_BUYER;
    const hold = it.price + buyerFee;
    modal.open("Checkout (Escrow)", `
      <div class='fee'>
        <div><small class='muted'>Item</small><strong>${it.title}</strong></div>
        <div><small class='muted'>Price</small><strong>${fmt(it.price)}</strong></div>
        <div><small class='muted'>Buyer fee (${Math.round(FEE_BUYER*100)}%)</small><strong>${fmt(buyerFee)}</strong></div>
        <div><small class='muted'>Held in escrow</small><strong>${fmt(hold)}</strong></div>
        <p class='muted small'>Funds held until signed delivery + buyer confirmation.</p>
      </div>`, [{label:"Cancel", ghost:true}, {label:"Place Order & Hold Funds", primary:true, onClick:()=>actions.buy(id)}]);
  },
  openWaitlist(){
    modal.open("Join Waitlist", `
      <div class='fee'>
        <div><small class='muted'>Email</small><input id='wlEmail' class='input' placeholder='you@example.com'></div>
      </div>
      <p class='muted small'>We’ll notify you when private beta opens.</p>
      <div class='muted small'>Current signups: <strong id='wlCount'>${state.waitlist.length}</strong></div>
    `, [{label:"Cancel", ghost:true}, {label:"Join", primary:true, onClick:()=>{
      const v = ($("#wlEmail").value||"").trim(); if(!v || !v.includes("@")) return;
      state.waitlist.push({email:v, ts:Date.now()});
      localStorage.setItem("cx_waitlist", JSON.stringify(state.waitlist));
      $("#wlCount").textContent = state.waitlist.length;
      render.waitlistTools();
    }}]);
  },
  closeModal(){ modal.close(); }
};
window.ui = ui;

const actions = {
  buy(id){
    const it = items.find(x=>x.id===id);
    const buyerFee = it.price * FEE_BUYER;
    const hold = it.price + buyerFee;
    if (state.wallet < hold){ log(`❌ Purchase failed — need ${fmt(hold - state.wallet)} more.`); modal.close(); return; }
    state.wallet -= hold;
    state.escrow[id] = { amount: it.price, buyerFee, status:"PENDING" };
    log(`🧾 Order placed: ${it.title}. Held ${fmt(hold)} in escrow.`);
    render.balances(); modal.close();
  },
  ship(id){
    const it = items.find(x=>x.id===id);
    if(!state.escrow[id]) return log(`ℹ️ No active escrow for ${it.title}.`);
    state.escrow[id].status="SHIPPED";
    log(`📦 Seller marked SHIPPED with signature required.`);
  },
  deliver(id){
    const it = items.find(x=>x.id===id);
    if(!state.escrow[id]) return log(`ℹ️ No active escrow for ${it.title}.`);
    state.escrow[id].status="DELIVERED";
    log(`✅ Carrier confirms DELIVERED (signature captured).`);
  },
  confirm(id){
    const tx = state.escrow[id]; if(!tx) return log(`ℹ️ No active escrow.`);
    const sellerFee = tx.amount * FEE_SELLER;
    state.seller += (tx.amount - sellerFee);
    state.platform += (tx.buyerFee + sellerFee);
    delete state.escrow[id];
    render.balances();
    log(`🎉 Buyer confirmed. Seller paid ${fmt(tx.amount - sellerFee)}. Platform captured fees.`);
  },
  dispute(id){
    const it = items.find(x=>x.id===id);
    if(!state.escrow[id]) return log(`ℹ️ No active escrow for ${it.title}.`);
    state.escrow[id].status="DISPUTED";
    log(`⚠️ Dispute opened. Funds locked until admin decision.`);
  }
};
window.actions = actions;

const modal = {
  open(title, body, actions){
    $("#modalTitle").textContent = title;
    $("#modalBody").innerHTML = body;
    const foot = $("#modalFoot"); foot.innerHTML = "";
    actions.forEach(a=>{
      const btn = document.createElement("button");
      btn.className = "btn " + (a.primary? "btn--primary":"") + (a.ghost? " btn--ghost": "");
      btn.textContent = a.label;
      btn.onclick = a.onClick || (()=>modal.close());
      foot.appendChild(btn);
    });
    $("#modal").classList.remove("hidden");
    render.waitlistTools();
  },
  close(){ $("#modal").classList.add("hidden"); }
};

const render = {
  feePreview(){
    const n = 1100, bf = n*FEE_BUYER, sf = n*FEE_SELLER;
    $("#feePreview").innerHTML = `
      <div class="fee">
        <div><small class="muted">Item price</small><strong>${fmt(n)}</strong></div>
        <div><small class="muted">Buyer fee (${Math.round(FEE_BUYER*100)}%)</small><strong>${fmt(bf)}</strong></div>
        <div><small class="muted">Held in escrow</small><strong>${fmt(n+bf)}</strong></div>
        <hr><div><small class="muted">Seller receives (after ${Math.round(FEE_SELLER*100)}%)</small><strong>${fmt(n-sf)}</strong></div>
      </div>`;
  },
  balances(){
    $("#walletBal").textContent = fmt(state.wallet);
    $("#balWallet").textContent = fmt(state.wallet);
    $("#balSeller").textContent = fmt(state.seller);
    $("#balPlatform").textContent = fmt(state.platform);
  },
  market(){
    const q = $("#q").value.toLowerCase();
    const brand = $("#brand").value;
    const cond = $("#cond").value;
    const filtered = items.filter(i =>
      (!brand || i.brand===brand) &&
      (!cond || i.condition===cond) &&
      (!q || (i.title+" "+i.brand).toLowerCase().includes(q))
    );
    $("#grid").classList.toggle("hidden", state.view!=="grid");
    $("#list").classList.toggle("hidden", state.view!=="list");

    if (state.view==="grid"){
      const g = $("#grid"); g.innerHTML = "";
      filtered.forEach(i=>{
        const el = document.createElement("div");
        el.className = "tile";
        el.innerHTML = `
          <img src="${i.img}" alt="${i.title}">
          <div class="row"><div><div class="small muted">${i.brand} • ${i.condition}${i.size? " • Size "+i.size:""}</div><strong>${i.title}</strong></div><div class="price">${fmt(i.price)}</div></div>
          <div class="row"><button class="btn btn--primary" data-buy="${i.id}">Buy (Escrow)</button><button class="btn btn--ghost" data-ship="${i.id}">Mark Shipped</button></div>`;
        g.appendChild(el);
      });
    } else {
      const l = $("#list"); l.innerHTML = "";
      const head = document.createElement("div");
      head.className="row--list head";
      head.innerHTML = "<div>Item</div><div>Brand</div><div>Price</div><div>Bid</div><div>Ask</div>";
      l.appendChild(head);
      filtered.forEach(i=>{
        const row = document.createElement("div");
        row.className="row--list";
        const bid = Math.max(...state.bids) || i.price*0.9;
        const ask = Math.min(...state.asks) || i.price*1.1;
        row.innerHTML = `<div>${i.title}</div><div>${i.brand}</div><div>${fmt(i.price)}</div><div>${fmt(bid)}</div><div>${fmt(ask)}</div>`;
        l.appendChild(row);
      });
    }

    $$("[data-buy]").forEach(b => b.onclick = (e)=> ui.openCheckout(e.target.dataset.buy));
    $$("[data-ship]").forEach(b => b.onclick = (e)=> actions.ship(e.target.dataset.ship));
  },
  bidsAsks(){
    $("#bids").innerHTML = state.bids.map(v=>`<div>• ${fmt(v)}</div>`).join("");
    $("#asks").innerHTML = state.asks.map(v=>`<div>• ${fmt(v)}</div>`).join("");
  },
  log(){
    const el = $("#log");
    if (state.log.length===0){ el.innerHTML = "<div class='muted small'>Actions will appear here.</div>"; return; }
    el.innerHTML = state.log.map(m=>`<div>${m}</div>`).join("");
  },
  filters(){
    const brand = $("#brand");
    brand.innerHTML = "<option value=''>All brands</option>" + BRANDS.map(b=>`<option>${b}</option>`).join("");
    $("#q").addEventListener("input", render.market);
    $("#brand").addEventListener("change", render.market);
    $("#cond").addEventListener("change", render.market);
  },
  waitlistTools(){
    // If waitlist modal is open, add a download CSV button
    const foot = $("#modalFoot");
    if (!foot) return;
    if ($$("[data-dlcsv]").length) return;
    const dl = document.createElement("button");
    dl.className = "btn btn--ghost";
    dl.textContent = "Download CSV";
    dl.setAttribute("data-dlcsv","1");
    dl.onclick = () => {
      const rows = [["email","timestamp"]]
        .concat(state.waitlist.map(x=>[x.email, new Date(x.ts).toISOString()]));
      const csv = rows.map(r=>r.map(c=>`"${String(c).replace('"','""')}"`).join(",")).join("\\n");
      const blob = new Blob([csv], {type:"text/csv"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "waitlist.csv"; a.click();
      URL.revokeObjectURL(url);
    };
    foot.prepend(dl);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  render.feePreview();
  render.balances();
  render.filters();
  render.market();
  render.bidsAsks();
});
