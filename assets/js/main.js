/**
* Template Name: DevFolio
* Template URL: https://bootstrapmade.com/devfolio-bootstrap-portfolio-html-template/
* Updated: Aug 07 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle — reescrito desde cero
   */
  (function() {
    const toggleBtn = document.querySelector('.mobile-nav-toggle');
    if (!toggleBtn) return;

    const openNav = () => {
      document.body.classList.add('mobile-nav-active');
      toggleBtn.classList.remove('bi-list');
      toggleBtn.classList.add('bi-x');
    };

    const closeNav = () => {
      document.body.classList.remove('mobile-nav-active');
      toggleBtn.classList.add('bi-list');
      toggleBtn.classList.remove('bi-x');
    };

    toggleBtn.addEventListener('click', () => {
      document.body.classList.contains('mobile-nav-active') ? closeNav() : openNav();
    });

    // Cerrar al hacer click en un link del menú
    document.querySelectorAll('#navmenu a').forEach(link => {
      link.addEventListener('click', () => {
        if (document.body.classList.contains('mobile-nav-active')) closeNav();
      });
    });

    // Cerrar al hacer click en el overlay (fuera del panel)
    document.querySelector('#navmenu').addEventListener('click', (e) => {
      if (e.target === document.querySelector('#navmenu') && document.body.classList.contains('mobile-nav-active')) {
        closeNav();
      }
    });
  })();

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped) {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
    });
  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    let position = window.scrollY + 200;
    let activeHash = null;

    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;

      let sectionStart = section.offsetTop;
      let sectionEnd = section.offsetTop + section.offsetHeight;

      // Si el enlace es 'Sobre mí' (#about), incluir también la sección Curriculum (#resume)
      if (navmenulink.hash === '#about') {
        let resumeSection = document.querySelector('#resume');
        if (resumeSection) {
          sectionEnd = Math.max(sectionEnd, resumeSection.offsetTop + resumeSection.offsetHeight);
        }
      }

      if (position >= sectionStart && position <= sectionEnd) {
        activeHash = navmenulink.hash;
      }
    });

    navmenulinks.forEach(navmenulink => {
      if (navmenulink.hash && navmenulink.hash === activeHash) {
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    });
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

  /**
   * Forzar descarga directa del CV al equipo (sin abrir visor en pestaña)
   */
  const cvBtns = document.querySelectorAll('#download-cv-btn, .download-cv-btn-trigger');
  cvBtns.forEach(cvBtn => {
    cvBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const filename = this.getAttribute('download') || 'cv_agustin_gonzalez.pdf';

      function triggerBlobDownload(blob) {
        const url = window.URL.createObjectURL(blob);
        const temp = document.createElement('a');
        temp.style.display = 'none';
        temp.href = url;
        temp.setAttribute('download', filename);
        document.body.appendChild(temp);
        temp.click();
        setTimeout(() => {
          document.body.removeChild(temp);
          window.URL.revokeObjectURL(url);
        }, 1500);
      }

      // Si tenemos los datos pre-cargados en Base64, convertimos a Blob de tipo octet-stream (fuerza descarga)
      if (window.CV_BASE64) {
        try {
          const byteChars = atob(window.CV_BASE64);
          const byteNumbers = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            byteNumbers[i] = byteChars.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/octet-stream' });
          triggerBlobDownload(blob);
          return;
        } catch (err) {
          console.warn('Error decodificando Base64, intentando fetch...', err);
        }
      }

      // Vía fetch con octet-stream como fallback
      const pdfUrl = this.getAttribute('href');
      fetch(pdfUrl)
        .then(res => res.arrayBuffer())
        .then(buffer => {
          const blob = new Blob([buffer], { type: 'application/octet-stream' });
          triggerBlobDownload(blob);
        })
        .catch(() => {
          const fallback = document.createElement('a');
          fallback.href = pdfUrl;
          fallback.setAttribute('download', filename);
          fallback.click();
        });
    });
  });

})();