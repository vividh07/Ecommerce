import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { formatINR } from '../lib/money';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import type { Order } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { IconCheck, IconShippingBox, IconUser } from '../components/icons/Icons';

export function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;
    api.get(`/orders/${orderId}`).then((res) => setOrder(res.data.data.order));
  }, [orderId]);

  if (!order) return <Skeleton className="mx-auto mt-12 h-64 max-w-lg w-full" />;

  const shortId = order._id.slice(-4).toUpperCase();

  return (
    <div className="mx-auto max-w-lg text-center">
      <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'CONFIRMATION' }]} />

      <div className="relative mx-auto mt-10 inline-flex">
        <IconShippingBox className="h-28 w-28 text-white/85" />
        <span className="absolute -right-1 -top-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#d4ff3f] text-accent-fg shadow-[0_0_0_6px_rgba(212,255,63,0.15)]">
          <IconCheck className="h-5 w-5" />
        </span>
      </div>

      <h1 className="page-title mt-8">Good things ahead.</h1>
      <p className="mt-4 text-sm text-muted">
        Order confirmed! Your order #{shortId} has been placed successfully.
      </p>

      <div className="panel mt-10 grid grid-cols-3 gap-3 p-5 text-left text-sm">
        <div>
          <p className="text-xs text-muted">Order number</p>
          <p className="mt-1 font-semibold">#{shortId}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Amount</p>
          <p className="mt-1 font-semibold">{formatINR(order.totalAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Items</p>
          <p className="mt-1 font-semibold">
            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <div className="col-span-3 mt-2 flex gap-2 border-t border-border pt-4">
          {order.items.slice(0, 4).map((item, i) => (
            <div
              key={i}
              className="flex h-14 w-14 items-center justify-center rounded-[8px] border border-border bg-panel-2 text-[10px] uppercase text-muted"
              title={item.productName}
            >
              {item.productName.slice(0, 2)}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 text-left text-sm text-muted">
        <IconUser className="mt-0.5 h-5 w-5 shrink-0 text-[#d4ff3f]" />
        <p>
          Order updates will appear in your account. We&apos;ll keep you posted as your order makes
          its way to you.
        </p>
      </div>

      <Link to={`/orders/${order._id}`} className="btn-primary mt-8 inline-flex w-full">
        View order →
      </Link>
      <Link to="/browse" className="btn-outline mt-3 inline-flex w-full">
        Continue shopping
      </Link>
    </div>
  );
}
