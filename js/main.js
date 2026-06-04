import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { SceneManager } from './SceneManager.js?v=platform-scroll-perf-20260604a';
import { HeroDroplet } from './scenes/HeroDroplet.js?v=platform-scroll-perf-20260604a';
import { LifecycleRibbon } from './scenes/LifecycleRibbon.js?v=platform-scroll-perf-20260604a';
import { Mandala } from './scenes/Mandala.js?v=mandala-scroll-smooth-20260602a';
import { shopify } from './shopify.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({
  ignoreMobileResize: true,
  limitCallbacks: true,
});

/**
 * HERESE - For Every Stage
 * Main Application Orchestrator
 */
class HereseApp {
  constructor() {
    this.isEntered = true;
    this.audioCtx = null;
    this.pinkNoise = null;
    this.audioMuted = false;
    this.clock = new THREE.Clock();
    this.isMobileRuntime = this._detectMobileRuntime();
    this._layoutViewport = { width: window.innerWidth, height: window.innerHeight };
    this._lastScrollProgress = -1;
    this._shopifyHydrationStarted = false;
    this._lastRenderedAt = 0;
    this._lastAmbientUpdateAt = 0;
    this._scrollActiveUntil = 0;
    this._scrollClassTimer = null;
    this._pageScrollRAF = null;
    this._boundAnimate = this._animate.bind(this);
    window.HERESE_APP = this;

    this._initScene();
    this._initForms();
    this._initCart();
    this._initExperience();
  }

  _detectMobileRuntime() {
    return window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches;
  }

  /* ═══════════════════════════════════════════════
     SCENE INITIALIZATION
     ═══════════════════════════════════════════════ */

