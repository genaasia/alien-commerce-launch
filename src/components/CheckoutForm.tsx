import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, CreditCard, MapPin, User, Mail, Phone, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe';
import { PaymentForm } from './PaymentForm';

interface CartItemWithDetails {
  id: string;
  variant_id: string;
  quantity: number;
  variant?: {
    id: string;
    title?: string;
    price: number;
    sku?: string;
  };
  product?: {
    id: string;
    name: string;
  };
}

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemWithDetails[];
  onCompleteOrder: (orderData: {
    customer: {
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
    };
    shipping: {
      firstName: string;
      lastName: string;
      company?: string;
      phone?: string;
      line1: string;
      line2?: string;
      city: string;
      region: string;
      postalCode: string;
      countryCode: string;
    };
    billing?: {
      firstName: string;
      lastName: string;
      company?: string;
      phone?: string;
      line1: string;
      line2?: string;
      city: string;
      region: string;
      postalCode: string;
      countryCode: string;
    };
    notes?: string;
  }) => Promise<void>;
}

export const CheckoutForm = ({ isOpen, onClose, items, onCompleteOrder }: CheckoutFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentStep, setPaymentStep] = useState<'info' | 'payment' | 'processing'>('info');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');

  // Form state
  const [customerData, setCustomerData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    postalCode: '',
    countryCode: 'US',
  });

  const [billingData, setBillingData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    postalCode: '',
    countryCode: 'US',
  });

  const [notes, setNotes] = useState('');

  const totalPrice = items.reduce((sum, item) => {
    if (item.variant) {
      return sum + (item.variant.price * item.quantity);
    }
    return sum;
  }, 0);

  const shippingCost = 15.00; // Fixed shipping for demo
  const tax = totalPrice * 0.08; // 8% tax for demo
  const finalTotal = totalPrice + shippingCost + tax;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!customerData.email || !customerData.firstName || !customerData.lastName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required customer fields.",
        variant: "destructive",
      });
      return;
    }

    if (!shippingData.line1 || !shippingData.city || !shippingData.region || !shippingData.postalCode) {
      toast({
        title: "Missing Address",
        description: "Please fill in all required shipping address fields.",
        variant: "destructive",
      });
      return;
    }

    // Move to payment step
    setPaymentStep('payment');
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    setPaymentIntentId(paymentId);
    setPaymentStep('processing');
    setIsSubmitting(true);

    try {
      await onCompleteOrder({
        customer: customerData,
        shipping: shippingData,
        billing: sameAsShipping ? undefined : billingData,
        notes: notes || undefined,
      });

      toast({
        title: "Order Placed Successfully!",
        description: "Your payment has been processed and your order will be shipped soon.",
      });

      onClose();
      // Reset form
      setPaymentStep('info');
      setPaymentIntentId('');
    } catch (error) {
      console.error('Order creation error:', error);
      toast({
        title: "Order Failed",
        description: "Payment was processed but order creation failed. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-card border-border">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Zap className="w-6 h-6 text-primary" />
            Quantum Checkout
            {paymentStep === 'payment' && " - Payment"}
            {paymentStep === 'processing' && " - Processing"}
          </DialogTitle>
        </DialogHeader>

        <Elements stripe={stripePromise} options={{
          mode: 'payment',
          amount: Math.round(finalTotal * 100),
          currency: 'usd',
        }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
            {/* Order Form */}
            <div className="space-y-6 overflow-y-auto pr-2 max-h-[70vh]">
              {paymentStep === 'info' && (
                <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <User className="w-5 h-5 text-primary" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={customerData.firstName}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="bg-input border-border focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={customerData.lastName}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="bg-input border-border focus:ring-primary"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-input border-border focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-input border-border focus:ring-primary"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <MapPin className="w-5 h-5 text-primary" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shippingFirstName">First Name *</Label>
                      <Input
                        id="shippingFirstName"
                        value={shippingData.firstName}
                        onChange={(e) => setShippingData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="bg-input border-border focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="shippingLastName">Last Name *</Label>
                      <Input
                        id="shippingLastName"
                        value={shippingData.lastName}
                        onChange={(e) => setShippingData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="bg-input border-border focus:ring-primary"
                        required
                      />
                    </div>
                  </div>
                  <Input
                    placeholder="Company (optional)"
                    value={shippingData.company}
                    onChange={(e) => setShippingData(prev => ({ ...prev, company: e.target.value }))}
                    className="bg-input border-border focus:ring-primary"
                  />
                  <Input
                    placeholder="Address Line 1 *"
                    value={shippingData.line1}
                    onChange={(e) => setShippingData(prev => ({ ...prev, line1: e.target.value }))}
                    className="bg-input border-border focus:ring-primary"
                    required
                  />
                  <Input
                    placeholder="Address Line 2 (optional)"
                    value={shippingData.line2}
                    onChange={(e) => setShippingData(prev => ({ ...prev, line2: e.target.value }))}
                    className="bg-input border-border focus:ring-primary"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="City *"
                      value={shippingData.city}
                      onChange={(e) => setShippingData(prev => ({ ...prev, city: e.target.value }))}
                      className="bg-input border-border focus:ring-primary"
                      required
                    />
                    <Input
                      placeholder="State/Region *"
                      value={shippingData.region}
                      onChange={(e) => setShippingData(prev => ({ ...prev, region: e.target.value }))}
                      className="bg-input border-border focus:ring-primary"
                      required
                    />
                  </div>
                  <Input
                    placeholder="Postal Code *"
                    value={shippingData.postalCode}
                    onChange={(e) => setShippingData(prev => ({ ...prev, postalCode: e.target.value }))}
                    className="bg-input border-border focus:ring-primary"
                    required
                  />
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sameAsShipping"
                      checked={sameAsShipping}
                      onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
                    />
                    <Label htmlFor="sameAsShipping">Same as shipping address</Label>
                  </div>
                  
                  {!sameAsShipping && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="First Name *"
                          value={billingData.firstName}
                          onChange={(e) => setBillingData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="bg-input border-border focus:ring-primary"
                        />
                        <Input
                          placeholder="Last Name *"
                          value={billingData.lastName}
                          onChange={(e) => setBillingData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="bg-input border-border focus:ring-primary"
                        />
                      </div>
                      <Input
                        placeholder="Address Line 1 *"
                        value={billingData.line1}
                        onChange={(e) => setBillingData(prev => ({ ...prev, line1: e.target.value }))}
                        className="bg-input border-border focus:ring-primary"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="City *"
                          value={billingData.city}
                          onChange={(e) => setBillingData(prev => ({ ...prev, city: e.target.value }))}
                          className="bg-input border-border focus:ring-primary"
                        />
                        <Input
                          placeholder="Postal Code *"
                          value={billingData.postalCode}
                          onChange={(e) => setBillingData(prev => ({ ...prev, postalCode: e.target.value }))}
                          className="bg-input border-border focus:ring-primary"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="pt-6">
                  <Label htmlFor="notes">Order Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for your order..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-input border-border focus:ring-primary mt-2"
                    rows={3}
                  />
                </CardContent>
              </Card>
                </form>
              )}

              {paymentStep === 'payment' && (
                <div className="space-y-6">
                  <Button
                    onClick={() => setPaymentStep('info')}
                    variant="outline"
                    className="mb-4"
                  >
                    ← Back to Information
                  </Button>
                  <PaymentForm
                    amount={finalTotal}
                    onPaymentSuccess={handlePaymentSuccess}
                    customerEmail={customerData.email}
                  />
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <h3 className="text-lg font-semibold">Processing Your Order</h3>
                    <p className="text-muted-foreground">
                      Please wait while we finalize your order...
                    </p>
                  </div>
                </div>
              )}
            </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="bg-gradient-card border-border/50 sticky top-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {item.product?.name || 'Unknown Product'}
                        </div>
                        {item.variant?.title && (
                          <div className="text-xs text-muted-foreground">
                            {item.variant.title}
                          </div>
                        )}
                        <div className="text-xs text-accent">
                          Qty: {item.quantity}
                        </div>
                      </div>
                      <div className="text-primary font-medium">
                        {item.variant ? formatPrice(item.variant.price * item.quantity) : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="bg-border" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <Separator className="bg-border" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary neon-text">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {paymentStep === 'info' && (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || items.length === 0}
                    className="w-full bg-gradient-primary hover:bg-primary-glow border-0 shadow-glow"
                    size="lg"
                  >
                    {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Elements>
    </DialogContent>
  </Dialog>
);
};