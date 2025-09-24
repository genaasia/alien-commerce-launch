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

  // Load real products from your database
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        console.log('Loading products from Genabase API...');
        
        // Load products from your database
        const productsData = await api.getProducts();
        console.log('Loaded products:', productsData);
        setProducts(productsData);
        
        // Load all variants
        const variantsData = await api.getProductVariants();
        console.log('Loaded variants:', variantsData);
        setVariants(variantsData);
        
        // Get or create cart
        let cart = await api.getCart(sessionId);
        if (!cart) {
          console.log('Creating new cart...');
          cart = await api.createCart(sessionId);
        }
        console.log('Cart:', cart);
        setCartId(cart.id);
        
        // Load existing cart items
        if (cart) {
          const items = await api.getCartItems(cart.id);
          console.log('Loaded cart items:', items);
          setCartItems(items);
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Loading Error",
          description: "Failed to load products from database. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [sessionId, toast]);

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
      if (!cartId) {
        toast({
          title: "Error",
          description: "Cart not initialized. Please refresh the page.",
          variant: "destructive",
        });
        return;
      }

      console.log('Adding to cart:', { cartId, variantId, quantity });
      
      // Add to cart via API
      const cartItem = await api.addToCart(cartId, variantId, quantity);
      console.log('Added cart item:', cartItem);
      
      // Reload cart items
      const updatedItems = await api.getCartItems(cartId);
      setCartItems(updatedItems);

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

  const handleUpdateCartQuantity = async (variantId: string, newQuantity: number) => {
    try {
      if (!cartId) return;

      console.log('Updating cart quantity:', { cartId, variantId, newQuantity });
      
      // Update via API
      await api.updateCartItemQuantity(cartId, variantId, newQuantity);
      
      // Reload cart items
      const updatedItems = await api.getCartItems(cartId);
      setCartItems(updatedItems);

      if (newQuantity <= 0) {
        toast({
          title: "Item Removed",
          description: "Item has been removed from your cart.",
        });
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast({
        title: "Error",
        description: "Failed to update cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteOrder = async (orderData: any) => {
    try {
      setIsLoading(true);
      
      if (!cartId || cartItems.length === 0) {
        throw new Error('No items in cart');
      }

      console.log('Processing order:', orderData);
      
      // Create customer
      const customer = await api.createCustomer(
        orderData.customer.email,
        orderData.customer.firstName,
        orderData.customer.lastName,
        orderData.customer.phone
      );
      console.log('Created customer:', customer);
      
      // Calculate totals
      const subtotal = cartItemsWithDetails.reduce((sum, item) => {
        return sum + (item.variant?.price || 0) * item.quantity;
      }, 0);
      const shippingCost = 15.00;
      const tax = subtotal * 0.08;
      const total = subtotal + shippingCost + tax;
      
      // Create order
      const order = await api.createOrder(customer.id, cartId, {
        subtotal_price: subtotal,
        shipping_price: shippingCost,
        total_tax: tax,
        total_price: total,
        notes: orderData.notes,
      });
      console.log('Created order:', order);
      
      // Create line items
      const lineItemsData = cartItemsWithDetails.map(item => ({
        order_id: order.id,
        variant_id: item.variant_id,
        product_id: item.variant?.product_id,
        title: item.product?.name,
        sku: item.variant?.sku,
        quantity: item.quantity,
        unit_price: item.variant?.price || 0,
        unit_tax_amount: (item.variant?.price || 0) * 0.08,
        total_discount: 0,
        total_price: (item.variant?.price || 0) * item.quantity,
      }));
      
      const lineItems = await api.createLineItems(lineItemsData);
      console.log('Created line items:', lineItems);
      
      // Create addresses
      const addresses = [
        {
          order_id: order.id,
          type: 'SHIPPING' as const,
          ...orderData.shipping,
        },
        {
          order_id: order.id,
          type: 'BILLING' as const,
          ...(orderData.billing || orderData.shipping),
        },
      ];
      
      const orderAddresses = await api.createOrderAddresses(addresses);
      console.log('Created addresses:', orderAddresses);
      
      // Clear cart after successful order
      setCartItems([]);
      setIsCheckoutOpen(false);
      
      toast({
        title: "Order Successful!",
        description: `Order #${order.id.slice(0, 8)} has been placed and will be processed soon.`,
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
          isOpen={isCartOpen}
          onOpenChange={setIsCartOpen}
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
