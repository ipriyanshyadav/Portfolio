import { motion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import HomepageBackground from '../components/HomepageBackground';

export default function Home() {
  const { data } = usePortfolio();
  const homepage = data?.homepage || {};
  const {
    name = 'Priyansh',
    // subheading = '',
    // cta_text = "Let's Work Together",
    // cta_email = '',
    // note_enabled = false,
    // note_text = '',
    // status_enabled = true,
    // status_text = '',
  } = homepage;

  const subtitleParts = subheading.split('|');

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      <HomepageBackground />
      <div className="text-center px-6 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4 tracking-tight"
        >
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to right, #00f5ff, #9d00ff)' }}
          >
            {name}
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-4 mb-8"
        >
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 font-light">
            {subtitleParts.map((part, idx) => (
              <span key={idx}>
                {part.trim()}
                {idx < subtitleParts.length - 1 && (
                  <span className="text-primary"> | </span>
                )}
              </span>
            ))}
          </p>
        </motion.div>

        {note_enabled && note_text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-sm text-gray-500 italic mb-6"
          >
            {note_text}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-col items-center gap-4"
        >
          {status_enabled && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.4, type: 'spring' }}
            className="flex items-center gap-2 text-base text-gray-300"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: '#00f5ff' }}
            />
            {status_text}
          </motion.div>
          )}

          <motion.a
            href={cta_email ? `mailto:${cta_email}` : '#contact'}
            onClick={cta_email ? undefined : (e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 rounded-full text-sm font-medium text-white border border-white/20 hover:border-white/50 transition-colors duration-300"
            style={{
              background: 'linear-gradient(135deg, #00f5ff22, #9d00ff22)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {cta_text}
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 bg-white/40 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
