import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { Breadcrumbs } from '../components/layout/ShopNavbar';

export function ShoppingRoomLobbyPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  return (
    <div className="mx-auto max-w-xl">
      <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'SHOPPING ROOM' }]} />
      <h1 className="page-title mt-4">Shop together.</h1>
      <p className="mt-3 text-muted">Create a room, share the code, vote on picks — everyone checks out separately.</p>
      <button type="button" className="btn-primary mt-8 w-full" onClick={async () => {
        try {
          const res = await api.post('/shopping-rooms');
          navigate(`/room/${res.data.data.roomCode}`);
        } catch {
          toast.error('Could not create room');
        }
      }}>Start a room</button>
      <form className="mt-8 flex gap-2" onSubmit={async (e) => {
        e.preventDefault();
        await api.post(`/shopping-rooms/${code}/join`);
        navigate(`/room/${code}`);
      }}>
        <input className="input-field uppercase" placeholder="Room code" value={code} onChange={(e) => setCode(e.target.value)} />
        <button type="submit" className="btn-outline">Join</button>
      </form>
      <Link to="/dashboard" className="mt-6 inline-block text-sm text-accent">Post-purchase dashboard →</Link>
    </div>
  );
}
