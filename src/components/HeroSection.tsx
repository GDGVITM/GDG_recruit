import { useState, useEffect, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import { gsap } from 'gsap';

const scrollToNext = () => {
  document.getElementById('opportunities')?.scrollIntoView({ 
    behavior: 'smooth' 
  });
};

export const HeroSection = () => {
  const titleWords = ['Effortless', 'AI integration'];
  const subtitle = 'for business';
  const description = ['No extra setup, just smart automation when you need it.', 'Handle the heavy lifting while you stay in control.'];
  const [visibleWords, setVisibleWords] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const splineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP animations for smoother entrance
    const tl = gsap.timeline({ delay: 0.5 });
    
    // Animate each title word
    titleWords.forEach((_, index) => {
      tl.to({}, { 
        duration: 0.8, 
        onComplete: () => setVisibleWords(index + 1) 
      });
    });
    
    // Animate subtitle, description, and button
    tl.call(() => setSubtitleVisible(true))
      .to({}, { duration: 0.6 })
      .call(() => setDescriptionVisible(true))
      .to({}, { duration: 0.8 })
      .call(() => setButtonVisible(true));

    // Animate Spline container on scroll
    if (splineRef.current) {
      gsap.set(splineRef.current, { rotationY: 0 });
      
      const handleScroll = () => {
        const scrollY = window.scrollY;
        const rotation = scrollY * 0.1;
        gsap.to(splineRef.current, { 
          rotationY: rotation, 
          duration: 0.3,
          ease: "power2.out"
        });
      };

      window.addEventListener('scroll', handleScroll);
      return () => {
        tl.kill();
        window.removeEventListener('scroll', handleScroll);
      };
    }

    return () => tl.kill();
  }, []);

  return (
    <div ref={heroRef} className="h-screen relative overflow-hidden bg-black">
      {/* Spline 3D Scene */}
      <div ref={splineRef} className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/MM7W507Mc-vk4BXG/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-between px-16">
        {/* Left Content */}
        <div className="max-w-2xl space-y-8 z-10">
          {/* Main Title */}
          <div className="space-y-4">
            {titleWords.map((word, index) => (
              <div
                key={index}
                className={`text-6xl xl:text-7xl font-light leading-tight ${
                  index < visibleWords ? 'fade-in' : 'opacity-0'
                } ${
                  index === 0 
                    ? 'text-white' 
                    : 'bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent'
                }`}
                style={{ animationDelay: `${index * 0.3}s` }}
              >
                {word}
              </div>
            ))}
          </div>

          {/* Subtitle */}
          <div
            className={`text-6xl xl:text-7xl font-light bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent ${
              subtitleVisible ? 'fade-in' : 'opacity-0'
            }`}
            style={{ animationDelay: '1.2s' }}
          >
            {subtitle}
          </div>

          {/* Description */}
          <div
            className={`space-y-2 ${
              descriptionVisible ? 'fade-in' : 'opacity-0'
            }`}
            style={{ animationDelay: '2s' }}
          >
            {description.map((line, index) => (
              <p key={index} className="text-gray-400 text-lg leading-relaxed">
                {line}
              </p>
            ))}
          </div>

          {/* CTA Button */}
          <button
            className={`bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-teal-500/25 ${
              buttonVisible ? 'fade-in' : 'opacity-0'
            }`}
            onClick={scrollToNext}
          >
            JOIN US NOW
          </button>
        </div>
      </div>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />
      
      {/* Interactive hint */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm animate-pulse">
        Press on the canvas to focus and interact
      </div>
    </div>
  );
};