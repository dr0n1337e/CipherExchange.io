
// Config
const BRANDS = ["Chrome Hearts","Rick Owens","Gallery Dept","ERD","Supreme","Rolex","Cartier"];
const FEE_BUYER = 0.05, FEE_SELLER = 0.05;
const MIN_BID_FACTOR = 0.75;
const DURATIONS = [
  ["30 mins", 30*60*1000],["1 hour", 60*60*1000],["2 hours", 2*60*60*1000],
  ["5 hours", 5*60*60*1000],["8 hours", 8*60*60*1000],["12 hours", 12*60*60*1000],
  ["24 hours", 24*60*60*1000],["2 days", 2*24*60*60*1000],["3 days", 3*24*60*60*1000],["5 days", 5*24*60*60*1000],
];

// Seed
const baseItems = [
  { id:"1", title:"Chrome Hearts Certified Hoodie", brand:"Chrome Hearts", category:"Clothing", condition:"Like New", size:"L", price:2450, allowBids:true, img:"assets/chrome_hoodie.jpg", images:["assets/chrome_hoodie.jpg"], sellerId:"s1", desc:"Black Certified Chrome hoodie with sleeve crosses.", isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null },
  { id:"2", title:"Rick Owens Geobasket", brand:"Rick Owens", category:"Clothing", condition:"Used", size:"42", price:1850, allowBids:true, img:"assets/geobasket.webp", images:["assets/geobasket.webp"], sellerId:"s2", desc:"OG black/white Geobasket. Box included.", isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null },
  { id:"3", title:"Gallery Dept Back Logo Tee", brand:"Gallery Dept", category:"Clothing", condition:"New", size:"M", price:620, allowBids:true, img:"assets/gallery_tee.webp", images:["assets/gallery_tee.webp"], sellerId:"s3", desc:"Washed black tee with gold back print.", isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null },
  { id:"4", title:"ERD Distressed Denim (Auction)", brand:"ERD", category:"Clothing", condition:"Like New", size:"32", price:0, allowBids:true, img:"assets/erd_denim.webp", images:["assets/erd_denim.webp"], sellerId:"s1", desc:"Signature distressing and repairs. Auction only.", isAuction:true, buyNowEnabled:false, auctionEnds: Date.now()+6*60*60*1000, auctionStart: 600 },
  { id:"5", title:"Supreme Box Logo Hoodie FW17", brand:"Supreme", category:"Clothing", condition:"Used", size:"M", price:1100, allowBids:true, img:"assets/sup_bogo.webp", images:["assets/sup_bogo.webp"], sellerId:"s2", desc:"FW17 BOGO, stone colorway.", isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null },
  { id:"6", title:"Rick Owens Ramones Low", brand:"Rick Owens", category:"Clothing", condition:"Like New", size:"43", price:1250, allowBids:true, img:"assets/ramones_low.webp", images:["assets/ramones_low.webp"], sellerId:"s3", desc:"Classic black/white Ramones low.", isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null },
  { id:"7", title:"Chrome Hearts Blue Patch Denim", brand:"Chrome Hearts", category:"Clothing", condition:"Used", size:"32", price:2850, allowBids:true, img:"assets/chrome_blue_patch.webp", images:["assets/chrome_blue_patch.webp"], sellerId:"s1", desc:"Multiple cross patches. Rare wash.", isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null },
  { id:"8", title:"Chrome Hearts Matty Boy Tee", brand:"Chrome Hearts", category:"Clothing", condition:"New", size:"L", price:780, allowBids:true, img:"assets/chrome_matty_boy.jpg", images:["assets/chrome_matty_boy.jpg"], sellerId:"s2", desc:"Matty Boy 'SPACE' graphic tee.", isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null },
  { id:"9", title:"Gallery Dept PaintSplatter Sweatpants", brand:"Gallery Dept", category:"Clothing", condition:"Like New", size:"M", price:990, allowBids:true, img:"assets/gallery_sweats.webp", images:["assets/gallery_sweats.webp"], sellerId:"s3", desc:"Paint splatter flared sweatpants.", isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null }
];
const seedSellers = [
  { id:"s1", name:"@rarethreads", rating:4.9, reviews:152, avgShipDays:2.1 },
  { id:"s2", name:"@cryptocouture", rating:4.7, reviews:98, avgShipDays:2.8 },
  { id:"s3", name:"@luxvault", rating:4.8, reviews:120, avgShipDays:2.4 }
];
const seedSales = [];

// State
const state = {
  items: JSON.parse(localStorage.getItem("cx_items")||"null") || baseItems,
  sellers: JSON.parse(localStorage.getItem("cx_sellers")||"null") || seedSellers,
  sales: JSON.parse(localStorage.getItem("cx_sales")||"null") || seedSales, // add buyerId on real checkouts
  bids: JSON.parse(localStorage.getItem("cx_bids")||"{}"),
  views: JSON.parse(localStorage.getItem("cx_views")||"[]"),
  wallet: parseFloat(localStorage.getItem("cx_wallet")||"2500"),
  user: JSON.parse(localStorage.getItem("cx_user")||"null"),
  watch: JSON.parse(localStorage.getItem("cx_watch")||"[]"),
  cart: JSON.parse(localStorage.getItem("cx_cart")||"[]"),
  messages: JSON.parse(localStorage.getItem("cx_msgs")||"[]"),
};
function persist(){
  localStorage.setItem("cx_items", JSON.stringify(state.items));
  localStorage.setItem("cx_sellers", JSON.stringify(state.sellers));
  localStorage.setItem("cx_sales", JSON.stringify(state.sales));
  localStorage.setItem("cx_bids", JSON.stringify(state.bids));
  localStorage.setItem("cx_views", JSON.stringify(state.views));
  localStorage.setItem("cx_wallet", String(state.wallet));
  localStorage.setItem("cx_user", JSON.stringify(state.user));
  localStorage.setItem("cx_watch", JSON.stringify(state.watch));
  localStorage.setItem("cx_cart", JSON.stringify(state.cart));
  localStorage.setItem("cx_msgs", JSON.stringify(state.messages));
}

