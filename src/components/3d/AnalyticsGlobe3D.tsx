import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Globe, 
  Radio, 
  PhoneCall, 
  TrendingUp, 
  ShieldCheck, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  FileCode, 
  Check, 
  ChevronDown, 
  Sparkles,
  Zap,
  Activity,
  Wifi,
  BarChart3,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { ThreeDGlobeSkeleton } from '../ui/SkeletonLoader';
import { exportMetricsAsCSV, exportMetricsAsPDF, CallCenterMetricsData } from '../../utils/exportMetrics';
import { RealtimeSentimentTrendChart } from '../analytics/RealtimeSentimentTrendChart';
import { SentimentRechart60s } from '../analytics/SentimentRechart60s';

interface CityHub {
  name: string;
  lat: number;
  lng: number;
  calls: string;
  avgLatencyMs: number;
  p99LatencyMs: number;
  throughputGbps: string;
  resolutionRate: string;
  status: 'OPTIMAL' | 'HIGH CAPACITY' | 'PEAK PERFORMANCE';
  regionCode: string;
}

const GLOBAL_HUBS: CityHub[] = [
  { 
    name: 'San Francisco', 
    lat: 37.7749, 
    lng: -122.4194, 
    calls: '14,290/hr', 
    avgLatencyMs: 210, 
    p99LatencyMs: 245, 
    throughputGbps: '1.42 Gbps', 
    resolutionRate: '94.2%', 
    status: 'OPTIMAL',
    regionCode: 'US-WEST-1'
  },
  { 
    name: 'New York', 
    lat: 40.7128, 
    lng: -74.0060, 
    calls: '22,410/hr', 
    avgLatencyMs: 195, 
    p99LatencyMs: 220, 
    throughputGbps: '2.18 Gbps', 
    resolutionRate: '95.1%', 
    status: 'OPTIMAL',
    regionCode: 'US-EAST-1'
  },
  { 
    name: 'London', 
    lat: 51.5074, 
    lng: -0.1278, 
    calls: '18,800/hr', 
    avgLatencyMs: 230, 
    p99LatencyMs: 260, 
    throughputGbps: '1.84 Gbps', 
    resolutionRate: '92.8%', 
    status: 'OPTIMAL',
    regionCode: 'EU-WEST-2'
  },
  { 
    name: 'Frankfurt', 
    lat: 50.1109, 
    lng: 8.6821, 
    calls: '9,340/hr', 
    avgLatencyMs: 225, 
    p99LatencyMs: 250, 
    throughputGbps: '1.12 Gbps', 
    resolutionRate: '91.4%', 
    status: 'PEAK PERFORMANCE',
    regionCode: 'EU-CENTRAL-1'
  },
  { 
    name: 'Tokyo', 
    lat: 35.6762, 
    lng: 139.6503, 
    calls: '12,980/hr', 
    avgLatencyMs: 240, 
    p99LatencyMs: 280, 
    throughputGbps: '1.35 Gbps', 
    resolutionRate: '93.5%', 
    status: 'OPTIMAL',
    regionCode: 'AP-NORTHEAST-1'
  },
  { 
    name: 'Singapore', 
    lat: 1.3521, 
    lng: 103.8198, 
    calls: '8,420/hr', 
    avgLatencyMs: 250, 
    p99LatencyMs: 290, 
    throughputGbps: '0.94 Gbps', 
    resolutionRate: '92.0%', 
    status: 'OPTIMAL',
    regionCode: 'AP-SOUTHEAST-1'
  },
  { 
    name: 'Sydney', 
    lat: -33.8688, 
    lng: 151.2093, 
    calls: '6,110/hr', 
    avgLatencyMs: 260, 
    p99LatencyMs: 310, 
    throughputGbps: '0.78 Gbps', 
    resolutionRate: '89.6%', 
    status: 'HIGH CAPACITY',
    regionCode: 'AP-SOUTHEAST-2'
  },
  { 
    name: 'São Paulo', 
    lat: -23.5505, 
    lng: -46.6333, 
    calls: '7,890/hr', 
    avgLatencyMs: 275, 
    p99LatencyMs: 325, 
    throughputGbps: '0.85 Gbps', 
    resolutionRate: '90.4%', 
    status: 'OPTIMAL',
    regionCode: 'SA-EAST-1'
  }
];

