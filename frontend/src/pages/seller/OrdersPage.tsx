import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/money';
import type { Order } from '../../types';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  SellerCard,
  SellerEmptyState,
  SellerPageHeader,
  SellerPagination,
  SellerPill,
  SellerThumb,
  formatShortDate,
  sellerBtnOutline,
  sellerBtnPrimary,
  sellerInputClass,
} from '../../components/seller/sellerUi';
import { IconCalendar, IconClose, IconDownload, IconMore, IconPin, IconTruck } from '../../components/icons/Icons';
import { Skeleton } from '../../components/ui/Skeleton';

type SellerOrder = Order & {
  orderNumber?: string;
  customer?: { name?: string; email?: string; phone?: string } | null;
  myFulfillment?: { status?: string };
  shippingAmount?: number;
};

function orderStatusMeta(status: string) {
  const s = status.toUpperCase();
  if (s === 'DELIVERED') return { label: 'Delivered', tone: 'success' as const, tab: 'delivered' };
  if (s === 'SHIPPED' || s === 'OUT_FOR_DELIVERY') return { label: 'In transit', tone: 'info' as const, tab: 'transit' };
  if (s === 'CANCELLED') return { label: 'Cancelled', tone: 'danger' as const, tab: 'cancelled' };
  if (s === 'PLACED' || s === 'CONFIRMED') return { label: 'To ship', tone: 'warning' as const, tab: 'ship' };
  return { label: status, tone: 'neutral' as const, tab: 'all' };
}

function fulfillmentStatus(o: SellerOrder) {
  return o.myFulfillment?.status ?? o.status;
}

