import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Sparkles, ShoppingBag, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StoreHeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
}

export const StoreHeader = ({ cartItemCount, onCartClick }: StoreHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Zap className="w-8 h-8 text-primary" />
            <div className="absolute inset-0 animate-pulse">
              <Zap className="w-8 h-8 text-primary-glow opacity-50" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold neon-text">
              Nexus Apparel
            </h1>
            <p className="text-sm text-accent">
              Alien Tech Fashion
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Button variant="ghost" className="text-foreground hover:text-primary">
            Collection
          </Button>
          <Button variant="ghost" className="text-foreground hover:text-primary">
            About
          </Button>
          <Button variant="ghost" className="text-foreground hover:text-primary">
            Contact
          </Button>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-foreground hover:text-primary"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={onCartClick}
            className="relative bg-card/50 border-border hover:bg-card hover:border-primary/50 glow"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Cart
            {cartItemCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-gradient-primary text-primary-foreground text-xs"
              >
                {cartItemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};