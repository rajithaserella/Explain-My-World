import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Scanner', path: '/scanner' },
    { name: 'Live AI', path: '/live-scanner' },
    { name: 'Voice', path: '/voice' },
    { name: 'Languages', path: '/languages' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      scrolled || isOpen ? "bg-white/80 backdrop-blur-md border-b border-neutral-100 py-4" : "bg-transparent py-6"
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-brand-950 rounded-xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Explain My World</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map(item => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-950",
                location.pathname === item.path ? "text-brand-950" : "text-neutral-400"
              )}
            >
              {item.name}
            </Link>
          ))}
          <Link to="/live-scanner" className="btn-primary !py-2.5 !px-6 text-sm">
            Live AI Scanner
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-neutral-100 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {navItems.map(item => (
                <Link 
                  key={item.name} 
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-2xl font-display font-bold text-brand-950 hover:pl-2 transition-all"
                >
                  {item.name}
                </Link>
              ))}
              <Link 
                to="/scanner" 
                onClick={() => setIsOpen(false)}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                Try Live Demo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
