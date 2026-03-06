/* =====================================================
   CrypCard — app.js
   Full SPA Logic · Mocked APIs · State Management
===================================================== */
'use strict';

// ═══════════════════════════════════════
// STATE  (// INTEGRATION: Replace with Zustand/Redux store)
// ═══════════════════════════════════════
const state = {
  user: { name: 'John Doe', email: 'john@example.com', referralCode: 'CRYPT2025' },
  cardType: 'visa',
  cardFrozen: false,
  spendLimit: 5000,
  kycStatus: 'pending', // 'pending' | 'approved' | 'rejected'
  kycStep: 0,           // 0=none, 1=personal,2=id,3=selfie
  bioEnabled: false,
  currentScreen: 'screen-splash',
  previousScreen: null,
  currentTab: 'home',
  depositCoin: 'USDT',
  depositNetwork: 'ERC-20',
  wallet: {
    USDT: { balance: 0,   address: '0xA1B2C3D4E5F6789012345678AbCdEf0123456789', price: 1.00 },
    USDC: { balance: 0,   address: '0xB2C3D4E5F67890123456789AbCdEf01234567890', price: 1.00 },
    BTC:  { balance: 0,   address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf', price: 67420 },
    ETH:  { balance: 0,   address: '0xC3D4E5F678901234567890AbCdEf012345678901', price: 3520 }
  },
  fiatBalance: 0,
  card: {
    number: '4291 8812 3344 5566',
    expiry: '12/28',
    cvv: '492',
    network: 'VISA'
  },
  transactions: [],
  recoveryPhrase: []
};

// ═══════════════════════════════════════
// MOCK DATA  (// INTEGRATION: Replace with real API calls)
// ═══════════════════════════════════════
const MOCK_PHRASE_WORDS = ['abandon','ability','able','about','above','absent','absorb','abstract','absurd','abuse','access','accident','account','accuse','achieve','acid','acoustic','acquire','across','action','actor','actress','actual','adapt'];

const MOCK_OFFERS = [
  { icon: '🛒', store: 'Amazon', desc: 'Earn 5% cashback on all purchases', rate: '5%' },
  { icon: '📦', store: 'Flipkart', desc: 'Get 3% back on electronics', rate: '3%' },
  { icon: '🍕', store: 'Swiggy', desc: '2% cashback on food orders', rate: '2%' },
  { icon: '✈️', store: 'MakeMyTrip', desc: '4% cashback on flight bookings', rate: '4%' },
  { icon: '👗', store: 'Myntra', desc: '3.5% cashback on fashion', rate: '3.5%' },
  { icon: '🎮', store: 'Steam', desc: '1% cashback on game purchases', rate: '1%' }
];

const COIN_CHANGES = { USDT: '+0.01%', USDC: '+0.00%', BTC: '+2.4%', ETH: '+1.8%' };

// ═══════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════
function navigate(screenId) {
  const prev = document.querySelector('.screen.active');
  const next = document.getElementById(screenId);
  if (!next || prev === next) return;
  state.previousScreen = state.currentScreen;
  state.currentScreen = screenId;
  prev.classList.remove('active');
  next.classList.add('active', 'slide-in');
  setTimeout(() => next.classList.remove('slide-in'), 350);
  // Refresh data for specific screens
  if (screenId === 'screen-app') refreshApp();
  if (screenId === 'screen-offers') renderOffers();
}

function goBack() {
  if (state.previousScreen) navigate(state.previousScreen);
  else navigate('screen-app');
}

// ═══════════════════════════════════════
// SPLASH → ONBOARDING
// ═══════════════════════════════════════
window.addEventListener('load', () => {
  setTimeout(() => navigate('screen-onboarding'), 2800);
});

// ═══════════════════════════════════════
// ONBOARDING SLIDES
// ═══════════════════════════════════════
let currentSlide = 0;
const totalSlides = 3;

function updateSlides() {
  document.querySelectorAll('.slide').forEach((s, i) => s.classList.toggle('active', i === currentSlide));
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  document.getElementById('ob-prev').style.visibility = currentSlide === 0 ? 'hidden' : 'visible';
  document.getElementById('ob-next').textContent = currentSlide === totalSlides - 1 ? 'Get Started →' : 'Next →';
}

function nextSlide() {
  if (currentSlide < totalSlides - 1) { currentSlide++; updateSlides(); }
  else navigate('screen-auth');
}
function prevSlide() {
  if (currentSlide > 0) { currentSlide--; updateSlides(); }
}

// ═══════════════════════════════════════
// AUTH
// ═══════════════════════════════════════
function switchTab(tab) {
  if (document.getElementById('form-login')) {
    // Auth screen tabs
    document.getElementById('form-login').classList.toggle('hidden', tab !== 'login');
    document.getElementById('form-signup').classList.toggle('hidden', tab !== 'signup');
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-signup').classList.toggle('active', tab !== 'login');
    return;
  }
  // App bottom tabs
  switchAppTab(tab);
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  if (!email) { showToast('Please enter your email', 'error'); return; }
  state.user.email = email;
  showToast('Logging in...', 'info');
  // INTEGRATION: Replace with real auth API
  setTimeout(() => { navigate('screen-app'); refreshApp(); }, 800);
}

function doSignup() {
  const name  = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  if (!name || !email) { showToast('Please fill all required fields', 'error'); return; }
  state.user.name  = name;
  state.user.email = email;
  // INTEGRATION: Replace with real signup + wallet generation API
  navigate('screen-wallet-create');
  runWalletCreation();
}

function doGoogleAuth() {
  showToast('Google Auth — integration point', 'info');
  // INTEGRATION: Replace with Google OAuth
  setTimeout(() => { navigate('screen-wallet-create'); runWalletCreation(); }, 600);
}

// ═══════════════════════════════════════
// WALLET CREATION ANIMATION
// ═══════════════════════════════════════
function runWalletCreation() {
  const steps = ['step1','step2','step3','step4'];
  let i = 0;
  const el = (id) => document.getElementById(id);

  const interval = setInterval(() => {
    if (i > 0) el(steps[i-1]).className = 'step-item done';
    if (i < steps.length) {
      el(steps[i]).className = 'step-item active-step';
      i++;
    } else {
      clearInterval(interval);
      el('creation-title').textContent = '✅ Wallet Created!';
      el('creation-sub').textContent   = 'Your secure wallet is ready.';
      // INTEGRATION: Real wallet = BIP39 mnemonic generation (ethers.js / bip39)
      state.recoveryPhrase = generateMockPhrase();
      setTimeout(() => { navigate('screen-recovery'); renderPhrase(); }, 900);
    }
  }, 700);
}

function generateMockPhrase() {
  // INTEGRATION: Use bip39.generateMnemonic() for real keys
  const shuffled = [...MOCK_PHRASE_WORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 12);
}

function renderPhrase() {
  const grid = document.getElementById('phrase-grid');
  grid.innerHTML = state.recoveryPhrase.map((w, i) =>
    `<div class="phrase-word"><span>${i+1}.</span>${w}</div>`
  ).join('');
}

function copyPhrase() {
  navigator.clipboard.writeText(state.recoveryPhrase.join(' ')).catch(()=>{});
  showToast('Phrase copied to clipboard!', 'success');
}

function togglePhraseNext() {
  document.getElementById('phrase-next-btn').disabled = !document.getElementById('phrase-confirm').checked;
}

// ═══════════════════════════════════════
// CARD ISSUANCE
// ═══════════════════════════════════════
function selectCardType(type) {
  state.cardType = type;
  document.getElementById('ct-visa').classList.toggle('selected', type === 'visa');
  document.getElementById('ct-mc').classList.toggle('selected', type === 'mastercard');
  document.getElementById('check-visa').classList.toggle('hidden', type !== 'visa');
  document.getElementById('check-mc').classList.toggle('hidden', type !== 'mastercard');
  // Update card network in state
  state.card.network = type === 'mastercard' ? 'MC' : 'VISA';
}

function issueCard() {
  showToast('Activating your card...', 'info');
  // INTEGRATION: Real card issuance via card-issuing API (e.g. Stripe Issuing, Marqeta)
  setTimeout(() => {
    showToast('🎉 Card Activated!', 'success');
    navigate('screen-app');
    refreshApp();
  }, 1200);
}

// ═══════════════════════════════════════
// APP SHELL — TAB SWITCHING
// ═══════════════════════════════════════
function switchAppTab(tab) {
  const tabs = ['home','deposit','convert','tx','card'];
  tabs.forEach(t => {
    const el = document.getElementById('tab-' + t);
    const nav = document.getElementById('nav-' + t);
    if (el) el.classList.toggle('hidden', t !== tab);
    if (el && t === tab) el.classList.add('active-tab');
    else if (el) el.classList.remove('active-tab');
    if (nav) nav.classList.toggle('active', t === tab);
  });
  state.currentTab = tab;
  if (tab === 'tx') renderAllTx();
  if (tab === 'card') renderCardTx();
  if (tab === 'home') renderHome();
  if (tab === 'convert') refreshConvert();
}

// Remove 'active' from all nav initially, set home active
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  const homeTab = document.getElementById('tab-home');
  if (homeTab) { homeTab.classList.remove('hidden'); homeTab.classList.add('active-tab'); }
});

