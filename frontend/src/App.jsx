import React, { Suspense } from 'react'
import { PortfolioProvider } from './context/PortfolioContext'
import Navbar from './components/Navbar'
import Background from './components/Background'
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Skills from './pages/Skills'
import Experience from './pages/Experience'
import Contact from './pages/Contact'
import LoadingScreen from './components/LoadingScreen'
import ErrorBoundary from './components/ErrorBoundary'
import { AnimatePresence, motion } from 'framer-motion'

function SectionDivider() {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true, amount: 1 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
      className="max-w-6xl mx-auto px-6"
    >
      <div className="relative h-px">
        {/* Static base line */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)' }} />
        {/* Animated cyan/purple shimmer */}
        <motion.div
          animate={{ x: ['0%', '100%', '0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 h-px w-1/3"
          style={{ background: 'linear-gradient(to right, transparent, #00f5ff, #9d00ff, transparent)' }}
        />
      </div>
    </motion.div>
  )
}

function App() {
  return (
    <PortfolioProvider>
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <AnimatePresence mode="wait">
            <div className="min-h-screen relative" style={{ backgroundColor: 'var(--color-bg)' }}>
              <Background />
              <Navbar />
              <main className="relative z-10">
                <Home />
                <SectionDivider />
                <About />
                <SectionDivider />
                <Projects />
                <SectionDivider />
                <Skills />
                <SectionDivider />
                <Experience />
                <SectionDivider />
                <Contact />
              </main>
            </div>
          </AnimatePresence>
        </Suspense>
      </ErrorBoundary>
    </PortfolioProvider>
  )
}

export default App
