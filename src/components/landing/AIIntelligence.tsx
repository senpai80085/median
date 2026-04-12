import { Layers, Binary, Cpu, Network } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Perceptual Hashing",
    description: "Content-based fingerprinting that identifies similar images regardless of format changes",
    value: "pHash",
  },
  {
    icon: Binary,
    title: "AI Embeddings",
    description: "Deep learning vectors that capture semantic meaning and visual features",
    value: "512-dim",
  },
  {
    icon: Cpu,
    title: "Hybrid Analysis",
    description: "Combined scoring using both traditional and AI methods for maximum accuracy",
    value: "99.2%",
  },
  {
    icon: Network,
    title: "Gemini Reasoning",
    description: "Explainable AI that provides human-readable analysis of detected matches",
    value: "XAI",
  },
];

export default function AIIntelligence() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Visualization */}
          <div className="relative animate-fade-in-up">
            <div className="glass rounded-3xl p-8 relative overflow-hidden">
              {/* Neural network visualization */}
              <div className="aspect-square relative">
                {/* Center node */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse-glow z-10">
                  <Cpu className="h-10 w-10 text-white" />
                </div>
                
                {/* Orbiting nodes */}
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                  <div
                    key={angle}
                    className="absolute top-1/2 left-1/2 w-12 h-12"
                    style={{
                      transform: `rotate(${angle}deg) translateX(120px) rotate(-${angle}deg)`,
                    }}
                  >
                    <div className={`w-full h-full rounded-full bg-gradient-to-br ${i % 2 === 0 ? 'from-primary/50 to-primary' : 'from-accent/50 to-accent'} animate-float`} style={{ animationDelay: `${i * 0.5}s` }}>
                      <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                        {['E', 'P', 'H', 'S', 'M', 'X'][i]}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Connection lines - SVG */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  {[0, 60, 120, 180, 240, 300].map((angle) => {
                    const rad = (angle * Math.PI) / 180;
                    const x = 50 + 30 * Math.cos(rad);
                    const y = 50 + 30 * Math.sin(rad);
                    return (
                      <line
                        key={angle}
                        x1="50"
                        y1="50"
                        x2={x}
                        y2={y}
                        stroke="url(#gradient)"
                        strokeWidth="0.5"
                        opacity="0.5"
                      />
                    );
                  })}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(250 91% 65%)" />
                      <stop offset="100%" stopColor="hsl(199 89% 48%)" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Animated ring */}
                <div className="absolute inset-8 rounded-full border border-primary/30 animate-spin" style={{ animationDuration: '20s' }} />
                <div className="absolute inset-16 rounded-full border border-accent/30 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
              </div>
            </div>
          </div>
          
          {/* Right side - Features */}
          <div className="space-y-6">
            <div className="animate-fade-in-up">
              <h2 className="text-4xl font-bold mb-4">
                Advanced <span className="gradient-text">AI Intelligence</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our multi-layered AI system combines traditional image processing with 
                cutting-edge deep learning to provide accurate, explainable results.
              </p>
            </div>
            
            <div className="grid gap-4">
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className={`glass rounded-xl p-5 flex items-start gap-4 hover-glow transition-all duration-300 animate-fade-in-up`}
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{feature.title}</h3>
                      <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-md">
                        {feature.value}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
