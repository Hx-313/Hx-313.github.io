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
});

/* ==========================================================================
   AVATAR GUIDE SYSTEM LOGIC
   ========================================================================== */
const guideSystem = document.getElementById('guide-system');
const speechContent = document.getElementById('speech-content');
const nextGuideBtn = document.getElementById('next-guide');
const skipGuideBtn = document.getElementById('skip-guide');
const eyeLeft = document.getElementById('eye-left-pupil');
const eyeRight = document.getElementById('eye-right-pupil');
const aeroAvatar = document.getElementById('aero-avatar');

// Guide States Configuration
const guideData = {
    'hero': {
        text: "Hi there! 👋 I am Abdullah's digital guide companion. I'm here to show you around. Let's start with his mobile applications!",
        nextBtn: "Explore Projects &rarr;",
        nextSectionId: "projects",
        className: "hero-state"
    },
    'projects': {
        text: "Abdullah builds premium cross-platform apps using Flutter! 📱 He has published 5 production apps. Check out the download links!",
        nextBtn: "View SaaS Products &rarr;",
        nextSectionId: "saas",
        className: "projects-state"
    },
    'saas': {
        text: "He also engineers complete SaaS platforms! 🌐 <strong>onlineorder.pk</strong> integrates customer web ordering, admin ePOS, and terminal dispatch apps.",
        nextBtn: "Let's Connect &rarr;",
        nextSectionId: "contact",
        className: "saas-state"
    },
    'contact': {
        text: "Need a high-performance mobile app or SaaS ordering solution? 🤝 Abdullah is 24, has 3 years of experience, and is ready. Let's talk!",
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

    eyeLeft.style.transform = `translate(${moveX}px, ${moveY}px)`;
    eyeRight.style.transform = `translate(${moveX}px, ${moveY}px)`;
});

// 2. Eye Blink Effect
function triggerBlink() {
    if (!eyeLeft || !eyeRight) return;
    
    // Scale eyes down to simulate blink
    eyeLeft.style.transform = 'scaleY(0.1)';
    eyeRight.style.transform = 'scaleY(0.1)';
    
    setTimeout(() => {
        eyeLeft.style.transform = 'scaleY(1)';
        eyeRight.style.transform = 'scaleY(1)';
    }, 150);
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
    setTimeout(() => {
        speechContent.innerHTML = data.text;
        nextGuideBtn.innerHTML = data.nextBtn;
        speechContent.style.opacity = 1;
    }, 250);
    
    // Trigger blink on position transition
    triggerBlink();
}

// 4. Scroll Interactivity (Intersection Observer)
const sections = document.querySelectorAll('.section-block');
const navLinks = document.querySelectorAll('.nav-link');

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
            navLinks.forEach(link => {
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
    
    // Add special minimized class in CSS that hides bubble
    // Style the container as small clickable helper
    const bubble = guideSystem.querySelector('.speech-bubble');
    if (bubble) bubble.style.display = 'none';
    
    // Change tooltip message or mouse style
    aeroAvatar.style.cursor = 'pointer';
}

// Restore Guide when avatar is clicked while minimized
aeroAvatar.addEventListener('click', () => {
    if (isMinimized) {
        isMinimized = false;
        guideSystem.classList.remove('guide-minimized');
        
        const bubble = guideSystem.querySelector('.speech-bubble');
        if (bubble) bubble.style.display = 'flex';
        
        aeroAvatar.style.cursor = 'default';
        
        // Force refresh current state text
        const stateKey = currentGuideState;
        currentGuideState = ''; // Reset to bypass duplicates check
        updateGuideState(stateKey);
    }
});

// Update guide position on resize for mobile responsiveness
window.addEventListener('resize', () => {
    // Triggers layout recalibration if required
    triggerBlink();
});
