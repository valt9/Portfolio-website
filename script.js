// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Persist theme choice across pages using localStorage.
    const themeBtn = document.getElementById('themeBtn');
    const body = document.body;

    // Apply stored theme on load (if any)
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
        body.classList.add('theme-light');
    } else if (stored === 'dark') {
        body.classList.remove('theme-light');
    }

    // Toggle theme and persist choice
    if (themeBtn) {
        themeBtn.addEventListener('click', function() {
            const isLight = body.classList.toggle('theme-light');
            try {
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
            } catch (e) {
                // If localStorage is unavailable (private mode), silently ignore
                // eslint-disable-next-line no-console
                console.warn('Could not persist theme preference:', e);
            }
        });
    }

    // Small glow/pulse effect when buttons or primary links are clicked.
    // Applies to <button> and elements with the .button-link class.
    document.addEventListener('click', function (ev) {
        const el = ev.target.closest('button, .button-link');
        if (!el) return;
        // play a short click sound (synthesized) on interaction
        try {
            playClickSound();
        } catch (e) {
            // ignore audio errors silently
        }
        // restart the animation by removing then re-adding the class
        el.classList.remove('click-glow');
        // force reflow so the animation can restart
        // eslint-disable-next-line no-unused-expressions
        void el.offsetWidth;
        el.classList.add('click-glow');
        // cleanup after animation completes (safe timeout slightly longer than animation)
        setTimeout(() => el.classList.remove('click-glow'), 3200);
    });

    // --- small synthesized click sound using WebAudio ---
    let _audioCtx = null;
    function getAudioCtx() {
        if (!_audioCtx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            _audioCtx = new Ctx();
        }
        return _audioCtx;
    }

    function playClickSound() {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        // short sine + high-pass noise blended for a clicky sound
        // oscillator component
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        oscGain.gain.setValueAtTime(0.0001, now);
        oscGain.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(oscGain);

        // optional noise transient for attack
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.0001, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.08, now + 0.005);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);

        // mix and output
        const outGain = ctx.createGain();
        outGain.gain.value = 0.9; // global volume
        oscGain.connect(outGain);
        noiseGain.connect(outGain);
        outGain.connect(ctx.destination);

        // start/stop
        osc.start(now);
        noise.start(now);
        osc.stop(now + 0.12);
        noise.stop(now + 0.12);
        // disconnect after a short delay
        setTimeout(() => {
            try { osc.disconnect(); } catch (e) {}
            try { noise.disconnect(); } catch (e) {}
            try { oscGain.disconnect(); } catch (e) {}
            try { noiseGain.disconnect(); } catch (e) {}
            try { outGain.disconnect(); } catch (e) {}
        }, 300);
    }
});
