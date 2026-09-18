import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Order } from '../types';
import { Skeleton } from '../components/ui/Skeleton';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders')
      .then((res) => setOrders(res.data.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Order history</h1>
      {orders.length === 0 ? (
        <p className="mt-6 text-muted">No orders yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((o) => (
            <li key={o._id} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">#{o._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-muted">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-accent">${o.totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-muted">{o.status} · {o.paymentStatus}</p>
                </div>
              </div>
              <ul className="mt-3 text-sm text-muted">
                {o.items.slice(0, 3).map((item, idx) => (
                  <li key={idx}>{item.productName} × {item.quantity}</li>
                ))}
              </ul>
              <Link to={`/orders/${o._id}`} className="mt-3 inline-block text-sm text-accent hover:underline">
                Track order
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
