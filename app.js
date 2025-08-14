
// ---- Data ----
const BRANDS = ["Chrome Hearts","Rick Owens","Gallery Dept","ERD","Supreme"];
const FEE_BUYER = 0.05, FEE_SELLER = 0.05;
const MIN_BID_FACTOR = 0.75;

const baseItems = [
  { id:"1", title:"Chrome Hearts Certified Hoodie", brand:"Chrome Hearts", condition:"Like New", size:"L", price:2450, allowBids:true, img:"assets/chrome_hoodie.jpg", sellerId:"s1", desc:"Black Certified Chrome hoodie with sleeve crosses. Includes dust bag." },
  { id:"2", title:"Rick Owens Geobasket", brand:"Rick Owens", condition:"Used", size:"42", price:1850, allowBids:true, img:"assets/geobasket.webp", sellerId:"s2", desc:"OG black/white Geobasket. Box and spare laces included." },
  { id:"3", title:"Gallery Dept Back Logo Tee", brand:"Gallery Dept", condition:"New", size:"M", price:620, allowBids:true, img:"assets/gallery_tee.webp", sellerId:"s3", desc:"Washed black tee with gold back print. New with tags." },
  { id:"4", title:"ERD Distressed Denim", brand:"ERD", condition:"Like New", size:"32", price:980, allowBids:false, img:"assets/erd_denim.webp", sellerId:"s1", desc:"Signature distressing and repairs. No bids accepted on this listing." },
  { id:"5", title:"Supreme Box Logo Hoodie FW17", brand:"Supreme", condition:"Used", size:"M", price:1100, allowBids:true, img:"assets/sup_bogo.webp", sellerId:"s2", desc:"FW17 BOGO, stone colorway. Light wear." },
  { id:"6", title:"Rick Owens Ramones Low", brand:"Rick Owens", condition:"Like New", size:"43", price:1250, allowBids:true, img:"assets/ramones_low.webp", sellerId:"s3", desc:"Classic black/white Ramones low. Gently worn." },
  { id:"7", title:"Chrome Hearts Blue Patch Denim", brand:"Chrome Hearts", condition:"Used", size:"32", price:2850, allowBids:true, img:"assets/chrome_blue_patch.webp", sellerId:"s1", desc:"Multiple black cross patches. Rare wash." },
  { id:"8", title:"Chrome Hearts Matty Boy Tee", brand:"Chrome Hearts", condition:"New", size:"L", price:780, allowBids:true, img:"assets/chrome_matty_boy.jpg", sellerId:"s2", desc:"Matty Boy 'SPACE' graphic tee in blue." },
  { id:"9", title:"Gallery Dept PaintSplatter Sweatpants", brand:"Gallery Dept", condition:"Like New", size:"M", price:990, allowBids:true, img:"assets/gallery_sweats.webp", sellerId:"s3", desc:"Paint splatter flared sweatpants. Fit true to size." }
];

const seedSellers = [
  { id:"s1", name:"@rarethreads", rating:4.9, reviews:152, avgShipDays:2.1 },
  { id:"s2", name:"@cryptocouture", rating:4.7, reviews:98, avgShipDays:2.8 },
  { id:"s3", name:"@luxvault", rating:4.8, reviews:120, avgShipDays:2.4 }
];

const seedSales = [
  { itemId:"1", price:2650, ts:Date.now()-2*24*3600*1000, sellerId:"s1" },
  { itemId:"2", price:1990, ts:Date.now()-3*24*3600*1000, sellerId:"s2" },
  { itemId:"5", price:1290, ts:Date.now()-1*24*3600*1000, sellerId:"s2" },
  { itemId:"7", price:3100, ts:Date.now()-5*24*3600*1000, sellerId:"s1" },
  { itemId:"6", price:1420, ts:Date.now()-6*24*3600*1000, sellerId:"s3" }
];

// ---- State ----
const state = {
  items: JSON.parse(localStorage.getItem("cx_items")||"null") || baseItems,
  sellers: JSON.parse(localStorage.getItem("cx_sellers")||"null") || seedSellers,
  sales: JSON.parse(localStorage.getItem("cx_sales")||"null") || seedSales,
  bids: JSON.parse(localStorage.getItem("cx_bids")||"{}"),
  views: JSON.parse(localStorage.getItem("cx_views")||"[]"),
  wallet: parseFloat(localStorage.getItem("cx_wallet")||"2500"),
  user: JSON.parse(localStorage.getItem("cx_user")||"null")
};

