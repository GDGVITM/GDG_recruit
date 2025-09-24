'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Mesh } from 'three';

const TEXTUREMAP = { src: 'https://i.postimg.cc/XYwvXN8D/img-4.png' };
const DEPTHMAP = { src: 'https://i.postimg.cc/2SHKQh2q/raw-4.webp' };

// Post Processing component using standard Three.js
const PostProcessing = ({
  strength = 1,
  threshold = 1,
  fullScreenEffect = true,
}: {
  strength?: number;
  threshold?: number;
  fullScreenEffect?: boolean;
}) => {
  const { gl, scene, camera } = useThree();
  const progressRef = useRef({ value: 0 });

  const render = useMemo(() => {
    // Create a simple post-processing effect using a custom shader
    const postProcessingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uScanProgress: { value: 0 },
        uTime: { value: 0 },
        uStrength: { value: strength },
        uThreshold: { value: threshold },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uScanProgress;
        uniform float uTime;
        uniform float uStrength;
        uniform float uThreshold;
        varying vec2 vUv;

        void main() {
          vec4 color = texture2D(tDiffuse, vUv);

          // Create scanning effect
          float scanPos = uScanProgress;
          float scanWidth = 0.05;
          float scanLine = smoothstep(0.0, scanWidth, abs(vUv.y - scanPos));
          vec3 redOverlay = vec3(1.0, 0.0, 0.0) * (1.0 - scanLine) * 0.4;

          // Mix original with scan effect
          vec3 withScanEffect = mix(color.rgb, color.rgb + redOverlay,
            fullScreenEffect ? smoothstep(0.9, 1.0, 1.0 - scanLine) : 1.0);

          // Add bloom effect simulation
          float luminance = dot(withScanEffect, vec3(0.299, 0.587, 0.114));
          vec3 bloom = withScanEffect * pow(luminance, uThreshold) * uStrength;

          gl_FragColor = vec4(withScanEffect + bloom, color.a);
        }
      `,
    });

    const renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );

    return { material: postProcessingMaterial, renderTarget };
  }, [strength, threshold, fullScreenEffect]);

  useFrame(({ clock }) => {
    // Animate the scan line from top to bottom
    render.material.uniforms.uScanProgress.value = (Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5);
    render.material.uniforms.uTime.value = clock.getElapsedTime();
  });

  return null;
};

const WIDTH = 300;
const HEIGHT = 300;

const Scene = () => {
  const [rawMap, depthMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src]);

  const meshRef = useRef<Mesh>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show image after textures are loaded
    if (rawMap && depthMap) {
      setVisible(true);
    }
  }, [rawMap, depthMap]);

  const { material, uniforms } = useMemo(() => {
    const uPointer = new THREE.Vector2(0);
    const uProgress = 0;

    const strength = 0.01;

    // Create a custom shader material that works with the current Three.js version
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uPointer: { value: uPointer },
        uProgress: { value: uProgress },
        uRawMap: { value: rawMap },
        uDepthMap: { value: depthMap },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec2 uPointer;
        uniform float uProgress;
        uniform sampler2D uRawMap;
        uniform sampler2D uDepthMap;
        uniform float uTime;
        varying vec2 vUv;

        // Noise function
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        // Cell noise function
        float cellNoise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float minDist = 1.0;
          for (int y = -1; y <= 1; y++) {
            for (int x = -1; x <= 1; x++) {
              vec2 neighbor = vec2(float(x), float(y));
              vec2 point = random(i + neighbor);
              vec2 diff = neighbor + point - f;
              float dist = length(diff);
              minDist = min(minDist, dist);
            }
          }
          return minDist;
        }

        void main() {
          vec2 uv = vUv;

          // Get depth map value
          float depth = texture2D(uDepthMap, uv).r;

          // Create parallax effect based on pointer
          vec2 parallaxUv = uv + depth * uPointer * 0.01;

          // Sample the raw map with parallax
          vec3 color = texture2D(uRawMap, parallaxUv).rgb;

          // Create aspect-corrected UV for effects
          float aspect = 300.0 / 300.0;
          vec2 tUv = vec2(uv.x * aspect, uv.y);

          // Create tiling effect
          vec2 tiling = vec2(120.0);
          vec2 tiledUv = mod(tUv * tiling, 2.0) - 1.0;

          // Create brightness using cell noise
          float brightness = cellNoise(tUv * tiling / 2.0);

          // Create dot pattern
          float dist = length(tiledUv);
          float dot = smoothstep(0.5, 0.49, dist) * brightness;

          // Create flow effect based on depth and progress
          float flow = 1.0 - smoothstep(0.0, 0.02, abs(depth - uProgress));

          // Create mask
          vec3 mask = dot * flow * vec3(10.0, 0.0, 0.0);

          // Blend using screen blend mode
          vec3 final = color + mask - color * mask;

          gl_FragColor = vec4(final, 1.0);
        }
      `,
      transparent: true,
      opacity: 0,
    });

    return {
      material,
      uniforms: {
        uPointer,
        uProgress,
      },
    };
  }, [rawMap, depthMap]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  useFrame(({ clock }) => {
    const progress = (Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5);

    // Update the material uniform directly
    if (meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uProgress.value = progress;
    }

    // Smooth appearance
    if (meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.opacity = THREE.MathUtils.lerp(
        mat.opacity,
        visible ? 1 : 0,
        0.07
      );
    }
  });

  useFrame(({ pointer }) => {
    uniforms.uPointer.copy(pointer);
  });

  const scaleFactor = 0.40;
  return (
    <mesh ref={meshRef} scale={[w * scaleFactor, h * scaleFactor, 1]} material={material}>
      <planeGeometry />
    </mesh>
  );
};

