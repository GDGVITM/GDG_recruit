import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Spline from '@splinetool/react-spline';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

interface AppProps {
  onSplineLoad?: () => void;
}

const App: React.FC<AppProps> = ({ onSplineLoad }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaButtons = useRef<HTMLAnchorElement[]>([]);
  
  // Add refs to the CTA buttons
  const addToRefs = (el: HTMLAnchorElement | null) => {
    if (el && !ctaButtons.current.includes(el)) {
      ctaButtons.current.push(el);
    }
  };

  useEffect(() => {
    // Hero section animations
    gsap.from(titleRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.3,
    });

    gsap.from(subtitleRef.current, {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.6,
    });

    gsap.from(ctaButtons.current, {
      y: 20,
      opacity: 0,
      stagger: 0.2,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.9,
    });

    // Section reveal animations
    const sections = document.querySelectorAll('.section');
    sections.forEach((section) => {
      gsap.from(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
    });
  }, []);

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="nav">
        <div className="logo">NEXUS</div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="hero">
        <div className="hero-content">
          <h1 ref={titleRef} className="glitch" data-text="SHAPING TOMORROW">
            SHAPING TOMORROW
          </h1>
          <p ref={subtitleRef} className="subtitle">
            Experience the future with cutting-edge 3D and motion design
          </p>
          <div ref={ctaRef} className="cta-buttons">
            <a href="#features" className="cta-primary" ref={addToRefs}>
              Get Started
            </a>
            <a href="#demo" className="cta-secondary" ref={addToRefs}>
              Watch Demo
            </a>
          </div>
        </div>
        <div className="spline-container">
          <Spline 
            scene="https://prod.spline.design/5wqQHq8y1iCqM2n7/scene.splinecode" 
            onLoad={() => onSplineLoad?.()} 
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section features">
        <div className="section-header">
          <h2>FEATURES</h2>
          <div className="divider"></div>
        </div>
        <div className="features-grid">
          <FeatureCard
            icon="⚡"
            title="Lightning Fast"
            description="Optimized for performance with Vite + React and GSAP."
          />
          <FeatureCard
            icon="🛡️"
            title="Secure"
            description="Best practices for secure, modern web experiences."
          />
          <FeatureCard
            icon="🔗"
            title="Seamless Sync"
            description="Smooth interactions and scroll-driven motion."
          />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section about">
        <div className="section-header">
          <h2>ABOUT US</h2>
          <div className="divider"></div>
        </div>
        <p className="about-text">
          We craft immersive digital experiences with cutting-edge 3D and motion design.
          Our mission is to push the boundaries of interaction and visual storytelling on the web.
        </p>
        <div className="stats">
          <StatCard number={120} label="Projects" />
          <StatCard number={60} label="Clients" />
          <StatCard number={14} label="Awards" />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section contact">
        <div className="section-header">
          <h2>GET IN TOUCH</h2>
          <div className="divider"></div>
        </div>
        <form className="contact-form">
          <div className="form-group">
            <input type="text" id="name" required />
            <label htmlFor="name">Name</label>
          </div>
          <div className="form-group">
            <input type="email" id="email" required />
            <label htmlFor="email">Email</label>
          </div>
          <div className="form-group">
            <textarea id="message" required></textarea>
            <label htmlFor="message">Message</label>
          </div>
          <button type="submit" className="cta-primary">Send Message</button>
        </form>
      </section>

      <footer>
        <p>© 2025 NEXUS. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <div className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

// Stat Card Component
const StatCard = ({ number, label }: { number: number; label: string }) => {
  const countRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        gsap.to(countRef.current, {
          innerText: number,
          duration: 2,
          snap: { innerText: 1 },
          stagger: 0.5,
          ease: 'power1.out',
        });
        observer.disconnect();
      }
    });

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [number]);

  return (
    <div className="stat-card">
      <div ref={countRef} className="stat-number">0</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

export default App;