// Schema upgrade defaults
state.items = state.items.map(i => ({ allowBids: true, desc: "", ...i }));

function persist(){
  localStorage.setItem("cx_items", JSON.stringify(state.items));
  localStorage.setItem("cx_sellers", JSON.stringify(state.sellers));
  localStorage.setItem("cx_sales", JSON.stringify(state.sales));
  localStorage.setItem("cx_bids", JSON.stringify(state.bids));
  localStorage.setItem("cx_views", JSON.stringify(state.views));
  localStorage.setItem("cx_wallet", String(state.wallet));
  localStorage.setItem("cx_user", JSON.stringify(state.user));
}

// ---- Helpers ----
const $ = s=>document.querySelector(s), $$ = s=>Array.from(document.querySelectorAll(s));
const fmt = n => n.toLocaleString(undefined,{style:"currency",currency:"USD"});
const byId = id => state.items.find(i=>i.id===id);
const sellerById = id => state.sellers.find(s=>s.id===id);

// Views & aggregations
function addView(itemId){ state.views.push({itemId, ts:Date.now()}); trimViews(); persist(); }
function trimViews(){ const cutoff = Date.now()-3600*1000; state.views = state.views.filter(v=>v.ts>=cutoff); }
function topMostViewed(limit=10){
  trimViews(); const counts={}; state.views.forEach(v=>counts[v.itemId]=(counts[v.itemId]||0)+1);
  return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([id])=>byId(id)).filter(Boolean);
}
function highestCurrentBids(limit=10){
  const tops = state.items.filter(i=>i.allowBids).map(i=>{
    const arr=state.bids[i.id]||[]; const top=arr.length?Math.max(...arr.map(b=>b.amt)):0;
    return {item:i, top};
  }).filter(x=>x.top>0).sort((a,b)=>b.top-a.top).slice(0,limit).map(x=>x.item);
  return tops;
}
function topSalesThisWeek(limit=10){
  const wk = Date.now()-7*24*3600*1000;
  const recent = state.sales.filter(s=>s.ts>=wk);
  const grouped = recent.reduce((m,s)=>{m[s.itemId]=Math.max(m[s.itemId]||0,s.price);return m;},{});
  return Object.entries(grouped).sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([id])=>byId(id)).filter(Boolean);
}

// ---- Live ticker across pages ----
const liveTicker = {
  el:null, timer:null, queue:[],
  sample(){ 
    const c=state.items.filter(i=>i.allowBids); const it=c[Math.floor(Math.random()*c.length)]||state.items[0];
    const bid=Math.round(it.price*(0.8+Math.random()*0.2));
    return `LIVE BID: <strong>${it.title}</strong> — ${fmt(bid)}`;
  },
  render(){ if(!this.el) this.el=$("#ticker"); if(!this.el) return;
    const msg=this.queue.shift()||this.sample();
    this.el.innerHTML=`<span>${msg}</span><span>${this.sample()}</span><span>${this.sample()}</span>`;
  },
  start(){ this.el=$("#ticker"); if(!this.el) return; this.render(); clearInterval(this.timer); this.timer=setInterval(()=>this.render(),5000); },
  pushImmediate(t){ if(!this.el) this.el=$("#ticker"); if(!this.el) return; this.queue.unshift(t); this.render(); }
};