// Utils
const $ = s=>document.querySelector(s), $$ = s=>Array.from(document.querySelectorAll(s));
const fmt = n => n.toLocaleString(undefined,{style:"currency",currency:"USD"});
const byId = id => state.items.find(i=>i.id===id);
const sellerById = id => state.sellers.find(s=>s.id===id);
const topBidAmt = id => { const a=state.bids[id]||[]; return a.length? Math.max(...a.map(b=>b.amt)) : 0; };
function addView(itemId){ state.views.push({itemId, ts:Date.now()}); trimViews(); persist(); }
function trimViews(){ const cutoff = Date.now() - 3600*1000; state.views = state.views.filter(v=>v.ts>=cutoff); }
function topMostViewed(limit=10){ trimViews(); const counts={}; state.views.forEach(v=>counts[v.itemId]=(counts[v.itemId]||0)+1); return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([id])=>byId(id)).filter(Boolean); }
function highestCurrentBids(limit=10){
  const tops = state.items.filter(i=>i.allowBids).map(i=>({ item:i, top: topBidAmt(i.id) }))
              .filter(x=>x.top>0).sort((a,b)=>b.top-a.top).slice(0,limit).map(x=>x.item);
  return tops;
}

// Live ticker
const liveTicker = { el:null, timer:null, queue:[], sample(){ const c=state.items.filter(i=>i.allowBids||i.isAuction); const it=c[Math.floor(Math.random()*c.length)]||state.items[0]; const basis = it.price||it.auctionStart||500; const bid=Math.round(basis*(0.8+Math.random()*0.2)); return `LIVE BID: <strong>${it.title}</strong> — ${fmt(bid)}`; },
  render(){ if(!this.el) this.el=$("#ticker"); if(!this.el) return; const msg=this.queue.shift()||this.sample(); this.el.innerHTML=`<span>${msg}</span><span>${this.sample()}</span><span>${this.sample()}</span>`; },
  start(){ this.el=$("#ticker"); if(!this.el) return; this.render(); clearInterval(this.timer); this.timer=setInterval(()=>this.render(),5000); },
  pushImmediate(t){ if(!this.el) this.el=$("#ticker"); if(!this.el) return; this.queue.unshift(t); this.render(); }
};

// Modal/UI
const ui = { setView(v){ $("#tabGrid").classList.toggle("tab--active", v==="grid"); $("#tabList").classList.toggle("tab--active", v==="list"); $("#grid").classList.toggle("hidden", v!=="grid"); $("#list").classList.toggle("hidden", v!=="list"); },
  openDeposit(){ modal.open("Deposit Funds", `<div class='muted small'>Add to your on‑site wallet (simulated)</div><div class='fee'><label class='small muted'>Amount (USD)</label><input id='depAmt' class='input' value='500'></div>`, [{label:"Cancel",ghost:true},{label:"Deposit",primary:true,onClick:()=>{const a=parseFloat($("#depAmt").value||"0"); if(isNaN(a)||a<=0) return; state.wallet+=a; persist(); render.wallet(); modal.close();}}]); },
  openBuyOptions(){ modal.open("Choose Purchase Option", `<p class='small'>Use <strong>Buy Now</strong> to hold funds in escrow, or place a <strong>LIVE BID</strong> (≥ 75% of ask/start) on allowed items.</p>`, [{label:"Go to Shop",primary:true,onClick:()=>{location.href="shop.html";}}]); },
  closeModal(){ modal.close(); }
};
const modal = { open(t,b,a){ $("#modalTitle").textContent=t; $("#modalBody").innerHTML=b; const f=$("#modalFoot"); f.innerHTML=""; (a||[{label:"Close"}]).forEach(x=>{ const btn=document.createElement("button"); btn.className="btn "+(x.primary?"btn--primary":"")+(x.ghost?" btn--ghost":""); btn.textContent=x.label; btn.onclick=x.onClick||modal.close; f.appendChild(btn); }); $("#modal").classList.remove("hidden"); }, close(){ $("#modal").classList.add("hidden"); } };

// Auth
function makeSilkId(){ const hex="abcdef0123456789"; let s="SILK-"; for(let i=0;i<64;i++){ s+=hex[Math.floor(Math.random()*hex.length)]; } return s; }
const auth = {
  open(){
    modal.open("Sign up / Sign in", `
      <div class='fee'>
        <div><small class='muted'>Email</small><input id='em' class='input' placeholder='you@example.com'></div>
        <div><small class='muted'>Password</small><input id='pw' type='password' class='input' placeholder='••••••••'></div>
        <div><small class='muted'>Account type</small><select id='ar' class='input'><option value='buyer'>Buyer</option><option value='seller'>Apply as Vendor</option></select></div>
      </div>
      <div class='small muted'>A random <strong>SILK ID</strong> will be generated to keep you anonymous.</div>
    `,[{label:"Cancel",ghost:true},{label:"Continue",primary:true,onClick:()=>{
      const email=($("#em").value||"").trim(), pass=($("#pw").value||"").trim(), role=$("#ar").value;
      if(!email||!pass){ alert("Email and password required."); return; }
      const silkId = makeSilkId();
      state.user = { id:"u_"+Date.now(), email, role, silkId, name: email.split("@")[0], vendor:{approved:false,subscribed:false} };
      persist();
      modal.open("Your SILK ID", `<p class='small'>Copy this for your records:</p><p><strong>${state.user.silkId}</strong></p>`,[{label:"Close",primary:true}]);
      render.refreshNav();
    }}]);
  },
  signOut(){ state.user=null; persist(); render.refreshNav(); location.href="index.html"; }
};
window.auth = auth;

