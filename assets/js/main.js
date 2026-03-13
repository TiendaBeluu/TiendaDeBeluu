/* =============================================
   TIENDA DE BELU — MAIN V2
   Scripts compartidos: Navbar, Scroll Fade,
   Hamburguesa, WhatsApp Float
   Se aplica a TODAS las páginas del sitio
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ============================================
  // NAVBAR — scroll effect
  // ============================================
  const v2Navbar  = document.querySelector('.v2-navbar');
  const v2Header  = document.querySelector('.v2-header');
  const v2Hero    = document.querySelector('.v2-hero');

  function updateNavbar() {
    if (!v2Navbar) return;
    if (v2Hero) {
      const heroBottom = v2Hero.getBoundingClientRect().bottom;
      const isScrolled = heroBottom < 80;
      v2Navbar.classList.toggle('scrolled', isScrolled);
      // FIX MOBILE: aplica .scrolled también al header completo
      // para activar el fondo rosado en mobile al hacer scroll
      if (v2Header) v2Header.classList.toggle('scrolled', isScrolled);
    } else {
      // En páginas sin hero (catálogo, acerca, contacto)
      // el header siempre tiene el fondo rosado desde el inicio
      v2Navbar.classList.add('scrolled');
      if (v2Header) v2Header.classList.add('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // ============================================
  // HAMBURGUESA — animación X
  // ============================================
  const v2HamBtn     = document.getElementById('v2HamburgerBtn');
  const bsCollapseEl = document.getElementById('v2NavMenu');

  if (v2HamBtn && bsCollapseEl) {
    bsCollapseEl.addEventListener('show.bs.collapse', () => v2HamBtn.classList.add('is-active'));
    bsCollapseEl.addEventListener('hide.bs.collapse', () => v2HamBtn.classList.remove('is-active'));
  }

  // ============================================
  // CERRAR MENÚ MOBILE al hacer clic en nav-link
  // ============================================
  if (bsCollapseEl) {
    document.querySelectorAll('.v2-navbar .nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        if (!bsCollapseEl.classList.contains('show')) return;

        if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
          try {
            bootstrap.Collapse.getOrCreateInstance(bsCollapseEl).hide();
            return;
          } catch (e) { /* fallback abajo */ }
        }

        if (v2HamBtn) v2HamBtn.click();
      });
    });
  }

  // ============================================
  // SCROLL FADE-IN — Intersection Observer
  // ============================================
  const v2Fades = document.querySelectorAll('.v2-scroll-fade');
  if (v2Fades.length > 0) {
    const v2Observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('v2-visible');
          v2Observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    v2Fades.forEach(function (el) { v2Observer.observe(el); });
  }

  // ============================================
  // HERO — ajuste de margin para navbar sticky
  //
  // FIX PROBLEMA 1: ahora mide el .v2-header
  // COMPLETO (tira de novedad + navbar), ya que
  // la tira está dentro del header en el HTML.
  //
  // FIX PROBLEMA 2: ResizeObserver recalcula en
  // tiempo real cuando el viewport cambia (p.ej.
  // al cerrar DevTools mobile), evitando que el
  // scroll quede mal posicionado.
  //
  // También actualiza scroll-padding-top en el
  // elemento <html> dinámicamente, reemplazando
  // el valor fijo de 72px del CSS.
  //
  // NOTA MOBILE: en mobile el CSS del index anula
  // margin-top/padding-top/min-height con !important
  // para que el hero arranque desde el borde superior
  // y el navbar transparente quede encima de la imagen.
  // ============================================
  (function adjustHero() {
    const nav  = v2Header; // <header> completo: tira + navbar
    const hero = v2Hero;
    if (!nav || !hero) return;

    function applyHeroOffset() {
      const h = nav.getBoundingClientRect().height;

      // En mobile (<=768px) el CSS del index maneja el hero con
      // margin-top negativo fijo. JS limpia sus estilos inline
      // para no interferir con los !important del media query.
      if (window.innerWidth <= 768) {
        hero.style.marginTop  = '';
        hero.style.paddingTop = '';
        hero.style.minHeight  = '';
      } else {
        hero.style.marginTop  = `-${h}px`;
        hero.style.paddingTop = `${h}px`;
        hero.style.minHeight  = `calc(100svh + ${h}px)`;
      }
      // scroll-padding-top siempre se actualiza en todos los viewports.
      // En mobile se resta un offset extra de 20px para que la sección
      // quede un poco más abajo y no quede pegada al navbar.
      const scrollOffset = window.innerWidth <= 768 ? h - 200 : h;
      document.documentElement.style.scrollPaddingTop = `${scrollOffset}px`;
    }

    applyHeroOffset();

    // FIX: ResizeObserver detecta cambios de tamaño del header
    // (incluyendo el cierre de DevTools) y recalcula sin recargar
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(function () {
        applyHeroOffset();
      });
      ro.observe(nav);
    }
  })();

  // ============================================
  // FAVORITO — toggle corazón en cards de producto
  // ============================================
  document.querySelectorAll('.v2-prod-fav').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const icon = this.querySelector('i');
      if (!icon) return;
      if (icon.classList.contains('fa-regular')) {
        icon.classList.replace('fa-regular', 'fa-solid');
        this.style.color = '#ff1493';
      } else {
        icon.classList.replace('fa-solid', 'fa-regular');
        this.style.color = '';
      }
    });
  });

  // ============================================
  // ANCHOR SCROLL — compensar navbar sticky
  //
  // FIX PROBLEMA 2: se reemplaza el scroll manual
  // con window.scrollTo() + cálculo de offsetTop
  // por scrollIntoView() nativo, que respeta
  // automáticamente el scroll-padding-top del <html>
  // (actualizado dinámicamente en adjustHero).
  //
  // Esto elimina el bug donde al volver de vista
  // mobile el scroll quedaba posicionado en el footer.
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return; // href="#" solo, no hacer nada

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      // scrollIntoView usa scroll-padding-top del <html>
      // que ya fue actualizado con la altura real del header
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ============================================
  // SCROLL SPY — solo en el index (cuando hay hero)
  // ============================================
  if (v2Hero) {

    const navLinks = document.querySelectorAll('.v2-navbar .nav-link');

    const spySections = [
      { id: 'v2-ofrecemos', href: '#v2-ofrecemos' }
    ];

    function clearActive() {
      navLinks.forEach(link => link.classList.remove('active'));
    }

    function setActive(href) {
      navLinks.forEach(function (link) {
        if (link.getAttribute('href') === href) {
          link.classList.add('active');
        }
      });
    }

    function runScrollSpy() {
      const navH    = v2Header ? v2Header.getBoundingClientRect().height : 0;
      const scrollY = window.scrollY;
      const offset  = navH + 80;
      let   active  = null;

      spySections.forEach(function (item) {
        const el = document.getElementById(item.id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + scrollY - offset;
        if (scrollY >= top) active = item.href;
      });

      clearActive();
      if (active) {
        setActive(active);
      } else {
        setActive('index.html');
      }
    }

    window.addEventListener('scroll', runScrollSpy, { passive: true });
    runScrollSpy();
  }

});