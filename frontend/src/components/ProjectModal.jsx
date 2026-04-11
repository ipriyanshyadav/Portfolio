import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProjectModal.css';

export default function ProjectModal({ project, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="project-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="project-modal-panel"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="project-modal-close" onClick={onClose} aria-label="Close">
              ✕
            </button>

            {project.image && (
              <div className="project-modal-image">
                <img src={project.image} alt={project.title} />
              </div>
            )}

            <div className="project-modal-content">
              <h2 className="project-modal-title">{project.title}</h2>

              <p className="project-modal-description">{project.description}</p>

              {project.techStack && project.techStack.length > 0 && (
                <div className="project-modal-tech">
                  <h3>Tech Stack</h3>
                  <div className="project-modal-tech-icons">
                    {project.techStack.map((tech, index) => (
                      <span key={index} className="project-modal-tech-icon">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="project-modal-buttons">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-modal-btn project-modal-btn-github"
                  >
                    GitHub
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-modal-btn project-modal-btn-live"
                  >
                    Live
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
