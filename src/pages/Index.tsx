import { useState, useEffect, useMemo } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { StoreHeader } from '@/components/StoreHeader';
import { HeroSection } from '@/components/HeroSection';
import { ProductCard } from '@/components/ProductCard';
import { ShoppingCart } from '@/components/ShoppingCart';
import { CheckoutForm } from '@/components/CheckoutForm';
import { api, Product, ProductVariant, CartItem } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Zap, ShoppingBag } from 'lucide-react';

// Sample data for demo (replace with API calls when ready)
import product1Image from '@/assets/product-1.jpg';
import product2Image from '@/assets/product-2.jpg';
import product3Image from '@/assets/product-3.jpg';
import product4Image from '@/assets/product-4.jpg';

interface CartItemWithDetails extends CartItem {
  variant?: ProductVariant;
  product?: Product;
}

const Index = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId] = useState(() => 'demo-session-' + Math.random().toString(36).substr(2, 9));
  const [cartId, setCartId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Sample data for demo
  const sampleProducts: Product[] = [
    {
      id: '1',
      name: 'Quantum Fusion Jacket',
      description: 'A cutting-edge jacket with alien tech aesthetics, featuring neon cyan accents and holographic details.',
      image_url: product1Image,
      is_published: true,
      availability_status: 'IN_STOCK',
      tags: 'outerwear,premium,quantum',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Nexus Energy Hoodie',
      description: 'Sleek hoodie with glowing energy lines and crystal-like elements for the ultimate sci-fi look.',
      image_url: product2Image,
      is_published: true,
      availability_status: 'IN_STOCK',
      tags: 'casual,energy,hoodie',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Circuit Surge Pants',
      description: 'Futuristic pants with neon circuit patterns and holographic side panels.',
      image_url: product3Image,
      is_published: true,
      availability_status: 'IN_STOCK',
      tags: 'bottoms,tech,circuits',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Cosmic Shift Tee',
      description: 'Iridescent t-shirt with color-shifting fabric and minimalist alien symbols.',
      image_url: product4Image,
      is_published: true,
      availability_status: 'IN_STOCK',
      tags: 'casual,basics,cosmic',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const sampleVariants: ProductVariant[] = [
    // Quantum Fusion Jacket variants
    { id: '1-s', product_id: '1', title: 'Small', price: 299.99, sku: 'QFJ-S', taxable: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '1-m', product_id: '1', title: 'Medium', price: 299.99, sku: 'QFJ-M', taxable: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '1-l', product_id: '1', title: 'Large', price: 299.99, sku: 'QFJ-L', taxable: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '1-xl', product_id: '1', title: 'X-Large', price: 319.99, sku: 'QFJ-XL', taxable: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    
    // Nexus Energy Hoodie variants
    { id: '2-s', product_id: '2', title: 'Small', price: 189.99, sku: 'NEH-S', taxable: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2-m', product_id: '2', title: 'Medium', price: 189.99, sku: 'NEH-M', taxable: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2-l', product_id: '2', title: 'Large', price: 189.99, sku: 'NEH-L', taxable: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    
    // Circuit Surge Pants variants
    { id: '3-30', product_id: '3', title: '30"', price: 159.99, sku: 'CSP-30', taxable: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '3-32', product_id: '3', title: '32"', price: 159.99, sku: 'CSP-32', taxable: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '3-34', product_id: '3', title: '34"', price: 159.99, sku: 'CSP-34', taxable: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '3-36', product_id: '3', title: '36"', price: 159.99, sku: 'CSP-36', taxable: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    
    // Cosmic Shift Tee variants
    { id: '4-s', product_id: '4', title: 'Small', price: 79.99, sku: 'CST-S', taxable: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '4-m', product_id: '4', title: 'Medium', price: 79.99, sku: 'CST-M', taxable: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '4-l', product_id: '4', title: 'Large', price: 79.99, sku: 'CST-L', taxable: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '4-xl', product_id: '4', title: 'X-Large', price: 84.99, sku: 'CST-XL', taxable: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];

  useEffect(() => {
    // Load sample data for demo
    setProducts(sampleProducts);
    setVariants(sampleVariants);
    setIsLoading(false);
    
    // In a real app, you'd create/get cart here
    // For demo, we'll simulate it
    const demoCartId = 'demo-cart-' + sessionId;
    setCartId(demoCartId);
  }, [sessionId]);

  const getVariantsForProduct = (productId: string) => {
    return variants.filter(variant => variant.product_id === productId);
  };

  const cartItemsWithDetails = useMemo(() => {
    return cartItems.map(item => ({
      ...item,
      variant: variants.find(v => v.id === item.variant_id),
      product: products.find(p => p.id === variants.find(v => v.id === item.variant_id)?.product_id),
    }));
  }, [cartItems, variants, products]);

  const totalCartItems = cartItemsWithDetails.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = async (variantId: string, quantity: number) => {
    try {
      // For demo, simulate adding to cart
      const existingItemIndex = cartItems.findIndex(item => item.variant_id === variantId);
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...cartItems];
        updatedItems[existingItemIndex].quantity += quantity;
        setCartItems(updatedItems);
      } else {
        const newItem: CartItem = {
          id: 'item-' + Math.random().toString(36).substr(2, 9),
          cart_id: cartId!,
          variant_id: variantId,
          quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCartItems([...cartItems, newItem]);
      }

      const variant = variants.find(v => v.id === variantId);
      const product = products.find(p => p.id === variant?.product_id);

      toast({
        title: "Added to Cart",
        description: `${product?.name} (${variant?.title}) has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCartQuantity = (variantId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item.variant_id !== variantId));
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      });
    } else {
      const updatedItems = cartItems.map(item =>
        item.variant_id === variantId
          ? { ...item, quantity: newQuantity }
          : item
      );
      setCartItems(updatedItems);
    }
  };

  const handleCompleteOrder = async (orderData: any) => {
    try {
      setIsLoading(true);
      
      // For demo, simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart after successful order
      setCartItems([]);
      setIsCheckoutOpen(false);
      
      toast({
        title: "Order Successful!",
        description: "Your order has been placed and will be processed soon.",
      });
    } catch (error) {
      console.error('Order error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing quantum systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader 
        cartItemCount={totalCartItems} 
        onCartClick={() => setIsCartOpen(!isCartOpen)} 
      />
      
      <HeroSection />

      {/* Products Section */}
      <section id="products" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge 
              variant="secondary" 
              className="bg-accent/20 text-accent border-accent/30 mb-4"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Quantum Collection
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 neon-text">
              Featured Products
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our latest alien-tech inspired apparel, crafted with otherworldly precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variants={getVariantsForProduct(product.id)}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Shopping Cart */}
      <div className="fixed bottom-6 right-6 z-50">
        <ShoppingCart
          items={cartItemsWithDetails}
          onUpdateQuantity={handleUpdateCartQuantity}
          onCheckout={() => setIsCheckoutOpen(true)}
          isLoading={isLoading}
        />
      </div>

      {/* Checkout Form */}
      <CheckoutForm
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItemsWithDetails}
        onCompleteOrder={handleCompleteOrder}
      />

      <Toaster />
    </div>
  );
};

export default Index;
