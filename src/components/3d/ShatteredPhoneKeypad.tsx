import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RefreshCw, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { ThreeDKeypadSkeleton } from '../ui/SkeletonLoader';

export const ShatteredPhoneKeypad: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shatterRatio, setShatterRatio] = useState<number>(0);
  const [isShattered, setIsShattered] = useState<boolean>(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Keypad Button Definitions (3x4 grid)
    const buttons: THREE.Mesh[] = [];
    const buttonOriginalPositions: THREE.Vector3[] = [];
    const buttonFragmentVelocities: THREE.Vector3[] = [];
    const buttonRotations: THREE.Vector3[] = [];

    const keys = [
      '1', '2', '3',
      '4', '5', '6',
      '7', '8', '9',
      '*', '0', '#'
    ];

    const buttonGroup = new THREE.Group();
    scene.add(buttonGroup);

    // Keypad housing
    const bodyGeometry = new THREE.BoxGeometry(7, 9, 0.8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x111642,
      roughness: 0.4,
      metalness: 0.6,
      wireframe: false,
    });
    const keypadBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    keypadBody.position.z = -0.4;
    buttonGroup.add(keypadBody);

    // Create 12 key meshes
    const buttonGeom = new THREE.BoxGeometry(1.6, 1.4, 0.6);
    
    keys.forEach((key, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);

      const x = (col - 1) * 2.0;
      const y = (1.5 - row) * 1.8;
      const z = 0.2;

      // Canvas texture with key label
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#1A1F5E';
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = '#3B42D4';
      ctx.lineWidth = 6;
      ctx.strokeRect(4, 4, 120, 120);

      ctx.fillStyle = '#00D4FF';
      ctx.font = 'bold 56px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(key, 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const btnMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.3,
        metalness: 0.7,
      });

      const btnMesh = new THREE.Mesh(buttonGeom, btnMat);
      btnMesh.position.set(x, y, z);
      buttonGroup.add(btnMesh);

      buttons.push(btnMesh);
      buttonOriginalPositions.push(new THREE.Vector3(x, y, z));

      // Random shatter velocity outward
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 6;
      buttonFragmentVelocities.push(new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed + (Math.random() - 0.5) * 3,
        (Math.random() - 0.2) * 8
      ));

      buttonRotations.push(new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6
      ));
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00D4FF, 2.0);
    dirLight.position.set(10, 15, 10);
    scene.add(dirLight);

    const redLight = new THREE.PointLight(0xEF4444, 2.5, 20);
    redLight.position.set(-8, -5, 5);
    scene.add(redLight);

    // Floating particles for debris
    const debrisCount = 300;
    const debrisGeom = new THREE.BufferGeometry();
    const debrisPos = new Float32Array(debrisCount * 3);
    for (let i = 0; i < debrisCount * 3; i++) {
      debrisPos[i] = (Math.random() - 0.5) * 20;
    }
    debrisGeom.setAttribute('position', new THREE.BufferAttribute(debrisPos, 3));
    const debrisMat = new THREE.PointsMaterial({
      color: 0x00D4FF,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
    });
    const debris = new THREE.Points(debrisGeom, debrisMat);
    scene.add(debris);

    let reqId: number;
    const startTime = performance.now();
    let currentShatter = 0;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) / 1000;

      // Smooth interpolation for shatter ratio
      const targetShatter = isShattered ? 1.0 : shatterRatio;
      currentShatter += (targetShatter - currentShatter) * 0.08;

      buttonGroup.rotation.y = Math.sin(elapsedTime * 0.8) * 0.2 + (currentShatter * 0.4);
      buttonGroup.rotation.x = Math.cos(elapsedTime * 0.6) * 0.1;

      // Animate buttons based on shatter amount
      buttons.forEach((btn, index) => {
        const orig = buttonOriginalPositions[index];
        const vel = buttonFragmentVelocities[index];
        const rot = buttonRotations[index];

        btn.position.x = orig.x + vel.x * currentShatter;
        btn.position.y = orig.y + vel.y * currentShatter;
        btn.position.z = orig.z + vel.z * currentShatter;

        btn.rotation.x = rot.x * currentShatter;
        btn.rotation.y = rot.y * currentShatter;
        btn.rotation.z = rot.z * currentShatter;
      });

      // Keypad body disintegration
      keypadBody.position.z = -0.4 - currentShatter * 4;
      keypadBody.scale.set(
        Math.max(0.01, 1 - currentShatter * 0.8),
        Math.max(0.01, 1 - currentShatter * 0.8),
        Math.max(0.01, 1 - currentShatter * 0.8)
      );

      debris.rotation.y = elapsedTime * 0.1;
      renderer.render(scene, camera);
      setIsLoading(false);
    };

    animate();

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
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      buttonGeom.dispose();
      debrisGeom.dispose();
      debrisMat.dispose();
      renderer.dispose();
    };
  }, [isShattered, shatterRatio]);

  return (
    <div className="relative w-full h-[420px] rounded-2xl glass-card border border-slate-700/60 overflow-hidden flex flex-col justify-between p-4">
      {/* Skeleton Feedback during initialization */}
      {isLoading && (
        <div className="absolute inset-0 z-30">
          <ThreeDKeypadSkeleton />
        </div>
      )}

      {/* 3D Canvas */}
      <div 
        ref={containerRef} 
        className={`w-full h-full absolute inset-0 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`} 
      />

      {/* Top HUD */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-red-500/30 text-xs font-mono text-red-300">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span>Legacy Touch-Tone IVR Tree</span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {isShattered ? 'Status: DEMOLISHED' : 'Status: RIGID (Press 1, Press 2...)'}
        </span>
      </div>

      {/* Bottom Interactive Controls */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsShattered(!isShattered)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-semibold transition-all ${
              isShattered
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20'
                : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40'
            }`}
          >
            {isShattered ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-red-400" />}
            <span>{isShattered ? 'Reassemble Keypad' : 'Shatter The Phone Tree'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          {isShattered ? (
            <div className="flex items-center gap-1.5 text-cyan-300">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>VoiceFlow Gemini AI Unlocked</span>
            </div>
          ) : (
            <span>30% of callers misrouted by rigid menus</span>
          )}
        </div>
      </div>
    </div>
  );
};
