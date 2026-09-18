import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function ShoppingRoomLobbyPage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [creating, setCreating] = useState(false);

  async function createRoom() {
    setCreating(true);
    try {
      const res = await api.post('/shopping-rooms');
      const code = res.data.data.roomCode;
      toast.success(`Room ${code} created`);
      navigate(`/room/${code}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Could not create room');
    } finally {
      setCreating(false);
    }
  }

  async function joinRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      await api.post(`/shopping-rooms/${joinCode.trim().toUpperCase()}/join`);
      navigate(`/room/${joinCode.trim().toUpperCase()}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Room not found');
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-8 md:p-10"
      >
        <p className="text-sm font-medium uppercase tracking-widest text-accent">Live</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Shopping Room</h1>
        <p className="mt-3 text-muted">
          Shortlist and vote on products with friends in real time. Everyone checks out on their own cart.
        </p>
        <button
          type="button"
          className="btn-primary mt-8 w-full sm:w-auto"
          disabled={creating}
          onClick={createRoom}
        >
          {creating ? 'Creating…' : 'Start a room'}
        </button>
        <form onSubmit={joinRoom} className="mt-10 border-t border-border pt-8">
          <label className="text-sm text-muted">Have a code?</label>
          <div className="mt-2 flex gap-2">
            <input
              className="input-field flex-1 uppercase"
              placeholder="e.g. A1B2C3"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <button type="submit" className="btn-ghost">Join</button>
          </div>
        </form>
        <p className="mt-6 text-xs text-muted">
          Share the link: <code className="text-accent">/room/YOUR_CODE</code>
        </p>
      </motion.div>
      <Link to="/dashboard" className="mt-6 inline-block text-sm text-accent hover:underline">
        Post-purchase dashboard →
      </Link>
    </div>
  );
}
