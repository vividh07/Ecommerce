import { checkoutService, constructStripeEvent } from '../services/checkoutService.js';

export const webhookController = {
  stripe: async (req, res) => {
    const signature = req.headers['stripe-signature'];
    const event = constructStripeEvent(req.body, signature);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await checkoutService.fulfillPaidOrder(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await checkoutService.handlePaymentFailed(event.data.object.id);
        break;
      default:
        break;
    }

    res.json({ received: true });
  },
};
