"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { LogIn, User, X, LogOut } from "lucide-react"

export function LoginWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [currentUser, setCurrentUser] = useState("")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username && password) {
      setIsLoggedIn(true)
      setCurrentUser(username)
      setIsOpen(false)
      setPassword("")
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser("")
    setUsername("")
    setShowLogoutConfirm(false)
  }

  if (isLoggedIn) {
    return (
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2">
        <div className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <User className="h-4 w-4" />
          {currentUser}
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
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Enviar
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
