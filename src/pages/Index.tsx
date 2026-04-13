import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Cpu, Search, Activity, ChevronRight, Play, Zap, Globe, Database, Network, X, Layers, Cpu as Processor } from "lucide-react";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [showBrief, setShowBrief] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [insightTyped, setInsightTyped] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);

  // --- LOADER LOGIC (SESSION-BASED) ---
  useEffect(() => {
    const hasBooted = sessionStorage.getItem("mg_booted");
    if (hasBooted) {
      setIsLoading(false);
      return;
    }

    const steps = ["Initializing Neural Mesh...", "Calibrating Vision Models...", "Establishing Secure Handshake...", "Core Active"];
    const advanceLoader = () => {
      if (loadStep < steps.length) {
        const delay = loadStep === 0 ? 800 : 600;
        setTimeout(() => setLoadStep(prev => prev + 1), delay);
      } else {
        setTimeout(() => {
          setIsLoading(false);
          sessionStorage.setItem("mg_booted", "true");
        }, 1000);
      }
    };
    if (isLoading) advanceLoader();
  }, [loadStep, isLoading]);

  // --- THREE.JS SCENE ---
  useEffect(() => {
    if (!canvasRef.current || isLoading) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 12);

    // Mouse tracking
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, radius: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Scroll tracking
    let scrollY = 0, scrollTarget = 0;
    const onScroll = () => { scrollTarget = window.scrollY; };
    window.addEventListener("scroll", onScroll);

    // --- HOLOGRAPHIC GRID ---
    const gridCount = 20;
    const gridGeo = new THREE.BufferGeometry();
    const gridPos = new Float32Array(gridCount * 4 * 3);
    const gridLimit = 60; // Larger grid
    
    for(let i = 0; i <= gridCount; i++) {
        const p = (i / gridCount - 0.5) * gridLimit;
        // X Lines
        gridPos[i * 12] = -gridLimit/2; gridPos[i * 12 + 1] = 0; gridPos[i * 12 + 2] = p;
        gridPos[i * 12 + 3] = gridLimit/2; gridPos[i * 12 + 4] = 0; gridPos[i * 12 + 5] = p;
        // Z Lines
        gridPos[i * 12 + 6] = p; gridPos[i * 12 + 7] = 0; gridPos[i * 12 + 8] = -gridLimit/2;
        gridPos[i * 12 + 9] = p; gridPos[i * 12 + 10] = 0; gridPos[i * 12 + 11] = gridLimit/2;
    }
    gridGeo.setAttribute("position", new THREE.BufferAttribute(gridPos, 3));
    const gridMat = new THREE.LineBasicMaterial({ color: 0x0891b2, transparent: true, opacity: 0.02 }); // Lower opacity
    const grid = new THREE.LineSegments(gridGeo, gridMat);
    grid.position.y = -6;
    grid.position.z = -15; // Further back
    scene.add(grid);

    // --- ENHANCED PARTICLES ---
    const particleCount = 1500;
    const particleGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pOriginals = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);
    const pSizes = new Float32Array(particleCount);

    const color1 = new THREE.Color(0x06b6d4);
    const color2 = new THREE.Color(0x3b82f6);

    for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * 40;
        const y = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 30 - 5;
        pPositions[i * 3] = x;
        pPositions[i * 3 + 1] = y;
        pPositions[i * 3 + 2] = z;
        pOriginals[i * 3] = x;
        pOriginals[i * 3 + 1] = y;
        pOriginals[i * 3 + 2] = z;
        
        const mixedColor = color1.clone().lerp(color2, Math.random());
        pColors[i * 3] = mixedColor.r;
        pColors[i * 3 + 1] = mixedColor.g;
        pColors[i * 3 + 2] = mixedColor.b;
        pSizes[i] = Math.random() * 2 + 1;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(pColors, 3));
    particleGeo.setAttribute("size", new THREE.BufferAttribute(pSizes, 1));

    const particleMat = new THREE.ShaderMaterial({
        uniforms: { 
          uTime: { value: 0 }, 
          uScroll: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            varying float vAlpha;
            uniform float uTime;
            uniform float uScroll;
            uniform vec2 uMouse;
            void main() {
                vColor = color;
                vec3 pos = position;
                
                // Reactive Mouse Force
                float dist = distance(pos.xy, uMouse * 10.0);
                float force = (1.0 - smoothstep(0.0, 4.0, dist)) * 2.0;
                pos.xy += normalize(pos.xy - uMouse * 10.0) * force;

                pos.y += sin(uTime * 0.2 + position.x * 0.5) * 0.2;
                pos.y -= uScroll * 0.002;
                vAlpha = smoothstep(25.0, 2.0, length(pos.xy)) * 0.6;
                vec4 mv = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (180.0 / -mv.z);
                gl_Position = projectionMatrix * mv;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
                float d = length(gl_PointCoord - 0.5);
                if(d > 0.5) discard;
                gl_FragColor = vec4(vColor, (1.0 - d * 2.0) * vAlpha);
            }
        `,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- NEURAL CONNECTIONS ---
    const lineCount = 150;
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(lineCount * 3 * 2);
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // --- ORBITAL RINGS ---
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);
    const ringMat = new THREE.LineBasicMaterial({ color: 0x0891b2, transparent: true, opacity: 0.15 });
    
    [1.8, 2.4, 3.2].forEach((radius, i) => {
        const ringGeo = new THREE.TorusGeometry(radius, 0.01, 16, 100);
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        ring.rotation.y = (Math.random() - 0.5) * 0.5;
        ringGroup.add(ring);
    });

    // --- CORE ---
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);
    const coreMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `varying vec3 vNormal; uniform float uTime; void main(){ vNormal=normal; vec3 pos=position+normal*sin(uTime*1.5+position.y*4.0)*0.03; gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0); }`,
        fragmentShader: `varying vec3 vNormal; uniform float uTime; void main(){ float fresnel=pow(1.0-abs(dot(vNormal,vec3(0.0,0.0,1.0))),3.0); vec3 col=mix(vec3(0.06,0.71,0.83),vec3(0.03,0.1,0.4),fresnel); gl_FragColor=vec4(col, 0.3 + fresnel * 0.7); }`,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    coreGroup.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 5), coreMat));
    coreGroup.position.set(0, 0, -3);

    const clock = new THREE.Clock();
    let frameId: number;
    const animate = () => {
        const t = clock.getElapsedTime();
        scrollY += (scrollTarget - scrollY) * 0.07;
        mouse.x += (mouse.tx - mouse.x) * 0.07;
        mouse.y += (mouse.ty - mouse.y) * 0.07;

        const scrollNorm = scrollY / (document.body.scrollHeight - window.innerHeight || 1);
        camera.position.x = mouse.x * 0.6;
        camera.position.y = mouse.y * 0.4 - scrollNorm * 7;
        camera.lookAt(0, -scrollNorm * 7, -5);

        particleMat.uniforms.uTime.value = t;
        particleMat.uniforms.uScroll.value = scrollY;
        particleMat.uniforms.uMouse.value.set(mouse.x, mouse.y);
        
        coreMat.uniforms.uTime.value = t;
        coreGroup.position.y = -scrollNorm * 12;
        coreGroup.rotation.y = t * 0.3;
        coreGroup.rotation.z = t * 0.2;

        ringGroup.position.copy(coreGroup.position);
        ringGroup.children.forEach((r, i) => {
            r.rotation.z = t * (0.1 + i * 0.05);
            r.rotation.x = Math.PI/2 + Math.sin(t * 0.5 + i) * 0.1;
        });

        grid.position.z = -20 + scrollNorm * 10;
        grid.rotation.x = 0.15 + mouse.y * 0.02;

        // Optimized Neural Connection Logic
        let lineIdx = 0;
        const pPosArr = particleGeo.attributes.position.array as Float32Array;
        const mouseWorld = new THREE.Vector3(mouse.x * 15, mouse.y * 10 - scrollNorm * 7, -5);
        
        // Only sample a small subset of particles for connections to save CPU
        for (let i = 0; i < 300 && lineIdx < lineCount; i++) {
            const pIdx = Math.floor(i * (particleCount / 300));
            const px = pPosArr[pIdx * 3];
            const py = pPosArr[pIdx * 3 + 1];
            const pz = pPosArr[pIdx * 3 + 2];
            
            const dx = px - mouseWorld.x;
            const dy = py - mouseWorld.y;
            const dz = pz - mouseWorld.z;
            const distSq = dx*dx + dy*dy + dz*dz;

            if (distSq < 25.0) { // Radius of 5
                for (let j = 0; j < 10; j++) {
                    const oIdx = (pIdx + j + 1) % particleCount;
                    const px2 = pPosArr[oIdx * 3];
                    const py2 = pPosArr[oIdx * 3 + 1];
                    const pz2 = pPosArr[oIdx * 3 + 2];
                    
                    const d2 = (px-px2)*(px-px2) + (py-py2)*(py-py2) + (pz-pz2)*(pz-pz2);
                    if (d2 < 2.0) {
                        linePositions[lineIdx * 6] = px;
                        linePositions[lineIdx * 6 + 1] = py;
                        linePositions[lineIdx * 6 + 2] = pz;
                        linePositions[lineIdx * 6 + 3] = px2;
                        linePositions[lineIdx * 6 + 4] = py2;
                        linePositions[lineIdx * 6 + 5] = pz2;
                        lineIdx++;
                        break;
                    }
                }
            }
        }
        // Fill remaining lines off-screen
        for(let i = lineIdx; i < lineCount; i++) {
            linePositions[i * 6] = 1000;
        }
        lineGeo.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(frameId);
        renderer.dispose();
    };
  }, [isLoading]);

  const typeInsight = () => {
    if (insightTyped) return;
    setInsightTyped(true);
    const text = "Decision Engine: Asset attribution complete. Semantic match found at 98.4% confidence. Structural fingerprint indicates 12% pixel manipulation. Recommended Action: IP Rights Enforcement.";
    let i = 0;
    const interval = setInterval(() => {
        if (typedRef.current) {
            if (i < text.length) {
                typedRef.current.textContent += text[i];
                i++;
            } else {
                clearInterval(interval);
                if (statusRef.current) {
                    statusRef.current.textContent = "VERIFIED_TRUST";
                    statusRef.current.classList.add("text-cyan-400");
                }
            }
        }
    }, 15);
  };

  return (
    <div className="new-ui-root relative min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#030712]"
          >
            <div className="relative mb-12 h-24 w-24">
              <div className="absolute inset-0 animate-[spin_2s_linear_infinite] rounded-full border-b-[3px] border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
              <div className="absolute inset-4 animate-[spin_3s_linear_infinite_reverse] rounded-full border-t-[3px] border-blue-500/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="h-8 w-8 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <motion.h2 
              initial={{ letterSpacing: "0.2em", opacity: 0.5 }}
              animate={{ letterSpacing: "0.5em", opacity: 1 }}
              transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
              className="text-[10px] font-black uppercase text-cyan-500"
            >
              Booting Media Guardian
            </motion.h2>
            <div className="mt-12 flex gap-2">
              {[0, 1, 2, 3].map(i => (
                <motion.div 
                  key={i} 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: i < loadStep ? 1 : 0 }}
                  className={`h-[3px] w-12 origin-left rounded-full transition-colors duration-500 ${i < loadStep ? "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" : "bg-slate-800"}`} 
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-80" />

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center"
        >
          <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            Real-Time Attribution Active
          </div>
          <h1 className="max-w-6xl text-6xl font-black leading-[1] tracking-tighter text-white sm:text-9xl">
            THE APEX OF <br/> 
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent italic">CONTENT TRUST</span>
          </h1>
          <p className="mx-auto mt-12 max-w-2xl text-lg font-medium leading-relaxed text-slate-400">
            Secure your intellectual property with world-class multimodal intelligence. 
            Automated verification, rights enforcement, and brand integrity at scale.
          </p>
          <div className="mt-16 flex flex-wrap justify-center gap-8">
            <Link to="/upload" className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-cyan-600 px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-cyan-600/30 transition-all hover:bg-cyan-500 hover:-translate-y-1">
              <span className="relative z-10">Initiate Ingestion</span>
              <Play className="relative z-10 h-4 w-4 fill-white" />
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Link>
            <button 
              onClick={() => setShowBrief(true)}
              className="rounded-2xl border border-white/10 bg-white/5 px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] backdrop-blur-xl transition hover:bg-white/10 hover:-translate-y-1"
            >
              Architecture Brief
            </button>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
          className="absolute bottom-12 flex flex-col items-center gap-4"
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-500">Decrypting Protocol</span>
          <div className="h-12 w-[1px] bg-gradient-to-b from-cyan-500/50 to-transparent" />
        </motion.div>
      </section>

      {/* Capabilities Section */}
      <section className="mx-auto max-w-7xl px-6 py-40">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
          className="grid gap-8 md:grid-cols-3"
        >
          {[
            { title: "Structural Analysis", tag: "pHash", icon: Shield, desc: "Perceptual hashing identifies structural mirrors even after color shifts, cropping, or resolution downgrades." },
            { title: "Semantic Intelligence", tag: "Neural Embeddings", icon: Cpu, desc: "Content-aware vectors detect similar subject matter and context beyond pixel-to-pixel comparison." },
            { title: "Reasoning Engine", tag: "LMM Gemini", icon: Search, desc: "Our Gemini-powered reasoning engine explains *why* content was flagged with human-like visual understanding." }
          ].map((item, i) => (
            <motion.div 
              key={item.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0 }
              }}
              className="group glass-obsidian p-12 rounded-[2.5rem] transition-all duration-500 hover:border-cyan-500/40 hover:glow-cyan"
            >
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500 group-hover:scale-110 transition-transform duration-500">
                <item.icon className="h-7 w-7" />
              </div>
              <div className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-4">{item.tag}</div>
              <h4 className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{item.title}</h4>
              <p className="mt-6 text-base font-medium leading-relaxed text-slate-400">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Insight Panel Preview */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          onViewportEnter={typeInsight}
          className="glass-obsidian p-16 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-64 w-64 bg-cyan-600/5 blur-[100px] pointer-events-none" />
          <div className="flex items-center justify-between mb-12 pb-8 border-b border-white/5">
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-xl">
                <Activity className="h-7 w-7 text-white animate-pulse" />
              </div>
              <div>
                <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">System Diagnosis Log-01</h5>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Status: Active Analysis</p>
              </div>
            </div>
            <span ref={statusRef} className="text-[10px] font-mono font-black text-slate-500 tracking-[0.3em] border border-white/10 px-4 py-1.5 rounded-full">
              CALIBRATING...
            </span>
          </div>
          <div className="min-h-[120px] text-2xl font-semibold italic text-slate-200 leading-snug border-l-4 border-cyan-500/40 pl-10">
            <span ref={typedRef} /><span className="inline-block h-8 w-1 bg-cyan-400 animate-pulse align-middle ml-3" />
          </div>
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-12">
            {[["Integrity", "98.4%"], ["Similarity", "0.94x"], ["Compute", "0.2ms"], ["Auth", "Verified"]].map(([l, v]) => (
              <div key={l} className="group">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 group-hover:text-cyan-500/50 transition-colors">{l}</div>
                <div className="text-xl font-black text-white group-hover:translate-x-1 transition-transform">{v}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section - Fixed UI */}
      <section className="mx-auto max-w-7xl px-6 py-40">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[4rem] glass-obsidian p-24 text-center border-white/5 hover:border-cyan-500/20 transition-colors duration-700"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative z-10">
            <div className="mx-auto mb-10 h-16 w-16 rounded-3xl bg-cyan-500/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-cyan-400" />
            </div>
            <h2 className="text-4xl font-black text-white sm:text-7xl uppercase tracking-tighter leading-none">
              SECURE YOUR <br/> <span className="text-cyan-500">DIGITAL FRONTIER</span>
            </h2>
            <p className="mt-8 text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
              Join the elite circle of enterprises ensuring multimodal content integrity across the global workspace.
            </p>
              <Link to="/upload" className="group relative flex items-center gap-3 rounded-[2rem] bg-cyan-600 px-14 py-6 text-[12px] font-black uppercase tracking-[0.3em] text-white transition-all hover:scale-105 hover:bg-cyan-500 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)]">
                Scan Content <ChevronRight className="h-4 w-4 relative z-10 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Link>
              <button 
                onClick={() => setShowBrief(true)}
                className="rounded-[2rem] border border-white/10 bg-white/5 px-14 py-6 text-[12px] font-black uppercase tracking-[0.3em] backdrop-blur-3xl transition hover:bg-white/10"
              >
                Architecture Brief
              </button>
          </div>
        </motion.div>
      </section>

      <footer className="py-24 text-center border-t border-white/5 bg-slate-950/40 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="h-6 w-6 rounded bg-cyan-600 flex items-center justify-center font-black text-white text-[8px]">MG</div>
             <span className="text-xs font-black uppercase tracking-[0.4em]">Media Guardian</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-600">
            Engineered for Content Sovereignty &bull; 2026
          </p>
        </div>
      </footer>

      {/* Architecture Brief Overlay */}
      <AnimatePresence>
        {showBrief && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl glass-obsidian rounded-[3rem] overflow-hidden border-cyan-500/30 flex flex-col md:flex-row h-[80vh]"
            >
              <button 
                onClick={() => setShowBrief(false)}
                className="absolute top-8 right-8 h-12 w-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors z-50 text-white"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="w-full md:w-1/3 p-12 border-b md:border-b-0 md:border-r border-white/5 bg-cyan-500/5">
                <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-8">
                  <Shield className="h-7 w-7" />
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Architecture<br/><span className="text-cyan-500">Protocol-01</span></h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  The Media Guardian engine utilizes a proprietary hybrid tensor network for cross-domain integrity verification.
                </p>
                <div className="space-y-6">
                  {[
                    { l: "Encryption", v: "AES-512 Quantum-Ready", icon: Lock },
                    { l: "Latency", v: "< 140ms Global E2E", icon: Zap },
                    { l: "Accuracy", v: "99.98% Confidence", icon: Activity }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.l}</p>
                        <p className="text-[11px] font-bold text-white">{item.v}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.05),transparent_50%)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {[
                    {
                      title: "Neural Ingestion",
                      icon: Cpu,
                      desc: "Multimodal content decomposition using distributed validator nodes.",
                      stats: ["4.2TB/s Throughput", "Vector Mapping"]
                    },
                    {
                      title: "Consensus Layer",
                      icon: Network,
                      desc: "Byzantine fault-tolerant rights verification across 12 node clusters.",
                      stats: ["Proof of Source", "Zero-Knowledge"]
                    },
                    {
                      title: "Global CDN",
                      icon: Globe,
                      desc: "Sub-millisecond delivery via globally distributed edge architecture.",
                      stats: ["Edge Compute", "Auto-Heal"]
                    },
                    {
                      title: "Quantum DB",
                      icon: Database,
                      desc: "Immutable ledger tracking for permanent content provenance.",
                      stats: ["3.4B Records", "Shard-Optimized"]
                    }
                  ].map((block, idx) => (
                    <div key={idx} className="p-8 rounded-[2rem] border border-white/5 hover:border-cyan-500/20 transition-all bg-white/[0.02]">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                          <block.icon className="h-5 w-5" />
                        </div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight">{block.title}</h4>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed mb-6">{block.desc}</p>
                      <div className="flex gap-3">
                        {block.stats.map(s => (
                          <span key={s} className="px-3 py-1 rounded-full bg-white/5 text-[9px] font-black text-cyan-500/70 border border-white/5">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-12 p-8 rounded-[2rem] border border-cyan-500/20 bg-cyan-500/5">
                  <div className="flex items-center gap-4 mb-4">
                    <Activity className="h-5 w-5 text-cyan-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">System Health: Optimal</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