  _initScene() {
    const canvas = document.getElementById('sanctuary-canvas');
    this.scene = new SceneManager(canvas);

    // Create 3D elements
    this.hero = new HeroDroplet();
    this.ribbon = new LifecycleRibbon();
    this.mandala = new Mandala();

    this.scene.add(this.hero.group);
    this.scene.add(this.ribbon.group);
    this.scene.add(this.mandala.group);

    // Start render loop immediately.
    this._initScrollPerformanceTracking();
    this._animate();

    // Handle responsive canvas and scroll recalculation.
    this._resizeRAF = null;
    const handleResize = ({ force = false } = {}) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const widthDelta = Math.abs(width - this._layoutViewport.width);
      const heightDelta = Math.abs(height - this._layoutViewport.height);
      const isMobileChromeResize = !force && this.isMobileRuntime && widthDelta < 2 && heightDelta > 0 && heightDelta < 140;

      if (isMobileChromeResize) return;

      this._layoutViewport = { width, height };
      this.isMobileRuntime = this._detectMobileRuntime();

      if (this._resizeRAF) cancelAnimationFrame(this._resizeRAF);
      this._resizeRAF = requestAnimationFrame(() => {
        const didResize = this.scene.resize({ force });
        if (didResize !== false && this.isEntered) ScrollTrigger.refresh();
      });
    };
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(() => handleResize({ force: true }), 300), { passive: true });
  }

  /* ═══════════════════════════════════════════════
     EXPERIENCE BOOT
     ═══════════════════════════════════════════════ */

  _initExperience() {
    requestAnimationFrame(() => {
      this._initLenis();
      this._initGSAP();
      this._initAudioToggle();
      this._initSearch();
      this._initAssetPredecode();
      ScrollTrigger.refresh();
    });
  }

  /* ═══════════════════════════════════════════════
     SMOOTH SCROLL (LENIS)
     ═══════════════════════════════════════════════ */

  async _initLenis() {
    const isTouchRuntime = this._detectMobileRuntime();

    // Native touch scrolling is more stable than a second scroll pipeline on
    // iOS, iPadOS, and coarse-pointer devices.
    if (isTouchRuntime) {
      this.lenis = null;
      return;
    }

    const { default: Lenis } = await import('lenis');
    this.lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      smoothTouch: false,
      syncTouch: false,
      touchMultiplier: 1,
    });

    // Connect Lenis to GSAP ticker
    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(500, 33);
  }

  /* ═══════════════════════════════════════════════
     GSAP SCROLL ANIMATIONS
     ═══════════════════════════════════════════════ */

  _initGSAP() {
    const sceneScrub = this.isMobileRuntime ? 0.35 : 0.9;
    const revealScrub = this.isMobileRuntime ? 0.3 : 0.75;

    // ── Hero text reveal ──
    gsap.to('.hero-headline .line', {
      opacity: 1,
      y: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power3.out',
      delay: 0.3,
    });

    gsap.to('.hero-sub', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 1.2,
    });

    gsap.to('.hero-ctas', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 1.5,
    });

    // ── Hero → Manifesto: camera pulls back, droplet shrinks ──
    ScrollTrigger.create({
      trigger: '#manifesto',
      start: 'top bottom',
      end: 'top center',
      scrub: sceneScrub,
      onUpdate: (self) => {
        const p = self.progress;
        this.hero.group.scale.setScalar(1 - p * 0.5);
        this.hero.group.position.y = p * 2.6;
        this.scene.camera.position.z = 12 + p * 3;
      },
    });

    // ── Manifesto reveal ──
    gsap.from('.manifesto-content', {
      scrollTrigger: {
        trigger: '#manifesto',
        start: 'top 70%',
        end: 'top 30%',
        scrub: revealScrub,
      },
      opacity: 0,
      y: 60,
      scale: 0.95,
    });

    // ── Lifecycle: scroll-driven camera dive along ribbon ──
    ScrollTrigger.create({
      trigger: '#lifecycle',
      start: 'top bottom',
      endTrigger: '#lifecycle',
      end: 'bottom bottom',
      scrub: sceneScrub,
      onUpdate: (self) => {
        const p = self.progress;

        // Move camera along the ribbon path
        this.scene.camera.position.y = -p * 45;
        this.scene.camera.position.z = 12 - p * 4;

        // Keep the womb resting behind the Why HERESE card once it has arrived there.
        this.hero.group.scale.setScalar(0.5);
        this.hero.group.position.y = 2.6;

        // Update ribbon glow
        this.ribbon.updateScroll(p);

        // Update environment
        this.scene.updateScroll(p * 0.7);
      },
    });

    // ── Phase panels stagger reveal ──
    const phases = document.querySelectorAll('.phase-panel');
    const isCompactViewport = window.matchMedia('(max-width: 768px)').matches;
    const isTabletViewport = window.matchMedia('(max-width: 1180px)').matches;
    const phaseDrift = isCompactViewport ? 0 : isTabletViewport ? 46 : 80;
    phases.forEach((panel, i) => {
      gsap.from(panel, {
        scrollTrigger: {
          trigger: panel,
          start: 'top 75%',
          end: 'top 35%',
          scrub: revealScrub,
        },
        opacity: 0,
        x: phaseDrift ? (i % 2 === 0 ? -phaseDrift : phaseDrift) : 0,
        y: isCompactViewport ? 36 : 0,
        scale: isCompactViewport ? 0.96 : 0.9,
      });
    });

    // ── Transparency Lab ──
    gsap.from('.transparency-header', {
      scrollTrigger: {
        trigger: '#transparency',
        start: 'top 70%',
      },
      immediateRender: false,
      opacity: 0,
      y: 50,
      duration: 1.2,
      ease: 'power3.out',
    });

    const ingredientCards = document.querySelectorAll('.ingredient-card');
    gsap.from(ingredientCards, {
      scrollTrigger: {
        trigger: '#transparency',
        start: 'top 50%',
      },
      immediateRender: false,
      opacity: 0,
      y: 40,
      scale: 0.9,
      stagger: 0.12,
      duration: 0.8,
      ease: 'power3.out',
    });

    // ── Waitlist section: camera descends to mandala ──
    ScrollTrigger.create({
      trigger: '#mandala',
      start: 'top bottom',
      end: 'bottom bottom',
      scrub: sceneScrub,
      onUpdate: (self) => {
        const p = self.progress;
        this.scene.camera.position.y = -45 - p * 5.5;
        this.scene.camera.position.z = 8 + p * 0.8;
        this.scene.updateScroll(0.72 + p * 0.1);
      },
    });

    ScrollTrigger.create({
      trigger: '#waitlist',
      start: 'top bottom-=2',
      end: 'top center',
      scrub: sceneScrub,
      onUpdate: (self) => {
        const p = self.progress;
        this.scene.camera.position.y = -50.5 - p * 9.5;
        this.scene.camera.position.z = 8.8;
        this.scene.updateScroll(0.82 + p * 0.1);
      },
    });

    // Continue the camera down VINELINE so the footer soil resolves at the page end.
    ScrollTrigger.create({
      trigger: '#gift',
      start: 'top bottom',
      endTrigger: '#footer',
      end: 'bottom bottom',
      scrub: sceneScrub,
      onUpdate: (self) => {
        const p = self.progress;
        this.scene.camera.position.y = -60 - p * 6.4;
        this.scene.camera.position.z = 8 + p * 1.1;
        this.ribbon.updateScroll(0.82 + p * 0.18);
        this.scene.updateScroll(0.85 + p * 0.15);
      },
    });

    gsap.from('.waitlist-content', {
      scrollTrigger: {
        trigger: '#waitlist',
        start: 'top 60%',
      },
      opacity: 0,
      y: 50,
      duration: 1.2,
      ease: 'power3.out',
    });

    // ── Counter animation ──
    ScrollTrigger.create({
      trigger: '#waitlist',
      start: 'top 60%',
      once: true,
      onEnter: () => this._animateCounter(),
    });

    // ── Gift section ──
    gsap.from('.gift-content', {
      scrollTrigger: {
        trigger: '#gift',
        start: 'top 65%',
      },
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
    });

    // ── Testimonials ──
    const bubbles = document.querySelectorAll('.testimonial-bubble');
    gsap.from(bubbles, {
      scrollTrigger: {
        trigger: '#testimonials',
        start: 'top 60%',
      },
      y: 8,
      scale: 0.995,
      stagger: 0.15,
      duration: 0.9,
      ease: 'power3.out',
    });

    // ── CTA buttons scroll behavior ──
    document.getElementById('cta-flow')?.addEventListener('click', () => {
      this._scrollTo('#lifecycle', 1.5);
    });

    document.getElementById('cta-sisterhood')?.addEventListener('click', () => {
      this._scrollTo('#waitlist', 1.8);
    });
  }

  _scrollTo(target, duration = 1.4) {
    if (this.lenis) {
      this.lenis.scrollTo(target, { duration });
      return;
    }

    document.querySelector(target)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  /* ═══════════════════════════════════════════════
     COUNTER ANIMATION
     ═══════════════════════════════════════════════ */

  _animateCounter() {
    const counterEl = document.getElementById('counter-number');
    const target = 14020;
    const obj = { val: 0 };

    gsap.to(obj, {
      val: target,
      duration: 2.5,
      ease: 'power2.out',
      onUpdate: () => {
        counterEl.textContent = Math.floor(obj.val).toLocaleString();
      },
    });
  }

  /* ═══════════════════════════════════════════════
     AUDIO: PROCEDURAL PINK NOISE
     ═══════════════════════════════════════════════ */

  _initAudio() {
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      // Pink noise via biquad-filtered white noise
      const bufferSize = 2 * this.audioCtx.sampleRate;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Paul Kellet's pink noise algorithm
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.02;
        b6 = white * 0.115926;
      }

      this.noiseSource = this.audioCtx.createBufferSource();
      this.noiseSource.buffer = noiseBuffer;
      this.noiseSource.loop = true;

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = 0;

      this.noiseSource.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
      this.noiseSource.start();

      // Fade in gently
      this.gainNode.gain.linearRampToValueAtTime(0.08, this.audioCtx.currentTime + 3);
    } catch (e) {
      console.warn('Audio initialization failed:', e);
    }
  }

  _initAudioToggle() {
    const toggleBtn = document.getElementById('audio-toggle');
    if (!toggleBtn) return;

    const toggleIcon = toggleBtn.querySelector('.audio-icon');
    if (!this.audioCtx) {
      this.audioMuted = true;
      toggleBtn.classList.add('muted');
      if (toggleIcon) toggleIcon.textContent = '🔇';
    }

    toggleBtn.addEventListener('click', () => {
      if (!this.audioCtx) {
        this.audioMuted = false;
        toggleBtn.classList.remove('muted');
        if (toggleIcon) toggleIcon.textContent = '🔊';
        this._initAudio();
        return;
      }

      this.audioMuted = !this.audioMuted;
      toggleBtn.classList.toggle('muted', this.audioMuted);

      if (this.gainNode) {
        this.gainNode.gain.linearRampToValueAtTime(
          this.audioMuted ? 0 : 0.08,
          this.audioCtx.currentTime + 0.5
        );
      }

      const icon = toggleBtn.querySelector('.audio-icon');
      icon.textContent = this.audioMuted ? '🔇' : '🔊';
    });
  }

  /* ═══════════════════════════════════════════════
     FORMS
     ═══════════════════════════════════════════════ */

  _initSearch() {
    const searchBtn = document.getElementById('search-btn');
    if (!searchBtn) return;

    searchBtn.addEventListener('click', (event) => {
      event.preventDefault();

      if (window.HERESE_SITE?.openSearch) {
        window.HERESE_SITE.openSearch();
        return;
      }

      if (this.lenis) {
        this._scrollTo('#lifecycle', 1.3);
        return;
      }

      this._scrollTo('#lifecycle', 1.3);
    });
  }

  _initAssetPredecode() {
    if (!('IntersectionObserver' in window)) return;

    const rootMargin = this.isMobileRuntime ? '1100px 0px' : '1800px 0px';
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const image = entry.target;
        image.decode?.().catch(() => {});
        observer.unobserve(image);
      });
    }, { rootMargin });

    document.querySelectorAll('img[loading="lazy"]').forEach((image) => observer.observe(image));
  }

  _initScrollPerformanceTracking() {
    const syncPageProgress = () => {
      this._pageScrollRAF = null;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollProgress = window.scrollY / maxScroll;
      if (Math.abs(scrollProgress - this._lastScrollProgress) > 0.0002) {
        this.scene.updateScroll(scrollProgress);
        this._lastScrollProgress = scrollProgress;
      }
    };

    const markScrolling = () => {
      this._scrollActiveUntil = performance.now() + 180;
      document.body.classList.add('is-scrolling');

      if (!this._pageScrollRAF) {
        this._pageScrollRAF = requestAnimationFrame(syncPageProgress);
      }

      clearTimeout(this._scrollClassTimer);
      this._scrollClassTimer = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 190);
    };

    window.addEventListener('scroll', markScrolling, { passive: true });
    requestAnimationFrame(syncPageProgress);
  }

  _initForms() {
    // Waitlist form
    const waitlistForm = document.getElementById('waitlist-form');
    waitlistForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      waitlistForm.style.display = 'none';
      document.getElementById('waitlist-success').style.display = 'block';

      // Update counter
      const counterEl = document.getElementById('counter-number');
      const current = parseInt(counterEl.textContent.replace(/,/g, ''));
      counterEl.textContent = (current + 1).toLocaleString();

      // Mandala burst
      this.mandala.burst();
    });

    // Gift form
    const giftForm = document.getElementById('gift-form');
    giftForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      giftForm.style.display = 'none';
      document.getElementById('gift-success').style.display = 'block';
    });
  }

  /* ═══════════════════════════════════════════════
     RENDER LOOP
     ═══════════════════════════════════════════════ */

  _animate(now = performance.now()) {
    requestAnimationFrame(this._boundAnimate);
    if (document.hidden) return;

    const qualityTier = this.scene.qualityTier;
    const isScrolling = now < this._scrollActiveUntil;
    const targetFps = qualityTier === 'mobile'
      ? (isScrolling ? 45 : 30)
      : qualityTier === 'tablet'
        ? (isScrolling ? 50 : 38)
        : (isScrolling ? 60 : 50);
    const minFrameGap = 1000 / targetFps;
    if (now - this._lastRenderedAt < minFrameGap) return;
    this._lastRenderedAt = now;

    const time = this.clock.getElapsedTime();
    const ambientFps = qualityTier === 'mobile' ? 24 : qualityTier === 'tablet' ? 30 : 45;
    const updateAmbient = now - this._lastAmbientUpdateAt >= 1000 / ambientFps;

    if (updateAmbient) {
      const cameraY = this.scene.camera.position.y;
      const heroActive = Math.abs(cameraY - this.hero.group.position.y) < 18;
      const ribbonActive = cameraY < 5 && cameraY > -79;
      const mandalaActive = Math.abs(cameraY - this.mandala.group.position.y) < 22;

      if (heroActive) {
        this.hero.update(time);
        this.hero.updateMouse(this.scene.mouse);
      }
      if (ribbonActive) this.ribbon.update(time);
      if (mandalaActive) this.mandala.update(time);
      this._lastAmbientUpdateAt = now;
    }

    // Render
    this.scene.render(time, { updateDecorations: updateAmbient });
  }

  /* ═══════════════════════════════════════════════
     CART & SHOP LOGIC
     ═══════════════════════════════════════════════ */

  _initCart() {
    this.cart = this._loadStoredCart();
    this.shopifyProducts = {};  // Will hold product data from Shopify
    this.shopifyCart = null;    // Shopify cart object
    this.isCheckingOut = false;

    const cartBtn = document.getElementById('cart-btn');
    const closeCart = document.getElementById('close-cart');
    const cartOverlay = document.querySelector('.cart-overlay');
    const checkoutBtn = document.getElementById('checkout-btn');

    cartBtn?.addEventListener('click', () => {
      this._ensureProductHydration();
      this._toggleCart();
    });
    closeCart?.addEventListener('click', () => this._closeCart());
    cartOverlay?.addEventListener('click', () => this._closeCart());
    checkoutBtn?.addEventListener('click', () => this._handleCheckout());
    this._initCartScrollContainment();
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this._closeCart();
    });
    window.addEventListener('storage', (e) => {
      if (e.key === 'herese-cart-v1') {
        this.cart = this._loadStoredCart();
        this._renderCart();
      }
    });

    document.addEventListener('change', (e) => {
      const packInput = e.target.closest('[data-pack-options] input[type="radio"]');
      if (!packInput) return;

      const card = packInput.closest('.phase-content');
      const button = card?.querySelector('.add-to-cart');
      if (!button) return;

      button.dataset.productPrice = packInput.dataset.packPrice || button.dataset.productPrice || '₹1499';
      const btnText = button.querySelector('.btn-text');
      if (btnText) btnText.textContent = `Add to Cart - ${button.dataset.productPrice}`;
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart')) {
        const btn = e.target.closest('.add-to-cart');
        const productId = btn.dataset.productId;
        const productName = btn.dataset.productName;
        const pack = this._getSelectedPack(btn);
        const cartName = pack.detail ? `${productName} - ${pack.detail}` : productName;

        this._ensureProductHydration();
        this._addToCart({
          id: productId,
          name: cartName,
          price: pack.price,
          packLabel: pack.label,
          packDetail: pack.detail,
        });
      }
    });

    this._renderCart();
  }

  _initCartScrollContainment() {
    const cartDrawer = document.getElementById('cart-drawer');
    const cartItems = document.getElementById('cart-items');
    if (!cartDrawer || !cartItems) return;

    let lastTouchY = 0;
    const scrollCart = (target, deltaY) => {
      const scroller = target?.closest?.('.cart-items') || cartItems;
      const helper = window.HERESE_SITE?.scrollElementByDelta;
      if (helper) return helper(scroller, deltaY);

      if (!scroller || Math.abs(deltaY) < 1 || scroller.scrollHeight <= scroller.clientHeight + 1) return false;
      const maxScroll = scroller.scrollHeight - scroller.clientHeight;
      const nextScroll = Math.max(0, Math.min(maxScroll, scroller.scrollTop + deltaY));
      const didMove = nextScroll !== scroller.scrollTop;
      scroller.scrollTop = nextScroll;
      return didMove;
    };

    cartDrawer.addEventListener('wheel', (event) => {
      if (!cartDrawer.classList.contains('active')) return;
      scrollCart(event.target, event.deltaY);
      event.preventDefault();
    }, { passive: false });

    cartDrawer.addEventListener('touchstart', (event) => {
      lastTouchY = event.touches?.[0]?.clientY || 0;
    }, { passive: false });

    cartDrawer.addEventListener('touchmove', (event) => {
      if (!cartDrawer.classList.contains('active')) return;
      const currentY = event.touches?.[0]?.clientY || lastTouchY;
      const deltaY = lastTouchY - currentY;
      lastTouchY = currentY;
      scrollCart(event.target, deltaY);
      event.preventDefault();
    }, { passive: false });
  }

  _ensureProductHydration() {
    if (this._shopifyHydrationPromise) return this._shopifyHydrationPromise;

    this._shopifyHydrationStarted = true;
    this._shopifyHydrationPromise = this._loadShopifyProducts();
    return this._shopifyHydrationPromise;
  }

  /**
   * Fetch products from Shopify and attach variant IDs without overriding pack pricing.
   */
  async _loadShopifyProducts() {
    try {
      this.shopifyProducts = await shopify.getProducts();

      // Map our product IDs to Shopify handles
      // Update this mapping when you add products to Shopify
      const handleMap = {
        'bloom-burst': 'bloomburst',
        'flow-fuel': 'flowfuel',
        'core-correct': 'corecorrect',
        'shift-steady': 'shiftsteady',
        'pause-prime': 'pauseprime',
        'luna-sync': 'lunasync',
      };

      document.querySelectorAll('.add-to-cart').forEach(btn => {
        const productId = btn.dataset.productId;
        const handle = handleMap[productId];
        const shopifyProduct = this.shopifyProducts[handle];

        if (shopifyProduct) {
          btn.dataset.shopifyVariantId = shopifyProduct.variantId;
        }
      });

      console.log('[Ecorality] Shopify products loaded:', Object.keys(this.shopifyProducts).length);
    } catch (err) {
      console.warn('[Ecorality] Could not load Shopify products (offline mode):', err.message);
    }
  }

  _addToCart(product) {
    this.cart.push(product);
    this._saveStoredCart();

    this._renderCart();

    if (this.cart.length === 1) {
      this._openCart();
    }

    gsap.fromTo('#cart-btn', { scale: 1 }, { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 });
  }

  _openCart() {
    const cartDrawer = document.getElementById('cart-drawer');
    const cartBtn = document.getElementById('cart-btn');
    cartDrawer?.classList.add('active');
    cartDrawer?.setAttribute('aria-hidden', 'false');
    cartBtn?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('cart-open');
    window.HERESE_SITE?.lockPageScroll?.();
  }

  _closeCart() {
    const cartDrawer = document.getElementById('cart-drawer');
    const cartBtn = document.getElementById('cart-btn');
    const wasOpen = cartDrawer?.classList.contains('active');
    cartDrawer?.classList.remove('active');
    cartDrawer?.setAttribute('aria-hidden', 'true');
    cartBtn?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('cart-open');
    if (wasOpen) window.HERESE_SITE?.unlockPageScroll?.();
  }

  _toggleCart() {
    const cartDrawer = document.getElementById('cart-drawer');
    if (cartDrawer?.classList.contains('active')) {
      this._closeCart();
    } else {
      this._openCart();
    }
  }

  /**
   * Handle checkout — create Shopify cart and redirect to checkout.ecorality.com
   */
  async _handleCheckout() {
    const checkoutNote = document.getElementById('checkout-note');
    const checkoutBtn = document.getElementById('checkout-btn');
    if (!this.cart.length) return;
    if (this.isCheckingOut) return;

    this.isCheckingOut = true;
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      const btnText = checkoutBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'Preparing checkout…';
    }

    try {
      await this._ensureProductHydration();

      // Build line items with Shopify variant IDs
      const handleMap = {
        'bloom-burst': 'bloomburst',
        'flow-fuel': 'flowfuel',
        'core-correct': 'corecorrect',
        'shift-steady': 'shiftsteady',
        'pause-prime': 'pauseprime',
        'luna-sync': 'lunasync',
      };

      // Aggregate quantities per variant
      const variantQuantities = {};
      for (const item of this.cart) {
        const handle = handleMap[item.id];
        const product = this.shopifyProducts[handle];
        if (product?.variantId) {
          if (!variantQuantities[product.variantId]) {
            variantQuantities[product.variantId] = { variantId: product.variantId, quantity: 0 };
          }
          variantQuantities[product.variantId].quantity += 1;
        }
      }

      const lineItems = Object.values(variantQuantities);

      if (lineItems.length > 0) {
        // Use Shopify Cart API
        const cart = await shopify.createCart(lineItems);
        if (cart) {
          const checkoutUrl = shopify.getCheckoutUrl(cart);
          if (checkoutUrl) {
            window.location.href = checkoutUrl;
            return;
          }
        }

        // Fallback: build direct /cart URL
        const fallbackUrl = shopify.buildDirectCheckoutUrl(lineItems);
        window.location.href = fallbackUrl;
        return;
      }

      // No Shopify variant IDs available — show message
      if (checkoutNote) {
        checkoutNote.textContent = 'Please configure Shopify credentials in shopify.js to enable checkout.';
      }
    } catch (err) {
      console.error('[Ecorality] Checkout error:', err);
      if (checkoutNote) {
        checkoutNote.textContent = 'Something went wrong. Please try again.';
      }
    } finally {
      this.isCheckingOut = false;
      if (checkoutBtn) {
        checkoutBtn.disabled = false;
        const btnText = checkoutBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Proceed to Checkout';
      }
    }
  }

  _escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  }

  _loadStoredCart() {
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

  _saveStoredCart() {
    try {
      localStorage.setItem('herese-cart-v1', JSON.stringify(this.cart));
    } catch (err) {
      console.warn('[HERESE] Could not save cart:', err.message);
    }
  }

  _parsePrice(price) {
    const value = parseFloat(String(price).replace(/[^0-9.]/g, ''));
    return Number.isFinite(value) ? value : 0;
  }

  _formatRupee(value) {
    return `₹${Math.round(value)}`;
  }

  _getSelectedPack(button) {
    const selected = button.closest('.phase-content')?.querySelector('[data-pack-options] input[type="radio"]:checked');
    return {
      label: selected?.dataset.packLabel || '14-sachet pack',
      detail: selected?.dataset.packDetail || '14 sachets',
      price: selected?.dataset.packPrice || button.dataset.productPrice || '₹1499',
    };
  }

  _syncCartMeta(total = 0) {
    const count = this.cart.length;
    const countEl = document.getElementById('cart-count');
    const cartBtn = document.getElementById('cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutNote = document.getElementById('checkout-note');

    if (countEl) countEl.textContent = count;
    if (cartBtn) {
      cartBtn.setAttribute('aria-label', count === 0 ? 'Open cart' : `Open cart, ${count} item${count === 1 ? '' : 's'}`);
    }
    if (checkoutBtn) {
      checkoutBtn.disabled = count === 0;
      checkoutBtn.setAttribute('aria-disabled', String(count === 0));
    }
    if (checkoutNote) {
      checkoutNote.textContent = count === 0 ? 'Add a ritual before checkout.' : '';
    }
  }

  _renderCart() {
    const itemsContainer = document.getElementById('cart-items');
    const totalEl = document.getElementById('total-amount');

    if (this.cart.length === 0) {
      itemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty. Add a craving ritual.</p>';
      totalEl.textContent = '₹0';
      this._syncCartMeta(0);
      return;
    }

    itemsContainer.innerHTML = this.cart.map((item, index) => `
      <div class="cart-item glass-card">
        <div>
          <h4>${this._escapeHTML(item.name)}</h4>
          <p>${this._escapeHTML(item.price)}</p>
        </div>
        <button type="button" class="remove-item" data-index="${index}" aria-label="Remove ${this._escapeHTML(item.name)} from cart">&times;</button>
      </div>
    `).join('');

    const total = this.cart.reduce((sum, item) => sum + this._parsePrice(item.price), 0);
    totalEl.textContent = this._formatRupee(total);
    this._syncCartMeta(total);

    itemsContainer.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        this.cart.splice(index, 1);
        this._saveStoredCart();
        this._renderCart();
      });
    });
  }
}

// ── BOOT ──
const bootHereseApp = () => {
  if (!window.HERESE_APP) new HereseApp();
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootHereseApp, { once: true });
} else {
  bootHereseApp();
}
