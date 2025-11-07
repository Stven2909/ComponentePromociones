"use client"

import { useState, useEffect } from 'react'
import { BASE_URL } from '@/lib/apiRoutes'
import { AdminDashboard } from './admin-dashboard'
import { LoginWidget } from './login-widget'

export function ProtectedDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setIsLoggedIn(false)
        setAuthLoading(false)
        return
      }

      const response = await fetch(`${BASE_URL}/any/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setIsLoggedIn(true)
      } else {
        localStorage.removeItem('auth_token')
        setIsLoggedIn(false)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      setIsLoggedIn(false)
    } finally {
      setAuthLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-4">Panel de Administración Promociones</h1>
          <p className="text-gray-600 mb-8">Inicia sesión para continuar</p>
          <LoginWidget />
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}