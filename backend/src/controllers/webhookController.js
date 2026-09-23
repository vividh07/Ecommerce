import { checkoutService, verifyWebhookSignature } from '../services/checkoutService.js';
import { ApiError } from '../utils/ApiError.js';

export const webhookController = {
  razorpay: async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      throw new ApiError(400, 'Missing Razorpay signature');
    }

    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString('utf8')
      : typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body);

    if (!verifyWebhookSignature(rawBody, signature)) {
      throw new ApiError(400, 'Invalid webhook signature');
    }

    const event = typeof req.body === 'object' && !Buffer.isBuffer(req.body)
      ? req.body
      : JSON.parse(rawBody);

    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload?.payment?.entity;
        if (payment?.order_id) {
          await checkoutService.fulfillPaidOrder({
            razorpayOrderId: payment.order_id,
            razorpayPaymentId: payment.id,
          });
        }
        break;
      }
      case 'payment.failed': {
        const payment = event.payload?.payment?.entity;
        if (payment?.order_id) {
          await checkoutService.handlePaymentFailed(payment.order_id);
        }
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  },
};