export const HeroSection = () => {
  const titleWords = 'Build Your Dreams'.split(' ');
  const subtitle = 'AI-powered creativity for the next generation.';
  const [visibleWords, setVisibleWords] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [delays, setDelays] = useState<number[]>([]);
  const [subtitleDelay, setSubtitleDelay] = useState(0);

  useEffect(() => {
    // Generate random delays for glitch effect
    setDelays(titleWords.map(() => Math.random() * 0.07));
    setSubtitleDelay(Math.random() * 0.1);
  }, [titleWords.length]);

  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timeout = setTimeout(() => setVisibleWords(visibleWords + 1), 600);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setSubtitleVisible(true), 800);
      return () => clearTimeout(timeout);
    }
  }, [visibleWords, titleWords.length]);

  const scrollToNext = () => {
    document.getElementById('opportunities')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <div className="h-svh">
      <div className="h-svh uppercase items-center w-full absolute z-60 pointer-events-none px-10 flex justify-center flex-col">
        <div className="text-3xl md:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold">
          <div className="flex space-x-2 lg:space-x-6 overflow-hidden text-white">
            {titleWords.map((word, index) => (
              <div
                key={index}
                className={index < visibleWords ? 'fade-in' : ''}
                style={{ animationDelay: `${index * 0.13 + (delays[index] || 0)}s` , opacity: index < visibleWords ? undefined : 0 }}
              >
                {word}
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs md:text-xl xl:text-2xl 2xl:text-3xl mt-2 overflow-hidden text-white font-bold">
          <div
            className={subtitleVisible ? 'fade-in-subtitle' : ''}
            style={{ animationDelay: `${titleWords.length * 0.13 + 0.2 + subtitleDelay}s`  , opacity: subtitleVisible ? undefined : 0 }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      <button
        className="explore-btn"
        style={{ animationDelay: '2.2s' }}
        onClick={scrollToNext}
      >
        Scroll to explore
        <span className="explore-arrow">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="arrow-svg">
            <path d="M11 5V17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M6 12L11 17L16 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
      </button>

      <Canvas
        flat
        camera={{ position: [0, 0, 1] }}
      >
        <PostProcessing fullScreenEffect={true} />
        <Scene />
      </Canvas>
    </div>
  );
};

export default HeroSection;