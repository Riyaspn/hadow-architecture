import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis' // Make sure to npm install lenis

gsap.registerPlugin(ScrollTrigger)

// --- 0. Smooth Scrolling (Lenis) ---
const lenis = new Lenis()
lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

// --- 0.1 Preloader & Magic Cursor ---
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if(preloader) {
    preloader.style.transform = 'translateY(-100%)';
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 1200);
  }
});

const ball = document.getElementById('ball');
if(ball) {
  gsap.set(ball, { xPercent: -50, yPercent: -50 });
  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const mouse = { x: pos.x, y: pos.y };
  const speed = 0.2; 

  const xSet = gsap.quickSetter(ball, "x", "px");
  const ySet = gsap.quickSetter(ball, "y", "px");

  window.addEventListener("mousemove", e => {    
    mouse.x = e.x;
    mouse.y = e.y;  
  });

  gsap.ticker.add(() => {
    const dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio()); 
    pos.x += (mouse.x - pos.x) * dt;
    pos.y += (mouse.y - pos.y) * dt;
    xSet(pos.x);
    ySet(pos.y);
  });

  // Hover states
  const addHover = () => {
    const hoverElements = document.querySelectorAll('a, button, .menu-btn');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => ball.classList.add('hover-state'));
      el.addEventListener('mouseleave', () => ball.classList.remove('hover-state'));
    });
  };
  addHover();
}

// --- 1. Hero Parallax ---
gsap.to('.hero-content', {
  yPercent: 50,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  }
})

// --- 2. Scroll-Linked Image Sequence (Canvas) ---
const canvas = document.getElementById('hero-lightpass');
const context = canvas.getContext('2d');
const loadingIndicator = document.getElementById('loading-indicator');

// Set canvas dimensions dynamically for responsiveness
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const frameCount = 240; // Updated to match your 240 extracted frames
const currentFrame = index => (
  // Path for ezgif generated frames
  `/frames/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
);

const images = [];
const airpods = {
  frame: 0
};

// Preload images
let loadedImages = 0;
for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  images.push(img);
  
  img.onload = () => {
    loadedImages++;
    if (loadedImages === frameCount) {
      loadingIndicator.style.display = 'none'; // Hide loading text
      render(); // Draw the first frame once all are loaded
    }
  };
  
  // If image is missing (e.g., user hasn't added them yet), draw placeholder
  img.onerror = () => {
    loadingIndicator.innerText = "Add your frames to public/frames/ to see the animation.";
  }
}

// GSAP ScrollTrigger to scrub through frames
gsap.to(airpods, {
  frame: frameCount - 1,
  snap: "frame",
  ease: "none",
  scrollTrigger: {
    trigger: ".canvas-section",
    start: "top top",
    end: "+=2000", // The scroll distance (pixels) to play the whole animation
    scrub: 0.5, // Smooth scrubbing
    pin: true // Pin the canvas while scrolling
  },
  onUpdate: render // Call render on every frame update
});

// Function to draw image to canvas (acting like object-fit: cover)
function render() {
  if (!images[airpods.frame] || !images[airpods.frame].complete) return;
  
  const img = images[airpods.frame];
  
  // Clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Math for 'object-fit: cover' logic so it is responsive on all screens
  const hRatio = canvas.width / img.width;
  const vRatio = canvas.height / img.height;
  
  // On mobile screens, use Math.min ('contain') so the full house is visible without side cropping.
  // On desktop screens, use Math.max ('cover') to fill the entire window.
  const isMobile = window.innerWidth <= 768;
  const ratio = isMobile ? Math.min(hRatio, vRatio) : Math.max(hRatio, vRatio);
  const centerShift_x = (canvas.width - img.width * ratio) / 2;
  const centerShift_y = (canvas.height - img.height * ratio) / 2;
  
  context.drawImage(
    img, 
    0, 0, img.width, img.height,
    centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
  );
}

// --- 3. Sticky Scroll Reveal (Vision Section) ---
const textBlocks = gsap.utils.toArray('.vision-text-block');

textBlocks.forEach((block, i) => {
  ScrollTrigger.create({
    trigger: block,
    start: "top 60%", // When the top of the text block hits 60% of viewport
    end: "top 40%",
    onEnter: () => {
      // Deactivate all others
      textBlocks.forEach(b => b.classList.remove('active'));
      // Activate this one
      block.classList.add('active');
    },
    onEnterBack: () => {
      textBlocks.forEach(b => b.classList.remove('active'));
      block.classList.add('active');
    }
  });
});

// --- 4. Mobile Menu Toggle ---
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileOverlay = document.getElementById('mobile-menu-overlay');

if (mobileBtn && mobileOverlay) {
  mobileBtn.addEventListener('click', () => {
    mobileBtn.classList.toggle('open');
    mobileOverlay.classList.toggle('active');
    
    // Toggle body scroll lock
    if (mobileOverlay.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });
}
