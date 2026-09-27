import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Brain, Cpu, Sparkles, Network } from 'lucide-react';
import { ThreeDBrainSkeleton } from '../ui/SkeletonLoader';

interface SubSystemHighlight {
  id: string;
  name: string;
  category: string;
  description: string;
  color: string;
}

const SUB_SYSTEMS: SubSystemHighlight[] = [
  {
    id: 'sys_1',
    name: 'Sub-System 1: Perception Engine',
    category: 'STT & Biometrics',
    description: 'Multi-lingual acoustic speech-to-text, voice signature biometrics (95%+ match), noise cancellation and barge-in detection.',
    color: '#00D4FF'
  },
  {
    id: 'sys_2',
    name: 'Sub-System 2: Understanding Engine',
    category: 'Gemini NLU & Sentiment',
    description: 'Multi-intent classification across 45+ enterprise categories, real-time emotion tracking (anger, anxiety, happiness) and slot extraction.',
    color: '#A855F7'
  },
  {
    id: 'sys_3',
    name: 'Sub-System 3: Dialogue Engine',
    category: 'Context & Tone Calibration',
    description: 'Contextual memory across multi-turn exchanges, adaptive communication style (concise vs. guided) and empathy-first responses.',
    color: '#3B42D4'
  },
  {
    id: 'sys_4',
    name: 'Sub-System 4: Action Engine',
    category: 'CRM & Autonomous Tools',
    description: 'Automated execution of refunds via Stripe, UPS tracking lookups, airline rebooking, and warm transfers with complete JSON packets.',
    color: '#22C55E'
  },
  {
    id: 'sys_5',
    name: 'Sub-System 5: Learning Engine',
    category: 'Continuous Vector Optimization',
    description: 'BigQuery telemetry, self-learning intent clusters, anomaly detection for product spikes, and automated knowledge base updates.',
    color: '#F59E0B'
  }
];

