import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const navItems = ['About', 'Projects', 'Skills', 'Experience', 'Certificates', 'Contact'];

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMenuOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const handleCVDownload = () => {
    window.open(`${API_BASE}/download-cv`, '_blank');
  };

  return (
    <>
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled || menuOpen ? 'bg-black/80 backdrop-blur-md border-b border-white/10' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-bold tracking-tight cursor-pointer"
          onClick={() => scrollToSection('home')}
        >
          <span className="text-white">Priyansh</span>
        </motion.div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item, i) => (
            <motion.button
              key={item}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              onClick={() => scrollToSection(item.toLowerCase())}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {item}
            </motion.button>
          ))}
          <span className="text-white/20">|</span>
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + navItems.length * 0.1 }}
            onClick={handleCVDownload}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            CV
          </motion.button>
        </div>

        {/* Mobile: CV + hamburger */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={handleCVDownload}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            CV
          </button>
          <button
            className="flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-white transition-transform duration-300 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-transform duration-300 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-black/90 backdrop-blur-md border-t border-white/10"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="text-sm text-gray-400 hover:text-white transition-colors text-left"
                >
                  {item}
                </button>
              ))}
              <button
                onClick={() => { handleCVDownload(); setMenuOpen(false); }}
                className="text-sm text-gray-400 hover:text-white transition-colors text-left"
              >
                Download CV
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
    </>
  );
};

export default Navbar;
