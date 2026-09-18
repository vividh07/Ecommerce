import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import { useCart } from '../context/CartContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { Skeleton } from '../components/ui/Skeleton';

type RoomState = {
  roomCode: string;
  hostUserId: string;
  status: string;
  shortlist: any[];
  presence: { userId: string; name: string }[];
};

export function ShoppingRoomPage() {
  const { roomCode } = useParams();
  const { activeCartId, refresh } = useCart();
  const [state, setState] = useState<RoomState | null>(null);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!roomCode) return;
    api.get(`/shopping-rooms/${roomCode}`).then((r) => setState(r.data.data));
    const socket = getSocket();
    socket?.emit('shopping:join', { roomCode });
    socket?.on('shopping:state', (s: RoomState) => setState(s));
    return () => { socket?.emit('shopping:leave', { roomCode }); socket?.off('shopping:state'); };
  }, [roomCode]);

  useEffect(() => {
    if (!debounced) return setResults([]);
    api.get('/catalog/products', { params: { q: debounced, limit: 5 } }).then((r) => setResults(r.data.items ?? []));
  }, [debounced]);

  if (!state) return <Skeleton className="h-96 w-full" />;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'ROOM', to: '/shopping-room' }, { label: state.roomCode }]} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title text-4xl">Room {state.roomCode}</h1>
        <div className="flex -space-x-2">
          {(state.presence ?? []).map((p) => (
            <span key={p.userId} className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-2 text-xs font-bold" title={p.name}>
              {p.name.slice(0, 2).toUpperCase()}
            </span>
          ))}
        </div>
      </div>
      <div className="card mt-8 p-5">
        <input className="input-field" placeholder="Search catalog to shortlist…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <ul className="mt-3 space-y-2 text-sm">
          {results.map((p) => (
            <li key={p._id} className="flex justify-between">
              <span>{p.name}</span>
              <button type="button" className="text-accent" onClick={() => getSocket()?.emit('shopping:shortlist:add', { roomCode, productId: p._id })}>Shortlist</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.shortlist.map((item) => (
          <article key={item.productId} className="card overflow-hidden">
            {item.image && <img src={item.image} alt="" className="aspect-video w-full object-cover" />}
            <div className="p-4">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-muted">▲ {item.votes.up} ▼ {item.votes.down}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" className="btn-ghost text-xs" onClick={() => getSocket()?.emit('shopping:vote', { roomCode, productId: item.productId, vote: 'up' })}>Up</button>
                <button type="button" className="btn-ghost text-xs" onClick={() => getSocket()?.emit('shopping:vote', { roomCode, productId: item.productId, vote: 'down' })}>Down</button>
                <button type="button" className="btn-primary ml-auto text-xs" onClick={async () => {
                  await api.post(`/shopping-rooms/${roomCode}/add-to-cart`, { productId: item.productId, cartId: activeCartId });
                  await refresh();
                  toast.success('Added to your cart');
                }}>My cart</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <Link to="/shopping-room" className="mt-8 inline-block text-sm text-muted hover:text-accent">← Lobby</Link>
    </div>
  );
}
