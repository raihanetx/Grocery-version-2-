'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Settings } from '@/types'

interface SettingsContextType {
  settings: Settings | null
  loading: boolean
  refetch: () => Promise<void>
}

const defaultSettings: Settings = {
  websiteName: 'GroceryHub',
  slogan: 'Freshness at your door',
  logoUrl: '',
  faviconUrl: '',
  bannerImages: [],
  insideDhakaDelivery: 60,
  outsideDhakaDelivery: 120,
  freeDeliveryMin: 1000,
  universalDelivery: 0,
  useUniversalDelivery: false,
  whatsappNumber: '',
  phoneNumber: '',
  facebookUrl: '',
  messengerUsername: '',
  aboutUs: '',
  termsConditions: '',
  refundPolicy: '',
  privacyPolicy: ''
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refetch: async () => {}
})

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

interface SettingsProviderProps {
  children: ReactNode
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(defaultSettings)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.success && data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading, refetch: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export default SettingsContext