function refreshApp() {
  // Update user avatar / name
  const letter = state.user.name?.[0]?.toUpperCase() || 'J';
  const avLetter = document.getElementById('avatar-letter');
  const spAvatar = document.getElementById('sp-avatar');
  const spName   = document.getElementById('sp-name');
  const spEmail  = document.getElementById('sp-email');
  if (avLetter) avLetter.textContent = letter;
  if (spAvatar) spAvatar.textContent = letter;
  if (spName)   spName.textContent = state.user.name;
  if (spEmail)  spEmail.textContent = state.user.email;

  // Update card displays
  const cardNum = state.card.number;
  const network = state.card.network === 'MC' ? '●● Mastercard' : 'VISA';
  ['vc-num-display','manage-card-num','cdp-num'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = cardNum;
  });
  ['vc-network-logo','manage-card-network'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = network;
  });
  const holderName = state.user.name.toUpperCase();
  ['vc-holder-name','manage-card-holder'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = holderName;
  });

  switchAppTab('home');
}

// ═══════════════════════════════════════
// HOME DASHBOARD
// ═══════════════════════════════════════
function renderHome() {
  // Total portfolio
  const total = calcTotalBalance();
  const tb = document.getElementById('total-balance');
  if (tb) tb.textContent = '$' + total.toFixed(2);

  // Fiat balance
  const fb = document.getElementById('fiat-balance-display');
  if (fb) fb.textContent = '$' + state.fiatBalance.toFixed(2);

  // Assets
  renderAssets();
  // Recent tx (last 5)
  const homeTx = document.getElementById('home-tx-list');
  if (homeTx) renderTxList(homeTx, state.transactions.slice(0,5));

  // Card status
  updateCardUI();

  // KYC banner
  const kycBanner = document.getElementById('kyc-banner');
  if (kycBanner) kycBanner.style.display = state.kycStatus === 'approved' ? 'none' : 'flex';
}

