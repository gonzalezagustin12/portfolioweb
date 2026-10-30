// AccordionGallery Vanilla JS Implementation using GSAP
(function () {
  function initAccordionGallery(container, options = {}) {
    if (!container || typeof gsap === 'undefined') return;

    const items = options.items || [];
    const count = items.length;
    if (!count) return;

    let active = Math.min(Math.max(options.defaultIndex !== undefined ? options.defaultIndex : 0, 0), count - 1);
    const accentColor = options.accentColor || '#FE2E2E';
    const overlayColor = options.overlayColor || '#111111';
    const textColor = options.textColor || '#ffffff';
    const height = options.height || 620;
    const gap = options.gap !== undefined ? options.gap : 16;
    const radius = options.radius !== undefined ? options.radius : 20;
    const expandRatio = options.expandRatio !== undefined ? options.expandRatio : 0.58;
    const duration = options.duration !== undefined ? options.duration : 0.65;
    const ease = options.ease || 'power3.out';
    const parallax = options.parallax !== undefined ? options.parallax : 0.5;
    const tilt = options.tilt !== undefined ? options.tilt : 8;
    const stagger = options.stagger !== undefined ? options.stagger : 0.06;
    const trigger = options.trigger || 'hover';
    const showLabels = options.showLabels !== undefined ? options.showLabels : true;
    const grayscale = options.grayscale !== undefined ? options.grayscale : true;
    const vertical = options.orientation === 'vertical';

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    container.classList.add('accordion-gallery');
    if (vertical) container.classList.add('accordion-gallery--vertical');
    container.style.setProperty('--ag-accent', accentColor);
    container.style.setProperty('--ag-overlay', overlayColor);
    container.style.setProperty('--ag-text', textColor);
    container.style.setProperty('--ag-gap', `${gap}px`);
    container.style.setProperty('--ag-radius', `${radius}px`);
    container.style.height = `${height}px`;
    container.setAttribute('role', 'list');

    let panelsHTML = '';
    items.forEach((item, i) => {
      const isActive = i === active;
      panelsHTML += `
        <div
          class="ag-panel${isActive ? ' ag-panel--active' : ''}"
          style="border-radius: ${radius}px;"
          data-index="${i}"
          role="listitem"
          tabindex="0"
          aria-current="${isActive ? 'true' : 'false'}"
          aria-label="${item.label || ''}"
        >
          <span class="ag-panel__frame">
            <span class="ag-panel__media">
              <img class="ag-media-img" src="${item.image}" alt="${item.alt || item.label || ''}" draggable="false" />
              ${item.video ? `<video class="ag-media-video" src="${item.video}" muted loop playsinline preload="none"></video>` : ''}
            </span>
            <span class="ag-panel__overlay" aria-hidden="true"></span>
          </span>
          ${
            showLabels
              ? `
            <span class="ag-panel__label" aria-hidden="true">
              <span class="ag-panel__bar"></span>
              <span class="ag-panel__info">
                <span class="ag-panel__text">${item.label || ''}</span>
                ${item.sublabel ? `<span class="ag-panel__subtext">${item.sublabel}</span>` : ''}
              </span>
            </span>
          `
              : ''
          }
        </div>
      `;
    });

    container.innerHTML = panelsHTML;

    const panels = Array.from(container.querySelectorAll('.ag-panel'));
    const mediaEls = panels.map(p => p.querySelector('.ag-panel__media'));
    const barEls = panels.map(p => p.querySelector('.ag-panel__bar'));
    const textEls = panels.map(p => p.querySelector('.ag-panel__info'));

    let currentTimeline = null;
    let mediaSize = 500;

    const isMobile = () => window.innerWidth <= 768;
    const isVertical = () => vertical || isMobile();

    const applyLayout = animate => {
      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;

      currentTimeline?.kill();
      const dur = animate && !prefersReduced ? duration : 0;
      const tl = gsap.timeline();
      const vert = isVertical();

      panels.forEach((panel, i) => {
        const isActive = i === active;
        const media = mediaEls[i];
        const bar = barEls[i];
        const text = textEls[i];

        const rot = vert ? 0 : (isActive ? 0 : i < active ? tilt : -tilt);
        const rotProp = vert ? { rotateX: 0, rotateY: 0 } : { rotateY: rot };

        tl.to(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease }, 0);

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i));
          const shift = drift * parallax * mediaSize * 0.06;
          const gray = grayscale ? (isActive ? 0 : 1) : 0;
          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: vert ? 0 : isActive ? 0 : shift,
              y: vert ? (isActive ? 0 : shift) : 0,
              '--ag-gray': gray,
              '--ag-dim': isActive ? 0 : 0.38,
              duration: dur,
              ease
            },
            0
          );
        }

        if (showLabels && bar && text) {
          if (isActive) {
            tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger }, 0);
          } else {
            tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
          }
        }
      });

      currentTimeline = tl;
    };

    const measure = () => {
      const rect = container.getBoundingClientRect();
      const vert = isVertical();
      const total = vert ? rect.height : rect.width;
      const usable = Math.max(total - gap * (count - 1), 120);
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.25);
      mediaSize = size;
      container.style.setProperty('--ag-media-size', `${size}px`);
      applyLayout(false);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);

    const setActiveIndex = (index, animate = true) => {
      if (active === index) return;
      active = index;
      panels.forEach((p, i) => {
        p.classList.toggle('ag-panel--active', i === active);
        p.setAttribute('aria-current', i === active ? 'true' : 'false');

        const img = p.querySelector('.ag-media-img');
        const vid = p.querySelector('.ag-media-video');

        if (i === active) {
          // Expand: crossfade to video
          if (vid) {
            vid.currentTime = 0;
            vid.play().catch(() => {});
            gsap.to(vid, { opacity: 1, duration: 0.35, ease: 'power2.out' });
            if (img) gsap.to(img, { opacity: 0, duration: 0.35, ease: 'power2.out' });
          }
        } else {
          // Collapse: revert to image
          if (vid) {
            gsap.to(vid, {
              opacity: 0,
              duration: 0.25,
              ease: 'power2.in',
              onComplete: () => {
                vid.pause();
                vid.currentTime = 0;
              }
            });
          }
          if (img) gsap.to(img, { opacity: 1, duration: 0.25, ease: 'power2.in' });
        }
      });
      applyLayout(animate);
    };

    let isNavigating = false;

    const navigateToDetail = (item, panel) => {
      if (isNavigating) return;
      isNavigating = true;

      panel.classList.add('ag-panel--navigating');
      // Target the visible element: video if it's showing, otherwise the img
      const _vid = panel.querySelector('.ag-media-video');
      const _img = panel.querySelector('.ag-media-img');
      const mediaImg = (_vid && parseFloat(getComputedStyle(_vid).opacity) > 0.5) ? _vid : (_img || _vid);

      // Animación cinematográfica de zoom in antes de redirigir
      gsap.to(mediaImg, {
        scale: 1.15,
        duration: 0.45,
        ease: 'power2.out'
      });

      gsap.to(panel, {
        scale: 0.98,
        duration: 0.25,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut'
      });

      setTimeout(() => {
        const targetUrl = item.link || 'portfolio-details.html';
        window.location.href = targetUrl;
      }, 400);
    };

    let expandedInMobile = null;

    panels.forEach((panel, i) => {
      if (trigger === 'hover') {
        panel.addEventListener('mouseenter', () => setActiveIndex(i, true));
      }

      panel.addEventListener('click', e => {
        e.preventDefault();
        const item = items[i];

        if (isMobile()) {
          // En móvil: si este panel no fue expandido previamente por un clic, primero lo expande y reproduce su video
          if (expandedInMobile !== i || active !== i) {
            expandedInMobile = i;
            setActiveIndex(i, true);
          } else {
            // Si ya fue expandido y el usuario vuelve a hacer clic sobre él, navega al proyecto
            navigateToDetail(item, panel);
          }
        } else {
          // En escritorio (desktop)
          if (active !== i) {
            setActiveIndex(i, true);
          } else {
            navigateToDetail(item, panel);
          }
        }
      });

      panel.addEventListener('focus', () => setActiveIndex(i, true));
      panel.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (active !== i) {
            setActiveIndex(i, true);
          } else {
            navigateToDetail(items[i], panel);
          }
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIndex((i + 1) % count, true);
          panels[(i + 1) % count]?.focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIndex((i - 1 + count) % count, true);
          panels[(i - 1 + count) % count]?.focus();
        }
      });
    });

    // Play video on initial active panel
    const initPanel = panels[active];
    if (initPanel) {
      const initVid = initPanel.querySelector('.ag-media-video');
      const initImg = initPanel.querySelector('.ag-media-img');
      if (initVid) {
        initVid.play().catch(() => {});
        initVid.style.opacity = '1';
        if (initImg) initImg.style.opacity = '0';
      }
    }

    applyLayout(false);
  }

  window.initAccordionGallery = initAccordionGallery;

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('portfolio-accordion-gallery');
    if (container) {
      const items = [
        {
          image: 'assets/img/portfolio/proyecto1/13.webp',
          video: 'assets/img/portfolio/proyecto1/video1.mp4',
          label: 'Proyecto 01',
          sublabel: 'RD Construcciones',
          link: 'rdconstrucciones.html',
          alt: 'RD Construcciones'
        },
        {
          image: 'assets/img/portfolio/proyecto2/3.webp',
          video: 'assets/img/portfolio/proyecto2/video2.mp4',
          label: 'Proyecto 02',
          sublabel: 'Las Piedras Shopping',
          link: 'laspiedrasshoping.html',
          alt: 'Las Piedras Shopping'
        },
        {
          image: 'assets/img/portfolio/proyecto3/8.webp',
          video: 'assets/img/portfolio/proyecto3/video3.mp4',
          label: 'Proyecto 03',
          sublabel: 'Neville Brody',
          link: 'nevillebrody.html',
          alt: 'Neville Brody'
        },
        {
          image: 'assets/img/portfolio/proyecto4/3.webp',
          video: 'assets/img/portfolio/proyecto4/video4.mp4',
          label: 'Proyecto 04',
          sublabel: 'Urban Style Magazine',
          link: 'urbanstylemagazine.html',
          alt: 'Urban Style Magazine'
        },
        {
          image: 'assets/img/portfolio/proyecto5/4.webp',
          video: 'assets/img/portfolio/proyecto5/video5.mp4',
          label: 'Proyecto 05',
          sublabel: 'Hagitoru',
          link: 'hagitoru.html',
          alt: 'Hagitoru'
        }
      ];

      initAccordionGallery(container, {
        items,
        defaultIndex: 0,
        expandRatio: 0.58, // Ocupa la mayor parte de la pantalla
        height: 600, // Altura imponente y cinematográfica
        gap: 16,
        radius: 20,
        accentColor: '#FE2E2E',
        overlayColor: '#111111',
        trigger: 'hover',
        grayscale: false,
        tilt: 8,
        parallax: 0.5
      });
    }
  });
})();
