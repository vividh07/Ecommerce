import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { Skeleton } from '../components/ui/Skeleton';

type RoomState = {
  roomCode: string;
  hostUserId: string;
  status: string;
  shortlist: Array<{
    productId: string;
    name: string;
    basePrice: number;
    image: string | null;
    addedByName: string;
    votes: { up: number; down: number; score: number };
  }>;
  participants: Array<{ userId: string; name: string }>;
  presence: Array<{ userId: string; name: string }>;
};

export function ShoppingRoomPage() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const { activeCartId, refresh: refreshCart } = useCart();
  const [state, setState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (!roomCode) return;
    api
      .get(`/shopping-rooms/${roomCode}`)
      .then((res) => setState(res.data.data))
      .catch(() => toast.error('Room not found'))
      .finally(() => setLoading(false));

    const socket = getSocket();
    if (!socket) return;
    socket.emit('shopping:join', { roomCode }, (ack: { ok: boolean; message?: string }) => {
      if (!ack?.ok) toast.error(ack?.message ?? 'Could not join live room');
    });
    socket.on('shopping:state', (payload: RoomState) => {
      if (payload.roomCode === roomCode.toUpperCase()) setState(payload);
    });
    return () => {
      socket.emit('shopping:leave', { roomCode });
      socket.off('shopping:state');
    };
  }, [roomCode]);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      return;
    }
    api
      .get('/catalog/products', { params: { q: debouncedSearch, limit: 6 } })
      .then((res) => setSearchResults(res.data.items ?? []));
  }, [debouncedSearch]);

  function emitVote(productId: string, vote: 'up' | 'down') {
    const socket = getSocket();
    socket?.emit('shopping:vote', { roomCode, productId, vote });
  }

  function shortlistProduct(productId: string) {
    const socket = getSocket();
    socket?.emit('shopping:shortlist:add', { roomCode, productId });
    toast.success('Added to room shortlist');
    setSearch('');
  }

  async function addToMyCart(productId: string) {
    try {
      await api.post(`/shopping-rooms/${roomCode}/add-to-cart`, {
        productId,
        cartId: activeCartId,
      });
      await refreshCart();
      toast.success('Added to your cart');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Could not add to cart');
    }
  }

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!state) return <p className="text-muted">Room unavailable.</p>;

  const code = state.roomCode;
  const isHost = user?.id === state.hostUserId;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/shopping-room" className="text-sm text-accent hover:underline">← Lobby</Link>
          <h1 className="mt-2 font-display text-3xl font-bold">
            Room <span className="gradient-text">{code}</span>
          </h1>
          <p className="text-sm text-muted">{state.status === 'ACTIVE' ? 'Live session' : 'Closed'}</p>
        </div>
        <div className="glass rounded-2xl px-4 py-3">
          <p className="text-xs text-muted">Online now</p>
          <div className="mt-2 flex -space-x-2">
            {(state.presence?.length ? state.presence : state.participants).map((p) => (
              <span
                key={p.userId}
                title={p.name}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-void bg-accent/20 text-xs font-bold text-accent"
              >
                {p.name.slice(0, 2).toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="font-display text-lg font-semibold">Add from catalog</h2>
        <input
          className="input-field mt-3"
          placeholder="Search products to shortlist…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {searchResults.length > 0 && (
          <ul className="mt-3 space-y-2">
            {searchResults.map((p) => (
              <li key={p._id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                <span>{p.name}</span>
                <button type="button" className="text-accent hover:underline" onClick={() => shortlistProduct(p._id)}>
                  Shortlist
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold">Live shortlist</h2>
        {state.shortlist.length === 0 ? (
          <p className="mt-4 text-muted">No products yet — search and shortlist items for the group.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {state.shortlist.map((item) => (
                <motion.article
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass overflow-hidden rounded-2xl"
                >
                  {item.image && (
                    <img src={item.image} alt="" className="aspect-video w-full object-cover" />
                  )}
                  <div className="p-4">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted">Added by {item.addedByName}</p>
                    <p className="mt-1 text-accent">${item.basePrice.toFixed(2)}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button type="button" className="btn-ghost px-3 py-1 text-sm" onClick={() => emitVote(item.productId, 'up')}>
                        ▲ {item.votes.up}
                      </button>
                      <button type="button" className="btn-ghost px-3 py-1 text-sm" onClick={() => emitVote(item.productId, 'down')}>
                        ▼ {item.votes.down}
                      </button>
                      <span className="ml-auto text-sm text-muted">Score {item.votes.score}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-primary mt-3 w-full text-sm"
                      onClick={() => addToMyCart(item.productId)}
                    >
                      Add to my cart
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {isHost && state.status === 'ACTIVE' && (
        <button
          type="button"
          className="btn-ghost"
          onClick={async () => {
            await api.post(`/shopping-rooms/${code}/close`);
            toast.success('Room closed');
          }}
        >
          Close room
        </button>
      )}
    </div>
  );
}
