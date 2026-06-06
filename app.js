document.addEventListener("DOMContentLoaded", () => {
    /* ─── UTILITIES ─────────────────────────────────────────── */
    // Split text into spans for staggered animations
    const splitText = (selector, type = "chars") => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            const text = el.innerText;
            el.innerHTML = '';
            
            if (type === "chars") {
                const chars = text.split('');
                chars.forEach(char => {
                    const span = document.createElement('span');
                    span.innerHTML = char === ' ' ? '&nbsp;' : char;
                    el.appendChild(span);
                });
            } else if (type === "words") {
                const words = text.split(' ');
                words.forEach((word, index) => {
                    const span = document.createElement('span');
                    span.innerHTML = word + (index < words.length - 1 ? '&nbsp;' : '');
                    el.appendChild(span);
                });
            }
        });
    };

    /* ─── SCROLL SETUP (LENIS) ──────────────────────────────── */
    const lenis = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    /* ─── CUSTOM CURSOR ─────────────────────────────────────── */
    const cursor = document.querySelector('.cursor');
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    
    // Disable custom cursor on touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const updateCursor = () => {
            const dx = mouseX - cursorX;
            const dy = mouseY - cursorY;
            
            cursorX += dx * 0.1; // Lerp factor
            cursorY += dy * 0.1;
            
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
            requestAnimationFrame(updateCursor);
        };
        requestAnimationFrame(updateCursor);

        // Hover Effects
        const hoverLinks = document.querySelectorAll('[data-cursor="hover"]');
        hoverLinks.forEach(link => {
            link.addEventListener('mouseenter', () => cursor.classList.add('hover-link'));
            link.addEventListener('mouseleave', () => cursor.classList.remove('hover-link'));
        });

        const projectCards = document.querySelectorAll('[data-cursor="project"]');
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => cursor.classList.add('hover-project'));
            card.addEventListener('mouseleave', () => cursor.classList.remove('hover-project'));
        });
    }

    /* ─── SCROLL PROGRESS BAR ───────────────────────────────── */
    const progressLine = document.createElement('div');
    progressLine.classList.add('scroll-progress');
    document.body.appendChild(progressLine);
    
    gsap.to(progressLine, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: true
        }
    });

    /* ─── INITIAL PAGE WIPE / HERO ANIMATION ────────────────── */
    // Split text for initial animations
    splitText('#hero-title', 'words');
    splitText('.footer-logotype', 'chars');
    splitText('.approach .section-title', 'chars');

    const curtain = document.querySelector('.curtain');
    const loaderBar = document.querySelector('.loader-bar');

    const initTimeline = gsap.timeline();

    // Loader bar fills up
    initTimeline.to(loaderBar, {
        width: '100%',
        duration: 0.8,
        ease: 'power2.inOut'
    })
    // Wipe lifts up
    .to(curtain, {
        yPercent: -100,
        duration: 0.6,
        ease: 'power4.inOut',
        delay: 0.2
    })
    // Hero words drop in
    .from('#hero-title span', {
        y: 100,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power4.out'
    }, "-=0.3")
    .from('.hero-subtitle', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
    }, "-=0.6")
    .from('.cta-btn', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
    }, "-=0.4");

    /* ─── APPROACH ANIMATIONS ───────────────────────────────── */
    const approachTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.approach',
            start: "top 80%",
        }
    });

    approachTl.to('.approach-divider', {
        scaleX: 1,
        duration: 0.8,
        ease: "power2.out"
    })
    .from('.approach .section-title span', {
        y: 20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.5,
        ease: "power2.out"
    }, "-=0.4")
    .to('.step-card', {
        y: 0,
        opacity: 1,
        stagger: 0.18,
        duration: 0.6,
        ease: "power2.out"
    }, "-=0.2");

    // Parallax on step numbers
    gsap.utils.toArray('.step-num').forEach(num => {
        gsap.to(num, {
            yPercent: 30,
            ease: "none",
            scrollTrigger: {
                trigger: num.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });
    });

    /* ─── PROJECTS ANIMATIONS ───────────────────────────────── */
    // Pin section title while scrolling horizontally on mobile? 
    // The prompt says "Cards enter via gsap.from({x: 60, opacity:0, stagger: 0.2s}) on ScrollTrigger"
    // Also says: "ScrollTrigger pin: While scrolling through projects, section title 'Selected Work' stays pinned/sticky on left while cards scroll right (horizontal feel in vertical scroll — GSAP pin: true)"
    
    // For desktop only (above 1024px)
    let mm = gsap.matchMedia();

    mm.add("(min-width: 1025px)", () => {
        // Pinned horizontal feel
        gsap.to('.projects-scroll', {
            x: () => -(document.querySelector('.projects-scroll').scrollWidth - window.innerWidth + document.querySelector('.projects-title-wrapper').offsetWidth),
            ease: "none",
            scrollTrigger: {
                trigger: '.projects',
                start: "top top",
                end: () => "+=" + document.querySelector('.projects-scroll').scrollWidth,
                scrub: true,
                pin: true,
                anticipatePin: 1
            }
        });
    });

    // Card entrance animation
    gsap.from('.project-card', {
        x: 60,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
            trigger: '.projects',
            start: "top 80%",
        }
    });

    /* ─── TEAM ANIMATIONS ───────────────────────────────────── */
    const teamTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.team',
            start: "top 80%",
        }
    });

    teamTl.from('.left-card', {
        x: -80,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
    })
    .from('.right-card', {
        x: 80,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
    }, "<")
    .to('.team-connection', {
        scaleX: 1,
        duration: 0.6,
        ease: "power2.out"
    }, "-=0.2")
    .to('.role-tag', {
        opacity: 1,
        duration: 0.4
    }, "+=0.2");

    // JS Mousemove Parallax Tilt
    if (!isTouchDevice) {
        document.querySelectorAll('[data-tilt]').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;
                
                gsap.to(card, {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    duration: 0.5,
                    ease: "power1.out",
                    transformPerspective: 800
                });
            });
            
            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.5,
                    ease: "power1.out"
                });
            });
        });
    }

    /* ─── ABOUT / PHILOSOPHY ANIMATIONS ─────────────────────── */
    // Scroll-linked text reveal
    splitText('.scroll-reveal-text', 'words');
    
    gsap.fromTo('.scroll-reveal-text span', 
        { opacity: 0.15, color: '#5a5750' },
        { 
            opacity: 1, 
            color: '#e8e4dc',
            stagger: 0.1,
            ease: "none",
            scrollTrigger: {
                trigger: '.about',
                start: "top 60%",
                end: "bottom 80%",
                scrub: true
            }
        }
    );

    // V letterform drift
    gsap.to('.bg-letter-v', {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
            trigger: '.about',
            start: "top bottom",
            end: "bottom top",
            scrub: 2
        }
    });

    /* ─── STATS ANIMATIONS ──────────────────────────────────── */
    const statsTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.stats',
            start: "top 80%",
        }
    });

    statsTl.to('.stat-divider', {
        opacity: 1,
        duration: 0.5,
        stagger: 0.2
    });

    // Number counters
    const counters = document.querySelectorAll('.stat-num');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        
        ScrollTrigger.create({
            trigger: '.stats',
            start: "top 80%",
            onEnter: () => {
                let obj = { val: 0 };
                gsap.to(obj, {
                    val: target,
                    duration: 2,
                    ease: "power2.out",
                    onUpdate: () => {
                        counter.innerText = Math.floor(obj.val);
                    }
                });
            },
            once: true
        });
    });

    /* ─── FOOTER ANIMATIONS ─────────────────────────────────── */
    const footerTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.footer',
            start: "top 80%",
        }
    });

    footerTl.from('.footer-logotype span', {
        y: 100,
        opacity: 0,
        stagger: 0.06,
        duration: 0.8,
        ease: "power3.out"
    })
    .to('.footer-logotype-underline', {
        scaleX: 1,
        duration: 0.6,
        ease: "power2.out"
    }, "-=0.2");
});
