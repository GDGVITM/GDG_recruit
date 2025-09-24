import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import './tailwind.css';
import App from './App';
import Loading from './components/Loading';

const Root = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [splineLoaded, setSplineLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading time for the Spline scene
    const timer = setTimeout(() => {
      setSplineLoaded(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // When Spline is loaded, wait a bit before hiding the loading screen
    if (splineLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        // Remove the loading class from body
        document.body.classList.remove('loading');
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [splineLoaded]);

  // Prevent scrolling when loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      
      // Add a class to the body when loading is complete for any additional styles
      document.body.classList.add('loaded');
      
      // Animate in the content
      gsap.to('body', {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }, [isLoading]);

  return (
    <StrictMode>
      {isLoading && <Loading />}
      <App onSplineLoad={() => setSplineLoaded(true)} />
    </StrictMode>
  );
};

// Initial body styles
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease-out';

createRoot(document.getElementById('root')!).render(<Root />);