export const NeuralBrainScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSystem, setActiveSystem] = useState<SubSystemHighlight>(SUB_SYSTEMS[1]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Brain Network Generation
    const nodeCount = 140;
    const nodes: THREE.Vector3[] = [];
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // Generate hemisphere brain shape
    for (let i = 0; i < nodeCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 4.5;

      // Ellipsoid deformed into dual hemispheres
      let x = r * Math.sin(phi) * Math.cos(theta) * 1.3;
      let y = r * Math.sin(phi) * Math.sin(theta) * 0.9 + 0.5;
      let z = r * Math.cos(phi) * 1.1;

      // Separation gap between left and right hemispheres
      if (x > 0) x += 0.4;
      else x -= 0.4;

      nodes.push(new THREE.Vector3(x, y, z));
    }

    // Node Spheres
    const nodeGeom = new THREE.SphereGeometry(0.12, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00D4FF });

    const instancedNodes = new THREE.InstancedMesh(nodeGeom, nodeMat, nodeCount);
    const dummy = new THREE.Object3D();

    nodes.forEach((pos, i) => {
      dummy.position.copy(pos);
      dummy.scale.setScalar(Math.random() * 0.8 + 0.6);
      dummy.updateMatrix();
      instancedNodes.setMatrixAt(i, dummy.matrix);
    });
    instancedNodes.instanceMatrix.needsUpdate = true;
    brainGroup.add(instancedNodes);

    // Neural Connections (Synaptic Edges)
    const linePositions: number[] = [];
    const maxDistance = 2.2;

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodes[i].distanceTo(nodes[j]);
        if (dist < maxDistance) {
          linePositions.push(nodes[i].x, nodes[i].y, nodes[i].z);
          linePositions.push(nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }

    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x3B42D4,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const neuralLines = new THREE.LineSegments(lineGeom, lineMat);
    brainGroup.add(neuralLines);

    // Glowing Synaptic Signal Pulses
    const pulseCount = 35;
    const pulsePositions = new Float32Array(pulseCount * 3);
    const pulseProgress = new Float32Array(pulseCount);
    const pulseStartNodes = new Int32Array(pulseCount);
    const pulseEndNodes = new Int32Array(pulseCount);

    for (let p = 0; p < pulseCount; p++) {
      pulseStartNodes[p] = Math.floor(Math.random() * nodeCount);
      pulseEndNodes[p] = (pulseStartNodes[p] + Math.floor(Math.random() * 8) + 1) % nodeCount;
      pulseProgress[p] = Math.random();
    }

    const pulseGeom = new THREE.BufferGeometry();
    pulseGeom.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3));
    const pulseMat = new THREE.PointsMaterial({
      color: 0x00D4FF,
      size: 0.35,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const pulsePoints = new THREE.Points(pulseGeom, pulseMat);
    brainGroup.add(pulsePoints);

    // Central glow core
    const coreGeom = new THREE.SphereGeometry(1.8, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xA855F7,
      transparent: true,
      opacity: 0.15,
      wireframe: true,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    brainGroup.add(coreMesh);

    let reqId: number;
    const startTime = performance.now();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) / 1000;

      brainGroup.rotation.y = elapsedTime * 0.2;
      brainGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.1;
      coreMesh.rotation.z = -elapsedTime * 0.4;

      // Update Synaptic Pulse positions
      const posAttr = pulseGeom.attributes.position as THREE.BufferAttribute;
      const pArr = posAttr.array as Float32Array;

      for (let p = 0; p < pulseCount; p++) {
        pulseProgress[p] += 0.015;
        if (pulseProgress[p] > 1) {
          pulseProgress[p] = 0;
          pulseStartNodes[p] = Math.floor(Math.random() * nodeCount);
          pulseEndNodes[p] = (pulseStartNodes[p] + Math.floor(Math.random() * 12) + 1) % nodeCount;
        }

        const sNode = nodes[pulseStartNodes[p]];
        const eNode = nodes[pulseEndNodes[p]];
        const t = pulseProgress[p];

        pArr[p * 3] = sNode.x + (eNode.x - sNode.x) * t;
        pArr[p * 3 + 1] = sNode.y + (eNode.y - sNode.y) * t;
        pArr[p * 3 + 2] = sNode.z + (eNode.z - sNode.z) * t;
      }

      posAttr.needsUpdate = true;
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
      nodeGeom.dispose();
      nodeMat.dispose();
      lineGeom.dispose();
      lineMat.dispose();
      pulseGeom.dispose();
      pulseMat.dispose();
      coreGeom.dispose();
      coreMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
      {/* 3D Brain WebGL Canvas */}
      <div className="lg:col-span-7 relative h-[440px] lg:h-[520px] xl:h-[560px] rounded-3xl glass-card border border-purple-500/40 overflow-hidden flex items-center justify-center shadow-2xl shadow-purple-950/30">
        {/* Skeleton Feedback during initialization */}
        {isLoading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90 animate-shimmer">
            <div className="relative flex flex-col items-center justify-center">
              <div className="w-56 h-56 rounded-full border border-purple-500/30 animate-pulse-glow" />
              <div className="absolute w-40 h-40 rounded-full border border-dashed border-cyan-400/30 animate-radar" />
              <div className="absolute flex flex-col items-center">
                <Brain className="w-10 h-10 text-purple-300 animate-pulse mb-2" />
                <span className="text-xs font-mono text-purple-200 font-bold">CALIBRATING 140 SYNAPSES</span>
                <span className="text-[10px] font-mono text-slate-400">Gemini Neural Network</span>
              </div>
            </div>
          </div>
        )}

        <div 
          ref={containerRef} 
          className={`w-full h-full absolute inset-0 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`} 
        />

        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B0F2F]/90 border border-purple-400/50 text-xs font-mono text-purple-200 shadow-lg font-semibold">
          <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
          <span>Gemini Neural Architecture</span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-xs font-mono text-slate-200 bg-[#0B0F2F]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700 shadow-xl">
          <span className="flex items-center gap-2 text-cyan-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>140 Cortical Nodes</span>
          </span>
          <span className="font-semibold text-purple-300">Synaptic Latency: &lt; 240ms</span>
        </div>
      </div>

      {/* Sub-System Selector & Interactive Inspector */}
      <div className="lg:col-span-5 flex flex-col gap-3 w-full">
        <div className="text-xs font-mono text-cyan-300 tracking-wider uppercase flex items-center gap-2 mb-1 font-bold">
          <Network className="w-4 h-4 text-cyan-400" />
          <span>Orchestration Sub-Systems</span>
        </div>

        <div className="space-y-2.5">
          {SUB_SYSTEMS.map(sys => {
            const isSelected = activeSystem.id === sys.id;
            return (
              <button
                key={sys.id}
                onClick={() => setActiveSystem(sys)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0E1438] border-cyan-400/90 shadow-xl shadow-cyan-500/15'
                    : 'glass-card border-slate-700/80 hover:border-slate-500 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-bold text-white">{sys.name}</span>
                  <span
                    className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border"
                    style={{ 
                      backgroundColor: `${sys.color}25`, 
                      borderColor: `${sys.color}60`,
                      color: sys.color 
                    }}
                  >
                    {sys.category}
                  </span>
                </div>
                {isSelected && (
                  <p className="text-xs sm:text-sm text-slate-200 mt-2.5 leading-relaxed font-sans">
                    {sys.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

