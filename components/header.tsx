"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Search, Settings, Calendar, Menu, ShoppingCart } from "lucide-react"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onMenuClick} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Panel de Control</span>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar en Panel de Control"
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm">
            <Calendar className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" className="relative">
            <ShoppingCart className="h-5 w-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              2
            </span>
          </Button>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-purple-400 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              1
            </span>
          </Button>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-gray-600">🇺🇸</span>
            <Button variant="ghost" size="sm" className="text-purple-600">
              Schedule
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
