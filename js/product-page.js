const PACKS = [
  { key: 'trial', label: 'Trial pack', detail: '5 sachets', price: '₹599', value: 599 },
  { key: 'standard', label: '14-sachet pack', detail: '14 sachets', price: '₹1499', value: 1499, default: true },
  { key: 'value', label: '28-sachet pack', detail: '28 sachets', price: '₹2799', value: 2799 },
];

const PRODUCT_PACK_TEXT = 'Trial pack: 5 sachets for ₹599. 14-sachet pack: ₹1499. 28-sachet pack: ₹2799.';

const PRODUCTS = {
  'pause': {
    id: 'shift-steady',
    name: 'Pause.',
    brand: 'HERESE',
    stage: 'Perimenopause support',
    phase: 'perimenopause',
    headline: 'Cooling citrus for changing bodies and warm, unsettled days.',
    image: '../assets/phase-04-pause.png?v=product-detail-20260601a',
    alt: 'HERESE Pause product box and ritual sachets',
    price: '₹1499',
    priceLabel: '14-sachet pack',
    forText: 'Women navigating perimenopause, heat, mood shifts, and a routine that suddenly needs more cooling support.',
    craving: 'Citrus, cooling, refreshing, and lightly satisfying.',
    need: 'Hydration cues, daily steadiness, and botanicals traditionally used for calm and female wellness.',
    bridge: 'Pause. turns a cooling citrus craving into a daily drink with Shatavari, Ashwagandha, Mulethi, and lemon peel.',
    benefits: [
      'Refreshing daily ritual for the perimenopause years',
      'Built for cooling, light, repeatable support',
      'Phase-focused herbs in a simple sachet format',
      'Easy to mix into chilled water'
    ],
    ingredients: ['Shatavari', 'Ashwagandha', 'Mulethi', 'Lemon peel', 'Vitamin and mineral support blend'],
    howToUse: 'Mix one sachet with 180-220 ml chilled water. Stir, sip, and use daily as part of a consistent wellness routine.',
    pack: `${PRODUCT_PACK_TEXT} Flavour: Cool Citrus Clarity.`
  },
  'bloomburst': {
    id: 'bloom-burst',
    name: 'BloomBurst',
    brand: 'HERESE',
    stage: 'First-period wellness',
    phase: 'menarche',
    headline: 'Berry-rose comfort for first period days.',
    image: '../assets/phase-01-bloomburst.png?v=product-detail-20260601a',
    alt: 'HERESE BloomBurst product box and ritual sachets',
    price: '₹1499',
    priceLabel: '14-sachet pack',
    forText: 'Young women beginning their cycle journey, and families who want first-period care to feel calm, kind, and easy to explain.',
    craving: 'Berry, sweet, playful, and comforting.',
    need: 'Gentle nourishment, familiar flavour, and a non-intimidating daily ritual for early hormonal changes.',
    bridge: 'BloomBurst turns berry comfort into a soft daily drink with Shatavari, rose petal, Amla, and beetroot.',
    benefits: [
      'Friendly support for the first years of cycling',
      'Berry-rose taste that feels approachable',
      'Simple sachet format for school, home, or travel',
      'Made to help period care feel less scary'
    ],
    ingredients: ['Shatavari', 'Rose petal', 'Amla', 'Beetroot', 'Vitamin C support'],
    howToUse: 'Mix one sachet with 180-220 ml cold water or a mild smoothie base. Stir well and drink once daily.',
    pack: `${PRODUCT_PACK_TEXT} Flavour: Tangy Berry-Rose.`
  },
  'flowfuel': {
    id: 'flow-fuel',
    name: 'FlowFuel',
    brand: 'HERESE',
    stage: 'Period comfort',
    phase: 'periods',
    headline: 'Cacao comfort for the monthly reset.',
    image: '../assets/phase-02-flowfuel.png?v=product-detail-20260601a',
    alt: 'HERESE FlowFuel product box and ritual sachets',
    price: '₹1499',
    priceLabel: '14-sachet pack',
    forText: 'Women who crave chocolate or sweet comfort around periods and want that craving to do more for the body.',
    craving: 'Chocolate, cacao, rich comfort, and sweet satisfaction.',
    need: 'A satisfying comfort ritual with mineral-minded nourishment and period-focused botanicals.',
    bridge: 'FlowFuel turns the chocolate craving into a cacao-style drink with Ashoka bark, Nagkesar, and jaggery warmth.',
    benefits: [
      'Craving-first period drink that feels like a treat',
      'Rich cacao taste for monthly comfort',
      'Botanical support for cycle-day routines',
      'Works warm with milk, plant milk, or water'
    ],
    ingredients: ['Cacao', 'Ashoka bark', 'Nagkesar', 'Jaggery', 'Warm spice support'],
    howToUse: 'Whisk one sachet into warm milk, plant milk, or hot water. Sip during period days or whenever chocolate comfort is needed.',
    pack: `${PRODUCT_PACK_TEXT} Flavour: Ceremonial Cacao Blend.`
  },
  'corecorrect': {
    id: 'core-correct',
    name: 'CoreCorrect',
    brand: 'HERESE',
    stage: 'PCOS support',
    phase: 'pcos',
    headline: 'Fresh green-mango support for metabolic rhythm.',
    image: '../assets/phase-03-corecorrect.png?v=product-detail-20260601a',
    alt: 'HERESE CoreCorrect product box and ritual sachets',
    price: '₹1499',
    priceLabel: '14-sachet pack',
    forText: 'Women building a PCOS-friendly daily routine who want something crisp, light, and easy to repeat.',
    craving: 'Tangy green mango, freshness, and a sharp satisfying sip.',
    need: 'Daily functional support for energy habits, cravings, and metabolic rhythm.',
    bridge: 'CoreCorrect channels a tangy green-mango craving into a functional blend with Kachnar, Methi, Kacha Aam, and Amla.',
    benefits: [
      'Daily support for PCOS-related wellness routines',
      'Tangy taste that keeps the ritual easy',
      'Botanicals chosen for metabolic and hormonal rhythm',
      'Light drink format for office, travel, and home'
    ],
    ingredients: ['Kachnar bark', 'Methi', 'Kacha Aam', 'Amla', 'Metabolic support blend'],
    howToUse: 'Mix one sachet into 180-220 ml cold water. Stir briskly and drink once daily with a meal or regular routine.',
    pack: `${PRODUCT_PACK_TEXT} Flavour: Crisp Green-Mango.`
  },
  'pauseprime': {
    id: 'pause-prime',
    name: 'PausePrime',
    brand: 'HERESE',
    stage: 'Menopause support',
    phase: 'menopause',
    headline: 'Golden almond comfort for mature phase nourishment.',
    image: '../assets/phase-05-pauseprime.png?v=product-detail-20260601a',
    alt: 'HERESE PausePrime product box and ritual sachets',
    price: '₹1499',
    priceLabel: '14-sachet pack',
    forText: 'Women in menopause who want a warm, grounding drink that treats this stage with dignity and depth.',
    craving: 'Warm, golden, grounding, and creamy comfort.',
    need: 'Mature phase nourishment, steady strength rituals, and botanicals associated with rest and resilience.',
    bridge: 'PausePrime turns a creamy golden craving into a menopause wellness drink with saffron, cardamom, Ashwagandha, and almond notes.',
    benefits: [
      'Warm ritual for menopause wellness routines',
      'Grounding almond and spice profile',
      'Botanical support for strength, harmony, and vitality habits',
      'Comforting format for morning or evening use'
    ],
    ingredients: ['Saffron', 'Cardamom', 'Ashwagandha', 'Almond', 'Golden spice support'],
    howToUse: 'Stir one sachet into warm milk, plant milk, or hot water. Sip daily as a grounding wellness ritual.',
    pack: `${PRODUCT_PACK_TEXT} Flavour: Golden Almond Elixir.`
  },
  'sleep-latte': {
    id: 'luna-sync',
    name: 'LunaSync',
    brand: 'HERESE',
    stage: 'Sleep Latte - Midnight Restoration',
    phase: 'sleep',
    headline: 'A creamy night drink for softer wind-down routines.',
    image: '../assets/phase-06-lunasync.png?v=product-detail-20260601a',
    alt: 'HERESE LunaSync Sleep Latte product box and ritual sachets',
    price: '₹1499',
    priceLabel: '14-sachet pack',
    forText: 'Women in any stage who want a calming bedtime ritual instead of late-night snacking.',
    craving: 'Creamy, calming, night-time comfort.',
    need: 'A warm wind-down cue, relaxing botanicals, and a low-effort ritual that separates the day from sleep.',
    bridge: 'LunaSync turns night-time comfort into a functional bedtime blend with Ashwagandha, Jatamansi, vanilla, and nutmeg.',
    benefits: [
      'Bedtime ritual for relaxation routines',
      'Creamy vanilla-nutmeg profile for night cravings',
      'Botanical support for a calmer wind-down habit',
      'Works across every phase of the HERESE lifecycle'
    ],
    ingredients: ['Ashwagandha', 'Jatamansi', 'Vanilla', 'Nutmeg', 'Night comfort spice blend'],
    howToUse: 'Stir one sachet into warm milk, plant milk, or hot water 30-45 minutes before bed. Sip slowly as part of a screen-down ritual.',
    pack: `${PRODUCT_PACK_TEXT} Flavour: Midnight Vanilla Sleep Latte.`
  }
};

