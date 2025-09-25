import { loadStripe } from '@stripe/stripe-js';

// This is a publishable key - it's safe to expose in frontend code
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

export default stripePromise;