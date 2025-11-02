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
});
