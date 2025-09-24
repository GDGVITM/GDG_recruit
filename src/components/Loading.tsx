import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Loading = () => {
  const loadingRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate the loading screen
    const tl = gsap.timeline({
      onComplete: () => {
        if (loadingRef.current) {
          loadingRef.current.style.pointerEvents = 'none';
        }
      }
    });

    tl.to(progressTextRef.current, {
      innerText: '100%',
      duration: 2,
      snap: { innerText: 1 },
      ease: 'power1.out',
      onUpdate: function() {
        if (progressRef.current) {
          const progress = parseInt(this.targets()[0].innerText) / 100;
          progressRef.current.style.transform = `scaleX(${progress})`;
        }
      }
    });

    tl.to(loadingRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        if (loadingRef.current) {
          loadingRef.current.style.display = 'none';
        }
      }
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div 
      ref={loadingRef}
      className="fixed inset-0 bg-[#0f0f1a] flex flex-col items-center justify-center z-[9999] transition-opacity duration-1000"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#00f7ff] to-[#7b2cbf] bg-clip-text text-transparent">
          NEXUS
        </h1>
        <p className="text-gray-400 text-sm md:text-base">Loading Experience</p>
      </div>
      
      <div className="w-full max-w-xs h-1 bg-gray-800 rounded-full overflow-hidden">
        <div 
          ref={progressRef}
          className="h-full bg-gradient-to-r from-[#00f7ff] to-[#7b2cbf] origin-left transform scale-x-0"
        ></div>
      </div>
      
      <div className="mt-4 text-gray-400 text-sm">
        <span ref={progressTextRef}>0</span>%
      </div>
    </div>
  );
};

export default Loading;
