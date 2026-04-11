import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from './GlassCard'

const LazyImage = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ minHeight: '200px' }}>
      {!isLoaded && (
        <div className="absolute inset-0 skeleton" />
      )}
      <img
        src={isInView ? src : ''}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />
    </div>
  )
}

const TechBadge = ({ tech }) => (
  <motion.span
    whileHover={{ scale: 1.05, y: -2 }}
    className="px-3 py-1.5 text-xs font-medium bg-white/10 border border-white/15 rounded-full text-white/90 hover:bg-white/15 hover:border-white/25 transition-all"
  >
    {tech}
  </motion.span>
)

const ProjectCard = ({
  project,
  onClick,
  index = 0
}) => {
  const hasLiveLink = Boolean(project.live_link)
  const hasGithubLink = Boolean(project.github_link)

  const handleCardClick = () => {
    if (onClick) {
      onClick(project)
    }
  }

  const handleLinkClick = (e, link) => {
    e.stopPropagation()
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      <GlassCard
        onClick={handleCardClick}
        className="p-0 overflow-hidden cursor-pointer group"
      >
        <div className="relative">
          {/* Image Section */}
          <div className="relative h-48 overflow-hidden rounded-t-2xl">
            {project.image ? (
              <LazyImage
                src={project.image}
                alt={project.title}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                <svg className="w-12 h-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* LIVE Badge */}
            {hasLiveLink && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-3 right-3 px-2.5 py-1 text-xs font-bold bg-red-500/90 text-white rounded-md shadow-lg"
              >
                LIVE
              </motion.div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content Section */}
          <div className="p-5">
            {/* Title */}
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white/90 transition-colors">
              {project.title}
            </h3>

            {/* Short Description */}
            <p className="text-sm text-white/60 leading-relaxed mb-4 line-clamp-2">
              {project.short_description}
            </p>

            {/* Tech Stack */}
            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech_stack.slice(0, 4).map((tech, idx) => (
                  <TechBadge key={idx} tech={tech} />
                ))}
                {project.tech_stack.length > 4 && (
                  <span className="px-3 py-1.5 text-xs font-medium text-white/50">
                    +{project.tech_stack.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
              {/* GitHub Button */}
              {hasGithubLink && (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => handleLinkClick(e, project.github_link)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/25 rounded-xl text-white/90 transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  GitHub
                </motion.button>
              )}

              {/* Live Button */}
              {hasLiveLink && (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => handleLinkClick(e, project.live_link)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white transition-all shadow-lg shadow-purple-500/20"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Live Demo
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export default ProjectCard
