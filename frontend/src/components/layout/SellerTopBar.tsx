import { Link } from 'react-router-dom';
import { IconBell, IconExternal, IconSearch } from '../icons/Icons';
import { sellerBtnPrimary } from '../seller/sellerUi';

export function SellerTopBar({ placeholder = 'Search orders, products, customers...' }: { placeholder?: string }) {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-[#e5e5e5] bg-white px-4 py-3.5 md:px-6">
      <div className="relative min-w-0 flex-1">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
        <input
          className="w-full rounded-[10px] border border-[#e5e5e5] bg-[#f5f5f5] py-2.5 pl-10 pr-4 text-sm text-[#111] outline-none placeholder:text-[#9ca3af] focus:border-[#d4ff3f] focus:bg-white"
          placeholder={placeholder}
        />
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          className="relative rounded-[10px] border border-[#e5e5e5] bg-white p-2.5 text-[#6b7280] hover:text-[#111]"
          aria-label="Notifications"
        >
          <IconBell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ef4444]" />
        </button>
        <Link to="/browse" className={sellerBtnPrimary('!py-2.5')}>
          Visit store
          <IconExternal className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}
