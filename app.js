/* ==========================================================================
   TYPEWRITER ANIMATION
   ========================================================================== */
class Typewriter {
    constructor(element, words, wait = 2500) {
        this.element = element;
        this.words = words;
        this.txt = '';
        this.wordIndex = 0;
        this.wait = parseInt(wait, 10);
        this.isDeleting = false;
        this.type();
    }

    type() {
        // Current index of word
        const current = this.wordIndex % this.words.length;
        // Get full text of current word
        const fullTxt = this.words[current];

        // Check if deleting
        if (this.isDeleting) {
            // Remove char
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            // Add char
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        // Insert text into element
        this.element.innerHTML = this.txt;

        // Initial Type Speed
        let typeSpeed = 80;

        if (this.isDeleting) {
            typeSpeed /= 2; // Delete faster
        }

        // If word is complete
        if (!this.isDeleting && this.txt === fullTxt) {
            // Make pause at end
            typeSpeed = this.wait;
            // Set delete to true
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            // Move to next word
            this.wordIndex++;
            // Pause before typing next word
            typeSpeed = 400;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// Init Typewriter on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    const typewriterElement = document.getElementById('typewriter');
    if (typewriterElement) {
        const words = ["Flutter Developer", "SaaS Solutions Architect", "Cross-Platform Engineer", "Mobile App Specialist"];
        new Typewriter(typewriterElement, words, 2000);
    }

    // Initialize Theme
    initTheme();
});

/* ==========================================================================
   THEME SWITCHER
   ========================================================================== */
function initTheme() {
    const themeBtns = document.querySelectorAll('.theme-btn');
    const savedTheme = localStorage.getItem('portfolio-theme') || 'teal';

    setTheme(savedTheme);

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            setTheme(theme);
        });
    });
}

function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('portfolio-theme', themeName);

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === themeName) {
            btn.classList.add('active');
        }
    });
}

/* ==========================================================================
   MOBILE MENU TOGGLE
   ========================================================================== */
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navWrapper = document.querySelector('.nav-wrapper');
const navLinks = document.querySelectorAll('.nav-link');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navWrapper.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navWrapper.classList.remove('active');
        });
    });
}

/* ==========================================================================
   AVATAR GUIDE SYSTEM LOGIC
   ========================================================================== */
const guideSystem = document.getElementById('guide-system');
const speechContent = document.getElementById('speech-content');
const speechSpeaker = document.getElementById('speech-speaker');
const nextGuideBtn = document.getElementById('next-guide');
const skipGuideBtn = document.getElementById('skip-guide');
const eyeLeft = document.getElementById('eye-left-pupil');
const eyeRight = document.getElementById('eye-right-pupil');
const dashEyeLeft = document.getElementById('dash-eye-left');
const dashEyeRight = document.getElementById('dash-eye-right');
const aeroAvatar = document.getElementById('aero-avatar');
const dashAvatar = document.getElementById('dash-avatar');

// Guide States Configuration (Alternating Speakers)
const guideData = {
    'hero': {
        speaker: 'Aero',
        text: "Hi there! 👋 I'm Aero, Hx313's digital guide. Let's start with his mobile applications!",
        nextBtn: "Explore Projects &rarr;",
        nextSectionId: "projects",
        className: "hero-state"
    },
    'projects': {
        speaker: 'Dash',
        text: "Flutter is awesome! 💙 Hx313 builds premium cross-platform apps using Flutter! Check out the download links!",
        nextBtn: "View SaaS Products &rarr;",
        nextSectionId: "saas",
        className: "projects-state"
    },
    'saas': {
        speaker: 'Aero',
        text: "He also engineers complete SaaS platforms! 🌐 <strong>onlineorder.pk</strong> integrates customer web ordering, admin ePOS, and terminal dispatch apps.",
        nextBtn: "Let's Connect &rarr;",
        nextSectionId: "contact",
        className: "saas-state"
    },
    'contact': {
        speaker: 'Dash',
        text: "Need a high-performance Flutter app or SaaS solution? 🤝 Hx313 is ready. Let's talk!",
        nextBtn: "Back to Top &uarr;",
        nextSectionId: "hero",
        className: "contact-state"
    }
};

let currentGuideState = 'hero';
let isMinimized = false;

// 1. Mouse Move Eye Tracking
window.addEventListener('mousemove', (e) => {
    if (!guideSystem || !eyeLeft || !eyeRight || isMinimized) return;

    const rect = guideSystem.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

    // Limits the movement of pupils in the socket
    const maxDist = window.innerWidth <= 768 ? 2 : 4; // Smaller translation on mobile screen
    const moveX = Math.cos(angle) * maxDist;
    const moveY = Math.sin(angle) * maxDist;

    if (eyeLeft) eyeLeft.style.transform = `translate(${moveX}px, ${moveY}px)`;
    if (eyeRight) eyeRight.style.transform = `translate(${moveX}px, ${moveY}px)`;

    // Dash eye tracking
    if (dashEyeLeft) dashEyeLeft.style.transform = `translate(${moveX * 0.8}px, ${moveY * 0.8}px)`;
    if (dashEyeRight) dashEyeRight.style.transform = `translate(${moveX * 0.8}px, ${moveY * 0.8}px)`;
});

