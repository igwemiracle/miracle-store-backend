const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


module.exports = {
  stripe,
  createPaymentIntent: (amount, currency = 'usd') => {
    return stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
    });
  },
};

