import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadStep, setLoadStep] = useState(0);
  const [insightTyped, setInsightTyped] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const insightRef = useRef<HTMLDivElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);

  // --- LOADER LOGIC ---
  useEffect(() => {
    const steps = ["Loading neural models...", "Preparing analysis pipeline...", "Calibrating detection engine...", "System ready"];
    const advanceLoader = () => {
      if (loadStep < steps.length) {
        setTimeout(() => {
          setLoadStep(prev => prev + 1);
        }, 600);
      } else {
        setTimeout(() => {
          setIsLoading(false);
        }, 1200);
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
    renderer.toneMappingExposure = 1.2;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 12);

    // Mouse tracking
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Scroll tracking
    let scrollY = 0, scrollTarget = 0;
    const onScroll = () => { scrollTarget = window.scrollY; };
    window.addEventListener("scroll", onScroll);

    // --- PARTICLES ---
    const particleCount = 2000;
    const particleGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);
    const pSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        pPositions[i * 3] = (Math.random() - 0.5) * 40;
        pPositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
        pPositions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
        const color = new THREE.Color().setHSL(0.7 + Math.random() * 0.15, 0.8, 0.4 + Math.random() * 0.3);
        pColors[i * 3] = color.r;
        pColors[i * 3 + 1] = color.g;
        pColors[i * 3 + 2] = color.b;
        pSizes[i] = Math.random() * 3 + 0.5;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(pColors, 3));
    particleGeo.setAttribute("size", new THREE.BufferAttribute(pSizes, 1));

    const particleMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uScroll: { value: 0 } },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            varying float vAlpha;
            uniform float uTime;
            uniform float uScroll;
            void main() {
                vColor = color;
                vec3 pos = position;
                pos.y += sin(uTime * 0.3 + position.x * 0.5) * 0.3;
                pos.x += cos(uTime * 0.2 + position.z * 0.3) * 0.2;
                pos.y -= uScroll * 0.002;
                float d = length(pos.xy);
                vAlpha = smoothstep(20.0, 5.0, d) * 0.7;
                vec4 mv = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (200.0 / -mv.z);
                gl_Position = projectionMatrix * mv;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
                float d = length(gl_PointCoord - 0.5);
                if(d > 0.5) discard;
                float alpha = smoothstep(0.5, 0.1, d) * vAlpha;
                gl_FragColor = vec4(vColor, alpha);
            }
        `,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- CARDS ---
    const cardGroup = new THREE.Group();
    scene.add(cardGroup);
    const cards: THREE.Group[] = [];
    const cardData = [
        { color: 0x8B5CF6, status: "safe", x: -3.5, y: 1.5, z: -2 },
        { color: 0x3B82F6, status: "danger", x: 2.8, y: 2, z: -1 },
        { color: 0x06B6D4, status: "safe", x: -2, y: -1.5, z: -3 },
        { color: 0x8B5CF6, status: "warning", x: 3.5, y: -1, z: -2.5 },
        { color: 0x3B82F6, status: "safe", x: -4.5, y: 0, z: -1.5 },
        { color: 0x06B6D4, status: "danger", x: 4.2, y: 0.5, z: -3 },
        { color: 0x8B5CF6, status: "safe", x: 0, y: 3, z: -2 },
        { color: 0x3B82F6, status: "safe", x: -1, y: -3, z: -1 },
    ];

    const createCard = (data: any) => {
        const group = new THREE.Group();
        const geo = new THREE.PlaneGeometry(1.4, 1, 8, 8);
        const mat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 }, uColor: { value: new THREE.Color(data.color) },
                uHover: { value: 0 }, uStatus: { value: data.status === "danger" ? 1.0 : data.status === "warning" ? 0.5 : 0.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                uniform float uTime;
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    pos.z += sin(uTime * 2.0 + uv.x * 3.14) * 0.02;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform vec3 uColor;
                uniform float uTime;
                uniform float uHover;
                uniform float uStatus;
                void main() {
                    vec3 bg = vec3(0.06, 0.09, 0.16);
                    float line1 = smoothstep(0.0, 0.01, abs(vUv.y - 0.7) - 0.04) < 1.0 && vUv.x > 0.1 && vUv.x < 0.6 ? 1.0 : 0.0;
                    float line2 = smoothstep(0.0, 0.01, abs(vUv.y - 0.5) - 0.025) < 1.0 && vUv.x > 0.1 && vUv.x < 0.85 ? 1.0 : 0.0;
                    float line3 = smoothstep(0.0, 0.01, abs(vUv.y - 0.35) - 0.025) < 1.0 && vUv.x > 0.1 && vUv.x < 0.7 ? 1.0 : 0.0;
                    float img = (vUv.x > 0.65 && vUv.x < 0.9 && vUv.y > 0.55 && vUv.y < 0.85) ? 1.0 : 0.0;
                    vec3 col = bg;
                    col = mix(col, uColor * 0.3, (line1 + line2 + line3) * 0.5);
                    col = mix(col, uColor * 0.4, img * 0.6);
                    float border = 1.0 - smoothstep(0.0, 0.03, min(min(vUv.x, 1.0-vUv.x), min(vUv.y, 1.0-vUv.y)));
                    vec3 borderColor = uStatus > 0.8 ? vec3(0.94,0.27,0.27) : uStatus > 0.3 ? vec3(0.96,0.62,0.04) : vec3(0.06,0.73,0.51);
                    float glowPulse = uStatus > 0.3 ? (sin(uTime * 3.0) * 0.3 + 0.7) : 0.4;
                    col += borderColor * border * glowPulse;
                    col += uColor * uHover * 0.15;
                    float alpha = 0.75 + border * 0.25 + uHover * 0.1;
                    float scanY = fract(uTime * 0.15);
                    float scan = smoothstep(0.0, 0.02, abs(vUv.y - scanY)) < 1.0 ? 0.3 : 0.0;
                    col += vec3(0.02, 0.73, 0.83) * scan;
                    gl_FragColor = vec4(col, alpha);
                }
            `,
            transparent: true, side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);

        const glowGeo = new THREE.PlaneGeometry(2, 1.5);
        const statusColor = data.status === "danger" ? new THREE.Color(0xEF4444) : data.status === "warning" ? new THREE.Color(0xF59E0B) : new THREE.Color(0x10B981);
        const glowMat = new THREE.ShaderMaterial({
            uniforms: { uColor: { value: statusColor }, uTime: { value: 0 }, uIntensity: { value: data.status === "safe" ? 0.08 : 0.2 } },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
            fragmentShader: `varying vec2 vUv; uniform vec3 uColor; uniform float uTime; uniform float uIntensity; void main(){ float d=length(vUv-0.5)*2.0; float alpha=smoothstep(1.0,0.0,d)*uIntensity; alpha*=(sin(uTime*2.0)*0.2+0.8); gl_FragColor=vec4(uColor,alpha); }`,
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.z = -0.05;
        group.add(glow);

        group.position.set(data.x, data.y, data.z);
        group.userData = { basePos: new THREE.Vector3(data.x, data.y, data.z), phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.4, mat, glowMat };
        cardGroup.add(group);
        cards.push(group);
    };
    cardData.forEach(createCard);

    // --- CORE ---
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);
    const coreGeo = new THREE.IcosahedronGeometry(0.6, 4);
    const coreMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `varying vec3 vNormal; uniform float uTime; void main(){ vNormal=normal; vec3 pos=position+normal*sin(uTime*2.0+position.y*5.0)*0.03; gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0); }`,
        fragmentShader: `varying vec3 vNormal; uniform float uTime; void main(){ float fresnel=pow(1.0-abs(dot(vNormal,vec3(0.0,0.0,1.0))),2.5); vec3 col=mix(vec3(0.545,0.361,0.965),vec3(0.024,0.714,0.831),fresnel); col+=vec3(1.0)*pow(fresnel,4.0)*0.5; gl_FragColor=vec4(col*(sin(uTime*3.0)*0.1+0.9),0.3+fresnel*0.6); }`,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    coreGroup.add(new THREE.Mesh(coreGeo, coreMat));
    
    for(let i=0; i<3; i++) {
        const r = new THREE.Mesh(new THREE.TorusGeometry(0.9+i*0.3, 0.008, 8, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(0.72-i*0.05, 0.8, 0.5), transparent: true, opacity: 0.2-i*0.05 }));
        r.userData = { rotSpeed: (i+1)*0.3, axis: i };
        coreGroup.add(r);
    }
    coreGroup.position.set(0, 0, -2);

    const beam = new THREE.Mesh(new THREE.PlaneGeometry(20, 0.05), new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `varying vec2 vUv; uniform float uTime; void main(){ float alpha=smoothstep(0.0,0.5,vUv.x)*smoothstep(1.0,0.5,vUv.x)*0.4; gl_FragColor=vec4(mix(vec3(0.545,0.361,0.965),vec3(0.024,0.714,0.831),vUv.x),alpha); }`,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    beam.position.z = -1;
    scene.add(beam);

    const clock = new THREE.Clock();
    const animate = () => {
        const t = clock.getElapsedTime();
        scrollY += (scrollTarget - scrollY) * 0.08;
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;

        const scrollNorm = scrollY / (document.body.scrollHeight - window.innerHeight || 1);
        camera.position.x = mouse.x * 0.8;
        camera.position.y = mouse.y * 0.5 - scrollNorm * 4;
        camera.lookAt(0, -scrollNorm * 4, -2);

        particleMat.uniforms.uTime.value = t;
        particleMat.uniforms.uScroll.value = scrollY;
        
        cards.forEach(c => {
            const ud = c.userData;
            c.position.x = ud.basePos.x + Math.sin(t * ud.speed + ud.phase) * 0.3 + mouse.x * 0.15;
            c.position.y = ud.basePos.y + Math.cos(t * ud.speed * 0.7 + ud.phase) * 0.2 + mouse.y * 0.1;
            c.rotation.y = Math.sin(t * 0.5 + ud.phase) * 0.15 + mouse.x * 0.05;
            ud.mat.uniforms.uTime.value = t;
            ud.glowMat.uniforms.uTime.value = t;
        });

        coreMat.uniforms.uTime.value = t;
        coreGroup.rotation.y = t * 0.2;
        coreGroup.children.forEach(child => {
            if(child.userData.rotSpeed) {
                const axis = child.userData.axis;
                if(axis === 0) child.rotation.x = t * child.userData.rotSpeed;
                else if(axis === 1) child.rotation.y = t * child.userData.rotSpeed;
                else child.rotation.z = t * child.userData.rotSpeed;
            }
        });
        coreGroup.position.y += (-scrollNorm * 8 - coreGroup.position.y) * 0.05;
        beam.position.y = Math.sin(t * 0.5) * 4;
        beam.material.uniforms.uTime.value = t;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
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
        renderer.dispose();
    };
  }, [isLoading]);

  // --- INTERSECTION OBSERVER ---
  useEffect(() => {
    if (isLoading) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if(e.isIntersecting) {
                e.target.classList.add("visible");
                if (e.target.classList.contains("insight-panel") && !insightTyped) {
                    setInsightTyped(true);
                    typeInsight();
                }
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll(".step-card, .process-node, .process-arrow, .result-card, .feature-card, .insight-panel").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [isLoading, insightTyped]);

  const typeInsight = () => {
    const text = "This image matches the original with 97.3% confidence due to similar subject posture, background composition, and color distribution. The crop margins and color shift suggest intentional modification to avoid detection. Perceptual hash distance: 4 bits. Semantic embedding cosine similarity: 0.946.";
    let i = 0;
    if (statusRef.current) {
        statusRef.current.textContent = "generating...";
        statusRef.current.style.color = "#F59E0B";
    }
    const interval = setInterval(() => {
        if (typedRef.current) {
            if (i < text.length) {
                typedRef.current.textContent += text[i];
                i++;
            } else {
                clearInterval(interval);
                if (statusRef.current) {
                    statusRef.current.textContent = "complete";
                    statusRef.current.style.color = "#10B981";
                }
            }
        }
    }, 18);
  };

  return (
    <div className="new-ui-root relative min-h-screen bg-[#020617] text-slate-100 selection:bg-violet-500 selection:text-white">
      {/* LOADER */}
      {isLoading && (
        <div id="loader" className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#020617] transition-opacity duration-700">
          <div className="relative mb-10 h-20 w-20">
            <div className="absolute inset-0 animate-[spin_1.2s_linear_infinite] rounded-full border-2 border-transparent border-t-violet-500" />
            <div className="absolute inset-2 animate-[spin_1.8s_linear_infinite_reverse] rounded-full border-2 border-transparent border-t-blue-500" />
            <div className="absolute inset-4 animate-[spin_2.4s_linear_infinite] rounded-full border-2 border-transparent border-t-cyan-500" />
            <div className="absolute inset-6 animate-pulse rounded-full bg-[radial-gradient(circle,theme(colors.violet.500),transparent)]" />
          </div>
          <h2 className="mb-6 text-lg font-semibold uppercase tracking-[0.15em] bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Initializing AI Engine
          </h2>
          <div className="flex flex-col gap-3 min-w-[260px]">
            {["Loading neural models...", "Preparing analysis pipeline...", "Calibrating detection engine...", "System ready"].map((step, idx) => (
              <div key={idx} className={`flex items-center gap-3 text-xs transition-colors duration-300 ${idx < loadStep ? "text-emerald-500" : idx === loadStep ? "text-cyan-400" : "text-slate-500"}`}>
                <div className={`h-2 w-2 rounded-full ${idx < loadStep ? "bg-emerald-500 shadow-[0_0_8px_theme(colors.emerald.500)]" : idx === loadStep ? "bg-cyan-400 shadow-[0_0_8px_theme(colors.cyan.400)]" : "bg-slate-600"}`} />
                {step}
              </div>
            ))}
          </div>
          <div className="mt-8 h-[1px] w-[260px] bg-slate-800">
            <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500" style={{ width: `${(loadStep / 4) * 100}%` }} />
          </div>
        </div>
      )}

      {/* BACKGROUND CANVAS */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
      <div className="fixed inset-0 z-0 pointer-events-none grid-pattern opacity-10" />

      {/* NAVIGATION */}
      <nav id="navbar" className="fixed top-0 left-0 right-0 z-[100] border-b border-violet-500/10 bg-[#020617]/50 px-6 py-4 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-sm font-black text-white shadow-lg shadow-violet-500/20">MG</span>
            <span className="text-sm font-bold tracking-tight text-white lg:text-base">AI Media Guardian</span>
          </Link>
          <div className="hidden items-center gap-8 text-xs font-medium uppercase tracking-widest text-slate-400 md:flex">
            {["Services", "AI Pipeline", "Results", "History"].map(item => (
                <Link key={item} to={`/${item.toLowerCase().replace(" ", "-")}`} className="transition hover:text-white">{item}</Link>
            ))}
          </div>
          <Link to="/upload" className="rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/30 transition hover:-translate-y-0.5">Get Started</Link>
        </div>
      </nav>

      {/* CONTENT */}
      {!isLoading && (
        <div className="relative z-10 pt-20">
          <section id="hero" className="flex min-h-[90vh] flex-col items-center justify-center px-6 text-center">
            <div className="mb-6 flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              AI-Powered Protection
            </div>
            <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tighter text-white sm:text-7xl">
              Protect Your Digital <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent italic">Assets</span> with AI
            </h1>
            <p className="mt-8 max-w-xl text-balance text-sm leading-relaxed text-slate-400 sm:text-base">
              Detect unauthorized media usage using advanced AI and explainable analysis.
              Powered by perceptual hashing, semantic embeddings, and multimodal reasoning.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/scan" className="btn-primary-restored">Start AI Scan</Link>
              <button className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">Watch Demo</button>
            </div>
            <div className="mt-16 flex gap-12 text-center">
                {[["99.7%", "Detection Rate"], ["<50ms", "Analysis Time"], ["10M+", "Media Scanned"]].map(([val, lbl]) => (
                    <div key={lbl}><div className="text-2xl font-black bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">{val}</div><div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">{lbl}</div></div>
                ))}
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section id="services" className="mx-auto max-w-7xl px-6 py-24">
            <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500">How it works</p>
                <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Triple-Layer Protection</h2>
                <p className="mx-auto mt-4 max-w-2xl text-slate-400 text-sm">Our AI pipeline analyzes your media through multiple detection layers for comprehensive coverage.</p>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {[
                  { step: "01", title: "Upload Media", desc: "Upload your images, videos, or audio. Our system ingests and fingerprints each asset automatically." },
                  { step: "02", title: "AI Analysis", desc: "Multiple AI models — pHash, embeddings, and Gemini — analyze content for matches and manipulation." },
                  { step: "03", title: "Explainable Results", desc: "Get detailed results with explainable AI insights. Understand exactly why content was flagged." }
              ].map((item, i) => (
                  <div key={item.title} className="step-card group relative rounded-3xl border border-white/5 bg-slate-900/40 p-10 backdrop-blur-md opacity-0 transition-all duration-700 translate-y-10">
                    <div className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-4">Step {item.step}</div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.desc}</p>
                  </div>
              ))}
            </div>
          </section>

          {/* INSIGHT SECTION */}
          <section className="mx-auto max-w-3xl px-6 py-20">
            <div className="insight-panel relative rounded-[2rem] border border-violet-500/20 bg-slate-950/60 p-10 backdrop-blur-2xl opacity-0 translate-y-10 transition-all duration-1000">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600">
                    <span className="text-xs font-black text-white">AI</span>
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-widest">Decision Insight</h4>
                </div>
                <span ref={statusRef} className="text-[10px] font-mono uppercase tracking-widest">ready</span>
              </div>
              <div className="border-l-2 border-violet-500/50 pl-6 text-sm italic leading-relaxed text-slate-400">
                <span ref={typedRef}/><span className="inline-block h-4 w-[2px] bg-cyan-400 animate-pulse align-middle ml-1" />
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4">
                {[["pHash Match", "96.1%"], ["Embedding", "0.946"], ["Confidence", "97.3%"]].map(([lbl, val]) => (
                    <div key={lbl} className="rounded-2xl bg-white/5 p-4 text-center border border-white/10 transition hover:bg-white/10">
                        <div className="text-xs font-bold text-white mb-1">{val}</div>
                        <div className="text-[9px] uppercase tracking-widest text-slate-500">{lbl}</div>
                    </div>
                ))}
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="mx-auto max-w-7xl px-6 py-32">
              <div className="relative overflow-hidden rounded-[3rem] border border-violet-500/30 bg-gradient-to-br from-violet-950/20 to-slate-950/40 p-16 text-center backdrop-blur-xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.violet.500/10),transparent_70%)]" />
                  <h2 className="relative text-3xl font-black text-white sm:text-5xl">Protect Your Brand Today</h2>
                  <p className="relative mt-6 text-slate-400 max-w-xl mx-auto italic">Join the next generation of digital asset protection powered by multimodal intelligence.</p>
                  <div className="relative mt-12">
                      <Link to="/upload" className="btn-primary-restored text-base px-12 py-5">Secure Your First Asset</Link>
                  </div>
              </div>
          </section>

          <footer className="py-12 text-center border-t border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">&copy; 2026 AI Media Guardian &bull; Advanced AI Layer</p>
          </footer>
        </div>
      )}
    </div>
  );
}
