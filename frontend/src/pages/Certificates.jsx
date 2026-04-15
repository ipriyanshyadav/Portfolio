import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';

function CertModal({ cert, onClose }) {
  return (
    <AnimatePresence>
      {cert && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-lg rounded-2xl p-8 pointer-events-auto"
              style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-semibold text-white">{cert.title}</h3>
                  <p className="text-primary mt-1">{cert.issuer}</p>
                  {cert.date && <p className="text-xs text-gray-500 mt-1">{cert.date}</p>}
                </div>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              {cert.description && <p className="text-sm text-gray-300 mb-6">{cert.description}</p>}
              {cert.credential_url && (
                <a href={cert.credential_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white border border-white/20 hover:border-primary/50 transition-colors"
                  style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.1), rgba(157,0,255,0.1))', backdropFilter: 'blur(12px)' }}
                >
                  View Credential ↗
                </a>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

const cardVariants = {
  hidden: { opacity: 0, x: -60 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' } }),
};

export default function Certificates() {
  const { data } = usePortfolio();
  const [selected, setSelected] = useState(null);

  if (!data?.certificates_enabled) return null;

  const certificates = data?.certificates || [];
  if (!certificates.length) return null;

  return (
    <section id="certificates" className="py-20 px-6 min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Certificates</h2>
          <div className="w-16 h-1 rounded-full" style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))' }} />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, i) => (
            <motion.div
              key={cert.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => setSelected(cert)}
              className="p-6 rounded-xl cursor-pointer flex flex-col gap-2 hover:bg-white/10 transition-colors duration-300"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(157,0,255,0.15))' }}>
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                {cert.credential_url && (
                  <span className="text-xs text-primary/60 border border-primary/20 rounded-full px-2 py-0.5">Verified</span>
                )}
              </div>
              <h3 className="text-base font-semibold text-white mt-1">{cert.title}</h3>
              <p className="text-sm text-primary">{cert.issuer}</p>
              {cert.date && <p className="text-xs text-gray-500">{cert.date}</p>}
              {cert.description && <p className="text-xs text-gray-400 line-clamp-2 mt-1">{cert.description}</p>}
            </motion.div>
          ))}
        </div>
      </div>

      <CertModal cert={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
