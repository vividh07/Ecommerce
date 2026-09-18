import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import type { Order } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { IconCheck } from '../components/icons/Icons';

export function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;
    api.get(`/orders/${orderId}`).then((res) => setOrder(res.data.data.order));
  }, [orderId]);

  if (!order) return <Skeleton className="mx-auto mt-12 h-64 max-w-lg w-full" />;

  return (
    <div className="mx-auto max-w-2xl text-center">
      <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'CONFIRMATION' }]} />
      <div className="mx-auto mt-12 flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent bg-accent/10">
        <IconCheck className="h-10 w-10 text-accent" />
      </div>
      <h1 className="page-title mt-8">Good things ahead.</h1>
      <p className="mt-4 text-muted">
        Order confirmed! Your order #{order._id.slice(-4)} has been placed successfully.
      </p>
      <div className="card mt-10 grid grid-cols-3 gap-4 p-6 text-left text-sm">
        <div>
          <p className="text-muted">Order number</p>
          <p className="font-semibold">#{order._id.slice(-6).toUpperCase()}</p>
        </div>
        <div>
          <p className="text-muted">Amount</p>
          <p className="font-semibold">${order.totalAmount.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-muted">Items</p>
          <p className="font-semibold">{order.items.length} items</p>
        </div>
      </div>
      <p className="mt-6 text-sm text-muted">Order updates will appear in your account.</p>
      <Link to={`/orders/${order._id}`} className="btn-primary mt-8 inline-flex">View order →</Link>
      <Link to="/browse" className="btn-outline mt-4 ml-0 inline-flex w-full sm:w-auto">Continue shopping</Link>
    </div>
  );
}
