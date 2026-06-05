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

  let pageScrollLock = null;

  function currentScrollY() {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }

  function setSmoothScrollPaused(paused) {
    const lenis = window.HERESE_APP?.lenis;
    if (!lenis) return;
    if (paused) lenis.stop?.();
    else lenis.start?.();
  }

  function lockPageScroll() {
    if (pageScrollLock) {
      pageScrollLock.count += 1;
      return;
    }

    const scrollY = currentScrollY();
    pageScrollLock = {
      count: 1,
      scrollY,
      htmlOverflow: document.documentElement.style.overflow,
      bodyOverflow: document.body.style.overflow,
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyLeft: document.body.style.left,
      bodyRight: document.body.style.right,
      bodyWidth: document.body.style.width
    };

    setSmoothScrollPaused(true);
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }

  function unlockPageScroll() {
    if (!pageScrollLock) return;
    if (pageScrollLock.count > 1) {
      pageScrollLock.count -= 1;
      return;
    }

    const { scrollY } = pageScrollLock;
    document.documentElement.style.overflow = pageScrollLock.htmlOverflow;
    document.body.style.overflow = pageScrollLock.bodyOverflow;
    document.body.style.position = pageScrollLock.bodyPosition;
    document.body.style.top = pageScrollLock.bodyTop;
    document.body.style.left = pageScrollLock.bodyLeft;
    document.body.style.right = pageScrollLock.bodyRight;
    document.body.style.width = pageScrollLock.bodyWidth;
    pageScrollLock = null;

    window.scrollTo(0, scrollY);
    setSmoothScrollPaused(false);
  }

  function scrollElementByDelta(element, deltaY) {
    if (!element || Math.abs(deltaY) < 1 || element.scrollHeight <= element.clientHeight + 1) return false;
    const maxScroll = element.scrollHeight - element.clientHeight;
    const nextScroll = Math.max(0, Math.min(maxScroll, element.scrollTop + deltaY));
    const didMove = nextScroll !== element.scrollTop;
    element.scrollTop = nextScroll;
    return didMove;
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
          <a href="${href('index.html#phase-quiz')}">Find Your Phase</a>
          <a href="${href('index.html#ritual')}">How It Works</a>
          <a href="${href('index.html#lifecycle')}">Shop Rituals</a>
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
    const panel = search.querySelector('.site-search-panel');
    let lastTouchY = 0;

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
      lockPageScroll();
      setTimeout(() => input.focus(), 30);
    };

    const closeSearch = () => {
      search.classList.remove('active');
      search.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('search-open');
      unlockPageScroll();
    };

    const containWheel = (event) => {
      if (!search.classList.contains('active')) return;
      const scrollTarget = event.target.closest('.site-search-panel') || panel;
      scrollElementByDelta(scrollTarget, event.deltaY);
      event.preventDefault();
    };

    const containTouchStart = (event) => {
      lastTouchY = event.touches?.[0]?.clientY || 0;
    };

    const containTouchMove = (event) => {
      if (!search.classList.contains('active')) return;
      const currentY = event.touches?.[0]?.clientY || lastTouchY;
      const deltaY = lastTouchY - currentY;
      lastTouchY = currentY;
      const scrollTarget = event.target.closest('.site-search-panel') || panel;
      scrollElementByDelta(scrollTarget, deltaY);
      event.preventDefault();
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
    panel?.addEventListener('click', (event) => event.stopPropagation());
    search.addEventListener('wheel', containWheel, { passive: false });
    search.addEventListener('touchstart', containTouchStart, { passive: false });
    search.addEventListener('touchmove', containTouchMove, { passive: false });
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

  const quizQuestions = [
    {
      key: 'phase',
      label: 'Which phase feels closest right now?',
      options: [
        'First period years',
        'Regular periods',
        'PMS-heavy cycles',
        'PCOS / irregular cycles',
        'Perimenopause',
        'Menopause',
        'Sleep or stress support'
      ]
    },
    {
      key: 'craving',
      label: 'What do you crave most often?',
      options: [
        'Chocolate',
        'Citrus / lemon',
        'Mango / tangy',
        'Berry / fruity',
        'Warm milk / calming drink',
        'Not sure'
      ]
    },
    {
      key: 'goal',
      label: 'What support would feel most useful?',
      options: [
        'Energy',
        'Calm',
        'Craving support',
        'Cycle comfort',
        'Cooling / heat support',
        'Sleep support'
      ]
    },
    {
      key: 'format',
      label: 'What would you actually drink?',
      options: [
        'Cold drink',
        'Warm drink',
        'Chocolate-style drink',
        'Sachet on the go',
        'Not sure'
      ]
    },
    {
      key: 'routine',
      label: 'How do you want the ritual to feel?',
      options: [
        'Light and refreshing',
        'Rich and comforting',
        'Steady and practical',
        'Night-time and calming',
        'Gentle and beginner-friendly'
      ]
    }
  ];

  function resultFor(productId, message) {
    const product = productById(productId) || products[0];
    return { product, message };
  }

  function buildQuizRecommendation(answers) {
    const text = normalize(Object.values(answers).join(' '));

    if (text.includes('first period') || text.includes('beginner') || text.includes('berry')) {
      return resultFor('bloom-burst', 'BloomBurst is the closest match for first-period years and gentle berry-rose support.');
    }

    if (text.includes('pcos') || text.includes('irregular') || text.includes('mango') || text.includes('tangy')) {
      return resultFor('core-correct', 'CoreCorrect matches tangy green-mango cravings and PCOS or metabolic routine support.');
    }

    if (text.includes('sleep') || text.includes('stress') || text.includes('warm milk') || text.includes('calming') || text.includes('night')) {
      return resultFor('luna-sync', 'Sleep Latte matches warm night cravings, calm, and bedtime wind-down rituals.');
    }

    if (text.includes('menopause') || text.includes('almond') || text.includes('golden')) {
      return resultFor('pause-prime', 'PausePrime matches warm golden comfort for menopause routines.');
    }

    if (text.includes('perimenopause') || text.includes('citrus') || text.includes('cooling') || text.includes('heat') || text.includes('cold drink') || text.includes('refreshing')) {
      return resultFor('shift-steady', 'Pause. matches cooling citrus cravings and perimenopause support.');
    }

    if (text.includes('period') || text.includes('pms') || text.includes('chocolate') || text.includes('cycle comfort') || text.includes('rich')) {
      return resultFor('flow-fuel', 'FlowFuel matches chocolate cravings and period comfort rituals.');
    }

    return resultFor('shift-steady', 'Pause. is a useful starting point if you are unsure where to begin.');
  }

  function initPhaseQuiz() {
    const card = document.getElementById('phase-quiz-card');
    if (!card) return;

    const stepLabel = document.getElementById('quiz-step-label');
    const progressLabel = document.getElementById('quiz-progress-label');
    const progressBar = document.getElementById('quiz-progress-bar');
    const questionArea = document.getElementById('quiz-question-area');
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    const resultEl = document.getElementById('quiz-result');
    const resultTitle = document.getElementById('quiz-result-title');
    const resultCopy = document.getElementById('quiz-result-copy');
    const resultLink = document.getElementById('quiz-result-link');
    const restart = document.getElementById('quiz-restart');
    if (!stepLabel || !progressLabel || !progressBar || !questionArea || !questionEl || !optionsEl || !resultEl || !resultTitle || !resultCopy || !resultLink || !restart) return;

    let step = 0;
    let answers = {};

    const clearRecommendation = () => {
      document.querySelectorAll('.phase-panel.quiz-recommended').forEach((panel) => {
        panel.classList.remove('quiz-recommended');
      });
    };

    const highlightProduct = (productId) => {
      clearRecommendation();
      const button = document.querySelector(`.add-to-cart[data-product-id="${productId}"]`);
      button?.closest('.phase-panel')?.classList.add('quiz-recommended');
    };

    const renderQuestion = () => {
      const current = quizQuestions[step];
      const progress = Math.round((step / quizQuestions.length) * 100);
      stepLabel.textContent = `Question ${step + 1} of ${quizQuestions.length}`;
      progressLabel.textContent = `${progress}%`;
      progressBar.style.width = `${progress}%`;
      questionEl.textContent = current.label;
      optionsEl.innerHTML = current.options.map((option) => `
        <button class="quiz-option" type="button" data-value="${option}">
          <span>${option}</span>
        </button>
      `).join('');
      questionArea.hidden = false;
      resultEl.hidden = true;
    };

    const showResult = () => {
      const { product, message } = buildQuizRecommendation(answers);
      stepLabel.textContent = 'Quiz complete';
      progressLabel.textContent = '100%';
      progressBar.style.width = '100%';
      questionArea.hidden = true;
      resultTitle.textContent = product.name;
      resultCopy.textContent = message;
      resultLink.href = href(product.path);
      resultLink.querySelector('.btn-text').textContent = `View ${product.name}`;
      resultEl.hidden = false;
      highlightProduct(product.id);

      try {
        localStorage.setItem('herese-quiz-result-v1', JSON.stringify({
          answers,
          productId: product.id,
          productName: product.name,
          createdAt: new Date().toISOString()
        }));
      } catch (err) {
        console.warn('[HERESE] Could not save quiz result:', err.message);
      }
    };

    optionsEl.addEventListener('click', (event) => {
      const option = event.target.closest('.quiz-option');
      if (!option) return;
      const current = quizQuestions[step];
      answers = { ...answers, [current.key]: option.dataset.value || option.textContent.trim() };
      step += 1;
      if (step >= quizQuestions.length) showResult();
      else renderQuestion();
    });

    restart.addEventListener('click', () => {
      step = 0;
      answers = {};
      clearRecommendation();
      renderQuestion();
    });

    renderQuestion();
  }

  window.HERESE_SITE = {
    products,
    href,
    lockPageScroll,
    unlockPageScroll,
    scrollElementByDelta,
    openSearch: null,
    closeSearch: null
  };

  window.addEventListener('DOMContentLoaded', () => {
    injectMenu();
    injectSearch();
    initProductCards();
    initPhaseQuiz();
  });
}());
