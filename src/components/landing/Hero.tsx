import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 animated-gradient opacity-20" />
      <div className="absolute inset-0 grid-pattern" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float-delayed" />
      
      {/* 3D floating cards visualization */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 hidden lg:block">
        <div className="relative">
          {/* Floating image cards being scanned */}
          <div className="glass rounded-2xl p-4 w-48 h-32 animate-float absolute top-0 right-20 transform rotate-6">
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 rounded-lg flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Image Asset</span>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 w-48 h-32 animate-float-delayed absolute top-20 right-40 transform -rotate-3">
            <div className="w-full h-full bg-gradient-to-br from-accent/30 to-primary/30 rounded-lg flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Protected</span>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 w-48 h-32 animate-float-delayed-2 absolute top-40 right-10 transform rotate-12">
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 rounded-lg flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Verified</span>
            </div>
          </div>
          
          {/* AI scanning beam effect */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>AI-Powered Media Protection</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 animate-fade-in-up animate-delay-100">
            <span className="text-foreground">Protect Your</span>
            <br />
            <span className="gradient-text">Digital Assets</span>
            <br />
            <span className="text-foreground">with AI</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-xl mb-8 leading-relaxed animate-fade-in-up animate-delay-200">
            Detect unauthorized media usage using advanced AI embeddings, 
            perceptual hashing, and explainable analysis powered by Google Gemini.
          </p>
          
          <div className="flex flex-wrap gap-4 animate-fade-in-up animate-delay-300">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-white px-8 hover-glow">
              <Link to="/scan">
                Try Live Detection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 hover:bg-white/5">
              <Link to="/upload">
                <Shield className="mr-2 h-5 w-5" />
                Upload Media
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