export const getLatencyHeatColor = (avgLatencyMs: number) => {
  if (avgLatencyMs <= 200) {
    return { colorHex: 0x10B981, cssColor: '#10B981', label: 'Low Latency (<200ms)', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50' };
  } else if (avgLatencyMs <= 235) {
    return { colorHex: 0x00D4FF, cssColor: '#00D4FF', label: 'Optimal (200-235ms)', badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50' };
  } else if (avgLatencyMs <= 255) {
    return { colorHex: 0xF59E0B, cssColor: '#F59E0B', label: 'Moderate (235-255ms)', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/50' };
  } else {
    return { colorHex: 0xEF4444, cssColor: '#EF4444', label: 'High Latency (>255ms)', badgeClass: 'bg-red-500/20 text-red-300 border-red-400/50' };
  }
};

export const AnalyticsGlobe3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCallCount, setActiveCallCount] = useState<number>(10428);
  const [selectedHub, setSelectedHub] = useState<CityHub>(GLOBAL_HUBS[0]);
  const [hoveredHub, setHoveredHub] = useState<CityHub | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  const showHeatmapRef = useRef<boolean>(true);
  useEffect(() => {
    showHeatmapRef.current = showHeatmap;
  }, [showHeatmap]);

  // Convert lat/lng to 3D Cartesian coordinates on sphere
  const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const globeRadius = 5.2;
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Globe Particle Surface
    const particleCount = 2000;
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      pos[i * 3] = globeRadius * Math.cos(theta) * Math.sin(phi);
      pos[i * 3 + 1] = globeRadius * Math.sin(theta) * Math.sin(phi);
      pos[i * 3 + 2] = globeRadius * Math.cos(phi);
    }
    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x3B42D4,
      size: 0.12,
      transparent: true,
      opacity: 0.65,
    });
    const globePoints = new THREE.Points(particleGeom, particleMat);
    globeGroup.add(globePoints);

    // 2. Wireframe Sphere Overlay
    const wireGeom = new THREE.SphereGeometry(globeRadius, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x1A1F5E,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireSphere = new THREE.Mesh(wireGeom, wireMat);
    globeGroup.add(wireSphere);

    // 3. Color-Coded Latency Heat Map Canvas Overlay
    const heatCanvas = document.createElement('canvas');
    heatCanvas.width = 1024;
    heatCanvas.height = 512;
    const heatCtx = heatCanvas.getContext('2d');

    const drawHeatmap = () => {
      if (!heatCtx) return;
      heatCtx.clearRect(0, 0, heatCanvas.width, heatCanvas.height);

      GLOBAL_HUBS.forEach(hub => {
        const u = (hub.lng + 180) / 360;
        const v = (90 - hub.lat) / 180;
        const cx = u * heatCanvas.width;
        const cy = v * heatCanvas.height;

        const { cssColor } = getLatencyHeatColor(hub.avgLatencyMs);
        const radius = 100;
        const grad = heatCtx.createRadialGradient(cx, cy, 0, cx, cy, radius);

        const r = cssColor === '#10B981' ? '16, 185, 129' :
                  cssColor === '#00D4FF' ? '0, 212, 255' :
                  cssColor === '#F59E0B' ? '245, 158, 11' : '239, 68, 68';

        grad.addColorStop(0, `rgba(${r}, 0.85)`);
        grad.addColorStop(0.35, `rgba(${r}, 0.5)`);
        grad.addColorStop(0.7, `rgba(${r}, 0.2)`);
        grad.addColorStop(1, `rgba(${r}, 0)`);

        heatCtx.fillStyle = grad;
        heatCtx.beginPath();
        heatCtx.arc(cx, cy, radius, 0, Math.PI * 2);
        heatCtx.fill();
      });
    };

    drawHeatmap();

    const heatTexture = new THREE.CanvasTexture(heatCanvas);
    const heatSphereGeom = new THREE.SphereGeometry(globeRadius + 0.08, 64, 64);
    const heatSphereMat = new THREE.MeshBasicMaterial({
      map: heatTexture,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const heatSphereMesh = new THREE.Mesh(heatSphereGeom, heatSphereMat);
    globeGroup.add(heatSphereMesh);

    // 4. Hub Markers, Pulsing Latency Rings & Connecting Arcs
    const hubPoints: THREE.Vector3[] = [];
    const heatRings: { mesh: THREE.Mesh; hub: CityHub }[] = [];

    GLOBAL_HUBS.forEach(hub => {
      const vec = latLngToVector3(hub.lat, hub.lng, globeRadius);
      hubPoints.push(vec);

      const { colorHex } = getLatencyHeatColor(hub.avgLatencyMs);

      // Hub glowing beacon
      const beaconGeom = new THREE.SphereGeometry(0.18, 12, 12);
      const beaconMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const beacon = new THREE.Mesh(beaconGeom, beaconMat);
      beacon.position.copy(vec);
      globeGroup.add(beacon);

      // Pulsing Heat Ring Mesh
      const ringGeom = new THREE.RingGeometry(0.2, 0.48, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      const ringPos = latLngToVector3(hub.lat, hub.lng, globeRadius + 0.12);
      ringMesh.position.copy(ringPos);
      ringMesh.lookAt(ringPos.clone().multiplyScalar(2));
      globeGroup.add(ringMesh);

      heatRings.push({ mesh: ringMesh, hub });
    });

    // Create 3D Curved Arcs between global hubs
    for (let i = 0; i < hubPoints.length; i++) {
      for (let j = i + 1; j < hubPoints.length; j++) {
        if (Math.random() > 0.4) {
          const v1 = hubPoints[i];
          const v2 = hubPoints[j];
          const mid = v1.clone().add(v2).multiplyScalar(0.5);
          mid.normalize().multiplyScalar(globeRadius + 1.8);

          const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
          const points = curve.getPoints(30);
          const arcGeom = new THREE.BufferGeometry().setFromPoints(points);

          const arcMat = new THREE.LineBasicMaterial({
            color: Math.random() > 0.5 ? 0x00D4FF : 0xA855F7,
            transparent: true,
            opacity: 0.45,
          });

          const arcLine = new THREE.Line(arcGeom, arcMat);
          globeGroup.add(arcLine);
        }
      }
    }

    setIsLoading(false);

    // Optimized WebGL Render Loop with Viewport Visibility Detection
    let isVisible = true;
    let observer: IntersectionObserver | null = null;

    if (containerRef.current && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
      }, { threshold: 0.05 });
      observer.observe(containerRef.current);
    }

    let animationFrameId: number;
    let lastTime = 0;
    const targetFpsInterval = 1000 / 45; // Smooth 45 FPS ceiling saves GPU/CPU resources

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // Skip GPU rendering completely when 3D Globe is scrolled out of viewport
      if (!isVisible) return;

      const delta = currentTime - lastTime;
      if (delta > targetFpsInterval) {
        lastTime = currentTime - (delta % targetFpsInterval);
        globeGroup.rotation.y += 0.002;
        globeGroup.rotation.x = Math.sin(currentTime * 0.0004) * 0.08;

        // Pulsate 3D Latency Heat Map Overlay and Rings
        const isHeatmapActive = showHeatmapRef.current;
        heatSphereMesh.visible = isHeatmapActive;

        heatRings.forEach((item, idx) => {
          item.mesh.visible = isHeatmapActive;
          if (isHeatmapActive) {
            const pulse = 1.0 + Math.sin(currentTime * 0.004 + idx * 0.8) * 0.35;
            item.mesh.scale.set(pulse, pulse, 1);
            (item.mesh.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(currentTime * 0.004 + idx * 0.8) * 0.3;
          }
        });

        renderer.render(scene, camera);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    // Resize Handler
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
      if (observer) observer.disconnect();
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Fluctuate call volume dynamically
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCallCount(prev => prev + Math.floor(Math.random() * 11) - 5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Export real-time telemetry metrics dataset
  const handleExport = (format: 'json' | 'csv' | 'pdf') => {
    const payload: CallCenterMetricsData = {
      concurrentStreams: activeCallCount,
      resolutionRate: '92.4%',
      avgLatency: '1.24s',
      monthlySavings: '$4.2M+',
      csat: '4.85 / 5.0',
      reportDate: new Date().toLocaleString(),
      hubs: GLOBAL_HUBS.map((h) => ({
        name: h.name,
        lat: h.lat,
        lng: h.lng,
        calls: h.calls,
        status: h.status,
        avgLatencyMs: h.avgLatencyMs,
        resolutionRate: h.resolutionRate
      })),
      intents: [
        { name: 'Order Status & Logistics Tracking', percentage: 42, volume: '6,120 calls/hr' },
        { name: 'Dispute Charge & Instant Refund', percentage: 28, volume: '4,080 calls/hr' },
        { name: 'Flight Status & Autonomous Rebooking', percentage: 18, volume: '2,620 calls/hr' },
        { name: 'Smart IoT Hardware Diagnostics', percentage: 12, volume: '1,750 calls/hr' }
      ]
    };

    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `telephony_analytics_edge_data_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setExportToast('Downloaded JSON Analytics Dataset');
    } else if (format === 'csv') {
      exportMetricsAsCSV(payload);
      setExportToast('Downloaded Metrics CSV Spreadsheet');
    } else {
      exportMetricsAsPDF(payload);
      setExportToast('Downloaded Executive PDF Metrics Report');
    }

    setIsExportMenuOpen(false);
    setTimeout(() => {
      setExportToast(null);
    }, 4000);
  };

  const currentDisplayHub = hoveredHub || selectedHub;

  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls Section */}
      <div className="rounded-3xl glass-card border border-cyan-500/30 p-5 sm:p-6 bg-slate-950 shadow-2xl space-y-4 relative z-40 overflow-visible">
        {/* Row 1: Badges & Export Action Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900 border border-cyan-400/80 text-xs sm:text-sm font-mono text-cyan-200 shadow-xl font-bold">
              <Globe className="w-4 h-4 text-cyan-300 animate-spin-slow shrink-0" />
              <span>Global Distributed Edge (25+ Languages)</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900 border border-emerald-400/80 text-xs font-mono text-emerald-300 shadow-xl font-bold">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-ping shrink-0" />
              <span>Live Telephony Streams</span>
            </div>
          </div>

          {/* Export Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end relative z-50">
            {/* Dedicated Prominent Download PDF Report Button */}
            <button
              onClick={() => handleExport('pdf')}
              title="Generate and download formatted Executive PDF Report"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-mono text-xs font-black shadow-xl shadow-purple-500/25 transition-all cursor-pointer select-none active:scale-95 border border-purple-300/40 hover:scale-105"
            >
              <FileText className="w-4 h-4 text-purple-200 animate-pulse shrink-0" />
              <span>Download PDF Report</span>
            </button>

            {/* Direct Quick JSON Export Button */}
            <button
              onClick={() => handleExport('json')}
              title="Download raw telemetry dataset as JSON"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/50 hover:border-cyan-300 text-xs font-mono text-cyan-200 hover:text-white shadow-md transition-all cursor-pointer font-bold active:scale-95"
            >
              <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Export JSON</span>
            </button>

            {/* Export Dropdown Menu */}
            <div className="relative z-50" ref={exportMenuRef}>
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                title="Export current real-time call center metrics"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-mono text-xs font-black shadow-xl shadow-cyan-500/25 transition-all cursor-pointer select-none active:scale-95 border border-cyan-300/40"
              >
                <Download className="w-4 h-4 text-white shrink-0" />
                <span>Export Report</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white transition-transform duration-200 shrink-0 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isExportMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2.5rem)] rounded-2xl bg-slate-950/98 border-2 border-cyan-400/90 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-[150] animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-extrabold border-b border-slate-800 flex items-center justify-between mb-2">
                    <span>Export Operational Data</span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </div>

                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-cyan-500/20 text-left text-xs font-mono transition-all group cursor-pointer border border-transparent hover:border-cyan-400/40"
                    >
                      <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 group-hover:scale-105 transition-transform shrink-0">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-white group-hover:text-cyan-200 block">
                          JSON Dataset (.json)
                        </span>
                        <span className="text-[10px] text-slate-300 leading-tight block">
                          Structured telemetry & edge hub stream metrics
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-emerald-500/20 text-left text-xs font-mono transition-all group cursor-pointer border border-transparent hover:border-emerald-400/40"
                    >
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 group-hover:scale-105 transition-transform shrink-0">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-white group-hover:text-emerald-200 block">
                          CSV Spreadsheet (.csv)
                        </span>
                        <span className="text-[10px] text-slate-300 leading-tight block">
                          Tabular dataset with 8 PoP edge hubs & intents
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-purple-500/20 text-left text-xs font-mono transition-all group cursor-pointer border border-transparent hover:border-purple-400/40"
                    >
                      <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/50 group-hover:scale-105 transition-transform shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-white group-hover:text-purple-200 block">
                          Executive PDF Report (.pdf)
                        </span>
                        <span className="text-[10px] text-slate-300 leading-tight block">
                          Formal executive summary with CSAT & ROI charts
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Interactive Edge Hub Selection Chips Bar with Hover Tooltips */}
        <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin scrollbar-thumb-cyan-500/40">
            <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider shrink-0 font-extrabold flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950 rounded-xl border border-cyan-500/40">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Active Edge Hub:
            </span>
            {GLOBAL_HUBS.map(hub => {
              const isSelected = selectedHub.name === hub.name;
              const isHovered = hoveredHub?.name === hub.name;

              return (
                <div key={hub.name} className="relative group shrink-0">
                  <button
                    onClick={() => setSelectedHub(hub)}
                    onMouseEnter={() => setHoveredHub(hub)}
                    onMouseLeave={() => setHoveredHub(null)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-950 shadow-lg shadow-cyan-500/30 font-black border border-white scale-105'
                        : isHovered
                        ? 'bg-cyan-500/30 text-white border border-cyan-300 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950 text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/60'
                    }`}
                  >
                    <span>{hub.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${isSelected ? 'bg-slate-950/30 text-slate-950 font-black' : 'bg-slate-900 text-cyan-300 border border-slate-800'}`}>
                      {hub.calls}
                    </span>
                  </button>

                  {/* Interactive High-Visibility Hover Tooltip */}
                  {isHovered && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-72 p-3.5 rounded-2xl bg-slate-950/98 border-2 border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.35)] backdrop-blur-2xl z-[100] animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                          <span className="font-extrabold text-white text-xs font-mono">{hub.name} Edge PoP</span>
                        </div>
                        <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
                          {hub.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block text-[9px]">Avg Turn Latency</span>
                          <span className="font-extrabold text-cyan-300 text-xs">{hub.avgLatencyMs} ms</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block text-[9px]">P99 Tail SLA</span>
                          <span className="font-extrabold text-purple-300 text-xs">{hub.p99LatencyMs} ms</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block text-[9px]">Network Throughput</span>
                          <span className="font-extrabold text-emerald-300 text-xs">{hub.throughputGbps}</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block text-[9px]">Self-Service FCR</span>
                          <span className="font-extrabold text-amber-300 text-xs">{hub.resolutionRate}</span>
                        </div>
                      </div>

                      <div className="mt-2 text-[9px] font-mono text-cyan-300/90 flex items-center justify-between pt-1.5 border-t border-slate-800">
                        <span>Region: {hub.regionCode}</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          {hub.calls} <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. 3D WebGL Holographic Globe Viewport with Dynamic Stage Telemetry Overlay */}
      <div className="relative w-full h-[400px] sm:h-[460px] lg:h-[500px] rounded-3xl glass-card border border-blue-500/40 overflow-hidden flex items-center justify-center shadow-2xl shadow-blue-950/30 bg-slate-950">
        {/* Skeleton Feedback during initialization */}
        {isLoading && (
          <div className="absolute inset-0 z-30">
            <ThreeDGlobeSkeleton />
          </div>
        )}

        {/* 3D WebGL Canvas */}
        <div 
          ref={containerRef} 
          className={`w-full h-full absolute inset-0 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`} 
        />

        {/* Dynamic Stage Telemetry HUD for Selected / Hovered Edge Hub */}
        <div className="absolute top-4 left-4 z-20 p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/60 shadow-2xl backdrop-blur-xl max-w-xs transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="font-extrabold text-white font-mono text-xs">
                {currentDisplayHub.name} ({currentDisplayHub.regionCode})
              </span>
            </div>
            <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/50">
              {currentDisplayHub.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Avg Latency:</span>
              <span className="font-black text-cyan-300">{currentDisplayHub.avgLatencyMs} ms</span>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Throughput:</span>
              <span className="font-black text-emerald-300">{currentDisplayHub.throughputGbps}</span>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Hourly Streams:</span>
              <span className="font-black text-purple-300">{currentDisplayHub.calls}</span>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Resolution:</span>
              <span className="font-black text-amber-300">{currentDisplayHub.resolutionRate}</span>
            </div>
          </div>
        </div>

        {/* Heatmap Layer Controls & Color Spectrum Legend HUD Overlay */}
        <div className="absolute top-4 right-4 z-20 p-3 sm:p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-500/50 shadow-2xl backdrop-blur-xl flex flex-col gap-2 max-w-[210px] sm:max-w-xs transition-all">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-extrabold text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
              <span>Latency Heatmap</span>
            </div>
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-black transition-all cursor-pointer border ${
                showHeatmap 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 border-emerald-300 shadow-md shadow-emerald-500/25 scale-105' 
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {showHeatmap ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Color Gradient Spectrum Legend */}
          <div className="space-y-1 pt-1.5 border-t border-slate-800 text-[10px] font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Regional SLA Latency</span>
              <span className="text-[9px] text-cyan-300 font-bold">{showHeatmap ? 'Active Spectrum' : 'Hidden'}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 via-amber-400 to-red-500 border border-slate-700 shadow-inner" />
            <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold">
              <span className="text-emerald-400">&lt;200ms</span>
              <span className="text-cyan-300">210-235ms</span>
              <span className="text-amber-400">240-255ms</span>
              <span className="text-red-400">&gt;255ms</span>
            </div>
          </div>
        </div>

        {/* Export Toast Notification */}
        {exportToast && (
          <div className="absolute top-20 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-950/95 border border-emerald-400/80 text-emerald-200 font-mono text-xs shadow-2xl backdrop-blur-md animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">{exportToast}</span>
          </div>
        )}
      </div>

      {/* 3. Floating Hub Data Selector & Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/95 backdrop-blur-xl p-5 rounded-2xl border border-slate-700/90 shadow-2xl">
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-inner">
          <span className="text-xs uppercase font-mono text-slate-300 font-bold block mb-1">Concurrent Streams</span>
          <p className="text-xl sm:text-2xl font-black font-mono text-cyan-300">{activeCallCount.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-inner">
          <span className="text-xs uppercase font-mono text-slate-300 font-bold block mb-1">Global Resolution</span>
          <p className="text-xl sm:text-2xl font-black font-mono text-emerald-400">92.4%</p>
        </div>
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-inner">
          <span className="text-xs uppercase font-mono text-slate-300 font-bold block mb-1">Avg Turn Latency</span>
          <p className="text-xl sm:text-2xl font-black font-mono text-purple-300">1.24s</p>
        </div>
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-inner flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-mono text-slate-300 font-bold block mb-1">Monthly Savings</span>
            <p className="text-xl sm:text-2xl font-black font-mono text-amber-300">$4.2M+</p>
          </div>
          <div className="hidden lg:flex flex-col gap-1.5">
            <button
              onClick={() => handleExport('json')}
              title="Quick Export JSON"
              className="text-[10px] font-mono font-bold text-cyan-300 hover:text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-cyan-500/40 hover:border-cyan-300 cursor-pointer shadow-sm active:scale-95 transition-all"
            >
              .JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              title="Quick Export CSV"
              className="text-[10px] font-mono font-bold text-emerald-300 hover:text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-emerald-500/40 hover:border-emerald-300 cursor-pointer shadow-sm active:scale-95 transition-all"
            >
              .CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              title="Quick Export PDF"
              className="text-[10px] font-mono font-bold text-purple-300 hover:text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-purple-500/40 hover:border-purple-300 cursor-pointer shadow-sm active:scale-95 transition-all"
            >
              .PDF
            </button>
          </div>
        </div>
      </div>

      {/* 4. Recharts Real-Time 60-Second Sentiment Trend Line Chart */}
      <SentimentRechart60s selectedHubName={selectedHub.name} />

      {/* 5. D3 Real-Time Sentiment Polarity Trends Visualizer */}
      <RealtimeSentimentTrendChart selectedHubName={selectedHub.name} />
    </div>
  );
};
