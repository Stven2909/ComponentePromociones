"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { LogIn, User, X, LogOut } from "lucide-react"

const API_BASE_URL = 'https://promotions.beckysflorist.site/service-main'
const AUTH_API_URL = 'https://accounts.beckysflorist.site/api/auth/authentication'

interface UserData {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
}

interface LoginResponse {
  message: string
  token: string
  username: string
}

export function LoginWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Cargar usuario si hay token guardado
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      validateToken(savedToken)
    }
  }, [])

  // Validar token con el backend
  const validateToken = async (token: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/any/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Token inválido')
      }

      const userData: UserData = await response.json()
      setCurrentUser(userData)
      setIsLoggedIn(true)
      setError("")
    } catch (err) {
      console.error('Error validando token:', err)
      localStorage.removeItem('auth_token')
      setIsLoggedIn(false)
      setCurrentUser(null)
      setError(err instanceof Error ? err.message : 'Error en validación')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!username || !password) {
      setError("Completa todos los campos")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${AUTH_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error('Credenciales inválidas')
      }

      const data: LoginResponse = await response.json()
      
      // Guardar token
      localStorage.setItem('auth_token', data.token)
      setPassword("")

      // Validar token para obtener datos del usuario
      await validateToken(data.token)
      setIsOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en el login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    setIsLoggedIn(false)
    setCurrentUser(null)
    setUsername("")
    setPassword("")
    setShowLogoutConfirm(false)
    setError("")
  }

  if (isLoggedIn && currentUser) {
    return (
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2">
        <div className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <User className="h-4 w-4" />
          <span title={`${currentUser.firstName} ${currentUser.lastName}`}>
            {currentUser.username}
          </span>
        </div>

        <Button
          onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>

        {showLogoutConfirm && (
          <Card className="absolute bottom-full mb-2 p-4 bg-slate-800 border-slate-700 shadow-xl">
            <p className="text-white text-sm mb-3">¿Deseas cerrar sesión?</p>
            <div className="flex gap-2">
              <Button onClick={handleLogout} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Sí
              </Button>
              <Button onClick={() => setShowLogoutConfirm(false)} size="sm" variant="destructive">
                No
              </Button>
            </div>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {!isOpen ? (
        <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
          <LogIn className="h-4 w-4 mr-2" />
          Iniciar sesión
        </Button>
      ) : (
        <Card className="p-6 bg-slate-800 border-slate-700 shadow-xl w-72">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">Iniciar sesión</h3>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm p-2 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">
                Usuario
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                required
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Enviar"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}