export function OrdersPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState<SellerOrder[]>([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(orderId ?? null);
  const [detail, setDetail] = useState<SellerOrder | null>(null);
  const [carrier, setCarrier] = useState('Delhivery');
  const [tracking, setTracking] = useState('');
  const [updating, setUpdating] = useState(false);
  const debouncedQ = useDebouncedValue(q, 300);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        try {
          const res = await api.get('/sellers/orders', {
            params: { page: 1, limit: 50, q: debouncedQ || undefined },
          });
          if (!cancelled) {
            const list = res.data.items ?? [];
            setItems(list);
            setMeta(res.data.meta ?? { page: 1, total: list.length, totalPages: 1 });
            if (!selectedId && list[0]) setSelectedId(list[0]._id);
          }
          return;
        } catch (err: unknown) {
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status !== 404) throw err;
        }

        const res = await api.get('/orders/seller/mine', { params: { limit: 50 } });
        if (!cancelled) {
          const list: SellerOrder[] = res.data.items ?? [];
          const filtered = debouncedQ
            ? list.filter(
                (o) =>
                  o._id.includes(debouncedQ) ||
                  o.items?.some((i) => i.productName.toLowerCase().includes(debouncedQ.toLowerCase()))
              )
            : list;
          setItems(filtered);
          setMeta({ page: 1, total: filtered.length, totalPages: 1 });
          if (!selectedId && filtered[0]) setSelectedId(filtered[0]._id);
        }
      } catch {
        toast.error('Failed to load orders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  useEffect(() => {
    if (orderId) setSelectedId(orderId);
  }, [orderId]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        try {
          const res = await api.get(`/sellers/orders/${selectedId}`);
          if (!cancelled) setDetail(res.data.data ?? res.data);
          return;
        } catch (err: unknown) {
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status !== 404) throw err;
        }
        const fromList = items.find((o) => o._id === selectedId) ?? null;
        if (!cancelled) setDetail(fromList);
      } catch {
        if (!cancelled) setDetail(items.find((o) => o._id === selectedId) ?? null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, items]);

  const counts = useMemo(() => {
    const ship = items.filter((o) => ['PLACED', 'CONFIRMED'].includes(fulfillmentStatus(o))).length;
    const transit = items.filter((o) => ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(fulfillmentStatus(o))).length;
    const delivered = items.filter((o) => fulfillmentStatus(o) === 'DELIVERED').length;
    const cancelled = items.filter((o) => fulfillmentStatus(o) === 'CANCELLED').length;
    return { all: meta.total || items.length, ship, transit, delivered, cancelled };
  }, [items, meta.total]);

  const filtered = useMemo(() => {
    if (tab === 'ship') return items.filter((o) => ['PLACED', 'CONFIRMED'].includes(fulfillmentStatus(o)));
    if (tab === 'transit') return items.filter((o) => ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(fulfillmentStatus(o)));
    if (tab === 'delivered') return items.filter((o) => fulfillmentStatus(o) === 'DELIVERED');
    if (tab === 'cancelled') return items.filter((o) => fulfillmentStatus(o) === 'CANCELLED');
    return items;
  }, [items, tab]);

  async function markShipped() {
    if (!selectedId) return;
    setUpdating(true);
    try {
      await api.patch(`/orders/seller/${selectedId}/status`, {
        status: 'SHIPPED',
        note: tracking ? `${carrier}: ${tracking}` : carrier,
      });
      toast.success('Marked as shipped');
      setItems((prev) =>
        prev.map((o) =>
          o._id === selectedId ? { ...o, status: 'SHIPPED', myFulfillment: { status: 'SHIPPED' } } : o
        )
      );
      setDetail((d) => (d ? { ...d, status: 'SHIPPED', myFulfillment: { status: 'SHIPPED' } } : d));
    } catch {
      toast.error('Could not update status');
    } finally {
      setUpdating(false);
    }
  }

  function selectOrder(id: string) {
    setSelectedId(id);
    navigate(`/seller/orders/${id}`, { replace: true });
  }

  if (loading) return <Skeleton className="h-96 w-full !bg-[#e5e5e5]" />;

  const tabs = [
    { id: 'all', label: `All orders (${counts.all})` },
    { id: 'ship', label: `To ship (${counts.ship})` },
    { id: 'transit', label: `In transit (${counts.transit})` },
    { id: 'delivered', label: `Delivered (${counts.delivered})` },
    { id: 'cancelled', label: `Cancelled (${counts.cancelled})` },
  ];

  const addr = detail?.shippingAddress;

  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <div className="min-w-0 flex-1">
        <SellerPageHeader title="Orders" subtitle="From checkout to delivery, every order in one place." />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            className={sellerInputClass('max-w-md flex-1')}
            placeholder="Search orders by ID, customer or product..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[8px] border border-[#e5e5e5] bg-white px-3 py-2.5 text-sm text-[#374151]"
          >
            <IconCalendar className="h-4 w-4 text-[#6b7280]" />
            This month
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 border-b border-[#e5e5e5]">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`border-b-2 pb-3 text-sm ${
                tab === t.id ? 'border-[#d4ff3f] font-medium text-[#111]' : 'border-transparent text-[#6b7280]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <SellerCard className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-widest text-[#9ca3af]">
                <tr className="border-b border-[#e5e5e5]">
                  <th className="px-5 py-3 font-medium">Order ID</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Shipping</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <SellerEmptyState message="No orders found." />
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => {
                    const metaStatus = orderStatusMeta(fulfillmentStatus(o));
                    const selected = selectedId === o._id;
                    return (
                      <tr
                        key={o._id}
                        onClick={() => selectOrder(o._id)}
                        className={`cursor-pointer border-b border-[#f0f0f0] last:border-0 ${
                          selected ? 'bg-[#f7ffe0]' : 'hover:bg-[#fafafa]'
                        }`}
                      >
                        <td className="px-5 py-3.5 font-medium">
                          #{o.orderNumber ?? o._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-5 py-3.5">{o.customer?.name ?? o.shippingAddress?.fullName ?? 'Customer'}</td>
                        <td className="px-5 py-3.5 text-[#6b7280]">{formatShortDate(o.createdAt)}</td>
                        <td className="px-5 py-3.5">{formatINR(o.totalAmount)}</td>
                        <td className="px-5 py-3.5 text-[#6b7280]">
                          {(o.shippingAmount ?? 0) === 0 ? 'Free' : formatINR(o.shippingAmount ?? 0)}
                        </td>
                        <td className="px-5 py-3.5">
                          <SellerPill tone={metaStatus.tone}>{metaStatus.label}</SellerPill>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <SellerPagination
            page={meta.page}
            totalPages={meta.totalPages}
            summary={`Showing 1–${filtered.length} of ${counts.all} orders`}
          />
        </SellerCard>
      </div>

      {detail ? (
        <aside className="w-full shrink-0 xl:w-[380px]">
          <SellerCard className="sticky top-4 overflow-hidden p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    Order #{detail.orderNumber ?? detail._id.slice(-6).toUpperCase()}
                  </h3>
                  <SellerPill tone={orderStatusMeta(fulfillmentStatus(detail)).tone}>
                    {orderStatusMeta(fulfillmentStatus(detail)).label}
                  </SellerPill>
                </div>
                <p className="mt-1 text-xs text-[#6b7280]">
                  Ordered {formatShortDate(detail.createdAt)}
                </p>
              </div>
              <div className="flex gap-1">
                <button type="button" className="p-1 text-[#9ca3af]" aria-label="More">
                  <IconMore className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="p-1 text-[#9ca3af]"
                  aria-label="Close"
                  onClick={() => {
                    setSelectedId(null);
                    navigate('/seller/orders', { replace: true });
                  }}
                >
                  <IconClose className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-[10px] border border-[#e5e5e5] p-3">
              <p className="font-medium">{detail.customer?.name ?? addr?.fullName ?? 'Customer'}</p>
              {detail.customer?.phone ? <p className="mt-0.5 text-sm text-[#6b7280]">{detail.customer.phone}</p> : null}
              {addr ? (
                <p className="mt-2 flex gap-2 text-sm text-[#6b7280]">
                  <IconPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {addr.line1}, {addr.city}, {addr.state} {addr.postalCode}
                  </span>
                </p>
              ) : null}
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold">Items ({detail.items?.length ?? 0})</p>
              <ul className="mt-3 space-y-3">
                {(detail.items ?? []).map((item, idx) => (
                  <li key={`${item.productName}-${idx}`} className="flex items-center gap-3">
                    <SellerThumb label={item.productName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-[#6b7280]">
                        {item.variantLabel || 'Default'} · Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">{formatINR(item.lineTotal)}</p>
                  </li>
                ))}
              </ul>
            </div>

            <dl className="mt-5 space-y-2 border-t border-[#e5e5e5] pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#6b7280]">Subtotal</dt>
                <dd>{formatINR(detail.subtotalAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6b7280]">Shipping</dt>
                <dd>{(detail.shippingAmount ?? 0) === 0 ? 'Free' : formatINR(detail.shippingAmount ?? 0)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd>{formatINR(detail.totalAmount)}</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center justify-between rounded-[10px] bg-[#f9fafb] px-3 py-2.5 text-sm">
              <span className="text-[#6b7280]">Payment</span>
              <SellerPill tone={detail.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                {detail.paymentStatus === 'PAID' ? 'Paid' : detail.paymentStatus}
              </SellerPill>
            </div>

            <div className="mt-5 border-t border-[#e5e5e5] pt-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <IconTruck className="h-4 w-4" />
                Shipment
              </div>
              <label className="text-xs text-[#6b7280]">Carrier</label>
              <select className={sellerInputClass('mt-1 mb-3')} value={carrier} onChange={(e) => setCarrier(e.target.value)}>
                <option>Delhivery</option>
                <option>BlueDart</option>
                <option>Shiprocket</option>
              </select>
              <label className="text-xs text-[#6b7280]">Tracking number</label>
              <input
                className={sellerInputClass('mt-1')}
                placeholder="Enter tracking ID"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
              />
              <button
                type="button"
                className={sellerBtnPrimary('mt-4 w-full')}
                disabled={updating}
                onClick={markShipped}
              >
                Mark as shipped
              </button>
              <button type="button" className={sellerBtnOutline('mt-2 w-full')}>
                <IconDownload className="h-4 w-4" />
                Download invoice
              </button>
            </div>
          </SellerCard>
        </aside>
      ) : null}
    </div>
  );
}
