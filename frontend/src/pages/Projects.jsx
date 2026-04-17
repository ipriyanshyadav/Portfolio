import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import { getSkillIcon } from '../utils/skillIcons';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Projects() {
  const { data } = usePortfolio();
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const projects = [...(data?.projects || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const LIMIT = window.innerWidth < 768 ? 4 : 6;
  const visibleProjects = showAll ? projects : projects.slice(0, LIMIT);

  return (
    <section id="projects" className="py-20 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Projects</h2>
          <div className="w-16 h-1 rounded-full" style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))' }} />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProjects.map((project, i) => (
            <motion.div
              key={project.id}
              layoutId={`project-card-${project.id}`}
              onClick={() => setSelectedProject(project)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glow-card group p-6 rounded-xl cursor-pointer flex flex-col"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <motion.div
                layoutId={`project-img-${project.id}`}
                className="h-40 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.2) 100%)' }}
              >
                {project.image_url ? (
                  <img src={project.image_url.startsWith('http') ? project.image_url : `${API_BASE}${project.image_url}`} alt={project.title} className="absolute inset-0 w-full h-full object-contain" />
                ) : (
                  <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                )}
                {project.live_url && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-500/20 text-green-400 border border-green-500/40">
                    ● Live
                  </span>
                )}
              </motion.div>

              <motion.h3 layoutId={`project-title-${project.id}`} className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                {project.title}
              </motion.h3>
              <motion.p layoutId={`project-desc-${project.id}`} className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
                {project.description}
              </motion.p>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech_stack?.slice(0, 3).map((tech) => {
                  const iconUrl = getSkillIcon(tech);
                  return (
                    <span key={tech} className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-white/10 text-gray-300">
                      {iconUrl && (
                        <img src={iconUrl} alt={tech} className="w-3.5 h-3.5 object-contain flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                      )}
                      {tech}
                    </span>
                  );
                })}
              </div>

              <div className="flex gap-2 mt-auto pt-2 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black hover:bg-gray-200 transition-colors font-medium text-xs">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                )}
                {project.live_url && (
                  <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30 transition-colors font-medium text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Live
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {projects.length > LIMIT && (
          <motion.button
            onClick={() => setShowAll((v) => !v)}
            className="mt-8 mx-auto flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium text-white border border-white/20 hover:border-primary/50 transition-colors duration-300"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', backdropFilter: 'blur(12px)' }}
            whileTap={{ scale: 0.95 }}
          >
            {showAll ? 'Show Less ↑' : `More (${projects.length - LIMIT}) ↓`}
          </motion.button>
        )}
      </div>

      {/* Inline Modal */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedProject(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                layoutId={`project-card-${selectedProject.id}`}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-8 pointer-events-auto"
                style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.1)' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              >
                <div className="flex justify-between items-start mb-6">
                  <motion.h3 layoutId={`project-title-${selectedProject.id}`} className="text-2xl font-semibold text-white">
                    {selectedProject.title}
                  </motion.h3>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                <motion.div
                  layoutId={`project-img-${selectedProject.id}`}
                  className="rounded-xl mb-6 overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.2) 100%)' }}
                >
                  {selectedProject.image_url ? (
                    <img src={selectedProject.image_url.startsWith('http') ? selectedProject.image_url : `${API_BASE}${selectedProject.image_url}`} alt={selectedProject.title} className="w-full h-auto object-contain rounded-xl" />
                  ) : (
                    <div className="h-40 flex items-center justify-center">
                      <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                  )}
                </motion.div>

                <motion.p layoutId={`project-desc-${selectedProject.id}`} className="text-gray-300 mb-6">
                  {selectedProject.description}
                </motion.p>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-6">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tech_stack?.map((tech) => {
                      const iconUrl = getSkillIcon(tech);
                      return (
                        <span key={tech} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-primary/20 text-primary border border-primary/30">
                          {iconUrl && (
                            <img src={iconUrl} alt={tech} className="w-4 h-4 object-contain flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                          )}
                          {tech}
                        </span>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex gap-3">
                  {selectedProject.github_url && (
                    <a href={selectedProject.github_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-gray-200 transition-colors font-medium">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      GitHub
                    </a>
                  )}
                  {selectedProject.live_url && (
                    <a href={selectedProject.live_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30 transition-colors font-medium">
                      ● Live
                    </a>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