// Wallet (demo)
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
  connectPhantom(){ window.open('https://phantom.app/', '_blank'); },
  connectTrust(){ window.open('https://trustwallet.com/', '_blank'); },
  simulate(){ state.user = state.user || { id:"demo", name:"demo", role:"buyer" }; state.user.wallet = { address:"0xDEMO...", chain:"EVM", connected:true }; persist(); modal.open("Wallet Connected","<p class='small'>Demo wallet connected.</p>",[{label:"Close",primary:true}]); }
};
window.wallet = wallet;

// Gating helpers
function requireUser(){ if(!state.user){ auth.open(); return false; } return true; }
function requireVendor(){ if(!state.user){ auth.open(); return false; } const v=state.user.vendor||{}; if(!(v.approved && v.subscribed)){ alert("Vendor approval + subscription required."); return false; } return true; }

// Cart
function saveCart(){ localStorage.setItem("cx_cart", JSON.stringify(state.cart)); render.refreshNav(); }
function addToCart(id){ if(!requireUser()) return; const it=byId(id); if(!it || !it.buyNowEnabled || !it.price) return alert("This item is auction-only."); if(state.cart.find(c=>c.id===id)) return toast("Already in cart"); state.cart.push({id, qty:1}); saveCart(); toast("Added to cart"); }
function removeFromCart(id){ state.cart = state.cart.filter(c=>c.id!==id); saveCart(); render.cartModal(); }
function cartTotal(){ return state.cart.reduce((s,c)=>{ const it=byId(c.id); return s + (it? it.price*c.qty : 0); },0); }
render.cartModal = function(){ if(!state.user){ auth.open(); return; } const rows = state.cart.map(c=>{ const it=byId(c.id); if(!it) return ""; return `<div class='fee'><div><a href='item.html?id=${it.id}'>${it.title}</a></div><div>${fmt(it.price)}</div><div><button class='btn btn--sm' onclick='removeFromCart("${it.id}")'>Remove</button></div></div>`; }).join("") || "<p class='small muted'>Your cart is empty.</p>";
  const subtotal = cartTotal(); const total = subtotal*(1+FEE_BUYER);
  modal.open("Your Cart", `
    ${rows}
    <hr/>
    <div class='fee'><div>Subtotal</div><div>${fmt(subtotal)}</div></div>
    <div class='fee'><div>Buyer fee</div><div>${fmt(subtotal*FEE_BUYER)}</div></div>
    <div class='fee'><div><strong>Total</strong></div><div><strong>${fmt(total)}</strong></div></div>
    <p class='small muted'>Checkout places funds in escrow until delivery is confirmed.</p>
  `,[{label:"Close",ghost:true},{label:"Checkout",primary:true,onClick:()=>{
    if(state.wallet < total){ alert("Insufficient wallet."); return; }
    state.wallet -= total;
    const buyerId = (state.user && state.user.silkId) || "unknown";
    state.cart.forEach(c=>{ const it=byId(c.id); if(!it) return; state.sales.push({ itemId: it.id, price: it.price, ts: Date.now(), sellerId: it.sellerId, buyerId }); });
    state.cart = []; saveCart(); persist(); render.wallet(); modal.open("Order Placed", "<p class='small'>Funds held in escrow. Vendors will ship discreetly.</p>",[{label:"Close",primary:true}]);
  }}]);
};

// Messaging
function saveMsgs(){ localStorage.setItem("cx_msgs", JSON.stringify(state.messages)); }
function threadIdFor(buyerId, vendorId){ return `t_${buyerId}_${vendorId}`; }
function openMessages(vendorId){
  if(!requireUser()) return;
  const buyerId = (state.user && state.user.silkId) || "unknown";
  const tid = threadIdFor(buyerId, vendorId);
  let t = state.messages.find(x=>x.threadId===tid);
  if(!t){ t={threadId:tid, buyerId, vendorId, messages:[]}; state.messages.push(t); saveMsgs(); }
  const body = `<div id='chatBox' class='card' style='max-height:300px; overflow:auto; margin-bottom:10px'>${t.messages.map(m=>`<div class='small'><strong>${m.from}:</strong> ${m.text}</div>`).join("")}</div>
    <div class='fee'><input id='chatMsg' class='input' placeholder='Message vendor...'><button class='btn btn--primary' onclick='sendMsg(\"${tid}\")'>Send</button></div>`;
  modal.open("Messages (anonymous)", body, [{label:"Close",primary:true}]);
}
window.openMessages = openMessages;
function sendMsg(tid){
  const t = state.messages.find(x=>x.threadId===tid); if(!t) return;
  const inp = $("#chatMsg"); const txt=(inp.value||"").trim(); if(!txt) return;
  t.messages.push({from:(state.user && state.user.silkId)||"you", text: txt, ts: Date.now()});
  saveMsgs();
  // demo vendor auto-reply
  t.messages.push({from:"vendor", text:"Thanks for your message. We'll respond shortly.", ts: Date.now()+500});
  saveMsgs();
  openMessages(t.vendorId); // re-open
}

