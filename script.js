document.addEventListener('DOMContentLoaded', () => {

    /* THEME SWITCHER LOGIC */
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.body.setAttribute('data-theme', currentTheme);
    } else {
        // Default to dark mode based on project aesthetic if not set
        document.body.setAttribute('data-theme', 'dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let theme = document.body.getAttribute('data-theme');
            let newTheme = theme === 'light' ? 'dark' : 'light';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Re-init grid color
            if (ctx) initGrid();
        });
    }

    /* INITIALIZE AOS ANIMATIONS */
    AOS.init({ once: true, offset: 50 });

    /* SPOTLIGHT EFFECT & INTERACTIVE CANVAS */
    const spotlight = document.getElementById('spotlight');
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let canvasWidth, canvasHeight;
    let mouse = { x: -1000, y: -1000 };
    const canvasDots = [];
    const spacing = 60;

    if (canvas && ctx) {
        function initGrid() {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            const dotColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(17,24,39,0.05)';
            
            canvasWidth = canvas.width = window.innerWidth;
            canvasHeight = canvas.height = window.innerHeight;
            canvasDots.length = 0;
            for (let x = 0; x <= canvasWidth; x += spacing) {
                for (let y = 0; y <= canvasHeight; y += spacing) {
                    canvasDots.push({ x, y, baseX: x, baseY: y, size: 1.5, color: dotColor });
                }
            }
        }
        initGrid();
        window.addEventListener('resize', initGrid);

        function animateCanvas() {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            
            for (let i = 0; i < canvasDots.length; i++) {
                let p = canvasDots[i];
                let dx = mouse.x - p.baseX;
                let dy = mouse.y - p.baseY;
                let dist = Math.sqrt(dx * dx + dy * dy);
                
                let maxDist = 200;
                if (dist < maxDist) {
                    const isDark = document.body.getAttribute('data-theme') === 'dark';
                    let force = (maxDist - dist) / maxDist;
                    p.x = p.baseX - (dx / dist) * force * 15;
                    p.y = p.baseY - (dy / dist) * force * 15;
                    p.size = 1.5 + force * 2.5;
                    p.color = isDark ? `rgba(255, 0, 0, ${0.1 + force * 0.7})` : `rgba(255, 0, 0, ${0.05 + force * 0.5})`;
                    
                    // Connect lines to mouse
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(255, 0, 0, ${force * (isDark ? 0.1 : 0.05)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                } else {
                    const isDark = document.body.getAttribute('data-theme') === 'dark';
                    p.x += (p.baseX - p.x) * 0.1;
                    p.y += (p.baseY - p.y) * 0.1;
                    p.size = 1.5;
                    p.color = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(17, 24, 39, 0.05)';
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }
            requestAnimationFrame(animateCanvas);
        }
        animateCanvas();
    }

    window.addEventListener('mousemove', e => {
        if (spotlight) {
            spotlight.style.setProperty('--x', `${e.clientX}px`);
            spotlight.style.setProperty('--y', `${e.clientY}px`);
        }
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    /* NAVBAR & MOBILE MENU */
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 50) {
            if (currentScrollY > lastScrollY && !mobileMenu.classList.contains('open')) {
                navbar.classList.add('hidden'); // Down
            } else {
                navbar.classList.remove('hidden'); // Up
            }
        } else {
            navbar.classList.remove('hidden'); // Top
        }
        lastScrollY = currentScrollY;

        // Scroll to top
        const btnTop = document.getElementById('scrollToTop');
        if (currentScrollY > 800) btnTop.classList.add('visible');
        else btnTop.classList.remove('visible');
    });

    menuToggle.addEventListener('click', () => mobileMenu.classList.toggle('open'));
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });

    // Scroll to top action
    document.getElementById('scrollToTop').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* 5-VIDEO CONSECUTIVE LOOP (Senior Architect Implementation) */
    const bgVideo = document.getElementById('loopVideo');
    const videoFiles = [
        'videos/1.mp4',
        'videos/2.mp4',
        'videos/3.mp4',
        'videos/4.mp4',
        'videos/5.mp4'
    ];
    let currentVideoIndex = 0;

    if (bgVideo) {
        bgVideo.addEventListener('ended', () => {
            currentVideoIndex++;
            if (currentVideoIndex >= videoFiles.length) {
                currentVideoIndex = 0; // Reset to first video
            }

            // Smooth transition effect
            bgVideo.style.opacity = 0;
            setTimeout(() => {
                bgVideo.src = videoFiles[currentVideoIndex];
                bgVideo.load();
                bgVideo.play().catch(e => console.log('Autoplay prevented', e));
                bgVideo.style.opacity = 1;
            }, 300); // 0.3s fade out before switch
        });
    }

    /* FAQ ACCORDION */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-btn');
        const panel = item.querySelector('.faq-panel');
        
        btn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all
            faqItems.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-panel').style.maxHeight = null;
            });

            // Open clicked if it wasn't active
            if (!isActive) {
                item.classList.add('active');
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    });

    /* ADVANCED STICKY SCROLL REVEAL / PARALLAX TWEAK */
    // Native CSS `position: sticky` handles the stacking. 
    // This observer fades elements out slightly as they move up past the viewport center.
    const stickyCards = document.querySelectorAll('.sticky-card');
    window.addEventListener('scroll', () => {
        if(window.innerWidth <= 900) return; // Disable effect on mobile stacking
        
        const scrollY = window.scrollY;
        const winH = window.innerHeight;
        
        stickyCards.forEach((card, i) => {
            const rect = card.getBoundingClientRect();
            // Calculate how far the card is from the center
            const distFromTop = rect.top;
            const threshold = 180 + (i * 20); // The top offset
            
            // If the card is in its sticky "locked" position at the top
            if(distFromTop <= threshold + 5) {
                // Dim previous cards slightly when new ones stack on top
                card.style.opacity = '1';
                
                // Dim cards *beneath* the currently active top card
                // Card 0 is behind Card 1, Card 1 is behind Card 2, etc.
                // We let CSS naturally cover them, but we can scale them slightly for depth
                const scale = Math.max(0.9, 1 - ((i * 0.02))); 
                card.style.transform = `scale(${scale})`;
            } else {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }
        });
    }, { passive: true });

});
