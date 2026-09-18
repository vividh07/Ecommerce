import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import type { Order } from '../types';
import { Skeleton } from '../components/ui/Skeleton';

export function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;
    api.get(`/orders/${orderId}`).then((res) => setOrder(res.data.data));
  }, [orderId]);

  if (!order) return <Skeleton className="h-48 w-full" />;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto max-w-xl glass rounded-3xl p-8 text-center"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-2xl text-success">
        ✓
      </div>
      <h1 className="font-display text-3xl font-bold">Order confirmed</h1>
      <p className="mt-2 text-muted">Thank you — your payment was received.</p>
      <p className="mt-4 text-sm text-muted">Order #{order._id.slice(-8).toUpperCase()}</p>
      <p className="text-2xl font-semibold text-accent">${order.totalAmount.toFixed(2)}</p>
      {order.sellerBreakdown.length > 1 && (
        <div className="mt-6 text-left text-sm">
          <p className="font-medium">Fulfilled by {order.sellerBreakdown.length} sellers</p>
          <ul className="mt-2 space-y-1 text-muted">
            {order.sellerBreakdown.map((s) => (
              <li key={s.sellerId}>{s.storeName}: ${s.subtotal.toFixed(2)}</li>
            ))}
          </ul>
        </div>
      )}
      <Link to="/orders" className="btn-primary mt-8 inline-flex">View order history</Link>
    </motion.div>
  );
}