// Bids & Buy Now
function bidIncrement(amount){ if(amount<1000) return 10; if(amount<5000) return 25; return 50; }
function minBidFor(it){
  const base = it.price ? Math.ceil(it.price*MIN_BID_FACTOR) : (it.auctionStart||0);
  const top = topBidAmt(it.id);
  const inc = bidIncrement(top || base || 0);
  return Math.max(base, top ? top + inc : base);
}
function placeBid(itemId){
  const it=byId(itemId);
  if(it.isAuction && it.auctionEnds && Date.now()>it.auctionEnds){ modal.open("Auction Ended", `<p class='small'>This auction has ended.</p>`); return; }
  if(!it.allowBids || it._ended){ modal.open("Bids Disabled", `<p class='small'>Bidding is closed for this item.</p>`); return; }
  const min = minBidFor(it);
  modal.open("Place LIVE BID", `
    <div class='fee'>
      <div><small class='muted'>Item</small><strong>${it.title}</strong></div>
      <div><small class='muted'>${it.price? "Ask":"Start"}</small><strong>${fmt(it.price||it.auctionStart)}</strong></div>
      <div><small class='muted'>Your bid (≥ ${fmt(min)})</small><input id='bidAmt' class='input' value='${min}'></div>
      <div class='small muted'>Minimum increments apply.</div>
    </div>
  `, [{label:"Cancel", ghost:true},{label:"Place Bid", primary:true, onClick:()=>{
    const n=parseFloat($("#bidAmt").value||"0"); if(isNaN(n) || n < min){ alert("Bid must meet the minimum."); return; }
    const arr = state.bids[itemId] || (state.bids[itemId]=[]);
    const u = state.user? (state.user.silkId || state.user.name) : "guest";
    arr.push({ amt:n, ts:Date.now(), user: u });
    persist();
    liveTicker.pushImmediate(`LIVE BID: <strong>${it.title}</strong> — ${fmt(n)} by ${u}`);
    modal.close();
    ["item","auctions","shop","home"].forEach(p=>{ if(document.body.dataset.page===p) { if(p==="item") render.itemDetail(); if(p==="auctions") render.auctions(); if(p==="shop") render.shop(); if(p==="home") render.home(); } });
  }}]);
}
function buyNow(itemId){
  const it=byId(itemId);
  if(!it.buyNowEnabled || !it.price){ modal.open("Buy Now Unavailable", `<p class='small'>This listing is auction-only.</p>`); return; }
  if(!requireUser()) return;
  const hold = it.price * (1+FEE_BUYER);
  if(state.wallet < hold){ modal.open("Insufficient Funds", `<p class='small muted'>You need ${fmt(hold-state.wallet)} more to place this order.</p>`, [{label:"Close"}]); return; }
  state.wallet -= hold; // escrow
  // record sale for leaderboard
  const buyerId = (state.user && state.user.silkId) || "unknown";
  state.sales.push({ itemId: it.id, price: it.price, ts: Date.now(), sellerId: it.sellerId, buyerId });
  persist(); render.wallet();
  modal.open("Order Placed", `<p class='small'>Funds held in escrow. Vendor ships with signature required.</p>`);
}
window.placeBid = placeBid; window.buyNow = buyNow;

// Watchlist
function toggleWatch(id){ const i=state.watch.indexOf(id); if(i>=0) state.watch.splice(i,1); else state.watch.push(id); localStorage.setItem("cx_watch",JSON.stringify(state.watch)); if(document.body.dataset.page==="shop") render.shop(); if(document.body.dataset.page==="item") render.itemDetail(); }
function isWatched(id){ return state.watch.includes(id); }
window.toggleWatch = toggleWatch;

// Vendor flows
const vendor = {
  apply(){
    if(!requireUser()) return;
    modal.open("Vendor Application", `
      <div class='fee'>
        <div><small class='muted'>Proof of inventory (links)</small><input id='v_inv' class='input' placeholder='Drive/Dropbox/IG highlights'></div>
        <div><small class='muted'>External reviews (links)</small><input id='v_rev' class='input' placeholder='Grailed/Reddit/Trustpilot'></div>
        <div><small class='muted'>Fulfilment commitment</small>
          <select id='v_ful' class='input'>
            <option>Ship within 48 hours</option>
            <option>Ship within 72 hours</option>
            <option>Ship within 5 days</option>
          </select>
        </div>
        <div><small class='muted'>KYC (demo)</small><input id='v_kyc' class='input' placeholder='Upload link or note (demo)'></div>
      </div>
    `,[{label:"Cancel",ghost:true},{label:"Submit",primary:true,onClick:()=>{
      state.user.vendor = state.user.vendor || {};
      state.user.vendor.application = { inventory:$("#v_inv").value, reviews:$("#v_rev").value, fulfilment:$("#v_ful").value, kyc:$("#v_kyc").value, ts:Date.now(), status:"pending" };
      persist(); modal.open("Submitted","<p class='small'>Application pending. You can simulate approval in this demo.</p>",[{label:"Close",primary:true}]);
    }}]);
  },
  simulateApprove(){ if(!requireUser()) return; state.user.vendor.approved = true; if(state.user.vendor.application) state.user.vendor.application.status="approved"; persist(); modal.open("Vendor Approved","<p class='small'>Please subscribe to activate listings.</p>",[{label:"Close",primary:true}]); },
  subscribe(){
    if(!requireUser()) return;
    const fee=99;
    modal.open("Vendor Subscription", `<p class='small'>Monthly fee: <strong>${fmt(fee)}</strong> (deducted from wallet in demo)</p>`, [{label:"Cancel",ghost:true},{label:"Subscribe",primary:true,onClick:()=>{ if(state.wallet<fee){ alert("Insufficient wallet."); return; } state.wallet-=fee; state.user.vendor.subscribed=true; persist(); render.wallet(); modal.open("Active","<p class='small'>Subscription active.</p>",[{label:"Close",primary:true}]); }}]);
  }
};
window.vendor = vendor;

