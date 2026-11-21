const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function applyTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeIcon.src = isLight ? './img/icons/sun.svg' : './img/icons/moon.svg';
}

themeToggle.addEventListener('click', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!document.startViewTransition || reduceMotion) {
        applyTheme();
        return;
    }

    const rect = themeToggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y)
    );

    const transition = document.startViewTransition(applyTheme);

    transition.ready.then(() => {
        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${endRadius}px at ${x}px ${y}px)`
                ]
            },
            {
                duration: 700,
                easing: 'ease-in-out',
                pseudoElement: '::view-transition-new(root)'
            }
        );
    });
});

(() => {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const total = track.children.length;
    const swatches = [...document.querySelectorAll('.swatch')];
    const colorName = document.getElementById('colorName');
    let index = 0;

    const goTo = (n) => {
        index = (n + total) % total;
        track.style.transform = `translateX(-${index * 100}%)`;
        swatches.forEach((s, i) => s.setAttribute('aria-pressed', i === index));
        colorName.textContent = swatches[index].dataset.name;
    };

    document.getElementById('carouselPrev').addEventListener('click', () => goTo(index - 1));
    document.getElementById('carouselNext').addEventListener('click', () => goTo(index + 1));
    swatches.forEach((s, i) => s.addEventListener('click', () => goTo(i)));

    let startX = null;
    carousel.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', (e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
        startX = null;
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goTo(index - 1);
        if (e.key === 'ArrowRight') goTo(index + 1);
    });

    goTo(0);
})();

(() => {
    const gallery = document.querySelector('.model-gallery');
    if (!gallery) return;

    const figures = [...gallery.querySelectorAll('figure')];
    const big = figures[0];
    let busy = false;

    const swap = (small) => {
        if (busy) return;
        busy = true;
        gallery.classList.add('is-swapping');

        setTimeout(() => {
            const a = big.querySelector('img');
            const b = small.querySelector('img');
            [a.src, b.src] = [b.src, a.src];
            [a.alt, b.alt] = [b.alt, a.alt];
            gallery.classList.remove('is-swapping');
            setTimeout(() => { busy = false; }, 300);
        }, 300);
    };

    figures.slice(1).forEach((fig) => {
        fig.tabIndex = 0;
        fig.setAttribute('role', 'button');
        fig.addEventListener('click', () => swap(fig));
        fig.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                swap(fig);
            }
        });
    });
})();