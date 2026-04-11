import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const PortfolioContext = createContext()

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function PortfolioProvider({ children }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPortfolioData()
  }, [])

  const fetchPortfolioData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/portfolio-data`)
      setData(response.data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch portfolio data:', err)
      setError('Failed to load portfolio data')
    } finally {
      setLoading(false)
    }
  }

  const submitContact = async (formData) => {
    try {
      let visitorIp = null
      try {
        const ipRes = await axios.get('https://api.ipify.org?format=json', { timeout: 4000 })
        visitorIp = ipRes.data?.ip || null
      } catch { /* ignore */ }
      const response = await axios.post(`${API_BASE}/contact`, { ...formData, visitor_ip: visitorIp })
      return response.data
    } catch (err) {
      console.error('Contact submission failed:', err)
      throw err
    }
  }

  const value = {
    data,
    loading,
    error,
    submitContact,
    refreshData: fetchPortfolioData
  }

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider')
  }
  return context
}
