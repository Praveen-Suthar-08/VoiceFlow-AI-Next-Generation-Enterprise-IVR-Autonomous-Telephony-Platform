import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX, Sparkles, Activity, RefreshCw } from 'lucide-react';
import { ThreeDSphereSkeleton } from '../ui/SkeletonLoader';

interface HeroVoiceSphereProps {
  isAudioReactive?: boolean;
}

export const HeroVoiceSphere: React.FC<HeroVoiceSphereProps> = ({ isAudioReactive = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isAudioSimulated, setIsAudioSimulated] = useState(true);
  const [activeFrequency, setActiveFrequency] = useState(48);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Particle Sphere Geometry
    const particleCount = 2800;
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const radius = 6.8;
    const cyanColor = new THREE.Color('#00D4FF');
    const purpleColor = new THREE.Color('#A855F7');
    const indigoColor = new THREE.Color('#3B42D4');

    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution on sphere
      const phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      // Color gradient from cyan (top/sides) to purple/indigo
      const mixRatio = (y / radius + 1) * 0.5;
      const particleColor = cyanColor.clone().lerp(purpleColor, mixRatio);
      if (Math.random() > 0.7) {
        particleColor.lerp(indigoColor, 0.4);
      }

      colors[i * 3] = particleColor.r;
      colors[i * 3 + 1] = particleColor.g;
      colors[i * 3 + 2] = particleColor.b;

      sizes[i] = Math.random() * 2.5 + 1.2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom glowing particle texture creation via Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(0, 212, 255, 0.8)');
    gradient.addColorStop(0.7, 'rgba(168, 85, 247, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const particleTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.38,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Orbital frequency waveform rings
    const ringGeometry = new THREE.TorusGeometry(8.2, 0.04, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00D4FF,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring1.rotation.x = Math.PI / 2.8;
    scene.add(ring1);

    const ringGeometry2 = new THREE.TorusGeometry(9.0, 0.03, 16, 100);
    const ringMaterial2 = new THREE.MeshBasicMaterial({
      color: 0xA855F7,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(ringGeometry2, ringMaterial2);
    ring2.rotation.x = -Math.PI / 3.4;
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 2;
      mouseY = y * 2;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    const startTime = performance.now();
    let reqId: number;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) / 1000;

      // Smooth mouse rotation
      targetRotationY += (mouseX * 0.4 - targetRotationY) * 0.05;
      targetRotationX += (mouseY * 0.4 - targetRotationX) * 0.05;

      particleSystem.rotation.y = elapsedTime * 0.15 + targetRotationY;
      particleSystem.rotation.x = targetRotationX;

      ring1.rotation.z = elapsedTime * 0.25;
      ring2.rotation.z = -elapsedTime * 0.2;

      // Audio waveform modulation
      const positionAttr = geometry.attributes.position as THREE.BufferAttribute;
      const posArray = positionAttr.array as Float32Array;

      const audioIntensity = (isAudioSimulated || isAudioReactive) ? Math.sin(elapsedTime * 4.5) * 0.5 + 0.5 : 0.2;
      setActiveFrequency(Math.round(40 + audioIntensity * 55));

      for (let i = 0; i < particleCount; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        // Spherical harmonic wave equation
        const wave1 = Math.sin(elapsedTime * 3.5 + oy * 1.2 + ox * 0.8) * 0.45;
        const wave2 = Math.cos(elapsedTime * 2.8 + oz * 1.5) * 0.35;
        const wave3 = Math.sin(elapsedTime * 6.0 + ox * 2.0) * 0.25 * audioIntensity;

        const displacement = 1 + (wave1 + wave2 + wave3) * (0.12 + audioIntensity * 0.08);

        posArray[i * 3] = ox * displacement;
        posArray[i * 3 + 1] = oy * displacement;
        posArray[i * 3 + 2] = oz * displacement;
      }

      positionAttr.needsUpdate = true;
      renderer.render(scene, camera);
      setIsLoading(false);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isAudioSimulated, isAudioReactive]);

  const handleSimulateReload = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 750);
  };

  return (
    <div 
      className="relative w-full h-[460px] sm:h-[520px] lg:h-[600px] xl:h-[640px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Skeleton Overlay during 3D asset initialization */}
      {isLoading && (
        <div className="absolute inset-0 z-30 transition-opacity duration-300">
          <ThreeDSphereSkeleton statusMessage="Synchronizing 2,800 Neural Audio Particles..." />
        </div>
      )}

      {/* Three.js Canvas Container */}
      <div 
        ref={containerRef} 
        className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} 
      />

      {/* Floating HUD Badges around 3D Sphere */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B0F2F]/90 backdrop-blur-md border border-cyan-400/50 text-xs text-cyan-200 font-mono shadow-xl">
        <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span className="font-semibold">Gemini 3.8 NLU Neural Mesh</span>
      </div>

      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2.5">
        <button
          onClick={handleSimulateReload}
          title="Reload 3D asset pipeline to preview skeleton feedback"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-xs font-mono transition-all shadow-xl cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Recalibrate</span>
        </button>

        <button
          onClick={() => setIsAudioSimulated(!isAudioSimulated)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md border text-xs font-mono transition-all shadow-xl cursor-pointer ${
            isAudioSimulated 
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-100 font-semibold' 
              : 'bg-slate-900/90 border-slate-700 text-slate-300'
          }`}
        >
          {isAudioSimulated ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          <span>Audio React: {isAudioSimulated ? `${activeFrequency} Hz` : 'Muted'}</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0B0F2F]/90 backdrop-blur-md border border-purple-400/50 text-xs text-purple-200 font-mono shadow-xl font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span>2,800 Synaptic Nodes</span>
        </div>
      </div>
    </div>
  );
};

