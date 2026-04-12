import { Upload, Brain, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Media",
    description: "Drop your images or videos into our secure platform for analysis.",
    gradient: "from-primary to-purple-500",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Our AI extracts embeddings, generates perceptual hashes, and analyzes content.",
    gradient: "from-purple-500 to-accent",
  },
  {
    icon: ShieldCheck,
    title: "Detection & Explanation",
    description: "Get detailed reports with similarity scores and AI-powered explanations.",
    gradient: "from-accent to-primary",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 animate-fade-in-up">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
            Three simple steps to protect your digital assets with AI-powered detection
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection lines */}
          <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-30" />
          
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className={`animate-fade-in-up animate-delay-${(index + 1) * 100}`}
            >
              <div className="glass rounded-2xl p-8 text-center hover-glow transition-all duration-300 h-full">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center animate-pulse-glow`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                
                <div className="text-sm font-medium text-primary mb-2">Step {index + 1}</div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