// Seller (vendor) + uploads
const seller = { _images: [], bindFileInput(){ const el=$("#s_files"), prev=$("#s_preview"); if(!el||!prev) return;
    el.onchange=async (e)=>{ seller._images=[]; prev.innerHTML=""; const files=Array.from(e.target.files||[]).slice(0,6);
      for(const f of files){ const url=await fileToDataURL(f); seller._images.push(url); const im=document.createElement("img"); im.src=url; prev.appendChild(im); } };
    const dSel=$("#s_duration"); if(dSel){ dSel.innerHTML = DURATIONS.map(([t,_])=>`<option>${t}</option>`).join(""); }
    const type=$("#s_type"), buySel=$("#s_buyNow"), buyWrap=$("#auctionBuyNow"), fixed=$("#fixedFields"), auc=$("#auctionFields");
    function refresh(){ const isA = type.value==="auction"; fixed.classList.toggle("hidden", isA); auc.classList.toggle("hidden", !isA); buyWrap.classList.toggle("hidden", buySel && buySel.value!=="true"); }
    if(type){ type.onchange=refresh; } if(buySel){ buySel.onchange=refresh; } refresh();
  },
  create(){
    if(!requireVendor()) return;
    const type=$("#s_type").value;
    const t=$("#s_title").value.trim(), b=$("#s_brand").value.trim(), cat=$("#s_category").value, c=$("#s_condition").value, s=$("#s_size").value.trim();
    const d=$("#s_desc").value.trim(); const imgs=seller._images;
    if(!t||!b){ alert("Please fill title and brand."); return; }
    const id=String(Date.now());
    let item = { id, title:t, brand:b, category:cat, condition:c, size:s, desc:d, images: imgs.slice(), img: (imgs[0]||"assets/og.png"), sellerId: state.user.id, allowBids:true, isAuction:false, buyNowEnabled:true, auctionEnds:null, auctionStart:null, boosted: $("#s_boost").value==="true" };
    if(type==="fixed"){
      const p=parseFloat($("#s_price").value||"0"); if(!p){ alert("Please enter an ask price."); return; }
      item.price=p; item.buyNowEnabled=true; item.allowBids = $("#s_allow").value==="true";
    } else {
      const start=parseFloat($("#s_start").value||"0"); if(!start){ alert("Please enter a start price."); return; }
      const dSel=$("#s_duration").value; const dur = (DURATIONS.find(([t,_])=>t===dSel)||DURATIONS[6])[1];
      item.isAuction=true; item.auctionStart=start; item.auctionEnds = Date.now()+dur;
      const allowBN = $("#s_buyNow").value==="true"; item.buyNowEnabled = allowBN;
      if(allowBN){ const p=parseFloat($("#s_price_auction").value||"0"); if(!p){ alert("Enter a Buy Now price or select 'auction only'."); return; } item.price=p; } else { item.price = 0; }
    }
    state.items.push(item); persist();
    render.sellerListings(); modal.open("Listing Created", `<p class='small'>Your item is now live.</p>`, [{label:"Close",primary:true}]);
    ["s_title","s_brand","s_size","s_price","s_start","s_desc","s_price_auction"].forEach(id=>{ const el=$("#"+id); if(el) el.value=""; }); seller._images=[]; const prev=$("#s_preview"); if(prev) prev.innerHTML="";
  }
};
window.seller = seller;
function fileToDataURL(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }

