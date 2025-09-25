import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
  customerEmail: string;
}

export const PaymentForm = ({ amount, onPaymentSuccess, customerEmail }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      // For now, we'll simulate a successful payment in test mode
      // In production, you'd create a payment intent on your backend
      toast({
        title: "Test Payment Mode",
        description: "This is a demo payment. In production, integrate with your backend.",
      });
      
      // Simulate successful payment
      await onPaymentSuccess('pi_test_' + Date.now());

      // Skip actual payment processing in demo mode
      return;
    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <CreditCard className="w-5 h-5 text-primary" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePayment}>
          <div className="mb-6">
            <PaymentElement />
          </div>
          <Button
            type="submit"
            disabled={!stripe || isLoading}
            className="w-full bg-gradient-primary hover:bg-primary-glow border-0 shadow-glow"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              `Pay ${new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(amount)}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};