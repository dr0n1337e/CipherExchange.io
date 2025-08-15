
// ---- Config ----
const BRANDS = ["Chrome Hearts","Rick Owens","Gallery Dept","ERD","Supreme"];
const FEE_BUYER = 0.05, FEE_SELLER = 0.05;
const MIN_BID_FACTOR = 0.75;

const DURATIONS = [
  ["30 mins", 30*60*1000],
  ["1 hour", 60*60*1000],
  ["2 hours", 2*60*60*1000],
  ["5 hours", 5*60*60*1000],
  ["8 hours", 8*60*60*1000],
  ["12 hours", 12*60*60*1000],
  ["24 hours", 24*60*60*1000],
  ["2 days", 2*24*60*60*1000],
  ["3 days", 3*24*60*60*1000],
  ["5 days", 5*24*60*60*1000],
];

// ---- Seed Data ----
const baseItems = [
  { id:"1", title:"Chrome Hearts Certified Hoodie", brand:"Chrome Hearts", condition:"Like New", size:"L", price:2450, allowBids:true, img:"assets/chrome_hoodie.jpg", sellerId:"s1", desc:"Black Certified Chrome hoodie with sleeve crosses. Includes dust bag.", isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null },
  { id:"2", title:"Rick Owens Geobasket", brand:"Rick Owens", condition:"Used", size:"42", price:1850, allowBids:true, img:"assets/geobasket.webp", sellerId:"s2", desc:"OG black/white Geobasket. Box and spare laces included.", isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null },
  { id:"3", title:"Gallery Dept Back Logo Tee", brand:"Gallery Dept", condition:"New", size:"M", price:620, allowBids:true, img:"assets/gallery_tee.webp", sellerId:"s3", desc:"Washed black tee with gold back print. New with tags.", isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null },
  // Example auction-only listing
  { id:"4", title:"ERD Distressed Denim (Auction)", brand:"ERD", condition:"Like New", size:"32", price:0, allowBids:true, img:"assets/erd_denim.webp", sellerId:"s1", desc:"Signature distressing and repairs. Auction only.", isAuction:true, buyNowEnabled:false, auctionEnds: Date.now()+6*60*60*1000, auctionStart: 600 },
  { id:"5", title:"Supreme Box Logo Hoodie FW17", brand:"Supreme", condition:"Used", size:"M", price:1100, allowBids:true, img:"assets/sup_bogo.webp", sellerId:"s2", desc:"FW17 BOGO, stone colorway. Light wear.", isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null },
  { id:"6", title:"Rick Owens Ramones Low", brand:"Rick Owens", condition:"Like New", size:"43", price:1250, allowBids:true, img:"assets/ramones_low.webp", sellerId:"s3", desc:"Classic black/white Ramones low. Gently worn.", isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null },
  { id:"7", title:"Chrome Hearts Blue Patch Denim", brand:"Chrome Hearts", condition:"Used", size:"32", price:2850, allowBids:true, img:"assets/chrome_blue_patch.webp", sellerId:"s1", desc:"Multiple black cross patches. Rare wash.", isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null },
  { id:"8", title:"Chrome Hearts Matty Boy Tee", brand:"Chrome Hearts", condition:"New", size:"L", price:780, allowBids:true, img:"assets/chrome_matty_boy.jpg", sellerId:"s2", desc:"Matty Boy 'SPACE' graphic tee in blue.", isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null },
  { id:"9", title:"Gallery Dept PaintSplatter Sweatpants", brand:"Gallery Dept", condition:"Like New", size:"M", price:990, allowBids:true, img:"assets/gallery_sweats.webp", sellerId:"s3", desc:"Paint splatter flared sweatpants. Fit true to size.", isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null }
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
state.items = state.items.map(i => ({
  allowBids: true, desc: "", isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null, ...i
}));

function persist(){
  localStorage.setItem("cx_items", JSON.stringify(state.items));
  localStorage.setItem("cx_sellers", JSON.stringify(state.sellers));
  localStorage.setItem("cx_sales", JSON.stringify(state.sales));
  localStorage.setItem("cx_bids", JSON.stringify(state.bids));
  localStorage.setItem("cx_views", JSON.stringify(state.views));
  localStorage.setItem("cx_wallet", String(state.wallet));
  localStorage.setItem("cx_user", JSON.stringify(state.user));
}

// ---- Utils ----
const $ = s=>document.querySelector(s), $$ = s=>Array.from(document.querySelectorAll(s));
const fmt = n => n.toLocaleString(undefined,{style:"currency",currency:"USD"});
const byId = id => state.items.find(i=>i.id===id);
const sellerById = id => state.sellers.find(s=>s.id===id);

function topBidAmt(itemId){ const a=state.bids[itemId]||[]; return a.length? Math.max(...a.map(b=>b.amt)) : 0; }
function now(){ return Date.now(); }
function timeLeft(ts){ const d = ts - now(); if(d<=0) return "Ended"; const s=Math.floor(d/1000); const dd=Math.floor(s/86400); const hh=Math.floor((s%86400)/3600); const mm=Math.floor((s%3600)/60); const ss=s%60; if(dd>0) return `${dd}d ${hh}h`; if(hh>0) return `${hh}h ${mm}m`; if(mm>0) return `${mm}m ${ss}s`; return `${ss}s`; }

// ---- Ticker ----
const liveTicker = {
  el:null, timer:null, queue:[],
  sample(){ const c=state.items.filter(i=>i.allowBids); const it=c[Math.floor(Math.random()*c.length)]||state.items[0]; const bid=Math.round((it.price||it.auctionStart||500)*(0.8+Math.random()*0.2)); return `LIVE BID: <strong>${it.title}</strong> — ${fmt(bid)}`; },
  render(){ if(!this.el) this.el=$("#ticker"); if(!this.el) return; const msg=this.queue.shift()||this.sample(); this.el.innerHTML=`<span>${msg}</span><span>${this.sample()}</span><span>${this.sample()}</span>`; },
  start(){ this.el=$("#ticker"); if(!this.el) return; this.render(); clearInterval(this.timer); this.timer=setInterval(()=>this.render(),5000); },
  pushImmediate(t){ if(!this.el) this.el=$("#ticker"); if(!this.el) return; this.queue.unshift(t); this.render(); }
};

// ---- Modal/UI ----
const ui = {
  setView(v){ $("#tabGrid").classList.toggle("tab--active", v==="grid"); $("#tabList").classList.toggle("tab--active", v==="list"); $("#grid").classList.toggle("hidden", v!=="grid"); $("#list").classList.toggle("hidden", v!=="list"); },
  openDeposit(){ modal.open("Deposit Funds", `<div class='muted small'>Add to your on‑site wallet (simulated)</div><div class='fee'><label class='small muted'>Amount (USD)</label><input id='depAmt' class='input' value='500'></div>`, [{label:"Cancel",ghost:true},{label:"Deposit",primary:true,onClick:()=>{const a=parseFloat($("#depAmt").value||"0"); if(isNaN(a)||a<=0) return; state.wallet+=a; persist(); render.wallet(); modal.close();}}]); },
  openBuyOptions(){ modal.open("Choose Purchase Option", `<p class='small'>Use <strong>Buy Now</strong> to hold funds in escrow, or place a <strong>LIVE BID</strong> (≥ 75% of ask/start) on allowed items.</p>`, [{label:"Go to Shop",primary:true,onClick:()=>{location.href="shop.html";}}]); },
  quickBuy(){ location.href="shop.html"; },
  closeModal(){ modal.close(); }
};
const modal = { open(t,b,a){ $("#modalTitle").textContent=t; $("#modalBody").innerHTML=b; const f=$("#modalFoot"); f.innerHTML=""; (a||[{label:"Close"}]).forEach(x=>{ const btn=document.createElement("button"); btn.className="btn "+(x.primary?"btn--primary":"")+(x.ghost?" btn--ghost":""); btn.textContent=x.label; btn.onclick=x.onClick||modal.close; f.appendChild(btn); }); $("#modal").classList.remove("hidden"); }, close(){ $("#modal").classList.add("hidden"); } };

// ---- Auth ----
const auth = { open(){ modal.open("Log in / Sign up", `<div class='fee'><div><small class='muted'>Username</small><input id='au' class='input' placeholder='handle'></div><div><small class='muted'>Seller?</small><select id='ar' class='input'><option value='buyer'>No</option><option value='seller'>Yes</option></select></div></div>`, [{label:"Cancel",ghost:true},{label:"Continue",primary:true,onClick:()=>{ const u=($("#au").value||"").trim(); if(!u) return; const role=$("#ar").value; const id="u_"+u.toLowerCase(); state.user={id,name:u,role}; if(role==="seller"&&!state.sellers.find(s=>s.id===id)){ state.sellers.push({id,name:"@"+u,rating:5,reviews:0,avgShipDays:2.5}); } persist(); modal.close(); render.wallet(); }}]); }, requireSeller(){ if(!state.user||state.user.role!=="seller"){ auth.open(); return false; } return true; } };
window.auth = auth;

// ---- Seller ----
const seller = {
  _images: [],
  bindFileInput(){ const el=$("#s_files"), prev=$("#s_preview"); if(!el||!prev) return;
    el.onchange=async (e)=>{ seller._images=[]; prev.innerHTML=""; const files=Array.from(e.target.files||[]).slice(0,4);
      for(const f of files){ const url=await fileToDataURL(f); seller._images.push(url); const im=document.createElement("img"); im.src=url; prev.appendChild(im); } };
    // populate durations
    const dSel=$("#s_duration"); if(dSel){ dSel.innerHTML = DURATIONS.map(([t,_])=>`<option>${t}</option>`).join(""); }
    // react to type changes
    const type=$("#s_type"), allow=$("#s_allow"), buySel=$("#s_buyNow"), buyWrap=$("#auctionBuyNow"), fixed=$("#fixedFields"), auc=$("#auctionFields");
    function refresh(){
      const isA = type.value==="auction";
      fixed.classList.toggle("hidden", isA);
      auc.classList.toggle("hidden", !isA);
      buyWrap.classList.toggle("hidden", buySel && buySel.value!=="true");
    }
    if(type){ type.onchange=refresh; } if(buySel){ buySel.onchange=refresh; } refresh();
  },
  create(){
    if(!auth.requireSeller()) return;
    const type=$("#s_type").value;
    const t=$("#s_title").value.trim(), b=$("#s_brand").value.trim(), c=$("#s_condition").value, s=$("#s_size").value.trim();
    const d=$("#s_desc").value.trim();
    const imgs=seller._images;
    if(!t||!b){ alert("Please fill title and brand."); return; }
    const id=String(Date.now());
    let item = { id, title:t, brand:b, condition:c, size:s, desc:d, img: imgs[0]||"assets/og.png", sellerId: state.user.id, allowBids:true, isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null };
    if(type==="fixed"){
      const p=parseFloat($("#s_price").value||"0"); if(!p){ alert("Please enter an ask price."); return; }
      item.price=p;
      item.buyNowEnabled=true;
      item.allowBids = $("#s_allow").value==="true";
    } else {
      // auction
      const start=parseFloat($("#s_start").value||"0"); if(!start){ alert("Please enter a start price."); return; }
      const dSel=$("#s_duration").value; const dur = DURATIONS.find(([t,_])=>t===dSel)?.[1] || 24*60*60*1000;
      item.isAuction=true; item.auctionStart=start; item.auctionEnds = now()+dur;
      const allowBN = $("#s_buyNow").value==="true";
      item.buyNowEnabled = allowBN;
      if(allowBN){ const p=parseFloat($("#s_price_auction").value||"0"); if(!p){ alert("Please enter a Buy Now price or select 'auction only'."); return; } item.price = p; } else { item.price = 0; }
    }
    state.items.push(item); persist();
    render.sellerListings();
    modal.open("Listing Created", `<p class='small'>Your item is now live.</p>`);
    // reset
    ["s_title","s_brand","s_size","s_price","s_start","s_desc","s_price_auction"].forEach(id=>{ const el=$("#"+id); if(el) el.value=""; });
    seller._images=[]; const prev=$("#s_preview"); if(prev) prev.innerHTML="";
  }
};
window.seller = seller;

function fileToDataURL(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }

// ---- Bidding / Buying ----
function minBidFor(it){
  const base = it.price ? Math.ceil(it.price*MIN_BID_FACTOR) : (it.auctionStart||0);
  const top = topBidAmt(it.id);
  return Math.max(base, top? top+1 : base);
}
function placeBid(itemId){
  const it=byId(itemId);
  if(it.isAuction && it.auctionEnds && now()>it.auctionEnds){ modal.open("Auction Ended", `<p class='small'>This auction has ended.</p>`); return; }
  if(!it.allowBids){ modal.open("Bids Disabled", `<p class='small'>The seller is not accepting bids on this item.</p>`); return; }
  const min = minBidFor(it);
  modal.open("Place LIVE BID", `
    <div class='fee'>
      <div><small class='muted'>Item</small><strong>${it.title}</strong></div>
      <div><small class='muted'>${it.price? "Ask":"Start"}</small><strong>${fmt(it.price||it.auctionStart)}</strong></div>
      <div><small class='muted'>Your bid (≥ ${fmt(min)})</small><input id='bidAmt' class='input' value='${min}'></div>
    </div>
  `, [{label:"Cancel", ghost:true},{label:"Place Bid", primary:true, onClick:()=>{
    const n=parseFloat($("#bidAmt").value||"0"); if(isNaN(n) || n < min){ alert("Bid must meet the minimum."); return; }
    const arr = state.bids[itemId] || (state.bids[itemId]=[]);
    const u = state.user? state.user.name : "guest";
    arr.push({ amt:n, ts:now(), user: u });
    persist();
    liveTicker.pushImmediate(`LIVE BID: <strong>${it.title}</strong> — ${fmt(n)} by ${u}`);
    modal.close();
    if (document.body.dataset.page==="item") render.itemDetail();
    if (document.body.dataset.page==="auctions") render.auctions();
    if (document.body.dataset.page==="shop") render.shop();
    if (document.body.dataset.page==="home") render.home();
  }}]);
}
function buyNow(itemId){
  const it=byId(itemId);
  if(!it.buyNowEnabled || !it.price){ modal.open("Buy Now Unavailable", `<p class='small'>This listing is auction-only.</p>`); return; }
  const hold = it.price * (1+FEE_BUYER);
  if(state.wallet < hold){ modal.open("Insufficient Funds", `<p class='small muted'>You need ${fmt(hold-state.wallet)} more to place this order.</p>`, [{label:"Close"}]); return; }
  state.wallet -= hold; persist(); render.wallet();
  modal.open("Order Placed", `<p class='small'>Funds held in escrow. Seller will ship with signature required.</p>`);
}
window.placeBid = placeBid; window.buyNow = buyNow;

// ---- Rendering ----
const render = {
  wallet(){ const el=$("#walletBal"); if(el) el.textContent = fmt(state.wallet); const y=$("#year"); if(y) y.textContent = new Date().getFullYear(); },
  priceMeta(i){
    const top = topBidAmt(i.id);
    const buy = (i.buyNowEnabled && i.price) ? `Buy: <strong>${fmt(i.price)}</strong>` : `<span class="muted">Auction only</span>`;
    const cur = top ? `Current bid: <strong>${fmt(top)}</strong>` : `${i.isAuction || i.allowBids? "Current bid: –" : ""}`;
    const end = (i.isAuction && i.auctionEnds) ? ` • <span class="countdown" data-end="${i.auctionEnds}">Ends in ${timeLeft(i.auctionEnds)}</span>` : "";
    return `<div class="meta"><span>${buy}</span><span>${cur}</span>${end}</div>`;
  },
  cards(sel, items){
    const c = $(sel); if(!c) return;
    c.innerHTML = items.map(i=>`
      <div class="tile">
        <a href="item.html?id=${i.id}"><img src="${i.img}" alt="${i.title}"></a>
        <div class="row">
          <div>
            <div class="small muted">${i.brand} • ${i.condition}${i.size? " • Size "+i.size:""}</div>
            <strong><a href="item.html?id=${i.id}">${i.title}</a></strong>
            ${render.priceMeta(i)}
          </div>
        </div>
        <div class="row">
          ${i.buyNowEnabled && i.price ? `<button class="btn btn--primary" onclick="buyNow('${i.id}')">Buy Now</button>` : ``}
          <button class="btn btn--ghost" onclick="placeBid('${i.id}')" ${i.allowBids? "":"disabled title='Bids disabled by seller'"}>LIVE BID</button>
        </div>
      </div>
    `).join("");
    render.bindCountdowns();
  },
  listRows(sel, items){
    const l=$(sel); if(!l) return;
    l.innerHTML = "";
    const head = document.createElement("div");
    head.className="row--list head";
    head.innerHTML="<div>Item</div><div>Brand</div><div>Ask / Buy Now</div><div>Current Bid</div><div>Ends</div><div>Actions</div>";
    l.appendChild(head);
    items.forEach(i=>{
      const top = topBidAmt(i.id);
      const ask = i.buyNowEnabled && i.price ? fmt(i.price) : "Auction only";
      const ends = i.isAuction && i.auctionEnds ? `<span class='countdown' data-end='${i.auctionEnds}'>${timeLeft(i.auctionEnds)}</span>` : "—";
      const row = document.createElement("div");
      row.className="row--list";
      row.innerHTML = `<div><a href="item.html?id=${i.id}">${i.title}</a></div><div>${i.brand}</div><div>${ask}</div><div>${top?fmt(top):"–"}</div><div>${ends}</div>
        <div>${i.buyNowEnabled && i.price ? `<button class="btn btn--primary" onclick="buyNow('${i.id}')">Buy</button>`:""} <button class="btn btn--ghost" onclick="placeBid('${i.id}')" ${i.allowBids? "":"disabled title='Bids disabled'"}>Bid</button></div>`;
      l.appendChild(row);
    });
    render.bindCountdowns();
  },
  shop(){
    const qEl=$("#q"), bEl=$("#brand"), cEl=$("#cond"); if(!qEl) return;
    bEl.innerHTML = "<option value=''>All brands</option>"+BRANDS.map(b=>`<option>${b}</option>`).join("");
    function apply(){
      const q=(qEl.value||"").toLowerCase(), br=bEl.value, co=cEl.value;
      const filtered = state.items.filter(i =>
        (!br || i.brand===br) && (!co || i.condition===co) && (!q || (i.title+" "+i.brand).toLowerCase().includes(q))
      );
      render.cards("#grid", filtered);
      render.listRows("#list", filtered);
    }
    qEl.oninput=apply; bEl.onchange=apply; cEl.onchange=apply;
    apply();
  },
  home(){ const mv = topMostViewed(10); render.cards("#mostViewed", mv.length? mv: state.items.slice(0,10)); const hb = highestCurrentBids(10); render.cards("#highestBids", hb.length? hb: state.items.slice(0,10)); const ts = topSalesThisWeek(10); render.cards("#topSales", ts.length? ts: state.items.slice(0,10)); },
  auctions(){
    const l=$("#auctionsList"); if(!l) return;
    l.innerHTML="";
    const head = document.createElement("div"); head.className="row--list head";
    head.innerHTML="<div>Item</div><div>Brand</div><div>Ask / Buy Now</div><div>Current Bid</div><div>Ends</div><div>Action</div>"; l.appendChild(head);
    state.items.filter(i=>i.allowBids || i.isAuction).forEach(i=>{
      const top = topBidAmt(i.id);
      const ask = i.buyNowEnabled && i.price ? fmt(i.price) : "Auction only";
      const ends = i.isAuction && i.auctionEnds ? `<span class='countdown' data-end='${i.auctionEnds}'>${timeLeft(i.auctionEnds)}</span>` : "—";
      const row = document.createElement("div"); row.className="row--list";
      row.innerHTML = `<div><a href="item.html?id=${i.id}">${i.title}</a></div><div>${i.brand}</div><div>${ask}</div><div>${top?fmt(top):"-"}</div><div>${ends}</div>
        <div><button class="btn btn--ghost" onclick="placeBid('${i.id}')">LIVE BID</button> ${i.buyNowEnabled && i.price? `<button class="btn btn--primary" onclick="buyNow('${i.id}')">Buy Now</button>`:""}</div>`;
      l.appendChild(row);
    });
    render.bindCountdowns();
  },
  itemDetail(){
    const params = new URLSearchParams(location.search); const id = params.get("id"); const it = byId(id); if(!it) return;
    addView(id);
    const seller = sellerById(it.sellerId) || {name:"@seller", rating:4.8, reviews:40, avgShipDays:2.5, id:it.sellerId};
    const top = topBidAmt(id);
    const ends = it.isAuction && it.auctionEnds ? `<div class="countdown" data-end="${it.auctionEnds}">Ends in ${timeLeft(it.auctionEnds)}</div>` : "";
    $("#itemDetail").innerHTML = `
      <div><img src="${it.img}" alt="${it.title}"></div>
      <div>
        <h1>${it.title}</h1>
        <div class="muted small">${it.brand} • ${it.condition}${it.size? " • Size "+it.size:""}</div>
        ${it.buyNowEnabled && it.price ? `<div class="price" style="margin:12px 0">${fmt(it.price)}</div>` : `<div class="badge">Auction only</div>`}
        ${ends}
        <p class="small" style="line-height:1.6">${it.desc||""}</p>
        <div class="muted small">Top bid: ${top?fmt(top):"–"} ${it.allowBids? `(min live bid: ${fmt(minBidFor(it))})`:"(bids disabled by seller)"}</div>
        <div class="mt-2">
          ${it.buyNowEnabled && it.price ? `<button class="btn btn--primary" onclick="buyNow('${id}')">Buy Now</button>` : ``}
          <button class="btn btn--ghost" onclick="placeBid('${id}')" ${it.allowBids? "":"disabled title='Bids disabled'"}>Place LIVE BID</button>
        </div>
        <div class="card" style="margin-top:12px">
          <div class="small muted">Seller</div>
          <div><a href="profile.html?id=${seller.id}">${seller.name||"@seller"}</a> • ⭐ ${seller.rating||4.8} (${seller.reviews||0} reviews) • Avg ship ${seller.avgShipDays||2.5} days</div>
        </div>
      </div>
    `;
    render.bindCountdowns();
  },
  sellerListings(){ if(!document.body.dataset.page==="sell") return; const me = state.user && state.user.role==="seller" ? state.user.id : null; const mine = me? state.items.filter(i=>i.sellerId===me): []; render.cards("#sellerListings", mine); },
  bindCountdowns(){
    function tick(){
      $$(".countdown").forEach(el=>{ const end = parseInt(el.dataset.end||"0",10); if(!end) return; el.textContent = (now()>end) ? "Ended" : "Ends in "+timeLeft(end); });
    }
    tick(); clearInterval(render._cdTimer); render._cdTimer = setInterval(tick, 1000);
  }
};

// ---- Views & aggregates used on home ----
function addView(itemId){ state.views.push({itemId, ts:now()}); trimViews(); persist(); }
function trimViews(){ const cutoff = now() - 3600*1000; state.views = state.views.filter(v=>v.ts >= cutoff); }
function topMostViewed(limit=10){ trimViews(); const counts = {}; state.views.forEach(v=>counts[v.itemId]=(counts[v.itemId]||0)+1); return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([id])=>byId(id)).filter(Boolean); }
function highestCurrentBids(limit=10){
  const tops = state.items.filter(i=>i.allowBids).map(i=>{
    const top = topBidAmt(i.id);
    return { item:i, top };
  }).filter(x=>x.top>0).sort((a,b)=>b.top-a.top).slice(0,limit).map(x=>x.item);
  return tops;
}
function topSalesThisWeek(limit=10){
  const wk = now()-7*24*3600*1000;
  const recent = state.sales.filter(s=>s.ts>=wk);
  const grouped = recent.reduce((m,s)=>{m[s.itemId]=Math.max(m[s.itemId]||0, s.price); return m;},{});
  return Object.entries(grouped).sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([id])=>byId(id)).filter(Boolean);
}