// Render
const render = {
  wallet(){ const y=$("#year"); if(y) y.textContent = new Date().getFullYear(); const cartBtn=$("#cartBtn"); if(cartBtn) cartBtn.textContent=`Cart${state.cart.length? " ("+state.cart.length+")":""}`; },
  priceMeta(i){
    const top = topBidAmt(i.id);
    const buy = (i.buyNowEnabled && i.price) ? `Buy: <strong>${fmt(i.price)}</strong>` : `<span class="muted">Auction only</span>`;
    const cur = (i.allowBids || i.isAuction) ? `Current bid: <strong>${top?fmt(top):"–"}</strong>` : "";
    const end = (i.isAuction && i.auctionEnds) ? ` • <span class="countdown" data-end="${i.auctionEnds}">Ends</span>` : "";
    return `<div class="meta"><span>${buy}</span><span>${cur}</span>${end}</div>`;
  },
  cards(sel, items){
    items = items.slice().sort((a,b)=>(b.boosted?1:0)-(a.boosted?1:0));
    const c = $(sel); if(!c) return;
    c.innerHTML = items.map(i=>`
      <div class="tile">
        <div class="tile__head"><button class="heart ${isWatched(i.id)?'heart--on':''}" onclick="toggleWatch('${i.id}')" aria-label="Watch">♥</button> ${i.boosted?'<span class="badge" style="border-color:#FF474C;color:#FF474C">BOOSTED</span>':''} ${i._ended?'<span class="badge badge--ended">Ended</span>':''}</div>
        <a href="item.html?id=${i.id}"><img src="${i.img}" alt="${i.title}" onerror="this.src='assets/og.png'"></a>
        <div class="row"><div><div class="small muted">${i.brand} • ${i.condition}${i.size? " • Size "+i.size:""} • ${i.category||"Clothing"}</div>
          <strong><a href="item.html?id=${i.id}">${i.title}</a></strong>
          ${render.priceMeta(i)}
        </div></div>
        <div class="row">
          ${(i.buyNowEnabled && i.price && !i._ended) ? `<button class="btn btn--primary" onclick="buyNow('${i.id}')">Buy Now</button> ${state.user?`<button class='btn' onclick='addToCart(\"${i.id}\")'>Add to Cart</button>`:''}` : ``}
          <button class="btn btn--ghost" onclick="placeBid('${i.id}')" ${(i.allowBids && !i._ended)? "":"disabled"}>LIVE BID</button>
          ${(state.user && state.user.role==='seller' && state.user.id===i.sellerId)? `<button class='btn btn--ghost' onclick='boostListing(\"${i.id}\")'>Boost</button>` : ``}
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
      const ends = i.isAuction && i.auctionEnds ? `<span class='countdown' data-end='${i.auctionEnds}'>Ends</span>` : (i._ended? "Ended":"—");
      const row = document.createElement("div");
      row.className="row--list";
      row.innerHTML = `<div><button class="heart ${isWatched(i.id)?'heart--on':''}" onclick="toggleWatch('${i.id}')" aria-label="Watch">♥</button> <a href="item.html?id=${i.id}">${i.title}</a></div><div>${i.brand}</div><div>${ask}</div><div>${top?fmt(top):"–"}</div><div>${ends}</div>
        <div>${(i.buyNowEnabled && i.price && !i._ended) ? `<button class="btn btn--primary" onclick="buyNow('${i.id}')">Buy</button> ${state.user?`<button class='btn' onclick='addToCart(\"${i.id}\")'>Add</button>`:''}`:""} <button class="btn btn--ghost" onclick="placeBid('${i.id}')" ${(i.allowBids && !i._ended)? "":"disabled"}>Bid</button> ${(state.user && state.user.role==='seller' && state.user.id===i.sellerId)? `<button class='btn btn--ghost' onclick='boostListing(\"${i.id}\")'>Boost</button>` : ``}</div>`;
      l.appendChild(row);
    });
    render.bindCountdowns();
  },
  shop(){
    const q=$("#q"), b=$("#brand"), c=$("#cond"), catSel=$("#category"), s=$("#sort"); if(!q) return;
    b.innerHTML = "<option value=''>All brands</option>"+BRANDS.map(b=>`<option>${b}</option>`).join("");
    function apply(){
      const qs=(q.value||"").toLowerCase(), br=b.value, co=c.value, cat=catSel.value, sort=s.value;
      let arr = state.items.filter(i =>
        (!br || i.brand===br) && (!co || i.condition===co) && (!cat || i.category===cat) &&
        (!qs || (i.title+" "+i.brand).toLowerCase().includes(qs))
      );
      const hashCat = (location.hash.startsWith("#cat=") ? decodeURIComponent(location.hash.split("=")[1]) : "");
      if(hashCat) arr = arr.filter(i=>i.category===hashCat);
      if(sort==="plh") arr.sort((a,b)=>(a.price||Infinity)-(b.price||Infinity));
      if(sort==="phl") arr.sort((a,b)=>(b.price||0)-(a.price||0));
      if(sort==="new") arr.sort((a,b)=> (parseInt(b.id)-parseInt(a.id)));
      if(sort==="end") arr.sort((a,b)=> ( (a.auctionEnds||Infinity) - (b.auctionEnds||Infinity) ));
      render.cards("#grid", arr); render.listRows("#list", arr);
    }
    [q,b,c,catSel,s].forEach(el=>{ if(el){ el.oninput=apply; el.onchange=apply; }});
    apply();
  },
  home(){ const mv=topMostViewed(10); render.cards("#mostViewed", mv.length?mv:state.items.slice(0,10)); const hb=highestCurrentBids(10); render.cards("#highestBids", hb.length?hb:state.items.slice(0,10)); },
  auctions(){ const l=$("#auctionsList"); if(!l) return; l.innerHTML=""; const head=document.createElement("div"); head.className="row--list head";
    head.innerHTML="<div>Item</div><div>Brand</div><div>Ask / Buy Now</div><div>Current Bid</div><div>Ends</div><div>Action</div>"; l.appendChild(head);
    state.items.filter(i=>i.allowBids || i.isAuction).forEach(i=>{ const top=topBidAmt(i.id); const ask = i.buyNowEnabled && i.price ? fmt(i.price) : "Auction only";
      const ends = i.isAuction && i.auctionEnds ? `<span class='countdown' data-end='${i.auctionEnds}'>Ends</span>` : (i._ended? "Ended":"—");
      const row=document.createElement("div"); row.className="row--list";
      row.innerHTML=`<div><a href="item.html?id=${i.id}">${i.title}</a></div><div>${i.brand}</div><div>${ask}</div><div>${top?fmt(top):"-"}</div><div>${ends}</div>
        <div><button class="btn btn--ghost" onclick="placeBid('${i.id}')">LIVE BID</button> ${i.buyNowEnabled && i.price? `<button class="btn btn--primary" onclick="buyNow('${i.id}')">Buy Now</button>`:""}</div>`; l.appendChild(row); });
    render.bindCountdowns();
  },
  itemDetail(){ const p=new URLSearchParams(location.search); const id=p.get("id"); const it=byId(id); if(!it) return; addView(id);
    const s=sellerById(it.sellerId)||{name:"@vendor",rating:4.8,reviews:40,avgShipDays:2.5,id:it.sellerId};
    const top=topBidAmt(id); const ends=it.isAuction && it.auctionEnds ? `<div class="countdown" data-end="${it.auctionEnds}">Ends</div>` : (it._ended? `<div class="badge badge--ended">Ended</div>`:"");
    const gallery = (it.images && it.images.length>1) ? `<div class="gallery">`+it.images.map(u=>`<img src="${u}" onclick="document.getElementById('heroImg').src='${u}'">`).join("")+`</div>`:"";
    $("#itemDetail").innerHTML=`<div><img id="heroImg" src="${(it.images&&it.images[0])||it.img}" alt="${it.title}" onerror="this.src='assets/og.png'">${gallery}</div>
      <div><h1>${it.title} ${isWatched(it.id)?'♥':''}</h1><div class="muted small">${it.brand} • ${it.condition}${it.size? " • Size "+it.size:""} • ${it.category||"Clothing"}</div>
      ${(it.buyNowEnabled && it.price && !it._ended) ? `<div class="price" style="margin:12px 0">${fmt(it.price)}</div>` : `<div class="badge">Auction only</div>`}
      ${ends}
      <p class="small" style="line-height:1.6">${it.desc||""}</p>
      <div class="muted small">Top bid: ${top?fmt(top):"–"} ${it.allowBids? `(min live bid: ${fmt(minBidFor(it))})`:"(bids disabled by vendor)"}</div>
      <div class="mt-2">
        ${(it.buyNowEnabled && it.price && !it._ended) ? `<button class="btn btn--primary" onclick="buyNow('${id}')">Buy Now</button> ${state.user?`<button class='btn' onclick='addToCart(\"${id}\")'>Add to Cart</button>`:''}` : ``}
        <button class="btn btn--ghost" onclick="placeBid('${id}')" ${(it.allowBids && !it._ended)? "":"disabled"}>Place LIVE BID</button>
      </div>
      <div class="card" style="margin-top:12px"><div class="small muted">Vendor</div>
      <div><a href="profile.html">${s.name||"@vendor"}</a> • ⭐ ${s.rating||4.8} (${s.reviews||0} reviews) • Avg ship ${s.avgShipDays||2.5} days
      <div class="mt-2"><button class="btn btn--ghost" onclick="openMessages('${s.id||it.sellerId}')">Message Vendor</button></div>
      </div></div>`;
    render.bindCountdowns();
    // Disclaimer
    const cont = document.createElement("div"); cont.className="card"; cont.style.marginTop="12px"; cont.innerHTML="<div class='small muted'>Disclaimer: 0 personal information will be shared with vendors. All shipping is handled discreetly via the platform, and vendors do not directly access any buyer details provided upon purchase.</div>"; document.querySelector(".item-detail").appendChild(cont);
  },
  sellerListings(){ if(document.body.dataset.page!=="sell") return;
    const portal = document.querySelector(".sell-scope") || document.body;
    if(!state.user){
      const info = document.createElement("div"); info.className="card";
      info.innerHTML = "<div class='card__title'>Become a Vendor</div><p class='small'>To sign up to become a Vendor you must pass a KYC check, provide proof of inventory, and demonstrate sufficient means to ship on time. Create an account to apply.</p><button class='btn btn--primary' onclick='auth.open()'>Create Account</button>";
      portal.parentNode.insertBefore(info, portal);
    } else {
      const v = state.user.vendor || {};
      let note = "";
      if(!v.application){ note = `<div class='card'><div class='card__title'>Apply to be a Vendor</div><p class='small'>Only approved, KYC-compliant vendors can sell on SilkExchange.</p><button class='btn btn--primary' onclick='vendor.apply()'>Apply</button> <button class='btn btn--ghost' onclick='vendor.simulateApprove()'>Simulate Approve (demo)</button></div>`; }
      else if(!v.approved){ note = `<div class='card'><div class='card__title'>Application Status: ${v.application.status||"pending"}</div><p class='small'>We will notify you once approved.</p><button class='btn' onclick='vendor.simulateApprove()'>Simulate Approve (demo)</button></div>`; }
      else if(!v.subscribed){ note = `<div class='card'><div class='card__title'>Vendor Subscription Required</div><p class='small'>Subscribe monthly to activate your listings.</p><button class='btn btn--primary' onclick='vendor.subscribe()'>Subscribe</button></div>`; }
      if(note){ const container = document.createElement("div"); container.className="section"; container.innerHTML = `<div class='section__head'><h2>Vendor Access</h2></div>${note}`; portal.parentNode.insertBefore(container, portal.nextSibling); }
      // Disable create button if not approved+subscribed
      const createBtn = document.querySelector("button.btn.btn--primary[onclick='seller.create()']");
      if(createBtn){ const ok = (v.approved && v.subscribed); createBtn.disabled = !ok; createBtn.title = ok? "" : "Vendor approval + subscription required"; }
    }
    // Populate your listings
    const me=state.user && state.user.id; const mine = me? state.items.filter(i=>i.sellerId===me) : [];
    const grid = $("#sellerListings"); if(grid){ render.cards("#sellerListings", mine); }
  },
  profile(){ if(!state.user){ auth.open(); return; } const u=state.user; const card=$("#profileCard"); if(card){ card.innerHTML = `
      <div class='fee'><div>Email</div><div>${u.email||"-"}</div></div>
      <div class='fee'><div>SILK ID</div><div><strong>${u.silkId}</strong></div></div>
      <div class='fee'><div>Role</div><div>${u.role}</div></div>
      <div class='mt-2'><button class='btn' onclick='ui.openDeposit()'>Deposit</button> <button class='btn btn--ghost' onclick='auth.signOut()'>Sign out</button></div>`; }
    // Orders
    const list=$("#ordersList"); if(list){ list.innerHTML=""; const my = state.sales.filter(s=>s.buyerId===u.silkId); const head=document.createElement("div"); head.className="row--list head"; head.innerHTML="<div>Item</div><div>Price</div><div>Seller</div><div>Date</div><div></div><div></div>"; list.appendChild(head);
      my.forEach(s=>{ const it=byId(s.itemId); const sv=sellerById(s.sellerId); const row=document.createElement("div"); row.className="row--list"; row.innerHTML=`<div>${it? it.title:"Item"}</div><div>${fmt(s.price)}</div><div>${sv?sv.name:"@vendor"}</div><div>${new Date(s.ts).toLocaleDateString()}</div><div></div><div></div>`; list.appendChild(row); });
    }
  },
  leaderboard(){
    const sel=$("#lbRange"); if(!sel) return;
    function cutoff(){ const v=sel.value; const now=Date.now(); if(v==="daily") return now-24*3600*1000; if(v==="weekly") return now-7*24*3600*1000; if(v==="monthly") return now-30*24*3600*1000; return 0; }
    function apply(){
      const cut = cutoff();
      const rows = state.sales.filter(s=>(s.buyerId && s.ts>=cut)).reduce((m,s)=>{ m[s.buyerId]=(m[s.buyerId]||0)+s.price; return m; },{});
      const sorted = Object.entries(rows).sort((a,b)=>b[1]-a[1]);
      const list = $("#lbList"); list.innerHTML = "";
      const head = document.createElement("div"); head.className="row--list head"; head.innerHTML="<div>Rank</div><div>SILK ID</div><div>Total Spent</div><div>Purchases</div><div></div><div></div>"; list.appendChild(head);
      sorted.forEach(([buyer, total], i)=>{
        const purchases = state.sales.filter(s=>s.buyerId===buyer).map(s=>byId(s.itemId)).filter(Boolean);
        const row = document.createElement("div"); row.className="row--list";
        row.innerHTML = `<div>#${i+1}</div><div>${buyer}</div><div>${fmt(total)}</div><div>${purchases.length}</div><div></div><div></div>`;
        list.appendChild(row);
      });
    }
    sel.onchange=apply; apply();
  },
  admin(){
    const body=$("#adminBody"); if(!body) return;
    const stats = `<div class='card'><div class='card__title'>Overview</div>
      <div class='fee'><div>Current user</div><div>${state.user? (state.user.email||state.user.silkId):"None"}</div></div>
      <div class='fee'><div>Items</div><div>${state.items.length}</div></div>
      <div class='fee'><div>Sales (7d)</div><div>${state.sales.filter(s=>s.ts>=Date.now()-7*24*3600*1000).length}</div></div>
    </div>`;
    const vhtml = `<div class='card'><div class='card__title'>Vendor Applications (demo — current user)</div>
      ${state.user && state.user.vendor && state.user.vendor.application ? `<div class='fee'><div>${state.user.vendor.application.inventory||"inventory?"}</div><div>${state.user.vendor.application.status||"pending"}</div></div>` : "<p class='small muted'>No captured applications.</p>"}
    </div>`;
    const chats = state.messages||[];
    const chtml = `<div class='card'><div class='card__title'>Chats</div>
      ${chats.length? chats.map(t=>`<div class='fee'><div>${t.threadId}</div><div>${t.messages.length} messages</div></div>`).join("") : "<p class='small muted'>No chats yet.</p>"}
    </div>`;
    body.innerHTML = stats + vhtml + chtml;
  },
  bindCountdowns(){ function tick(){ $$(".countdown").forEach(el=>{ const end=parseInt(el.dataset.end||"0",10); if(!end) return; const d=end-Date.now(); if(d<=0){ el.textContent="Ended"; } else { const s=Math.floor(d/1000); const dd=Math.floor(s/86400); const hh=Math.floor((s%86400)/3600); const mm=Math.floor((s%3600)/60); const ss=s%60; el.textContent=(dd>0?`${dd}d ${hh}h`:(hh>0?`${hh}h ${mm}m`:(mm>0?`${mm}m ${ss}s`:`${ss}s`))); } }); } tick(); clearInterval(render._cdTimer); render._cdTimer=setInterval(tick,1000); },
  refreshNav(){
    const nav = document.querySelector(".nav__links"); if(nav && !document.getElementById("cartBtn")){ const b=document.createElement("button"); b.id="cartBtn"; b.className="btn btn--ghost btn--sm"; b.textContent="Cart"; b.onclick=()=>render.cartModal(); nav.appendChild(b); }
    const cartBtn = document.getElementById("cartBtn"); if(cartBtn){ cartBtn.style.display = state.user? "inline-flex":"none"; cartBtn.textContent = `Cart${state.cart.length? " ("+state.cart.length+")":""}`; }
  }
};

