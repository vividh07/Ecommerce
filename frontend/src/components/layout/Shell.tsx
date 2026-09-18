import { Link, NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition ${isActive ? 'text-accent' : 'text-muted hover:text-text'}`;

export function Shell() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border glass-strong">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link to="/" className="font-display text-xl font-bold tracking-tight">
            Nexus<span className="gradient-text">Market</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <NavLink to="/browse" className={navLinkClass}>Browse</NavLink>
            {user && (
              <>
                <NavLink to="/orders" className={navLinkClass}>Orders</NavLink>
                {(user.role === 'SELLER' || user.role === 'ADMIN') && (
                  <NavLink to="/seller" className={navLinkClass}>Seller</NavLink>
                )}
                {user.role === 'ADMIN' && (
                  <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
                )}
              </>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/cart" className="btn-ghost relative text-sm">
                  Cart
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-void"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </Link>
                <span className="hidden text-sm text-muted sm:inline">{user.name}</span>
                <button type="button" onClick={() => logout()} className="btn-ghost text-sm">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm">Join</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Outlet />
      </main>
      <footer className="mt-16 border-t border-border py-8 text-center text-sm text-muted">
        Nexus Market — Phase 1 portfolio build. Stripe test mode.
      </footer>
    </div>
  );
}
