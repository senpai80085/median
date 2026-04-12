import { Copyright, ShieldAlert, Handshake } from "lucide-react";

const reasons = [
  {
    icon: Copyright,
    title: "Protect Intellectual Property",
    description: "Safeguard your creative works from unauthorized reproduction and distribution across the digital landscape.",
  },
  {
    icon: ShieldAlert,
    title: "Prevent Content Misuse",
    description: "Detect and track when your media is being used without permission or proper attribution.",
  },
  {
    icon: Handshake,
    title: "Enable Digital Trust",
    description: "Build confidence in digital ecosystems with verifiable content authenticity and provenance tracking.",
  },
];

export default function WhyItMatters() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 animate-fade-in-up">
            Why It <span className="gradient-text">Matters</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto animate-fade-in-up animate-delay-100">
            In the age of AI-generated content, protecting authentic media is more critical than ever
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div 
              key={reason.title}
              className={`animate-fade-in-up`}
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-card to-secondary flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                  <reason.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{reason.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