// Boost (only visible if vendor viewing own listing via render)
function boostListing(itemId){
  const it=byId(itemId); const cost=10;
  modal.open("Boost Listing", `<p class='small'>Boost for <strong>${fmt(cost)}</strong>. Shows higher with a badge.</p>`,[{label:"Cancel",ghost:true},{label:"Boost",primary:true,onClick:()=>{ if(state.wallet<cost){ alert("Insufficient wallet"); return; } state.wallet-=cost; it.boosted=true; persist(); render.shop(); render.home(); render.auctions(); modal.open("Boosted","<p class='small'>Listing boosted.</p>",[{label:"Close",primary:true}]); }}]);
}
window.boostListing = boostListing;

// Service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('service-worker.js').catch(()=>{}); });
}

// Drawer & init
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById('menuBtn'); const drawer = document.getElementById('drawer'); const drawerClose = document.getElementById('drawerClose');
  if (menuBtn && drawer) menuBtn.addEventListener('click', () => drawer.classList.add('drawer--open'));
  if (drawerClose && drawer) drawerClose.addEventListener('click', () => drawer.classList.remove('drawer--open'));
  if (drawer) drawer.addEventListener('click', (e) => { if (e.target === drawer) drawer.classList.remove('drawer--open'); });

  render.refreshNav(); render.wallet(); liveTicker.start();
  const page=document.body.dataset.page;
  if(page==="shop"){ ui.setView('grid'); render.shop(); }
  if(page==="home"){ render.home(); }
  if(page==="auctions"){ render.auctions(); }
  if(page==="item"){ render.itemDetail(); }
  if(page==="profile"){ render.profile(); }
  if(page==="sell"){ render.sellerListings(); seller.bindFileInput(); }
  if(page==="leaderboard"){ render.leaderboard(); }
  if(page==="admin"){ render.admin(); }
});

// Toast
let toastTimer;
function toast(msg){
  let el = document.getElementById("toast");
  if(!el){ el = document.createElement("div"); el.id="toast"; el.className="toast"; document.body.appendChild(el); }
  el.textContent = msg; clearTimeout(toastTimer); el.style.position="fixed"; el.style.bottom="84px"; el.style.left="50%"; el.style.transform="translateX(-50%)"; el.style.background="#5D6164"; el.style.border="1px solid var(--border)"; el.style.padding="10px 14px"; el.style.borderRadius="12px"; el.style.zIndex="30"; toastTimer=setTimeout(()=>{ el.style.display="none"; }, 2500);
}
