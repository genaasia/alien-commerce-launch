import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Sparkles, ArrowDown } from 'lucide-react';

export const HeroSection = () => {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    productsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden cyber-grid">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 gradient-animate opacity-10" />
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/20 blur-xl animate-pulse" />
      <div className="absolute top-3/4 right-1/4 w-24 h-24 rounded-full bg-accent/20 blur-xl animate-pulse animation-delay-1000" />
      <div className="absolute top-1/2 right-1/3 w-16 h-16 rounded-full bg-secondary/20 blur-xl animate-pulse animation-delay-2000" />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center mb-6">
          <Badge 
            variant="secondary" 
            className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm px-4 py-2"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Now Available: Quantum Collection 2024
          </Badge>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            NEXUS
          </span>
          <br />
          <span className="neon-text">
            APPAREL
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Discover the future of fashion with our cutting-edge alien technology-inspired clothing. 
          Where style meets the cosmos.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button 
            onClick={scrollToProducts}
            size="lg" 
            className="bg-gradient-primary hover:bg-primary-glow border-0 shadow-glow px-8 py-6 text-lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Explore Collection
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="border-border hover:border-primary/50 px-8 py-6 text-lg"
          >
            Watch Origin Story
          </Button>
        </div>

        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Free Galactic Shipping
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            30-Day Time Warp Returns
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Quantum Quality Guarantee
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={scrollToProducts}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
        >
          <ArrowDown className="w-6 h-6" />
        </Button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
    </section>
  );
};