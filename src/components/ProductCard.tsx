import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, ProductVariant } from '@/lib/api';
import { ShoppingCart, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  variants: ProductVariant[];
  onAddToCart: (variantId: string, quantity: number) => void;
}

export const ProductCard = ({ product, variants, onAddToCart }: ProductCardProps) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.length > 0 ? variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    setIsAdding(true);
    try {
      await onAddToCart(selectedVariant.id, quantity);
    } finally {
      setIsAdding(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Card className="group bg-gradient-card border-border/50 hover-lift glow-lg overflow-hidden">
      <div className="relative">
        {product.image_url && (
          <div className="aspect-square overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status Badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-3 left-3 bg-accent/20 text-accent border-accent/30 backdrop-blur-sm"
        >
          <Zap className="w-3 h-3 mr-1" />
          {product.availability_status}
        </Badge>
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-xl text-foreground neon-text">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-muted-foreground text-sm line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Variant Selection */}
        {variants.length > 1 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Variant
            </label>
            <Select
              value={selectedVariant?.id}
              onValueChange={(value) => {
                const variant = variants.find(v => v.id === value);
                setSelectedVariant(variant || null);
              }}
            >
              <SelectTrigger className="bg-input border-border focus:ring-primary">
                <SelectValue placeholder="Select variant" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {variants.map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{variant.title || 'Default'}</span>
                      <span className="text-primary font-medium ml-2">
                        {formatPrice(variant.price)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Price Display */}
        {selectedVariant && (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(selectedVariant.price)}
              </div>
              {selectedVariant.compare_at_price && selectedVariant.compare_at_price > selectedVariant.price && (
                <div className="text-sm text-muted-foreground line-through">
                  {formatPrice(selectedVariant.compare_at_price)}
                </div>
              )}
            </div>
            
            {selectedVariant.sku && (
              <Badge variant="outline" className="text-xs">
                {selectedVariant.sku}
              </Badge>
            )}
          </div>
        )}

        {/* Quantity and Add to Cart */}
        <div className="flex items-center gap-3">
          <Select
            value={quantity.toString()}
            onValueChange={(value) => setQuantity(parseInt(value))}
          >
            <SelectTrigger className="w-20 bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {[1, 2, 3, 4, 5].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleAddToCart}
            disabled={!selectedVariant || isAdding}
            className="flex-1 bg-gradient-primary hover:bg-primary-glow border-0 shadow-glow"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </Button>
        </div>

        {/* Tags */}
        {product.tags && (
          <div className="flex flex-wrap gap-1">
            {product.tags.split(',').map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs border-accent/30 text-accent"
              >
                {tag.trim()}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};