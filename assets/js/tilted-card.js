// TiltedCard Vanilla JS Implementation (adapted from React Bits)
(function () {
  function initTiltedCard(el, options = {}) {
    if (!el) return;

    const body = el.querySelector('.tilted-card__body');
    const shadow = el.querySelector('.tilted-card__shadow');
    if (!body) return;

    const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
    const smoother = t => {
      const x = clamp(t, 0, 1);
      return x * x * x * (x * (x * 6 - 15) + 10);
    };

    const step = (state, key, target, omega, zeta, dt) => {
      const velocity = `v${key}`;
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        state[velocity] += (omega * omega * (target - state[key]) - 2 * zeta * omega * state[velocity]) * h;
        state[key] += state[velocity] * h;
      }
      const settled = Math.abs(target - state[key]) < 0.001 && Math.abs(state[velocity]) < 0.01;
      if (settled) {
        state[key] = target;
        state[velocity] = 0;
      }
      return !settled;
    };

    const amplitude = options.rotateAmplitude !== undefined ? options.rotateAmplitude : 18;
    const scaleOnHover = options.scaleOnHover !== undefined ? options.scaleOnHover : 1.06;
    const smoothness = options.smoothness !== undefined ? options.smoothness : 0.6;
    const glareStrength = options.glare !== undefined ? options.glare : 0.8;
    const shadowStrength = options.shadow !== undefined ? options.shadow : 0.45;
    const parallax = options.parallax !== undefined ? options.parallax : 1;

    const state = {
      rx: 0, vrx: 0,
      ry: 0, vry: 0,
      lift: 0, vlift: 0,
      ty: 0, vty: 0
    };

    const pointer = { nx: 0, ny: 0, x: 0, y: 0, inside: false, mouse: false, vx: 0, last: 0 };
    let raf = 0;
    let last = 0;
    let time = 0;

    const frame = now => {
      raf = 0;
      const dt = clamp((now - last) / 1000 || 0, 0, 0.05);
      last = Math.max(last, now);
      time += dt;

      const hovering = pointer.inside;
      let inputX = hovering ? pointer.nx : 0;
      let inputY = hovering ? pointer.ny : 0;

      const omega = 20 * Math.pow(0.2, smoothness);
      const zeta = 1 - 0.3 * smoothness;
      const lifted = hovering ? 1 : 0;

      let busy = false;
      busy = step(state, 'rx', -inputY * amplitude, omega, zeta, dt) || busy;
      busy = step(state, 'ry', inputX * amplitude, omega, zeta, dt) || busy;
      busy = step(state, 'lift', lifted, omega, Math.max(zeta, 0.85), dt) || busy;

      const scale = 1 + (scaleOnHover - 1) * state.lift;
      const rx = state.rx;
      const ry = state.ry;
      const radiansX = (rx * Math.PI) / 180;
      const radiansY = (ry * Math.PI) / 180;

      body.style.transform = `translate3d(0, 0, 0) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) scale(${scale.toFixed(4)})`;
      body.style.setProperty('--tc-px', (Math.sin(radiansY) * parallax).toFixed(4));
      body.style.setProperty('--tc-py', (-Math.sin(radiansX) * parallax).toFixed(4));

      const reach = Math.max(amplitude, 1);
      body.style.setProperty('--tc-gx', `${(50 + (ry / reach) * 46).toFixed(2)}%`);
      body.style.setProperty('--tc-gy', `${(50 - (rx / reach) * 46).toFixed(2)}%`);

      const energy = Math.min(1, Math.hypot(rx, ry) / reach);
      body.style.setProperty('--tc-glare', (glareStrength * Math.max(state.lift, energy)).toFixed(3));

      if (shadow) {
        const offsetX = -Math.sin(radiansY) * 20;
        const offsetY = 10 + 14 * state.lift + Math.sin(radiansX) * 16;
        const spread = scale * (0.9 + 0.05 * state.lift);
        shadow.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0) scale(${spread.toFixed(4)})`;
        shadow.style.opacity = (shadowStrength * (0.4 + 0.6 * state.lift)).toFixed(3);
      }

      if (busy || hovering || state.lift > 0.005) {
        raf = requestAnimationFrame(frame);
      }
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const track = event => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      pointer.nx = clamp((x - rect.width / 2) / (rect.width / 2), -1, 1);
      pointer.ny = clamp((y - rect.height / 2) / (rect.height / 2), -1, 1);
    };

    el.addEventListener('pointerenter', e => {
      pointer.inside = true;
      track(e);
      wake();
    });

    el.addEventListener('pointermove', e => {
      pointer.inside = true;
      track(e);
      wake();
    });

    el.addEventListener('pointerleave', () => {
      pointer.inside = false;
      wake();
    });

    wake();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.tilted-card');
    if (card) {
      initTiltedCard(card, {
        rotateAmplitude: 20,
        scaleOnHover: 1.06,
        glare: 0.85,
        shadow: 0.5,
        smoothness: 0.65,
        parallax: 1.2
      });
    }
  });
})();