function calcTotalBalance() {
  let total = 0;
  for (const coin in state.wallet) {
    total += state.wallet[coin].balance * state.wallet[coin].price;
  }
  return total + state.fiatBalance;
}

function renderAssets() {
  const list = document.getElementById('assets-list');
  if (!list) return;
  const coins = ['USDT','USDC','BTC','ETH'];
  const icons = { USDT: '₮', USDC: '$', BTC: '₿', ETH: 'Ξ' };
  list.innerHTML = coins.map(coin => {
    const w = state.wallet[coin];
    const usdVal = (w.balance * w.price).toFixed(2);
    const change = COIN_CHANGES[coin];
    const isUp = change.startsWith('+');
    return `<div class="asset-item" onclick="switchTab('deposit')">
      <div class="ai-icon ${coin.toLowerCase()}">${icons[coin]}</div>
      <div class="ai-info">
        <div class="ai-name">${coin}</div>
        <div class="ai-amount">${w.balance.toFixed(6)} ${coin}</div>
      </div>
      <div class="ai-value">
        <div class="ai-usd">$${usdVal}</div>
        <div class="ai-change ${isUp ? 'up' : 'down'}">${change}</div>
      </div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════
// TRANSACTIONS
// ═══════════════════════════════════════
const TX_ICONS = { deposit: '📥', card: '💳', convert: '⇄', send: '📤' };

function addTransaction(tx) {
  tx.id   = Date.now();
  tx.date = new Date().toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
  state.transactions.unshift(tx);
}

function renderTxList(container, txs) {
  if (!container) return;
  if (txs.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:28px;color:var(--muted);font-size:14px;">No transactions yet</div>';
    return;
  }
  container.innerHTML = txs.map(tx => `
    <div class="tx-item">
      <div class="tx-icon ${tx.type}">${TX_ICONS[tx.type] || '💱'}</div>
      <div class="tx-info">
        <div class="tx-desc">${tx.desc}</div>
        <div class="tx-date">${tx.date}</div>
      </div>
      <div class="tx-amount">
        <div class="tx-val ${tx.amount > 0 ? 'plus' : 'minus'}">${tx.amount > 0 ? '+' : ''}${tx.display}</div>
        <div class="tx-status ${tx.status}">${tx.statusLabel}</div>
      </div>
    </div>`).join('');
}

function renderAllTx() {
  const el = document.getElementById('all-tx-list');
  renderTxList(el, state.transactions);
}

function renderCardTx() {
  const el = document.getElementById('card-tx-list');
  renderTxList(el, state.transactions.filter(t => t.type === 'card'));
}

function filterTx(btn, filter) {
  document.querySelectorAll('.tx-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('all-tx-list');
  const filtered = filter === 'all' ? state.transactions : state.transactions.filter(t => t.type === filter);
  renderTxList(el, filtered);
}

// ═══════════════════════════════════════
// DEPOSIT (QR CODE — pure canvas)
// ═══════════════════════════════════════
function selectDepositCoin(btn, coin) {
  document.querySelectorAll('.coin-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.depositCoin = coin;
  const el = document.getElementById('dep-coin-name');
  if (el) el.textContent = coin;
  drawQR();
  const addrEl = document.getElementById('qr-address-display');
  if (addrEl) addrEl.textContent = state.wallet[coin].address;
}

function updateNetwork() {
  state.depositNetwork = document.getElementById('network-select').value;
  drawQR();
}

function drawQR() {
  // Simple visual QR placeholder — INTEGRATION: Use qrcode.js or react-native-qrcode-svg for real QR
  const canvas = document.getElementById('qr-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 200;
  canvas.width = canvas.height = size;
  const data = state.wallet[state.depositCoin].address + '|' + state.depositNetwork;
  const cellSize = 6;
  const cells = Math.floor(size / cellSize);

  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, size, size);

  // Seed-based pseudo-random pattern
  let seed = 0;
  for (let i = 0; i < data.length; i++) seed += data.charCodeAt(i);

  function rand() { seed = (seed * 16807 + 0) % 2147483647; return (seed & 1); }

  ctx.fillStyle = '#00d4ff';
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      // Fixed finder patterns (corners)
      const inFinder = (r < 8 && c < 8) || (r < 8 && c >= cells - 8) || (r >= cells - 8 && c < 8);
      if (rand() || inFinder) {
        ctx.fillStyle = inFinder ? '#8b5cf6' : '#00d4ff';
        ctx.fillRect(c * cellSize, r * cellSize, cellSize - 1, cellSize - 1);
      }
    }
  }

  // Center logo
  ctx.fillStyle = '#0a1628';
  ctx.fillRect(size/2-20, size/2-20, 40, 40);
  ctx.fillStyle = '#00d4ff';
  ctx.font = 'bold 22px Inter';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('₿', size/2, size/2);
}

function copyAddress() {
  const addr = state.wallet[state.depositCoin].address;
  navigator.clipboard.writeText(addr).catch(()=>{});
  showToast('Address copied!', 'success');
}

function simulateDeposit() {
  // INTEGRATION: Replace with real blockchain listener / webhook
  const amount = parseFloat(document.getElementById('sim-amount').value);
  if (!amount || amount <= 0) { showToast('Enter a valid amount', 'error'); return; }
  const coin = state.depositCoin;
  state.wallet[coin].balance += amount;
  addTransaction({ type: 'deposit', desc: `Deposit ${coin}`, display: `+${amount} ${coin}`, amount: 1, status: 'confirmed', statusLabel: 'Confirmed' });
  document.getElementById('sim-amount').value = '';
  showToast(`✅ ${amount} ${coin} deposited!`, 'success');
  renderHome();
}

// ═══════════════════════════════════════
// CONVERT
// ═══════════════════════════════════════
const RATES = { USDT: 1.00, USDC: 1.00, BTC: 67420, ETH: 3520 };

function refreshConvert() {
  updateRate();
}

function updateRate() {
  const coin = document.getElementById('cv-coin').value;
  const rate = RATES[coin];
  const rdVal = document.getElementById('rd-val');
  if (rdVal) rdVal.textContent = `1 ${coin} = $${rate.toFixed(2)}`;
  const avail = document.getElementById('cv-avail');
  if (avail) avail.textContent = `${state.wallet[coin].balance.toFixed(6)} ${coin}`;
  calcConvert();
}

function calcConvert() {
  const coin   = document.getElementById('cv-coin').value;
  const amount = parseFloat(document.getElementById('cv-amount').value) || 0;
  const rate   = RATES[coin];
  const fee    = amount * rate * 0.001;
  const receive = Math.max(0, amount * rate - fee);
  const cvEl = document.getElementById('cv-receive');
  if (cvEl) cvEl.textContent = '$' + receive.toFixed(2);
}

function doConvert() {
  // INTEGRATION: Replace with real DEX/CEX conversion API
  const coin   = document.getElementById('cv-coin').value;
  const amount = parseFloat(document.getElementById('cv-amount').value);
  if (!amount || amount <= 0) { showToast('Enter an amount', 'error'); return; }
  if (amount > state.wallet[coin].balance) { showToast('Insufficient balance', 'error'); return; }
  const rate    = RATES[coin];
  const fee     = amount * rate * 0.001;
  const receive = amount * rate - fee;
  state.wallet[coin].balance -= amount;
  state.fiatBalance += receive;
  addTransaction({ type: 'convert', desc: `${amount} ${coin} → USD`, display: `+$${receive.toFixed(2)}`, amount: 1, status: 'confirmed', statusLabel: 'Converted' });
  const convertTxEl = document.getElementById('convert-tx-list');
  renderTxList(convertTxEl, state.transactions.filter(t => t.type === 'convert'));
  document.getElementById('cv-amount').value = '';
  calcConvert();
  showToast(`✅ Converted to $${receive.toFixed(2)}!`, 'success');
  updateRate();
}

// ═══════════════════════════════════════
// CARD MANAGEMENT
// ═══════════════════════════════════════
function toggleFreeze() {
  state.cardFrozen = !state.cardFrozen;
  updateCardUI();
  showToast(state.cardFrozen ? '❄️ Card frozen' : '✅ Card unfrozen', state.cardFrozen ? 'info' : 'success');
  // INTEGRATION: Call card issuer API to freeze/unfreeze
}

function updateCardUI() {
  const frozen    = state.cardFrozen;
  const statusBadges = ['vc-status','manage-card-status'];
  statusBadges.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = frozen ? 'FROZEN' : 'ACTIVE';
    el.className   = 'vc-status-badge' + (frozen ? ' frozen' : '');
  });
  ['home-card','manage-card'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.filter        = frozen ? 'grayscale(0.6)' : '';
      el.style.borderColor   = frozen ? 'rgba(0,212,255,0.5)' : '';
    }
  });
  const freezeIcon  = document.getElementById('freeze-icon');
  const freezeLabel = document.getElementById('freeze-label');
  const cdpStatus   = document.getElementById('cdp-status');
  if (freezeIcon)  freezeIcon.textContent  = frozen ? '🔥' : '❄️';
  if (freezeLabel) freezeLabel.textContent = frozen ? 'Unfreeze' : 'Freeze Card';
  if (cdpStatus) { cdpStatus.textContent = frozen ? 'Frozen' : 'Active'; cdpStatus.className = 'cdp-val ' + (frozen ? 'status-frozen' : 'status-active'); }

  const limEl = document.getElementById('cdp-limit');
  if (limEl) limEl.textContent = '$' + state.spendLimit.toLocaleString();
}

function revealCVV() {
  if (state.cardFrozen) { showToast('Unfreeze card first', 'error'); return; }
  // INTEGRATION: Real CVV reveal requires re-auth via biometric/PIN + card issuer API
  const el = document.getElementById('cvv-display');
  if (el) el.textContent = state.card.cvv;
  openModal('cvv-modal');
  // Auto-hide after 30s
  setTimeout(() => closeModal('cvv-modal'), 30000);
}

function openLimitModal() {
  document.getElementById('limit-slider').value = state.spendLimit;
  updateLimitDisplay();
  openModal('limit-modal');
}

function updateLimitDisplay() {
  const val = document.getElementById('limit-slider').value;
  document.getElementById('limit-val-display').textContent = '$' + parseInt(val).toLocaleString();
}

function saveLimit() {
  state.spendLimit = parseInt(document.getElementById('limit-slider').value);
  updateCardUI();
  closeModal('limit-modal');
  showToast('✅ Spend limit updated', 'success');
  // INTEGRATION: Call card issuer API to update limit
}

// Seed some demo card transactions
function seedCardTx() {
  const stores = ['Amazon.in', 'Flipkart', 'Netflix', 'Apple Store', 'Uber Eats'];
  const amounts = [29.99, 149.00, 12.99, 4.99, 18.50];
  for (let i = 0; i < stores.length; i++) {
    state.transactions.push({
      id: 1000 + i, type: 'card', desc: stores[i],
      display: `-$${amounts[i]}`, amount: -1,
      status: 'confirmed', statusLabel: 'Paid',
      date: new Date(Date.now() - i * 86400000).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })
    });
  }
}
seedCardTx();

// ═══════════════════════════════════════
// KYC
// ═══════════════════════════════════════
function startKYC() {
  const btn = document.getElementById('kyc-start-btn');
  if (state.kycStatus === 'approved') { showToast('KYC already approved ✅', 'success'); return; }

  const steps = [
    { el: 'kyc-s1', num: 'ks-n1', st: 'ks-st1', msg: 'Verifying personal info...' },
    { el: 'kyc-s2', num: 'ks-n2', st: 'ks-st2', msg: 'Uploading document...' },
    { el: 'kyc-s3', num: 'ks-n3', st: 'ks-st3', msg: 'Confirming selfie...' },
  ];

  btn.disabled = true;
  btn.textContent = 'Verifying...';
  let step = 0;

  // INTEGRATION: Real KYC via Onfido / Jumio / DigiLocker
  const interval = setInterval(() => {
    if (step < steps.length) {
      const s = steps[step];
      document.getElementById(s.el).classList.add('done');
      document.getElementById(s.num).textContent = '✓';
      document.getElementById(s.st).textContent  = '✅';
      state.kycStep = step + 1;
      showToast(s.msg, 'info');
      step++;
    } else {
      clearInterval(interval);
      state.kycStatus = 'approved';
      const badge = document.getElementById('kyc-badge');
      const text  = document.getElementById('kyc-status-text');
      const spBadge = document.getElementById('sp-kyc-badge');
      if (badge) { badge.textContent = '✅ KYC APPROVED'; badge.className = 'kyc-badge approved'; }
      if (text)  text.textContent = 'Your identity has been verified. Enjoy higher limits!';
      if (spBadge) { spBadge.textContent = 'KYC Verified'; spBadge.className = 'sp-badge verified'; }
      btn.textContent = 'Verified ✅';
      const kycBanner = document.getElementById('kyc-banner');
      if (kycBanner) kycBanner.style.display = 'none';
      showToast('🎉 KYC Approved!', 'success');
    }
  }, 1200);
}

// ═══════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════
function toggleBiometric() {
  state.bioEnabled = !state.bioEnabled;
  const toggle = document.getElementById('bio-toggle');
  if (toggle) toggle.classList.toggle('on', state.bioEnabled);
  showToast(state.bioEnabled ? '🔐 Biometric enabled' : 'Biometric disabled', 'info');
  // INTEGRATION: expo-local-authentication / WebAuthn
}

function doLogout() {
  if (!confirm('Are you sure you want to logout?')) return;
  Object.assign(state, { cardFrozen: false, fiatBalance: 0, transactions: [], kycStatus: 'pending', kycStep: 0 });
  for (const c in state.wallet) state.wallet[c].balance = 0;
  seedCardTx();
  navigate('screen-auth');
  showToast('Logged out', 'info');
}

// ═══════════════════════════════════════
// OFFERS
// ═══════════════════════════════════════
function renderOffers() {
  const list = document.getElementById('offers-list');
  if (!list) return;
  list.innerHTML = MOCK_OFFERS.map(o => `
    <div class="offer-card">
      <div class="oc-icon">${o.icon}</div>
      <div class="oc-info">
        <div class="oc-title">${o.store}</div>
        <div class="oc-desc">${o.desc}</div>
      </div>
      <div class="oc-badge">${o.rate}</div>
    </div>`).join('');
}

// ═══════════════════════════════════════
// REFERRAL
// ═══════════════════════════════════════
function copyReferral() {
  navigator.clipboard.writeText(state.user.referralCode).catch(()=>{});
  showToast('Referral code copied! 🎁', 'success');
}

// ═══════════════════════════════════════
// MODALS
// ═══════════════════════════════════════
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.add('hidden'); });
});

// ═══════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════
let toastTimer;
function showToast(msg, type = 'success') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast  = document.getElementById('toast');
  const msgEl  = document.getElementById('toast-msg');
  const iconEl = document.getElementById('toast-icon');
  if (!toast) return;
  msgEl.textContent  = msg;
  iconEl.textContent = icons[type] || '✅';
  toast.className    = 'toast ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ═══════════════════════════════════════
// INIT QR on deposit tab
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Draw QR after a tick so canvas is rendered
  setTimeout(() => {
    drawQR();
    const addrEl = document.getElementById('qr-address-display');
    if (addrEl) addrEl.textContent = state.wallet['USDT'].address;
  }, 300);
});
