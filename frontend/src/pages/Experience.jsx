import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 'Present') return 'Present';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

function ExpModal({ exp, onClose }) {
  return (
    <AnimatePresence>
      {exp && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-8 pointer-events-auto"
              style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white">{exp.role}</h3>
                  <p className="text-primary mt-1">{exp.company}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(exp.start_date)} — {formatDate(exp.end_date)}
                    {exp.location && ` · ${exp.location}`}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              <ul className="space-y-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Highlights</p>
                {exp.highlights?.map((h, j) => (
                  <motion.li
                    key={j}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: j * 0.05 }}
                    className="text-sm text-gray-300 flex items-start gap-2"
                  >
                    <span className="text-primary mt-1">•</span>
                    {h}
                  </motion.li>
                ))}
                {exp.description && (
                  <li className="text-sm text-gray-300">{exp.description}</li>
                )}
              </ul>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function ExpCard({ exp, onClick }) {
  return (
    <div
      onClick={() => onClick(exp)}
      className="glow-card p-6 rounded-xl cursor-pointer hover:bg-white/10 transition-colors duration-300"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
    >
      <h3 className="text-lg font-semibold text-white mb-1">{exp.role}</h3>
      <p className="text-primary text-sm mb-2">{exp.company}</p>
      <p className="text-xs text-gray-500 mb-3">
        {formatDate(exp.start_date)} — {formatDate(exp.end_date)}
        {exp.location && ` · ${exp.location}`}
      </p>
      <ul className="space-y-1">
        {(exp.highlights || []).slice(0, 2).map((h, j) => (
          <li key={j} className="text-xs text-gray-400 flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>{h}
          </li>
        ))}
        {(exp.highlights?.length || 0) > 2 && (
          <li className="text-xs text-primary/60">+{exp.highlights.length - 2} more...</li>
        )}
      </ul>
    </div>
  );
}

export default function Experience() {
  const { data } = usePortfolio();
  const [selectedExp, setSelectedExp] = useState(null);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const experiences = data?.experience || [];

  const cardVariants = {
    hidden: { opacity: 0, x: -60 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.2, duration: 0.6, ease: 'easeOut' },
    }),
  };

  return (
    <section id="experience" ref={containerRef} className="py-20 px-6 min-h-screen relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Experience</h2>
          <div className="w-16 h-1 rounded-full" style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))' }} />
        </motion.div>

        {/* Desktop timeline */}
        <div className="hidden md:block relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-white/10" />
          <motion.div
            style={{ scaleY, originY: 0, background: 'linear-gradient(to bottom, var(--color-primary), var(--color-secondary))' }}
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px"
          />

          <div className="space-y-12">
            {experiences.map((exp, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={exp.id || i}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  className={`relative flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className="w-5/12">
                    <ExpCard exp={exp} onClick={setSelectedExp} />
                  </div>

                  <div className="w-2/12 flex justify-center">
                    {exp.is_current ? (
                      <motion.div
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-4 h-4 rounded-full bg-primary border-2 border-primary z-10"
                      />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-white/20 border-2 border-white/40 z-10" />
                    )}
                  </div>
                  <div className="w-5/12" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile list */}
        <div className="md:hidden space-y-6">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.id || i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="relative pl-8 border-l-2 border-white/20 hover:border-primary/50 transition-colors duration-300"
            >
              {exp.is_current && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -left-[9px] top-0 w-4 h-4 bg-primary rounded-full"
                />
              )}
              <ExpCard exp={exp} onClick={setSelectedExp} />
            </motion.div>
          ))}
        </div>
      </div>

      <ExpModal exp={selectedExp} onClose={() => setSelectedExp(null)} />
    </section>
  );
}