let cart = loadStoredCart();

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderList(id, items) {
  const list = document.getElementById(id);
  if (!list) return;
  list.innerHTML = '';

  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  }
}

function getDefaultPack() {
  return PACKS.find((pack) => pack.default) || PACKS[0];
}

function getSelectedPack() {
  const selected = document.querySelector('[name="product-pack"]:checked');
  return PACKS.find((pack) => pack.key === selected?.value) || getDefaultPack();
}

function formatRupee(value) {
  return `₹${Math.round(value)}`;
}

function parsePrice(price) {
  const value = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  return Number.isFinite(value) ? value : 0;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function loadStoredCart() {
  try {
    const stored = localStorage.getItem('herese-cart-v1');
    const parsed = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && item.id && item.name && item.price);
  } catch (err) {
    console.warn('[HERESE] Could not read stored cart:', err.message);
    return [];
  }
}

function saveStoredCart() {
  try {
    localStorage.setItem('herese-cart-v1', JSON.stringify(cart));
  } catch (err) {
    console.warn('[HERESE] Could not save cart:', err.message);
  }
}

function syncCartMeta(total = 0) {
  const count = cart.length;
  const countEl = document.getElementById('cart-count');
  const cartBtn = document.getElementById('cart-btn');
  const checkoutBtn = document.getElementById('checkout-btn');
  const checkoutNote = document.getElementById('checkout-note');

  if (countEl) countEl.textContent = count;
  if (cartBtn) cartBtn.setAttribute('aria-label', count === 0 ? 'Open cart' : `Open cart, ${count} item${count === 1 ? '' : 's'}`);
  if (checkoutBtn) {
    checkoutBtn.disabled = count === 0;
    checkoutBtn.setAttribute('aria-disabled', String(count === 0));
  }
  if (checkoutNote && count === 0) {
    checkoutNote.textContent = 'Add a ritual before checkout.';
  }
  if (checkoutNote && count > 0 && total > 0) {
    checkoutNote.textContent = 'Checkout will connect when live pricing is enabled.';
  }
}

