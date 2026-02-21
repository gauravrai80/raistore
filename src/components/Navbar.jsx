import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Heart, Menu, X, Zap, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { CartSidebar } from './CartSidebar';
import { AuthModal } from './AuthModal';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
const navLinks = [
  { label: 'New Arrivals', href: '#products', tab: 'new' },
  { label: 'Fashion', href: '#products', tab: 'fashion' },
  { label: 'Electronics', href: '#products', tab: 'electronics' },
  { label: 'Home & Living', href: '#products', tab: 'home' },
  { label: 'Sale', href: '#products', tab: 'sale', accent: true },
];
export function Navbar({ onCartOpen }) {
  const navigate = useNavigate();
  const { totalItems, wishlist } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (<>
    {/* Announcement Bar */}
    <div className="gradient-orange text-white text-center py-2.5 text-xs font-semibold font-body relative overflow-hidden">
      <motion.div animate={{ x: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} className="inline-flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 fill-current" />
        Free shipping on orders over $100 · Use code <strong>NOVA20</strong> for 20% off
        <Zap className="h-3.5 w-3.5 fill-current" />
      </motion.div>
    </div>

    {/* Main Navbar */}
    <header className={cn('sticky top-0 z-40 w-full transition-all duration-300', scrolled ? 'glass shadow-md' : 'bg-card border-b border-border')}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/favicon-raistore.png" alt="RaiStore" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-display font-bold text-xl text-foreground tracking-tight">
            Rai<span className="text-gradient">Store</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (<a key={link.label} href={link.href} onClick={(e) => {
            e.preventDefault();
            if (link.tab === 'new') navigate('/?badge=New#products');
            else if (link.tab === 'sale') navigate('/?badge=Sale#products');
            else if (link.tab) navigate(`/?category=${link.tab}#products`);
            else navigate(link.href);
          }} className={cn('px-4 py-2 text-sm font-medium font-body rounded-lg transition-colors cursor-pointer', link.accent
            ? 'text-primary font-bold hover:bg-accent'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary')}>
            {link.label}
          </a>))}
        </nav>

        {/* Search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/?search=${encodeURIComponent(searchQuery)}#products`);
                }
              }}
              placeholder="Search products, brands..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-secondary border border-border rounded-xl font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-card transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Mobile search */}
          <button className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary" onClick={() => setSearchOpen(!searchOpen)}>
            <Search className="h-4.5 w-4.5" />
          </button>

          {/* Wishlist */}
          <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary">
            <Heart className="h-4 w-4" />
            {wishlist.length > 0 && (<span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center font-body">
              {wishlist.length}
            </span>)}
          </button>

          {/* User menu */}
          <div className="relative hidden sm:block">
            <button onClick={() => user ? setUserMenuOpen(!userMenuOpen) : setAuthOpen(true)} className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary">
              {user ? (<div className="w-7 h-7 gradient-orange rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold font-body">{user.email?.[0]?.toUpperCase()}</span>
              </div>) : <User className="h-4 w-4" />}
            </button>
            <AnimatePresence>
              {userMenuOpen && user && (<motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} className="absolute right-0 top-12 bg-card border border-border rounded-2xl shadow-xl-custom p-2 w-48 z-50">
                <p className="px-3 py-2 text-xs text-muted-foreground font-body truncate border-b border-border mb-1">{user.email}</p>
                <button onClick={() => { navigate('/profile'); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-body text-foreground hover:bg-secondary rounded-xl transition-colors">
                  <User className="h-3.5 w-3.5" /> My Profile
                </button>
                <button onClick={() => { navigate('/orders'); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-body text-foreground hover:bg-secondary rounded-xl transition-colors">
                  <ShoppingCart className="h-3.5 w-3.5" /> My Orders
                </button>
                {isAdmin && (<a href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm font-body text-foreground hover:bg-secondary rounded-xl transition-colors">
                  <LayoutDashboard className="h-3.5 w-3.5" /> Admin Panel
                </a>)}
                <button onClick={() => {
                  logout();
                  setUserMenuOpen(false);
                  navigate('/');
                }} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-body text-destructive hover:bg-destructive/10 rounded-xl transition-colors">
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </motion.div>)}
            </AnimatePresence>
          </div>

          {/* Cart */}
          <motion.button onClick={() => onCartOpen ? onCartOpen() : setCartOpen(true)} className="relative flex items-center gap-2 gradient-orange text-white px-3 py-2 rounded-xl shadow-brand font-body" whileTap={{ scale: 0.97 }}>
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:block text-sm font-semibold">Cart</span>
            {totalItems > 0 && (<span className="bg-card text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {totalItems}
            </span>)}
          </motion.button>

          <button className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary ml-1" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-border px-4 py-3 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-secondary border border-border rounded-xl font-body focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/?search=${encodeURIComponent(e.target.value)}#products`);
                  setSearchOpen(false);
                }
              }}
            />
          </div>
        </motion.div>)}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden border-t border-border overflow-hidden bg-card">
          <nav className="px-4 py-4 space-y-1">
            {navLinks.map(link => (<a key={link.label} href={link.href} onClick={() => {
              setMenuOpen(false);
              if (link.tab)
                window.dispatchEvent(new CustomEvent('shopify-nav-tab', { detail: link.tab }));
            }} className={cn('block px-4 py-3 text-sm font-medium font-body rounded-xl transition-colors', link.accent ? 'text-primary font-bold bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-secondary')}>
              {link.label}
            </a>))}
            {!user && (<button onClick={() => { setAuthOpen(true); setMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium font-body rounded-xl text-muted-foreground hover:bg-secondary transition-colors">
              Sign In / Register
            </button>)}
          </nav>
        </motion.div>)}
      </AnimatePresence>
    </header>

    <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
  </>);
}