// ---- UI / Modal ----
const ui = {
  setView(v){ $("#tabGrid").classList.toggle("tab--active", v==="grid"); $("#tabList").classList.toggle("tab--active", v==="list");
              $("#grid").classList.toggle("hidden", v!=="grid"); $("#list").classList.toggle("hidden", v!=="list"); },
  openDeposit(){
    modal.open("Deposit Funds", `<div class='muted small'>Add to your on‑site wallet (simulated)</div>
      <div class='fee'><label class='small muted'>Amount (USD)</label><input id='depAmt' class='input' value='500'></div>`,
      [{label:"Cancel",ghost:true},{label:"Deposit",primary:true,onClick:()=>{const a=parseFloat($("#depAmt").value||"0"); if(isNaN(a)||a<=0) return; state.wallet+=a; persist(); render.wallet(); modal.close();}}]);
  },
  openBuyOptions(){ modal.open("Choose Purchase Option", `<p class='small'>Use <strong>Buy Now</strong> to hold funds in escrow, or place a <strong>LIVE BID</strong> (≥ 75% of ask) on allowed items.</p>`, [{label:"Go to Shop",primary:true,onClick:()=>{location.href="shop.html";}}]); },
  quickBuy(){ location.href="shop.html"; },
  closeModal(){ modal.close(); }
};
const modal = {
  open(t,body,actions){ $("#modalTitle").textContent=t; $("#modalBody").innerHTML=body; const foot=$("#modalFoot"); foot.innerHTML="";
    (actions||[{label:"Close"}]).forEach(a=>{ const b=document.createElement("button"); b.className="btn "+(a.primary?"btn--primary":"")+(a.ghost?" btn--ghost":""); b.textContent=a.label; b.onclick=a.onClick||modal.close; foot.appendChild(b); });
    $("#modal").classList.remove("hidden"); },
  close(){ $("#modal").classList.add("hidden"); }
};

// ---- Auth ----
const auth = {
  open(){ modal.open("Log in / Sign up", `<div class='fee'><div><small class='muted'>Username</small><input id='au' class='input' placeholder='handle'></div>
  <div><small class='muted'>Seller?</small><select id='ar' class='input'><option value='buyer'>No</option><option value='seller'>Yes</option></select></div></div>`,
  [{label:"Cancel",ghost:true},{label:"Continue",primary:true,onClick:()=>{ const u=($("#au").value||"").trim(); if(!u) return; const role=$("#ar").value; const id="u_"+u.toLowerCase(); state.user={id,name:u,role}; if(role==="seller"&&!state.sellers.find(s=>s.id===id)){ state.sellers.push({id,name:"@"+u,rating:5,reviews:0,avgShipDays:2.5}); } persist(); modal.close(); render.wallet(); }}]); },
  requireSeller(){ if(!state.user||state.user.role!=="seller"){ auth.open(); return false; } return true; }
};
window.auth = auth;

// ---- Seller (file uploads) ----
const seller = {
  _images: [],
  bindFileInput(){ const el=$("#s_files"), prev=$("#s_preview"); if(!el||!prev) return;
    el.onchange=async (e)=>{ seller._images=[]; prev.innerHTML=""; const files=Array.from(e.target.files||[]).slice(0,4);
      for(const f of files){ const url=await fileToDataURL(f); seller._images.push(url); const im=document.createElement("img"); im.src=url; prev.appendChild(im); } }; },
  create(){ if(!auth.requireSeller()) return;
    const t=$("#s_title").value.trim(), b=$("#s_brand").value.trim(), c=$("#s_condition").value, s=$("#s_size").value.trim(), p=parseFloat($("#s_price").value||"0"), imgUrl=$("#s_img").value.trim(), d=$("#s_desc").value.trim(), allow=$("#s_allow").value==="true";
    if(!t||!b||!p){ alert("Please fill title, brand, and price."); return; }
    const id=String(Date.now()); const primary=seller._images[0]||imgUrl||"assets/og.png";
    state.items.push({ id, title:t, brand:b, condition:c, size:s, price:p, img:primary, sellerId: state.user.id, allowBids: allow, desc:d });
    persist(); render.sellerListings(); modal.open("Listing Created", `<p class='small'>Your item is now live in Shop.</p>`);
    $("#s_title").value=$("#s_brand").value=$("#s_size").value=$("#s_price").value=$("#s_img").value=$("#s_desc").value=""; seller._images=[]; const prev=$("#s_preview"); if(prev) prev.innerHTML="";
  }
};
window.seller = seller;
function fileToDataURL(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }

// ---- Bidding / Buying ----
function placeBid(itemId){
  const it=byId(itemId);
  if(!it.allowBids){ modal.open("Bids Disabled", `<p class='small'>The seller is not accepting bids on this item.</p>`); return; }
  const min=Math.ceil(it.price*MIN_BID_FACTOR);
  modal.open("Place LIVE BID", `<div class='fee'><div><small class='muted'>Item</small><strong>${it.title}</strong></div>
  <div><small class='muted'>Ask</small><strong>${fmt(it.price)}</strong></div>
  <div><small class='muted'>Your bid (≥ ${fmt(min)})</small><input id='bidAmt' class='input' value='${min}'></div></div>`,
  [{label:"Cancel",ghost:true},{label:"Place Bid",primary:true,onClick:()=>{
    const n=parseFloat($("#bidAmt").value||"0"); if(isNaN(n)||n<min){ alert("Bid must be at least 75% of ask."); return; }
    const arr=state.bids[itemId]||(state.bids[itemId]=[]); const u=state.user?state.user.name:"guest"; arr.push({amt:n,ts:Date.now(),user:u}); persist();
    liveTicker.pushImmediate(`LIVE BID: <strong>${it.title}</strong> — ${fmt(n)} by ${u}`);
    modal.close(); if(document.body.dataset.page==="item") render.itemDetail();
  }}]);
}
function buyNow(itemId){
  const it=byId(itemId); const hold=it.price*(1+FEE_BUYER);
  if(state.wallet<hold){ modal.open("Insufficient Funds", `<p class='small muted'>You need ${fmt(hold-state.wallet)} more to place this order.</p>`, [{label:"Close"}]); return; }
  state.wallet-=hold; persist(); render.wallet(); modal.open("Order Placed", `<p class='small'>Funds held in escrow. Seller will ship with signature required.</p>`);
}
window.placeBid=placeBid; window.buyNow=buyNow;