// 2. Eye Blink Effect
function triggerBlink() {
    if (eyeLeft && eyeRight) {
        eyeLeft.style.transform = 'scaleY(0.1)';
        eyeRight.style.transform = 'scaleY(0.1)';
        setTimeout(() => {
            eyeLeft.style.transform = 'scaleY(1)';
            eyeRight.style.transform = 'scaleY(1)';
        }, 150);
    }

    if (dashEyeLeft && dashEyeRight) {
        setTimeout(() => { // slight delay for dash to look natural
            dashEyeLeft.style.transform = 'scaleY(0.1)';
            dashEyeRight.style.transform = 'scaleY(0.1)';
            setTimeout(() => {
                dashEyeLeft.style.transform = 'scaleY(1)';
                dashEyeRight.style.transform = 'scaleY(1)';
            }, 150);
        }, 200);
    }
}

// Blink randomly every 3 to 7 seconds
setInterval(() => {
    if (!isMinimized) triggerBlink();
}, Math.random() * 4000 + 3000);

// 3. Update Guide Text & Position
function updateGuideState(stateKey) {
    if (!guideData[stateKey] || currentGuideState === stateKey || isMinimized) return;

    currentGuideState = stateKey;
    const data = guideData[stateKey];

    // Remove all state classes first
    guideSystem.classList.remove('hero-state', 'projects-state', 'saas-state', 'contact-state');
    // Add active state class
    guideSystem.classList.add(data.className);

    // Fade out text, change content, and fade in
    speechContent.style.opacity = 0;
    if (speechSpeaker) speechSpeaker.style.opacity = 0;

    setTimeout(() => {
        if (speechSpeaker) {
            speechSpeaker.innerHTML = data.speaker;
            speechSpeaker.style.color = data.speaker === 'Dash' ? '#0ea5e9' : 'var(--color-primary)';
            speechSpeaker.style.opacity = 1;
        }
        speechContent.innerHTML = data.text;
        nextGuideBtn.innerHTML = data.nextBtn;
        speechContent.style.opacity = 1;

        // Bounce the speaking avatar
        if (data.speaker === 'Dash' && dashAvatar) {
            dashAvatar.style.transform = 'scale(1.1) translateY(-10px)';
            aeroAvatar.style.transform = 'scale(0.9)';
            setTimeout(() => { dashAvatar.style.transform = ''; aeroAvatar.style.transform = ''; }, 300);
        } else if (aeroAvatar) {
            aeroAvatar.style.transform = 'scale(1.1) translateY(-10px)';
            if (dashAvatar) dashAvatar.style.transform = 'scale(0.9)';
            setTimeout(() => { aeroAvatar.style.transform = ''; if (dashAvatar) dashAvatar.style.transform = ''; }, 300);
        }

    }, 250);

    // Trigger blink on position transition
    triggerBlink();
}

// 4. Scroll Interactivity (Intersection Observer)
const sections = document.querySelectorAll('.section-block');
const scrollNavLinks = document.querySelectorAll('.nav-link');

const observerOptions = {
    root: null,
    rootMargin: '-40% 0px -40% 0px', // Trigger when section crosses the middle of screen
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !isMinimized) {
            const sectionId = entry.target.id;
            updateGuideState(sectionId);

            // Update Navigation Menu Active Class
            scrollNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => observer.observe(section));

