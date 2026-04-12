import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="glass rounded-3xl p-12 md:p-16 text-center max-w-4xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-sm text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Ready to get started?</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Start <span className="gradient-text">Analyzing</span> Now
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Upload your media and let our AI-powered system detect unauthorized usage 
            with detailed explanations and confidence scores.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-white px-8 hover-glow">
              <Link to="/scan">
                Start Analyzing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-6">
            Powered by Google AI
          </p>
        </div>
      </div>
    </section>
  );
}