// ---- Rendering ----
const render = {
  wallet(){ const el=$("#walletBal"); if(el) el.textContent=fmt(state.wallet); const y=$("#year"); if(y) y.textContent=new Date().getFullYear(); },
  cards(sel, items){ const c=$(sel); if(!c) return;
    c.innerHTML=items.map(i=>`
      <div class="tile">
        <a href="item.html?id=${i.id}"><img src="${i.img}" alt="${i.title}"></a>
        <div class="row"><div><div class="small muted">${i.brand} • ${i.condition}${i.size? " • Size "+i.size:""}</div><strong><a href="item.html?id=${i.id}">${i.title}</a></strong></div><div class="price">${fmt(i.price)}</div></div>
        <div class="row">
          <button class="btn btn--primary" onclick="buyNow('${i.id}')">Buy Now</button>
          <button class="btn btn--ghost" onclick="placeBid('${i.id}')" ${i.allowBids?"":"disabled title='Bids disabled by seller'"}>LIVE BID</button>
        </div>
      </div>`).join(""); },
  listRows(sel, items){ const l=$(sel); if(!l) return;
    l.innerHTML=""; const head=document.createElement("div"); head.className="row--list head"; head.innerHTML="<div>Item</div><div>Brand</div><div>Ask</div><div>Top Bid</div><div>Actions</div>"; l.appendChild(head);
    items.forEach(i=>{ const top=(state.bids[i.id]||[]).reduce((m,b)=>Math.max(m,b.amt),0); const row=document.createElement("div"); row.className="row--list";
      row.innerHTML=`<div><a href="item.html?id=${i.id}">${i.title}</a></div><div>${i.brand}</div><div>${fmt(i.price)}</div><div>${top?fmt(top):"-"}</div>
      <div><button class="btn btn--primary" onclick="buyNow('${i.id}')">Buy</button> <button class="btn btn--ghost" onclick="placeBid('${i.id}')" ${i.allowBids?"":"disabled title='Bids disabled'"}>Bid</button></div>`; l.appendChild(row); }); },
  shop(){ const q=$("#q"), b=$("#brand"), c=$("#cond"); if(!q) return; b.innerHTML="<option value=''>All brands</option>"+BRANDS.map(x=>`<option>${x}</option>`).join("");
    function apply(){ const qs=(q.value||"").toLowerCase(), br=b.value, co=c.value;
      const filtered=state.items.filter(i=>(!br||i.brand===br)&&(!co||i.condition===co)&&(!qs||(i.title+" "+i.brand).toLowerCase().includes(qs)));
      render.cards("#grid", filtered); render.listRows("#list", filtered);
    }
    q.oninput=apply; b.onchange=apply; c.onchange=apply; apply(); },
  home(){ const mv=topMostViewed(10); render.cards("#mostViewed", mv.length?mv:state.items.slice(0,10));
    const hb=highestCurrentBids(10); render.cards("#highestBids", hb.length?hb:state.items.slice(0,10));
    const ts=topSalesThisWeek(10); render.cards("#topSales", ts.length?ts:state.items.slice(0,10)); },
  auctions(){ const l=$("#auctionsList"); if(!l) return; l.innerHTML=""; const head=document.createElement("div"); head.className="row--list head";
    head.innerHTML="<div>Item</div><div>Brand</div><div>Ask</div><div>Top Bid</div><div>Action</div>"; l.appendChild(head);
    state.items.filter(i=>i.allowBids).forEach(i=>{ const top=(state.bids[i.id]||[]).reduce((m,b)=>Math.max(m,b.amt),0); const row=document.createElement("div"); row.className="row--list";
      row.innerHTML=`<div><a href="item.html?id=${i.id}">${i.title}</a></div><div>${i.brand}</div><div>${fmt(i.price)}</div><div>${top?fmt(top):"-"}</div>
      <div><button class="btn btn--ghost" onclick="placeBid('${i.id}')">LIVE BID</button></div>`; l.appendChild(row); }); },
  itemDetail(){ const p=new URLSearchParams(location.search); const id=p.get("id"); const it=byId(id); if(!it) return; addView(id); const s=sellerById(it.sellerId)||{name:"@seller",rating:4.8,reviews:40,avgShipDays:2.5,id:it.sellerId};
    const top=(state.bids[id]||[]).reduce((m,b)=>Math.max(m,b.amt),0);
    $("#itemDetail").innerHTML=`<div><img src="${it.img}" alt="${it.title}"></div>
      <div><h1>${it.title}</h1><div class="muted small">${it.brand} • ${it.condition}${it.size? " • Size "+it.size:""}</div>
      <div class="price" style="margin:12px 0">${fmt(it.price)}</div><p class="small" style="line-height:1.6">${it.desc||""}</p>
      <div class="muted small">Top bid: ${top?fmt(top):"–"} ${it.allowBids?`(min live bid: ${fmt(Math.ceil(it.price*MIN_BID_FACTOR))})`:"(bids disabled by seller)"}</div>
      <div class="mt-2"><button class="btn btn--primary" onclick="buyNow('${id}')">Buy Now</button>
      <button class="btn btn--ghost" onclick="placeBid('${id}')" ${it.allowBids?"":"disabled title='Bids disabled'"}>Place LIVE BID</button></div>
      <div class="card" style="margin-top:12px"><div class="small muted">Seller</div>
      <div><a href="profile.html?id=${s.id}">${s.name||"@seller"}</a> • ⭐ ${s.rating||4.8} (${s.reviews||0} reviews) • Avg ship ${s.avgShipDays||2.5} days</div></div></div>`; },
  profile(){ const p=new URLSearchParams(location.search); const id=p.get("id"); const s=sellerById(id)||{id,name:"@seller",rating:4.8,reviews:40,avgShipDays:2.5};
    $("#sellerHeader").innerHTML=`<div class="grid grid--2"><div><h2>${s.name}</h2><div class="muted small">⭐ ${s.rating} • ${s.reviews} reviews • Avg ship ${s.avgShipDays} days</div></div>
      <div class="muted small">Verified seller • No counterfeit strikes</div></div>`;
    const forSale=state.items.filter(i=>i.sellerId===id); render.cards("#sellerForSale", forSale);
    const sold=state.sales.filter(x=>x.sellerId===id).map(x=>byId(x.itemId)).filter(Boolean); render.cards("#sellerSold", sold);
    const list=$("#sellerReviews"); list.innerHTML=["Great comms, super fast ship!","Item as described, will buy again.","Authentic, smooth transaction."].map((t,i)=>`<div class="row--list"><div>⭐ ${[5,5,4][i]}</div><div class="muted">${t}</div></div>`).join(""); },
  sellerListings(){ if(!document.body.dataset.page==="sell") return; const me=state.user&&state.user.role==="seller"?state.user.id:null; const mine=me?state.items.filter(i=>i.sellerId===me):[]; render.cards("#sellerListings", mine); }
};

// ---- Boot ----
document.addEventListener("DOMContentLoaded", ()=>{
  render.wallet(); liveTicker.start();
  const page=document.body.dataset.page;
  if(page==="shop"){ ui.setView('grid'); render.shop(); }
  if(page==="home"){ render.home(); }
  if(page==="auctions"){ render.auctions(); }
  if(page==="item"){ render.itemDetail(); }
  if(page==="profile"){ render.profile(); }
  if(page==="sell"){ render.sellerListings(); seller.bindFileInput(); }
});