// 5. Button Navigation Clicks
if (nextGuideBtn) {
    nextGuideBtn.addEventListener('click', () => {
        const data = guideData[currentGuideState];
        const targetSection = document.getElementById(data.nextSectionId);

        if (targetSection) {
            // Scroll to the next section
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// 6. Minimize & Restore Logic
if (skipGuideBtn) {
    skipGuideBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        minimizeGuide();
    });
}

function minimizeGuide() {
    isMinimized = true;
    guideSystem.classList.add('guide-minimized');
    const bubble = guideSystem.querySelector('.speech-bubble');
    if (bubble) bubble.style.display = 'none';
    if (aeroAvatar) aeroAvatar.style.cursor = 'pointer';
    if (dashAvatar) dashAvatar.style.cursor = 'pointer';
}

function restoreGuide() {
    isMinimized = false;
    guideSystem.classList.remove('guide-minimized');
    const bubble = guideSystem.querySelector('.speech-bubble');
    if (bubble) bubble.style.display = 'flex';
    if (aeroAvatar) aeroAvatar.style.cursor = 'pointer';
    if (dashAvatar) dashAvatar.style.cursor = 'pointer';
    const stateKey = currentGuideState;
    currentGuideState = '';
    updateGuideState(stateKey);
}

/* ==========================================================================
   MASCOT MISCHIEF / PLAY SYSTEM
   ========================================================================== */
let isMischiefPlaying = false;

// Playful interactions pool
const aeroMischief = [
    { aeroAnim: 'poke-right',  dashAnim: 'wobble',       speaker: 'Aero', text: "*pokes Dash* Hey birdie, stop napping! We have a visitor! 👉🐦" },
    { aeroAnim: 'spin',        dashAnim: 'jump-back',     speaker: 'Aero', text: "Watch this spin move! 🌀 ...okay I'm dizzy now." },
    { aeroAnim: 'wave',        dashAnim: 'flap',          speaker: 'Dash', text: "Show off! I can fly AND code. Can you? 😏💙" },
    { aeroAnim: 'bounce',      dashAnim: 'side-eye',      speaker: 'Aero', text: "I once compiled 10,000 widgets in 2 seconds. Just sayin'. 🤖⚡" },
    { aeroAnim: 'headbutt',    dashAnim: 'tumble',        speaker: 'Dash', text: "OW! That's my wing! Hx313, tell your robot to chill! 😤" },
    { aeroAnim: 'dance',       dashAnim: 'flap',          speaker: 'Aero', text: "🎵 Hot reload, hot reload, watch my code just overload! 🎵" },
];

const dashMischief = [
    { dashAnim: 'poke-left',   aeroAnim: 'wobble',        speaker: 'Dash', text: "*pecks Aero* Beep boop yourself, tin can! 🐦💥" },
    { dashAnim: 'flap',        aeroAnim: 'jump-back',     speaker: 'Dash', text: "FLUTTER FLUTTER FLUTTER! 💙 I'm the mascot, I do what I want!" },
    { dashAnim: 'spin',        aeroAnim: 'side-eye',      speaker: 'Aero', text: "...did that bird just breakdance? I need a reboot. 🤖😵" },
    { dashAnim: 'bounce',      aeroAnim: 'wave',          speaker: 'Dash', text: "Fun fact: setState(() {}) is basically magic. Fight me. ✨" },
    { dashAnim: 'headbutt',    aeroAnim: 'tumble',        speaker: 'Aero', text: "ERROR 404: Dignity not found. That bird headbutted me! 😵‍💫" },
    { dashAnim: 'dance',       aeroAnim: 'wobble',        speaker: 'Dash', text: "🎵 Build, run, hot reload — that's how Flutter rolls! 🎵" },
];

function playMischief(initiator) {
    if (isMischiefPlaying) return;

    // If minimized, restore first
    if (isMinimized) {
        restoreGuide();
        return;
    }

    isMischiefPlaying = true;

    const pool = initiator === 'aero' ? aeroMischief : dashMischief;
    const action = pool[Math.floor(Math.random() * pool.length)];

    // Apply CSS animation classes
    if (aeroAvatar) {
        aeroAvatar.classList.add('mischief-' + action.aeroAnim);
    }
    if (dashAvatar) {
        // Small delay so the reactor responds after the initiator
        setTimeout(() => {
            dashAvatar.classList.add('mischief-' + action.dashAnim);
        }, 150);
    }

    // Show the banter in the speech bubble
    if (speechContent && speechSpeaker) {
        speechContent.style.opacity = 0;
        speechSpeaker.style.opacity = 0;

        setTimeout(() => {
            speechSpeaker.innerHTML = action.speaker;
            speechSpeaker.style.color = action.speaker === 'Dash' ? '#0ea5e9' : 'var(--color-primary)';
            speechSpeaker.style.opacity = 1;
            speechContent.innerHTML = action.text;
            speechContent.style.opacity = 1;
        }, 200);
    }

    // Clean up animations after they finish
    setTimeout(() => {
        if (aeroAvatar) {
            aeroAvatar.className = 'avatar-svg aero';
        }
        if (dashAvatar) {
            dashAvatar.className = 'avatar-svg dash';
        }
        isMischiefPlaying = false;
    }, 1200);
}

// Attach click listeners
if (aeroAvatar) {
    aeroAvatar.style.cursor = 'pointer';
    aeroAvatar.addEventListener('click', () => playMischief('aero'));
}
if (dashAvatar) {
    dashAvatar.style.cursor = 'pointer';
    dashAvatar.addEventListener('click', () => playMischief('dash'));
}

// Update guide position on resize for mobile responsiveness
window.addEventListener('resize', () => {
    triggerBlink();
});
