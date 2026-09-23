import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { IconBell } from '../icons/Icons';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../lib/socket';

export type AccountNotification = {
  _id: string;
  title: string;
  body?: string;
  href?: string;
  read: boolean;
  createdAt: string;
};

type Variant = 'shop' | 'seller' | 'admin';

const VARIANT: Record<
  Variant,
  {
    button: string;
    panel: string;
    itemHover: string;
    unreadDot: string;
    muted: string;
    border: string;
  }
> = {
  shop: {
    button: 'relative rounded-full p-2.5 text-text transition hover:bg-hover-soft',
    panel:
      'absolute right-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-[12px] border border-border bg-panel shadow-xl',
    itemHover: 'hover:bg-hover-soft',
    unreadDot: 'bg-accent',
    muted: 'text-muted',
    border: 'border-border',
  },
  seller: {
    button:
      'relative rounded-[10px] border border-[#e5e5e5] bg-white p-2.5 text-[#6b7280] hover:text-[#111]',
    panel:
      'absolute right-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-[12px] border border-[#e5e5e5] bg-white shadow-xl',
    itemHover: 'hover:bg-[#fafafa]',
    unreadDot: 'bg-[#ef4444]',
    muted: 'text-[#6b7280]',
    border: 'border-[#e5e5e5]',
  },
  admin: {
    button: 'relative rounded-full border border-border p-2.5 text-muted hover:text-text',
    panel:
      'absolute right-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-[12px] border border-border bg-[#111] shadow-xl',
    itemHover: 'hover:bg-white/5',
    unreadDot: 'bg-[#d4ff3f]',
    muted: 'text-muted',
    border: 'border-border',
  },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell({ variant = 'shop' }: { variant?: Variant }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AccountNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const styles = VARIANT[variant];

  const unread = items.filter((n) => !n.read).length;

  async function load() {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/account/notifications');
      setItems(res.data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;
    const onNew = () => {
      void load();
    };
    socket.on('notification:new', onNew);
    socket.on('order:updated', onNew);
    return () => {
      socket.off('notification:new', onNew);
      socket.off('order:updated', onNew);
    };
  }, [user?.id]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  async function openPanel() {
    setOpen((v) => !v);
    if (!open) await load();
  }

  async function markAllRead() {
    try {
      const res = await api.post('/account/notifications/read-all');
      setItems(res.data.items ?? items.map((n) => ({ ...n, read: true })));
    } catch {
      /* ignore */
    }
  }

  async function openItem(n: AccountNotification) {
    if (!n.read) {
      try {
        await api.patch(`/account/notifications/${n._id}/read`);
        setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
  }

  if (!user) return null;

  return (
    <div className="relative" ref={rootRef}>
      <button type="button" className={styles.button} aria-label="Notifications" onClick={() => void openPanel()}>
        <IconBell className="h-4 w-4" />
        {unread > 0 ? (
          <span className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ${styles.unreadDot}`} />
        ) : null}
      </button>

      {open ? (
        <div className={styles.panel}>
          <div className={`flex items-center justify-between border-b ${styles.border} px-4 py-3`}>
            <p className="text-sm font-semibold">Notifications</p>
            {unread > 0 ? (
              <button type="button" className={`text-xs ${styles.muted} hover:underline`} onClick={() => void markAllRead()}>
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className={`px-4 py-6 text-sm ${styles.muted}`}>Loading…</p>
            ) : items.length === 0 ? (
              <p className={`px-4 py-6 text-sm ${styles.muted}`}>No notifications yet.</p>
            ) : (
              items.map((n) => {
                const content = (
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body ? <p className={`mt-0.5 truncate text-xs ${styles.muted}`}>{n.body}</p> : null}
                    <p className={`mt-1 text-[11px] ${styles.muted}`}>{timeAgo(n.createdAt)}</p>
                  </div>
                );
                const rowClass = `flex w-full items-start gap-3 px-4 py-3 text-left ${styles.itemHover} ${
                  n.read ? 'opacity-70' : ''
                }`;
                return n.href ? (
                  <Link key={n._id} to={n.href} className={rowClass} onClick={() => void openItem(n)}>
                    {!n.read ? <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${styles.unreadDot}`} /> : <span className="w-2 shrink-0" />}
                    {content}
                  </Link>
                ) : (
                  <button key={n._id} type="button" className={rowClass} onClick={() => void openItem(n)}>
                    {!n.read ? <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${styles.unreadDot}`} /> : <span className="w-2 shrink-0" />}
                    {content}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