function renderCart() {
  const itemsContainer = document.getElementById('cart-items');
  const totalEl = document.getElementById('total-amount');
  if (!itemsContainer || !totalEl) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty. Add a craving ritual.</p>';
    totalEl.textContent = '₹0';
    syncCartMeta(0);
    return;
  }

  itemsContainer.innerHTML = cart.map((item, index) => `
    <div class="cart-item glass-card">
      <div>
        <h4>${escapeHTML(item.name)}</h4>
        <p>${escapeHTML(item.price)}</p>
      </div>
      <button type="button" class="remove-item" data-index="${index}" aria-label="Remove ${escapeHTML(item.name)} from cart">&times;</button>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + parsePrice(item.price), 0);
  totalEl.textContent = formatRupee(total);
  syncCartMeta(total);

  itemsContainer.querySelectorAll('.remove-item').forEach((button) => {
    button.addEventListener('click', () => {
      cart.splice(Number(button.dataset.index), 1);
      saveStoredCart();
      renderCart();
    });
  });
}

function openCart() {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBtn = document.getElementById('cart-btn');
  cartDrawer?.classList.add('active');
  cartDrawer?.setAttribute('aria-hidden', 'false');
  cartBtn?.setAttribute('aria-expanded', 'true');
  document.body.classList.add('cart-open');
}

function closeCart() {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBtn = document.getElementById('cart-btn');
  cartDrawer?.classList.remove('active');
  cartDrawer?.setAttribute('aria-hidden', 'true');
  cartBtn?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('cart-open');
}

function addProductToCart(product) {
  const pack = getSelectedPack();
  cart.push({
    id: product.id,
    name: `${product.name} - ${pack.detail}`,
    price: pack.price,
    packLabel: pack.label,
    packDetail: pack.detail,
  });
  saveStoredCart();
  renderCart();
  openCart();
}

function updateProductPack() {
  const pack = getSelectedPack();
  setText('product-price-label', pack.label);
  setText('product-price', pack.price);

  document.querySelectorAll('[data-product-action]').forEach((button) => {
    button.dataset.productPrice = pack.price;
    button.dataset.packLabel = pack.label;
    button.dataset.packDetail = pack.detail;
  });
}

function renderPackSelector() {
  const priceRow = document.querySelector('.product-price-row');
  if (!priceRow || document.getElementById('product-pack-selector')) return;

  const selector = document.createElement('div');
  selector.id = 'product-pack-selector';
  selector.className = 'product-pack-selector';
  selector.innerHTML = `
    <span class="product-pack-title">Choose your pack</span>
    <div class="product-pack-options" data-product-pack-options>
      ${PACKS.map((pack) => `
        <label class="product-pack-option">
          <input type="radio" name="product-pack" value="${escapeHTML(pack.key)}" ${pack.default ? 'checked' : ''} />
          <span>${escapeHTML(pack.detail)}</span>
          <strong>${escapeHTML(pack.price)}</strong>
        </label>
      `).join('')}
    </div>
  `;

  priceRow.insertAdjacentElement('afterend', selector);
  selector.addEventListener('change', updateProductPack);
}

function hydrateProduct(product) {
  document.body.dataset.phase = product.phase;
  document.title = `${product.name} | ${product.brand} Product Detail`;

  setText('product-brand', product.brand);
  setText('product-name', product.name);
  setText('product-stage', product.stage);
  setText('product-headline', product.headline);
  setText('product-price-label', product.priceLabel);
  setText('product-price', product.price);
  setText('product-for', product.forText);
  setText('product-craving', product.craving);
  setText('product-need', product.need);
  setText('product-bridge', product.bridge);
  setText('product-how', product.howToUse);
  setText('product-pack', product.pack);
  renderPackSelector();
  updateProductPack();

  const image = document.getElementById('product-image');
  if (image) {
    image.src = product.image;
    image.alt = product.alt;
  }

  renderList('product-benefits', product.benefits);
  renderList('product-ingredients', product.ingredients);

  document.querySelectorAll('[data-product-action]').forEach((button) => {
    button.dataset.productId = product.id;
    button.dataset.productName = product.name;
    button.dataset.productPrice = product.price;
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const slug = document.body.dataset.product;
  const product = PRODUCTS[slug];
  if (!product) return;

  hydrateProduct(product);
  renderCart();

  const cartBtn = document.getElementById('cart-btn');
  const closeBtn = document.getElementById('close-cart');
  const cartOverlay = document.querySelector('.cart-overlay');
  const checkoutBtn = document.getElementById('checkout-btn');
  const addButton = document.getElementById('product-add-cart');
  const buyButton = document.getElementById('product-buy-now');

  cartBtn?.addEventListener('click', () => {
    const isOpen = document.getElementById('cart-drawer')?.classList.contains('active');
    if (isOpen) closeCart();
    else openCart();
  });
  closeBtn?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);
  window.addEventListener('storage', (event) => {
    if (event.key === 'herese-cart-v1') {
      cart = loadStoredCart();
      renderCart();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCart();
  });

  addButton?.addEventListener('click', () => addProductToCart(product));
  buyButton?.addEventListener('click', () => addProductToCart(product));
  checkoutBtn?.addEventListener('click', () => {
    const checkoutNote = document.getElementById('checkout-note');
    if (checkoutNote) checkoutNote.textContent = 'Checkout will connect when live pricing is enabled.';
  });
});
