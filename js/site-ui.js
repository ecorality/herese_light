(function () {
  const products = [
    {
      id: 'bloom-burst',
      slug: 'bloomburst',
      name: 'BloomBurst',
      phase: 'Menarche',
      stage: 'The First Bloom',
      path: 'products/bloomburst.html',
      terms: 'menarche first period first-period puberty first bloom teen berry sweet playful comforting rose shatavari amla beetroot early hormonal changes'
    },
    {
      id: 'flow-fuel',
      slug: 'flowfuel',
      name: 'FlowFuel',
      phase: 'Periods',
      stage: 'The Monthly Reset',
      path: 'products/flowfuel.html',
      terms: 'period periods menstrual monthly reset cramps cacao chocolate rich comfort sweet satisfaction flow ashoka nagkesar period comfort'
    },
    {
      id: 'core-correct',
      slug: 'corecorrect',
      name: 'CoreCorrect',
      phase: 'PCOS',
      stage: 'The Metabolic Recalibration',
      path: 'products/corecorrect.html',
      terms: 'pcos metabolic ovarian balance tangy green mango fresh satisfying core kachnar methi amla insulin wellness'
    },
    {
      id: 'shift-steady',
      slug: 'pause',
      name: 'Pause.',
      phase: 'Perimenopause',
      stage: 'The Great Transition',
      path: 'products/pause.html',
      terms: 'perimenopause peri menopause transition hot flashes cooling citrus refreshing light comfort shatavari ashwagandha mulethi'
    },
    {
      id: 'pause-prime',
      slug: 'pauseprime',
      name: 'PausePrime',
      phase: 'Menopause',
      stage: 'The Golden Sovereignty',
      path: 'products/pauseprime.html',
      terms: 'menopause mature golden warm grounding creamy comfort saffron cardamom almond ashwagandha sovereignty'
    },
    {
      id: 'luna-sync',
      slug: 'sleep-latte',
      name: 'Sleep Latte',
      phase: 'Sleep',
      stage: 'LunaSync - Midnight Restoration',
      path: 'products/sleep-latte.html',
      terms: 'sleep latte lunasync luna sync bedtime night relaxation creamy calming nighttime vanilla nutmeg jatamansi ashwagandha restoration'
    }
  ];

  const root = window.location.pathname.includes('/products/') ? '../' : '';

  function href(path) {
    return `${root}${path}`;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function isInteractive(target) {
    return !!target.closest('a, button, input, label, textarea, select, summary, [data-pack-options], [data-product-pack-options], [role="button"]');
  }

  function productById(id) {
    return products.find((product) => product.id === id);
  }

  function injectMenu() {
    const nav = document.getElementById('main-nav');
    const logo = nav?.querySelector('.nav-logo');
    if (!nav || !logo || document.getElementById('menu-btn')) return;

    const button = document.createElement('button');
    button.id = 'menu-btn';
    button.className = 'nav-icon-btn menu-btn';
    button.type = 'button';
    button.setAttribute('aria-label', 'Open site menu');
    button.setAttribute('aria-controls', 'site-menu');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>';
    nav.insertBefore(button, logo);

    const drawer = document.createElement('div');
    drawer.id = 'site-menu';
    drawer.className = 'site-menu';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = `
      <div class="site-menu-overlay" data-close-menu></div>
      <aside class="site-menu-panel glass-card" aria-label="HERESE menu">
        <div class="site-menu-header">
          <span>HERESE</span>
          <button class="site-menu-close" type="button" aria-label="Close menu" data-close-menu>&times;</button>
        </div>
        <nav class="site-menu-links" aria-label="Site sections">
          <a href="${href('index.html#hero')}">Sanctuary</a>
          <a href="${href('index.html#manifesto')}">Manifesto</a>
          <a href="${href('index.html#ritual')}">Ritual</a>
          <a href="${href('index.html#lifecycle')}">Products</a>
          <a href="${href('index.html#transparency')}">Transparency Lab</a>
          <a href="${href('index.html#waitlist')}">Waitlist</a>
        </nav>
        <div class="site-menu-products">
          <span class="site-menu-kicker">Phase</span>
          ${products.map((product) => `
            <a class="site-menu-product" href="${href(product.path)}">
              <span>${product.phase} &gt; ${product.stage}</span>
              <strong>${product.name}</strong>
            </a>
          `).join('')}
        </div>
      </aside>
    `;
    document.body.appendChild(drawer);

    const openMenu = () => {
      drawer.classList.add('active');
      drawer.setAttribute('aria-hidden', 'false');
      button.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    };

    const closeMenu = () => {
      drawer.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');
      button.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    };

    button.addEventListener('click', openMenu);
    drawer.querySelectorAll('[data-close-menu]').forEach((element) => {
      element.addEventListener('click', closeMenu);
    });
    drawer.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  function buildSearchResults(query) {
    const normalizedQuery = normalize(query);
    const terms = normalizedQuery.split(' ').filter(Boolean);
    if (!normalizedQuery) return products;

    return products
      .map((product) => {
        const haystack = normalize(`${product.name} ${product.phase} ${product.stage} ${product.terms}`);
        let score = haystack.includes(normalizedQuery) ? 10 : 0;
        score += terms.filter((term) => haystack.includes(term)).length;
        return { product, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.product);
  }

  function injectSearch() {
    if (document.getElementById('site-search')) return;

    const search = document.createElement('div');
    search.id = 'site-search';
    search.className = 'site-search';
    search.setAttribute('aria-hidden', 'true');
    search.innerHTML = `
      <div class="site-search-overlay" data-close-search></div>
      <section class="site-search-panel glass-card" role="dialog" aria-modal="true" aria-labelledby="site-search-title">
        <div class="site-search-header">
          <div>
            <span class="site-menu-kicker">Search HERESE</span>
            <h2 id="site-search-title">Find your phase or product</h2>
          </div>
          <button class="site-search-close" type="button" aria-label="Close search" data-close-search>&times;</button>
        </div>
        <label class="site-search-label" for="site-search-input">Type a product, phase, craving, or concern</label>
        <input id="site-search-input" class="site-search-input" type="search" placeholder="Try periods, PCOS, menopause, sleep, cacao..." autocomplete="off" />
        <p class="site-search-hint">Examples: type "periods" for FlowFuel, "first period" for BloomBurst, or "sleep" for Sleep Latte.</p>
        <div id="site-search-results" class="site-search-results" role="listbox"></div>
      </section>
    `;
    document.body.appendChild(search);

    const input = document.getElementById('site-search-input');
    const results = document.getElementById('site-search-results');

    const render = () => {
      const matches = buildSearchResults(input.value);
      results.innerHTML = matches.length ? matches.map((product) => `
        <a class="site-search-result" href="${href(product.path)}" role="option">
          <span>${product.phase} &gt; ${product.stage}</span>
          <strong>${product.name}</strong>
        </a>
      `).join('') : '<p class="site-search-empty">No match yet. Try a phase like periods, PCOS, menopause, perimenopause, menarche, or sleep.</p>';
    };

    const openSearch = () => {
      render();
      search.classList.add('active');
      search.setAttribute('aria-hidden', 'false');
      document.body.classList.add('search-open');
      setTimeout(() => input.focus(), 30);
    };

    const closeSearch = () => {
      search.classList.remove('active');
      search.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('search-open');
    };

    input.addEventListener('input', render);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const first = results.querySelector('a');
        if (first) window.location.href = first.href;
      }
    });
    search.querySelectorAll('[data-close-search]').forEach((element) => {
      element.addEventListener('click', closeSearch);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeSearch();
    });

    window.HERESE_SITE.openSearch = openSearch;
    window.HERESE_SITE.closeSearch = closeSearch;

    document.querySelectorAll('#search-btn').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        openSearch();
      });
    });
  }

  function initProductCards() {
    document.querySelectorAll('.phase-content').forEach((card) => {
      const button = card.querySelector('.add-to-cart');
      const product = productById(button?.dataset.productId);
      if (!product) return;

      card.dataset.productUrl = href(product.path);
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `View ${product.name} product page`);

      card.addEventListener('click', (event) => {
        if (isInteractive(event.target)) return;
        window.location.href = card.dataset.productUrl;
      });
      card.addEventListener('keydown', (event) => {
        if ((event.key === 'Enter' || event.key === ' ') && !isInteractive(event.target)) {
          event.preventDefault();
          window.location.href = card.dataset.productUrl;
        }
      });
    });

    document.querySelectorAll('.phase-product-floater').forEach((figure) => {
      const panel = figure.closest('.phase-panel');
      const button = panel?.querySelector('.add-to-cart');
      const product = productById(button?.dataset.productId);
      if (!product) return;

      figure.dataset.productUrl = href(product.path);
      figure.setAttribute('role', 'link');
      figure.setAttribute('tabindex', '0');
      figure.setAttribute('aria-label', `View ${product.name} product page`);
      figure.addEventListener('click', () => {
        window.location.href = figure.dataset.productUrl;
      });
      figure.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          window.location.href = figure.dataset.productUrl;
        }
      });
    });
  }

  window.HERESE_SITE = {
    products,
    href,
    openSearch: null,
    closeSearch: null
  };

  window.addEventListener('DOMContentLoaded', () => {
    injectMenu();
    injectSearch();
    initProductCards();
  });
}());
