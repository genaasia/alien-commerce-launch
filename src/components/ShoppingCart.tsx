import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart as ShoppingCartIcon, Plus, Minus, Trash2, Zap } from 'lucide-react';
import { CartItem, ProductVariant, Product } from '@/lib/api';

interface CartItemWithDetails extends CartItem {
  variant?: ProductVariant;
  product?: Product;
}

interface ShoppingCartProps {
  items: CartItemWithDetails[];
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  onCheckout: () => void;
  isLoading?: boolean;
}

export const ShoppingCart = ({ items, onUpdateQuantity, onCheckout, isLoading }: ShoppingCartProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    if (item.variant) {
      return sum + (item.variant.price * item.quantity);
    }
    return sum;
  }, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleQuantityChange = (variantId: string, newQuantity: number) => {
    onUpdateQuantity(variantId, newQuantity);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative bg-card/50 border-border hover:bg-card hover:border-primary/50 glow"
        >
          <ShoppingCartIcon className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-gradient-primary text-primary-foreground text-xs"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg bg-card border-border">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Zap className="w-5 h-5 text-primary" />
            Quantum Cart
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {totalItems} items
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <ShoppingCartIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground text-sm">
                Add some alien tech to get started!
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 py-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="group">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-card border border-border/50 hover:border-primary/30 transition-colors">
                        {item.product?.image_url && (
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">
                            {item.product?.name || 'Unknown Product'}
                          </h4>
                          {item.variant?.title && (
                            <p className="text-sm text-muted-foreground">
                              {item.variant.title}
                            </p>
                          )}
                          {item.variant?.sku && (
                            <p className="text-xs text-accent">
                              SKU: {item.variant.sku}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 border-border"
                                onClick={() => handleQuantityChange(item.variant_id, item.quantity - 1)}
                                disabled={isLoading}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              
                              <span className="text-sm font-medium min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 border-border"
                                onClick={() => handleQuantityChange(item.variant_id, item.quantity + 1)}
                                disabled={isLoading}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-semibold text-primary">
                                {item.variant ? formatPrice(item.variant.price * item.quantity) : 'N/A'}
                              </div>
                              {item.variant && (
                                <div className="text-xs text-muted-foreground">
                                  {formatPrice(item.variant.price)} each
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleQuantityChange(item.variant_id, 0)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t border-border pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-accent">Calculated at checkout</span>
                  </div>
                  <Separator className="bg-border" />
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary neon-text">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    onCheckout();
                    setIsOpen(false);
                  }}
                  disabled={isLoading || items.length === 0}
                  className="w-full bg-gradient-primary hover:bg-primary-glow border-0 shadow-glow"
                  size="lg"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isLoading ? 'Processing...' : 'Proceed to Checkout'}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};