// ---- Boot ----
document.addEventListener("DOMContentLoaded", () => {
  render.wallet(); liveTicker.start();
  const page = document.body.dataset.page;
  if(page==="shop"){ ui.setView('grid'); render.shop(); }
  if(page==="home"){ render.home(); }
  if(page==="auctions"){ render.auctions(); }
  if(page==="item"){ render.itemDetail(); }
  if(page==="profile"){ render.profile(); }
  if(page==="sell"){ render.sellerListings(); seller.bindFileInput(); }
});


// ---- Service Worker registration ----
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(()=>{});
  });
}

// ---- Wallet modal (placeholders) ----
const wallet = {
  open(){
    modal.open("Connect Wallet", `
      <div class='fee'>
        <div><strong>Phantom</strong><div class='small muted'>Solana & EVM — opens Phantom app</div></div>
        <button class='btn btn--primary' onclick='wallet.connectPhantom()'>Open Phantom</button>
        <hr/>
        <div><strong>Trust Wallet</strong><div class='small muted'>EVM via WalletConnect — placeholder</div></div>
        <button class='btn' onclick='wallet.connectTrust()'>Open Trust Wallet</button>
        <hr/>
        <div><strong>Demo Wallet</strong><div class='small muted'>Simulate a connected wallet for this demo</div></div>
        <button class='btn' onclick='wallet.simulate()'>Simulate connect</button>
      </div>
    `);
  },
  connectPhantom(){
    // Placeholder: open Phantom website/app; real app would integrate Phantom SDK / Wallet Standard
    window.open('https://phantom.app/', '_blank');
  },
  connectTrust(){
    // Placeholder: open Trust Wallet; real app would integrate WalletConnect v2
    window.open('https://trustwallet.com/', '_blank');
  },
  simulate(){
    state.user = state.user || { id:"demo", name:"demo", role:"buyer" };
    state.user.wallet = { address: "0xDEMO...", chain: "EVM", connected: true };
    persist();
    modal.open("Wallet Connected", "<p class='small'>Demo wallet connected.</p>");
  }
};
window.wallet = wallet;


// --- v5.1: Mobile drawer menu handlers ---
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById('menuBtn');
  const drawer = document.getElementById('drawer');
  const drawerClose = document.getElementById('drawerClose');
  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => drawer.classList.add('drawer--open'));
  }
  if (drawerClose && drawer) {
    drawerClose.addEventListener('click', () => drawer.classList.remove('drawer--open'));
  }
  if (drawer) {
    drawer.addEventListener('click', (e) => { if (e.target === drawer) drawer.classList.remove('drawer--open'); });
  }
});
