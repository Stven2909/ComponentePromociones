"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Store,
  Tag,
  Gift,
  BarChart3,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Save,
  Copy,
} from "lucide-react"
import { Header } from "./header"
import { Footer } from "./footer"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showCreatePromotion, setShowCreatePromotion] = useState(false)
  const [showCreateCoupon, setShowCreateCoupon] = useState(false)
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState(null)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [editingCampaign, setEditingCampaign] = useState(null)

  const [promotionForm, setPromotionForm] = useState({
    name: "",
    description: "",
    type: "percentage",
    value: "",
    minPurchase: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    usageLimit: "",
    userLimit: "",
    categories: [],
    products: [],
    isActive: true,
    isStackable: false,
    requiresCode: false,
    code: "",
  })

  const [couponForm, setCouponForm] = useState({
    code: "",
    description: "",
    type: "percentage",
    value: "",
    minPurchase: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    maxUses: "",
    userLimit: "",
    categories: [],
    isActive: true,
    isStackable: false,
  })

  const [campaignForm, setCampaignForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: "",
    targetAudience: "",
    promotions: [],
    channels: [],
    isActive: true,
  })

  const stats = [
    {
      title: "Promociones Activas",
      value: "12",
      change: "+2.5%",
      changeType: "positive",
      icon: Tag,
    },
    {
      title: "Cupones Utilizados",
      value: "1,234",
      change: "+12.3%",
      changeType: "positive",
      icon: Gift,
    },
    {
      title: "Campañas en Curso",
      value: "8",
      change: "+5.1%",
      changeType: "positive",
      icon: Calendar,
    },
    {
      title: "Conversión Total",
      value: "23.4%",
      change: "+1.2%",
      changeType: "positive",
      icon: TrendingUp,
    },
  ]

  const [activePromotions, setActivePromotions] = useState([
    {
      id: "PROMO001",
      name: "Descuento Verano 2024",
      description: "Descuento especial para productos de verano",
      type: "Porcentaje",
      discount: "30%",
      status: "Activa",
      used: 245,
      limit: 500,
      expires: "2024-08-31",
      startTime: "00:00",
      endTime: "23:59",
      categories: ["Ropa", "Accesorios"],
      minPurchase: "$50",
      created: "2024-06-01",
    },
    {
      id: "PROMO002",
      name: "Envío Gratis",
      description: "Envío gratuito en compras mayores a $100",
      type: "Envío",
      discount: "100%",
      status: "Activa",
      used: 89,
      limit: 200,
      expires: "2024-07-15",
      startTime: "09:00",
      endTime: "18:00",
      categories: ["Todos"],
      minPurchase: "$100",
      created: "2024-06-10",
    },
    {
      id: "PROMO003",
      name: "2x1 Electrónicos",
      description: "Lleva 2 productos electrónicos y paga solo 1",
      type: "Cantidad",
      discount: "50%",
      status: "Pausada",
      used: 156,
      limit: 300,
      expires: "2024-09-30",
      startTime: "10:00",
      endTime: "22:00",
      categories: ["Electrónicos"],
      minPurchase: "$0",
      created: "2024-05-15",
    },
    {
      id: "PROMO004",
      name: "Primera Compra",
      description: "Descuento especial para nuevos clientes",
      type: "Fijo",
      discount: "$20",
      status: "Activa",
      used: 67,
      limit: 1000,
      expires: "2024-12-31",
      startTime: "00:00",
      endTime: "23:59",
      categories: ["Todos"],
      minPurchase: "$30",
      created: "2024-05-01",
    },
  ])

  const [coupons, setCoupons] = useState([
    {
      id: 1,
      code: "SUMMER30",
      discount: "30%",
      type: "Porcentaje",
      uses: 245,
      maxUses: 500,
      status: "Activo",
      created: "2024-06-01",
    },
    {
      id: 2,
      code: "FREESHIP",
      discount: "Gratis",
      type: "Envío",
      uses: 89,
      maxUses: 200,
      status: "Activo",
      created: "2024-06-15",
    },
    {
      id: 3,
      code: "WELCOME20",
      discount: "$20",
      type: "Fijo",
      uses: 67,
      maxUses: 1000,
      status: "Activo",
      created: "2024-05-20",
    },
    {
      id: 4,
      code: "FLASH50",
      discount: "50%",
      type: "Porcentaje",
      uses: 156,
      maxUses: 300,
      status: "Expirado",
      created: "2024-05-01",
    },
  ])

  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: "Campaña Verano",
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      budget: "$5,000",
      spent: "$3,200",
      conversions: 245,
      status: "Activa",
    },
    {
      id: 2,
      name: "Back to School",
      startDate: "2024-08-01",
      endDate: "2024-09-15",
      budget: "$3,000",
      spent: "$1,800",
      conversions: 156,
      status: "Programada",
    },
    {
      id: 3,
      name: "Black Friday",
      startDate: "2024-11-25",
      endDate: "2024-11-30",
      budget: "$10,000",
      spent: "$0",
      conversions: 0,
      status: "Borrador",
    },
  ])

  const refreshAllData = () => {
    // Simular actualización de datos después de cambios
    console.log("[v0] Refreshing all data across sections")
  }

  const handleCreatePromotion = () => {
    if (editingPromotion) {
      setActivePromotions(
        activePromotions.map((p) => (p.id === editingPromotion.id ? { ...editingPromotion, ...promotionForm } : p)),
      )
    } else {
      const newPromotion = {
        id: Date.now(),
        ...promotionForm,
        uses: 0,
        status: promotionForm.isActive ? "Activa" : "Inactiva",
      }
      setActivePromotions([...activePromotions, newPromotion])
    }
    setShowCreatePromotion(false)
    resetPromotionForm()
    refreshAllData() // Sincronizar cambios
  }

  const handleEditPromotion = (promotion) => {
    setEditingPromotion(promotion)
    setPromotionForm({
      name: promotion.name,
      description: promotion.description,
      type:
        promotion.type === "Porcentaje"
          ? "percentage"
          : promotion.type === "Fijo"
            ? "fixed"
            : promotion.type === "Envío"
              ? "shipping"
              : "quantity",
      value: promotion.discount.replace(/[%$]/g, ""),
      minPurchase: promotion.minPurchase.replace("$", ""),
      maxDiscount: "",
      startDate: "",
      endDate: promotion.expires,
      startTime: promotion.startTime,
      endTime: promotion.endTime,
      usageLimit: promotion.limit.toString(),
      userLimit: "",
      categories: promotion.categories,
      products: [],
      isActive: promotion.status === "Activa",
      isStackable: false,
      requiresCode: false,
      code: "",
    })
    setShowCreatePromotion(true)
  }

  const handleDeletePromotion = (id) => {
    setActivePromotions(activePromotions.filter((p) => p.id !== id))
    refreshAllData() // Sincronizar cambios
  }

  const handleTogglePromotionStatus = (promotionId) => {
    setActivePromotions(
      activePromotions.map((p) =>
        p.id === promotionId ? { ...p, status: p.status === "Activa" ? "Pausada" : "Activa" } : p,
      ),
    )
  }

  const resetPromotionForm = () => {
    setPromotionForm({
      name: "",
      description: "",
      type: "percentage",
      value: "",
      minPurchase: "",
      maxDiscount: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      usageLimit: "",
      userLimit: "",
      categories: [],
      products: [],
      isActive: true,
      isStackable: false,
      requiresCode: false,
      code: "",
    })
    setEditingPromotion(null)
  }

  const resetCouponForm = () => {
    setCouponForm({
      code: "",
      description: "",
      type: "percentage",
      value: "",
      minPurchase: "",
      maxDiscount: "",
      startDate: "",
      endDate: "",
      maxUses: "",
      userLimit: "",
      categories: [],
      isActive: true,
      isStackable: false,
    })
    setEditingCoupon(null)
  }

  const handleCreateCoupon = () => {
    if (editingCoupon) {
      setCoupons(coupons.map((c) => (c.id === editingCoupon.id ? { ...editingCoupon, ...couponForm } : c)))
    } else {
      const newCoupon = {
        id: Date.now(),
        ...couponForm,
        uses: 0,
        status: couponForm.isActive ? "Activo" : "Inactivo",
      }
      setCoupons([...coupons, newCoupon])
    }
    setShowCreateCoupon(false)
    resetCouponForm()
    refreshAllData() // Sincronizar cambios
  }

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon)
    setCouponForm({
      code: coupon.code,
      description: "",
      type: coupon.type === "Porcentaje" ? "percentage" : coupon.type === "Fijo" ? "fixed" : "shipping",
      value: coupon.discount.replace(/[%$]/g, "").replace("Gratis", "0"),
      minPurchase: "",
      maxDiscount: "",
      startDate: "",
      endDate: "",
      maxUses: coupon.maxUses.toString(),
      userLimit: "",
      categories: [],
      isActive: coupon.status === "Activo",
      isStackable: false,
    })
    setShowCreateCoupon(true)
  }

  const handleDeleteCoupon = (id) => {
    setCoupons(coupons.filter((c) => c.id !== id))
    refreshAllData() // Sincronizar cambios
  }

  const resetCampaignForm = () => {
    setCampaignForm({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      budget: "",
      targetAudience: "",
      promotions: [],
      channels: [],
      isActive: true,
    })
    setEditingCampaign(null)
  }

  const handleCreateCampaign = () => {
    if (editingCampaign) {
      setCampaigns(campaigns.map((c) => (c.id === editingCampaign.id ? { ...editingCampaign, ...campaignForm } : c)))
    } else {
      const newCampaign = {
        id: Date.now(),
        ...campaignForm,
        spent: 0,
        status: campaignForm.isActive ? "Activa" : "Inactiva",
      }
      setCampaigns([...campaigns, newCampaign])
    }
    setShowCreateCampaign(false)
    resetCampaignForm()
    refreshAllData() // Sincronizar cambios
  }

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign)
    setCampaignForm({
      name: campaign.name,
      description: "",
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      budget: campaign.budget.replace("$", "").replace(",", ""),
      targetAudience: "",
      promotions: [],
      channels: [],
      isActive: campaign.status === "Activa",
    })
    setShowCreateCampaign(true)
  }

  const handleDeleteCampaign = (id) => {
    setCampaigns(campaigns.filter((c) => c.id !== id))
    refreshAllData() // Sincronizar cambios
  }

  const handleToggleCouponStatus = (couponId) => {
    setCoupons(
      coupons.map((c) => (c.id === couponId ? { ...c, status: c.status === "Activo" ? "Inactivo" : "Activo" } : c)),
    )
    refreshAllData() // Sincronizar cambios
  }

  const handleToggleCampaignStatus = (campaignId) => {
    setCampaigns(
      campaigns.map((c) => (c.id === campaignId ? { ...c, status: c.status === "Activa" ? "Pausada" : "Activa" } : c)),
    )
    refreshAllData() // Sincronizar cambios
  }

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "promotions", label: "Promociones", icon: Tag },
    { id: "coupons", label: "Cupones", icon: Gift },
    { id: "campaigns", label: "Campañas", icon: Calendar },
  ]

  const recentActivity = [
    { action: "Nueva promoción 'Verano'", time: "Hace 5 minutos", status: "Activa", type: "success" },
    { action: "Cupón 'FREESHIP' expirado", time: "Hace 1 hora", status: "Expirado", type: "warning" },
    { action: "Campaña 'Black Friday' creada", time: "Ayer", status: "Borrador", type: "info" },
  ]

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "w-64" : "w-16"} transition-all duration-300 bg-slate-900 border-r border-slate-800`}
        >
          <div className="p-4">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
              {sidebarOpen && <h1 className="text-xl font-bold text-white">Panel Promociones</h1>}
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? "bg-purple-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content */}
          <main className="flex-1 overflow-auto p-6 bg-gray-50">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <Card key={index} className="bg-white border border-gray-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                              <p className="text-sm text-purple-400 mt-1">{stat.change} Este mes</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Icon className="h-6 w-6 text-purple-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Promociones Activas</CardTitle>
                    <CardDescription>Resumen de las promociones actualmente en funcionamiento.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Promoción</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descuento</TableHead>
                          <TableHead>Uso</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Expira</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activePromotions.slice(0, 4).map((promo) => (
                          <TableRow key={promo.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{promo.name}</div>
                                <div className="text-sm text-muted-foreground">{promo.id}</div>
                              </div>
                            </TableCell>
                            <TableCell>{promo.type}</TableCell>
                            {/* Cambiando color de descuento de text-primary a text-purple-600 */}
                            <TableCell className="font-medium text-purple-600">{promo.discount}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {promo.used}/{promo.limit}
                                <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                                  <div
                                    className="bg-purple-600 h-1.5 rounded-full"
                                    style={{ width: `${(promo.used / promo.limit) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {/* Cambiando badge de estado a variante purple */}
                              <Badge
                                variant={promo.status === "Activa" ? "default" : "secondary"}
                                className={promo.status === "Activa" ? "bg-purple-600 hover:bg-purple-700" : ""}
                              >
                                {promo.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{promo.expires}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Actividad Reciente</CardTitle>
                    <CardDescription className="text-gray-600">Últimas acciones en promociones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                          <Badge
                            variant={activity.type === "success" ? "default" : "secondary"}
                            className="bg-purple-100 text-purple-800"
                          >
                            {activity.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "promotions" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">Gestión de Promociones</h3>
                  <Button
                    onClick={() => setShowCreatePromotion(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Promoción
                  </Button>
                </div>

                {/* Promotions Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar promociones..." className="pl-10 w-80" />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="active">Activas</SelectItem>
                        <SelectItem value="paused">Pausadas</SelectItem>
                        <SelectItem value="expired">Expiradas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Promotions Table */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Promoción</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descuento</TableHead>
                          <TableHead>Horario</TableHead>
                          <TableHead>Progreso</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Expira</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activePromotions.map((promo) => (
                          <TableRow key={promo.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{promo.name}</div>
                                <div className="text-sm text-muted-foreground">{promo.description}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Min: {promo.minPurchase} • {promo.categories.join(", ")}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{promo.type}</Badge>
                            </TableCell>
                            {/* Cambiando color de descuento de text-primary a text-purple-600 */}
                            <TableCell className="font-medium text-purple-600">{promo.discount}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3" />
                                {promo.startTime} - {promo.endTime}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  {promo.used}/{promo.limit}
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                  <div
                                    className="bg-purple-600 h-2 rounded-full transition-all"
                                    style={{ width: `${(promo.used / promo.limit) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={promo.status === "Activa" ? "default" : "secondary"}
                                className={
                                  promo.status === "Activa"
                                    ? "bg-purple-600 hover:bg-purple-700 cursor-pointer"
                                    : "cursor-pointer"
                                }
                                onClick={() => handleTogglePromotionStatus(promo.id)}
                              >
                                {promo.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{promo.expires}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleEditPromotion(promo)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeletePromotion(promo.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "coupons" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">Gestión de Cupones</h3>
                  <Button
                    onClick={() => setShowCreateCoupon(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Cupón
                  </Button>
                </div>

                {/* Coupons Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar cupones..." className="pl-10 w-80" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                </div>

                {/* Coupons Table */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descuento</TableHead>
                          <TableHead>Usos</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Creado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {coupons.map((coupon) => (
                          <TableRow key={coupon.id}>
                            <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{coupon.type}</Badge>
                            </TableCell>
                            {/* Cambiando color de descuento de text-primary a text-purple-600 */}
                            <TableCell className="font-medium text-purple-600">{coupon.discount}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm">
                                  {coupon.uses}/{coupon.maxUses}
                                </div>
                                <div className="w-full bg-secondary rounded-full h-1.5">
                                  <div
                                    className="bg-purple-600 h-1.5 rounded-full"
                                    style={{ width: `${(coupon.uses / coupon.maxUses) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={coupon.status === "Activo" ? "default" : "destructive"}
                                className={
                                  coupon.status === "Activo"
                                    ? "bg-purple-500 hover:bg-purple-600 cursor-pointer"
                                    : "cursor-pointer"
                                }
                                onClick={() => handleToggleCouponStatus(coupon.id)}
                              >
                                {coupon.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{coupon.created}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleEditCoupon(coupon)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteCoupon(coupon.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "campaigns" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">Gestión de Campañas</h3>
                  <Button
                    onClick={() => setShowCreateCampaign(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Campaña
                  </Button>
                </div>

                {/* Campaigns Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar campañas..." className="pl-10 w-80" />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="active">Activas</SelectItem>
                        <SelectItem value="scheduled">Programadas</SelectItem>
                        <SelectItem value="draft">Borradores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Campaigns Table */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Campaña</TableHead>
                          <TableHead>Período</TableHead>
                          <TableHead>Presupuesto</TableHead>
                          <TableHead>Gastado</TableHead>
                          <TableHead>Conversiones</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {campaigns.map((campaign) => (
                          <TableRow key={campaign.id}>
                            <TableCell className="font-medium">{campaign.name}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{campaign.startDate}</div>
                                <div className="text-muted-foreground">{campaign.endDate}</div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{campaign.budget}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm">
                                  ${campaign.spent.toLocaleString()} / ${campaign.budget.replace(/[$,]/g, "")}
                                </div>
                                <div className="w-full bg-secondary rounded-full h-1.5">
                                  <div
                                    className="bg-purple-500 h-1.5 rounded-full"
                                    style={{
                                      width: `${Math.min((campaign.spent / Number.parseInt(campaign.budget.replace(/[$,]/g, ""))) * 100, 100)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{campaign.conversions}</TableCell>
                            <TableCell>
                              <Badge
                                variant={campaign.status === "Activa" ? "default" : "secondary"}
                                className={
                                  campaign.status === "Activa"
                                    ? "bg-purple-500 hover:bg-purple-600 cursor-pointer"
                                    : "cursor-pointer"
                                }
                                onClick={() => handleToggleCampaignStatus(campaign.id)}
                              >
                                {campaign.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleEditCampaign(campaign)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteCampaign(campaign.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            <Dialog open={showCreatePromotion} onOpenChange={setShowCreatePromotion}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-2 border-purple-200">
                <DialogHeader>
                  <DialogTitle className="text-slate-800">
                    {editingPromotion ? "Editar Promoción" : "Crear Nueva Promoción"}
                  </DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Configura todos los detalles de tu promoción incluyendo fechas, horarios y condiciones.
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full bg-white">
                  <TabsList className="grid w-full grid-cols-4 bg-purple-50">
                    <TabsTrigger
                      value="basic"
                      className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      Básico
                    </TabsTrigger>
                    <TabsTrigger
                      value="conditions"
                      className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      Condiciones
                    </TabsTrigger>
                    <TabsTrigger
                      value="schedule"
                      className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      Horarios
                    </TabsTrigger>
                    <TabsTrigger
                      value="advanced"
                      className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      Avanzado
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 bg-white p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre de la Promoción</Label>
                        <Input
                          id="name"
                          value={promotionForm.name}
                          onChange={(e) => setPromotionForm({ ...promotionForm, name: e.target.value })}
                          placeholder="Ej: Descuento Verano 2024"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Descuento</Label>
                        <Select
                          value={promotionForm.type}
                          onValueChange={(value) => setPromotionForm({ ...promotionForm, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                            <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                            <SelectItem value="shipping">Envío Gratis</SelectItem>
                            <SelectItem value="quantity">Por Cantidad (2x1, 3x2)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={promotionForm.description}
                        onChange={(e) => setPromotionForm({ ...promotionForm, description: e.target.value })}
                        placeholder="Describe los detalles de la promoción..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="value">Valor del Descuento</Label>
                        <Input
                          id="value"
                          type="number"
                          value={promotionForm.value}
                          onChange={(e) => setPromotionForm({ ...promotionForm, value: e.target.value })}
                          placeholder={promotionForm.type === "percentage" ? "30" : "20"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minPurchase">Compra Mínima ($)</Label>
                        <Input
                          id="minPurchase"
                          type="number"
                          value={promotionForm.minPurchase}
                          onChange={(e) => setPromotionForm({ ...promotionForm, minPurchase: e.target.value })}
                          placeholder="50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxDiscount">Descuento Máximo ($)</Label>
                        <Input
                          id="maxDiscount"
                          type="number"
                          value={promotionForm.maxDiscount}
                          onChange={(e) => setPromotionForm({ ...promotionForm, maxDiscount: e.target.value })}
                          placeholder="100"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="conditions" className="space-y-4 bg-white p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="usageLimit">Límite de Usos Total</Label>
                        <Input
                          id="usageLimit"
                          type="number"
                          value={promotionForm.usageLimit}
                          onChange={(e) => setPromotionForm({ ...promotionForm, usageLimit: e.target.value })}
                          placeholder="500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userLimit">Límite por Usuario</Label>
                        <Input
                          id="userLimit"
                          type="number"
                          value={promotionForm.userLimit}
                          onChange={(e) => setPromotionForm({ ...promotionForm, userLimit: e.target.value })}
                          placeholder="1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Categorías Aplicables</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {["Ropa", "Electrónicos", "Hogar", "Deportes", "Libros", "Juguetes"].map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={category}
                              checked={promotionForm.categories.includes(category)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPromotionForm({
                                    ...promotionForm,
                                    categories: [...promotionForm.categories, category],
                                  })
                                } else {
                                  setPromotionForm({
                                    ...promotionForm,
                                    categories: promotionForm.categories.filter((c) => c !== category),
                                  })
                                }
                              }}
                            />
                            <Label htmlFor={category} className="text-sm">
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requiresCode"
                        checked={promotionForm.requiresCode}
                        onCheckedChange={(checked) => setPromotionForm({ ...promotionForm, requiresCode: checked })}
                      />
                      <Label htmlFor="requiresCode">Requiere Código de Cupón</Label>
                    </div>

                    {promotionForm.requiresCode && (
                      <div className="space-y-2">
                        <Label htmlFor="code">Código del Cupón</Label>
                        <div className="flex gap-2">
                          <Input
                            id="code"
                            value={promotionForm.code}
                            onChange={(e) => setPromotionForm({ ...promotionForm, code: e.target.value.toUpperCase() })}
                            placeholder="VERANO30"
                          />
                          <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="schedule" className="space-y-4 bg-white p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Fecha de Inicio</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={promotionForm.startDate}
                          onChange={(e) => setPromotionForm({ ...promotionForm, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">Fecha de Fin</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={promotionForm.endDate}
                          onChange={(e) => setPromotionForm({ ...promotionForm, endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Hora de Inicio</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={promotionForm.startTime}
                          onChange={(e) => setPromotionForm({ ...promotionForm, startTime: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">Hora de Fin</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={promotionForm.endTime}
                          onChange={(e) => setPromotionForm({ ...promotionForm, endTime: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium mb-2 text-slate-800">Vista Previa del Horario</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {promotionForm.startDate || "Fecha inicio"} - {promotionForm.endDate || "Fecha fin"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {promotionForm.startTime || "00:00"} - {promotionForm.endTime || "23:59"}
                        </span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4 bg-white p-4 rounded-lg">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isActive"
                          checked={promotionForm.isActive}
                          onCheckedChange={(checked) => setPromotionForm({ ...promotionForm, isActive: checked })}
                        />
                        <Label htmlFor="isActive">Activar promoción inmediatamente</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isStackable"
                          checked={promotionForm.isStackable}
                          onCheckedChange={(checked) => setPromotionForm({ ...promotionForm, isStackable: checked })}
                        />
                        <Label htmlFor="isStackable">Permitir combinar con otras promociones</Label>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium mb-2 text-slate-800">Resumen de la Promoción</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Nombre:</strong> {promotionForm.name || "Sin nombre"}
                        </div>
                        <div>
                          <strong>Tipo:</strong>{" "}
                          {promotionForm.type === "percentage"
                            ? "Porcentaje"
                            : promotionForm.type === "fixed"
                              ? "Monto Fijo"
                              : promotionForm.type === "shipping"
                                ? "Envío Gratis"
                                : "Por Cantidad"}
                        </div>
                        <div>
                          <strong>Descuento:</strong> {promotionForm.value}
                          {promotionForm.type === "percentage" ? "%" : promotionForm.type === "fixed" ? "$" : ""}
                        </div>
                        <div>
                          <strong>Compra mínima:</strong> ${promotionForm.minPurchase || "0"}
                        </div>
                        <div>
                          <strong>Límite de usos:</strong> {promotionForm.usageLimit || "Sin límite"}
                        </div>
                        <div>
                          <strong>Categorías:</strong>{" "}
                          {promotionForm.categories.length > 0 ? promotionForm.categories.join(", ") : "Todas"}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="bg-white pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreatePromotion(false)
                      resetPromotionForm()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreatePromotion}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingPromotion ? "Guardar Cambios" : "Crear Promoción"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateCoupon} onOpenChange={setShowCreateCoupon}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-2 border-purple-200">
                <DialogHeader>
                  <DialogTitle className="text-slate-800">
                    {editingCoupon ? "Editar Cupón" : "Crear Nuevo Cupón"}
                  </DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Configura los detalles del cupón incluyendo código, descuento y condiciones de uso.
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full bg-white">
                  <TabsList className="grid w-full grid-cols-3 bg-purple-50">
                    <TabsTrigger
                      value="basic"
                      className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      Básico
                    </TabsTrigger>
                    <TabsTrigger
                      value="conditions"
                      className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      Condiciones
                    </TabsTrigger>
                    <TabsTrigger
                      value="schedule"
                      className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      Horarios
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 bg-white p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="couponCode">Código del Cupón</Label>
                        <div className="flex gap-2">
                          <Input
                            id="couponCode"
                            value={couponForm.code}
                            onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                            placeholder="VERANO30"
                          />
                          <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="couponType">Tipo de Descuento</Label>
                        <Select
                          value={couponForm.type}
                          onChange={(value) => setCouponForm({ ...couponForm, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                            <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                            <SelectItem value="shipping">Envío Gratis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="couponDescription">Descripción</Label>
                      <Textarea
                        id="couponDescription"
                        value={couponForm.description}
                        onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                        placeholder="Describe el cupón..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="couponValue">Valor del Descuento</Label>
                        <Input
                          id="couponValue"
                          type="number"
                          value={couponForm.value}
                          onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                          placeholder={couponForm.type === "percentage" ? "30" : "20"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="couponMinPurchase">Compra Mínima ($)</Label>
                        <Input
                          id="couponMinPurchase"
                          type="number"
                          value={couponForm.minPurchase}
                          onChange={(e) => setCouponForm({ ...couponForm, minPurchase: e.target.value })}
                          placeholder="50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="couponMaxDiscount">Descuento Máximo ($)</Label>
                        <Input
                          id="couponMaxDiscount"
                          type="number"
                          value={couponForm.maxDiscount}
                          onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                          placeholder="100"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="conditions" className="space-y-4 bg-white p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="couponMaxUses">Límite de Usos Total</Label>
                        <Input
                          id="couponMaxUses"
                          type="number"
                          value={couponForm.maxUses}
                          onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                          placeholder="500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="couponUserLimit">Límite por Usuario</Label>
                        <Input
                          id="couponUserLimit"
                          type="number"
                          value={couponForm.userLimit}
                          onChange={(e) => setCouponForm({ ...couponForm, userLimit: e.target.value })}
                          placeholder="1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Categorías Aplicables</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {["Ropa", "Electrónicos", "Hogar", "Deportes", "Libros", "Juguetes"].map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`coupon-${category}`}
                              checked={couponForm.categories.includes(category)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCouponForm({ ...couponForm, categories: [...couponForm.categories, category] })
                                } else {
                                  setCouponForm({
                                    ...couponForm,
                                    categories: couponForm.categories.filter((c) => c !== category),
                                  })
                                }
                              }}
                            />
                            <Label htmlFor={`coupon-${category}`} className="text-sm">
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="couponStackable"
                        checked={couponForm.isStackable}
                        onChange={(checked) => setCouponForm({ ...couponForm, isStackable: checked })}
                      />
                      <Label htmlFor="couponStackable">Permitir combinar con otras promociones</Label>
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule" className="space-y-4 bg-white p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="couponStartDate">Fecha de Inicio</Label>
                        <Input
                          id="couponStartDate"
                          type="date"
                          value={couponForm.startDate}
                          onChange={(e) => setCouponForm({ ...couponForm, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="couponEndDate">Fecha de Fin</Label>
                        <Input
                          id="couponEndDate"
                          type="date"
                          value={couponForm.endDate}
                          onChange={(e) => setCouponForm({ ...couponForm, endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="couponActive"
                        checked={couponForm.isActive}
                        onChange={(checked) => setCouponForm({ ...couponForm, isActive: checked })}
                      />
                      <Label htmlFor="couponActive">Activar cupón inmediatamente</Label>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="bg-white pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateCoupon(false)
                      resetCouponForm()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateCoupon}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingCoupon ? "Guardar Cambios" : "Crear Cupón"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateCampaign} onOpenChange={setShowCreateCampaign}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-2 border-purple-200">
                <DialogHeader>
                  <DialogTitle className="text-slate-800">
                    {editingCampaign ? "Editar Campaña" : "Crear Nueva Campaña"}
                  </DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Configura los detalles de la campaña promocional incluyendo fechas, presupuesto y audiencia
                    objetivo.
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full bg-white">
                  <TabsList className="grid w-full grid-cols-3 bg-purple-50">
                    <TabsTrigger
                      value="basic"
                      className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      Básico
                    </TabsTrigger>
                    <TabsTrigger
                      value="budget"
                      className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      Presupuesto
                    </TabsTrigger>
                    <TabsTrigger
                      value="targeting"
                      className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      Audiencia
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 bg-white p-4 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="campaignName">Nombre de la Campaña</Label>
                      <Input
                        id="campaignName"
                        value={campaignForm.name}
                        onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                        placeholder="Ej: Campaña Verano 2024"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="campaignDescription">Descripción</Label>
                      <Textarea
                        id="campaignDescription"
                        value={campaignForm.description}
                        onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                        placeholder="Describe los objetivos y detalles de la campaña..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="campaignStartDate">Fecha de Inicio</Label>
                        <Input
                          id="campaignStartDate"
                          type="date"
                          value={campaignForm.startDate}
                          onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="campaignEndDate">Fecha de Fin</Label>
                        <Input
                          id="campaignEndDate"
                          type="date"
                          value={campaignForm.endDate}
                          onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="budget" className="space-y-4 bg-white p-4 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="campaignBudget">Presupuesto Total ($)</Label>
                      <Input
                        id="campaignBudget"
                        type="number"
                        value={campaignForm.budget}
                        onChange={(e) => setCampaignForm({ ...campaignForm, budget: e.target.value })}
                        placeholder="5000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Canales de Marketing</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Email", "Redes Sociales", "Google Ads", "Facebook Ads", "Influencers", "Banner Web"].map(
                          (channel) => (
                            <div key={channel} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`campaign-${channel}`}
                                checked={campaignForm.channels.includes(channel)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setCampaignForm({ ...campaignForm, channels: [...campaignForm.channels, channel] })
                                  } else {
                                    setCampaignForm({
                                      ...campaignForm,
                                      channels: campaignForm.channels.filter((c) => c !== channel),
                                    })
                                  }
                                }}
                              />
                              <Label htmlFor={`campaign-${channel}`} className="text-sm">
                                {channel}
                              </Label>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="targeting" className="space-y-4 bg-white p-4 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="campaignAudience">Audiencia Objetivo</Label>
                      <Select
                        value={campaignForm.targetAudience}
                        onChange={(value) => setCampaignForm({ ...campaignForm, targetAudience: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona audiencia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los usuarios</SelectItem>
                          <SelectItem value="new">Nuevos clientes</SelectItem>
                          <SelectItem value="returning">Clientes recurrentes</SelectItem>
                          <SelectItem value="vip">Clientes VIP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="campaignActive"
                        checked={campaignForm.isActive}
                        onChange={(checked) => setCampaignForm({ ...campaignForm, isActive: checked })}
                      />
                      <Label htmlFor="campaignActive">Activar campaña inmediatamente</Label>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="bg-white pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateCampaign(false)
                      resetCampaignForm()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateCampaign}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingCampaign ? "Guardar Cambios" : "Crear Campaña"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
