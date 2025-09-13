'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from './ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from 'lucide-react';
import { Header } from './header';
import { Footer } from './footer';

// URL base del backend
const API_BASE_URL = 'http://localhost:8502/service-main/api/promociones';

// Interface para Promocion (mapea con PromocionDTO del backend)
interface Promocion {
  id: number;
  nombre: string;
  descripcion: string;
  tipoPromocion: string;
  tipoCondicion: string;
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  esAcumulable: boolean;
  estaActiva: boolean;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreatePromotion, setShowCreatePromotion] = useState(false);
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promocion | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const { toast } = useToast();

  // Estado del formulario ajustado al PromocionDTO
  const [promotionForm, setPromotionForm] = useState({
    nombre: '',
    descripcion: '',
    tipoPromocion: 'DESCUENTO_PORCENTAJE',
    tipoCondicion: 'MONTO_MINIMO',
    valorDescuento: '',
    fechaInicio: '',
    fechaFin: '',
    esAcumulable: false,
    estaActiva: true,
  });

  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    minPurchase: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    maxUses: '',
    userLimit: '',
    categories: [] as string[],
    isActive: true,
    isStackable: false,
  });

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    targetAudience: '',
    promotions: [] as string[],
    channels: [] as string[],
    isActive: true,
  });

  const stats = [
    {
      title: 'Promociones Activas',
      value: '12',
      change: '+2.5%',
      changeType: 'positive',
      icon: Tag,
    },
    {
      title: 'Cupones Utilizados',
      value: '1,234',
      change: '+12.3%',
      changeType: 'positive',
      icon: Gift,
    },
    {
      title: 'Campañas en Curso',
      value: '8',
      change: '+5.1%',
      changeType: 'positive',
      icon: Calendar,
    },
    {
      title: 'Conversión Total',
      value: '23.4%',
      change: '+1.2%',
      changeType: 'positive',
      icon: TrendingUp,
    },
  ];

  const [coupons, setCoupons] = useState([
    {
      id: 1,
      code: 'SUMMER30',
      discount: '30%',
      type: 'Porcentaje',
      uses: 245,
      maxUses: 500,
      status: 'Activo',
      created: '2024-06-01',
    },
    {
      id: 2,
      code: 'FREESHIP',
      discount: 'Gratis',
      type: 'Envío',
      uses: 89,
      maxUses: 200,
      status: 'Activo',
      created: '2024-06-15',
    },
    {
      id: 3,
      code: 'WELCOME20',
      discount: '$20',
      type: 'Fijo',
      uses: 67,
      maxUses: 1000,
      status: 'Activo',
      created: '2024-05-20',
    },
    {
      id: 4,
      code: 'FLASH50',
      discount: '50%',
      type: 'Porcentaje',
      uses: 156,
      maxUses: 300,
      status: 'Expirado',
      created: '2024-05-01',
    },
  ]);

  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Campaña Verano',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      budget: '$5,000',
      spent: '$3,200',
      conversions: 245,
      status: 'Activa',
    },
    {
      id: 2,
      name: 'Back to School',
      startDate: '2024-08-01',
      endDate: '2024-09-15',
      budget: '$3,000',
      spent: '$1,800',
      conversions: 156,
      status: 'Programada',
    },
    {
      id: 3,
      name: 'Black Friday',
      startDate: '2024-11-25',
      endDate: '2024-11-30',
      budget: '$10,000',
      spent: '$0',
      conversions: 0,
      status: 'Borrador',
    },
  ]);

  const recentActivity = [
    { action: 'Nueva promoción "Verano"', time: 'Hace 5 minutos', status: 'Activa', type: 'success' },
    { action: 'Cupón "FREESHIP" expirado', time: 'Hace 1 hora', status: 'Expirado', type: 'warning' },
    { action: 'Campaña "Black Friday" creada', time: 'Ayer', status: 'Borrador', type: 'info' },
  ];

  // Fetch promociones del backend
  const fetchPromociones = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/activas`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: No se pudieron cargar las promociones`);
      }
      const data = await response.json();
      setPromociones(data);
    } catch (error) {
      console.error('Error fetching promociones:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudieron cargar las promociones',
        variant: 'destructive',
      });
    }
  };

  // Cargar promociones al cambiar a la pestaña de promociones
  useEffect(() => {
    if (activeTab === 'promotions') {
      fetchPromociones();
    }
  }, [activeTab]);

  // Crear o actualizar promoción
  const handleCreatePromotion = async () => {
    try {
      // Validar campos requeridos
      if (!promotionForm.nombre || !promotionForm.valorDescuento || !promotionForm.fechaInicio || !promotionForm.fechaFin) {
        throw new Error('Por favor, completa todos los campos requeridos');
      }

      // Convertir fechas al formato yyyy-MM-dd HH:mm:ss para LocalDateTime
      const fechaInicio = new Date(promotionForm.fechaInicio).toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(' ', 'T');

      const fechaFin = new Date(promotionForm.fechaFin).toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(' ', 'T');

      const payload = {
        ...promotionForm,
        valorDescuento: parseFloat(promotionForm.valorDescuento) || 0,
        fechaInicio,
        fechaFin,
      };

      const url = editingPromotion ? `${API_BASE_URL}/${editingPromotion.id}` : API_BASE_URL;
      const method = editingPromotion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${editingPromotion ? 'Error al actualizar promoción' : 'Error al crear promoción'}`);
      }

      toast({
        title: 'Éxito',
        description: editingPromotion ? 'Promoción actualizada correctamente' : 'Promoción creada correctamente',
      });

      setShowCreatePromotion(false);
      resetPromotionForm();
      fetchPromociones();
    } catch (error) {
      console.error('Error creating/updating promoción:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : (editingPromotion ? 'No se pudo actualizar la promoción' : 'No se pudo crear la promoción'),
        variant: 'destructive',
      });
    }
  };

  // Editar promoción
  const handleEditPromotion = (promotion: Promocion) => {
    setEditingPromotion(promotion);
    setPromotionForm({
      nombre: promotion.nombre,
      descripcion: promotion.descripcion,
      tipoPromocion: promotion.tipoPromocion,
      tipoCondicion: promotion.tipoCondicion,
      valorDescuento: promotion.valorDescuento.toString(),
      fechaInicio: promotion.fechaInicio.split('.')[0],
      fechaFin: promotion.fechaFin.split('.')[0],
      esAcumulable: promotion.esAcumulable,
      estaActiva: promotion.estaActiva,
    });
    setShowCreatePromotion(true);
  };

  // Eliminar promoción
  const handleDeletePromotion = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: Error al eliminar promoción`);
      }
      toast({
        title: 'Éxito',
        description: 'Promoción eliminada correctamente',
      });
      fetchPromociones();
    } catch (error) {
      console.error('Error deleting promoción:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar la promoción',
        variant: 'destructive',
      });
    }
  };

  // Toglear estado (activa/pausada)
  const handleTogglePromotionStatus = async (id: number) => {
    try {
      const promocion = promociones.find((p) => p.id === id);
      if (!promocion) return;

      // Convertir fechas al formato yyyy-MM-dd HH:mm:ss para LocalDateTime
      const fechaInicio = new Date(promocion.fechaInicio).toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(' ', 'T');

      const fechaFin = new Date(promocion.fechaFin).toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(' ', 'T');

      const updatedPromocion = {
        ...promocion,
        valorDescuento: parseFloat(promocion.valorDescuento.toString()) || 0,
        fechaInicio,
        fechaFin,
        estaActiva: !promocion.estaActiva,
      };

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPromocion),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: Error al actualizar estado`);
      }
      toast({
        title: 'Éxito',
        description: `Promoción ${updatedPromocion.estaActiva ? 'activada' : 'pausada'} correctamente`,
      });
      fetchPromociones();
    } catch (error) {
      console.error('Error toggling promoción status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar el estado de la promoción',
        variant: 'destructive',
      });
    }
  };

  // Resetear formulario de promoción
  const resetPromotionForm = () => {
    setPromotionForm({
      nombre: '',
      descripcion: '',
      tipoPromocion: 'DESCUENTO_PORCENTAJE',
      tipoCondicion: 'MONTO_MINIMO',
      valorDescuento: '',
      fechaInicio: '',
      fechaFin: '',
      esAcumulable: false,
      estaActiva: true,
    });
    setEditingPromotion(null);
  };

  // Resetear formulario de cupones
  const resetCouponForm = () => {
    setCouponForm({
      code: '',
      description: '',
      type: 'percentage',
      value: '',
      minPurchase: '',
      maxDiscount: '',
      startDate: '',
      endDate: '',
      maxUses: '',
      userLimit: '',
      categories: [],
      isActive: true,
      isStackable: false,
    });
    setEditingCoupon(null);
  };

  // Crear o actualizar cupón
  const handleCreateCoupon = () => {
    if (editingCoupon) {
      setCoupons(coupons.map((c) => (c.id === editingCoupon.id ? { ...editingCoupon, ...couponForm } : c)));
    } else {
      const newCoupon = {
        id: Date.now(),
        ...couponForm,
        uses: 0,
        status: couponForm.isActive ? 'Activo' : 'Inactivo',
      };
      setCoupons([...coupons, newCoupon]);
    }
    setShowCreateCoupon(false);
    resetCouponForm();
    refreshAllData();
  };

  // Editar cupón
  const handleEditCoupon = (coupon: any) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      description: '',
      type: coupon.type === 'Porcentaje' ? 'percentage' : coupon.type === 'Fijo' ? 'fixed' : 'shipping',
      value: coupon.discount.replace(/[%$]/g, '').replace('Gratis', '0'),
      minPurchase: '',
      maxDiscount: '',
      startDate: '',
      endDate: '',
      maxUses: coupon.maxUses.toString(),
      userLimit: '',
      categories: [],
      isActive: coupon.status === 'Activo',
      isStackable: false,
    });
    setShowCreateCoupon(true);
  };

  // Eliminar cupón
  const handleDeleteCoupon = (id: number) => {
    setCoupons(coupons.filter((c) => c.id !== id));
    refreshAllData();
  };

  // Resetear formulario de campañas
  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      budget: '',
      targetAudience: '',
      promotions: [],
      channels: [],
      isActive: true,
    });
    setEditingCampaign(null);
  };

  // Crear o actualizar campaña
  const handleCreateCampaign = () => {
    if (editingCampaign) {
      setCampaigns(campaigns.map((c) => (c.id === editingCampaign.id ? { ...editingCampaign, ...campaignForm } : c)));
    } else {
      const newCampaign = {
        id: Date.now(),
        ...campaignForm,
        spent: '0',
        status: campaignForm.isActive ? 'Activa' : 'Inactiva',
      };
      setCampaigns([...campaigns, newCampaign]);
    }
    setShowCreateCampaign(false);
    resetCampaignForm();
    refreshAllData();
  };

  // Editar campaña
  const handleEditCampaign = (campaign: any) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      description: '',
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      budget: campaign.budget.replace('$', '').replace(',', ''),
      targetAudience: '',
      promotions: [],
      channels: [],
      isActive: campaign.status === 'Activa',
    });
    setShowCreateCampaign(true);
  };

  // Eliminar campaña
  const handleDeleteCampaign = (id: number) => {
    setCampaigns(campaigns.filter((c) => c.id !== id));
    refreshAllData();
  };

  // Toglear estado de cupón
  const handleToggleCouponStatus = (couponId: number) => {
    setCoupons(
      coupons.map((c) =>
        c.id === couponId ? { ...c, status: c.status === 'Activo' ? 'Inactivo' : 'Activo' } : c,
      ),
    );
    refreshAllData();
  };

  // Toglear estado de campaña
  const handleToggleCampaignStatus = (campaignId: number) => {
    setCampaigns(
      campaigns.map((c) =>
        c.id === campaignId ? { ...c, status: c.status === 'Activa' ? 'Pausada' : 'Activa' } : c,
      ),
    );
    refreshAllData();
  };

  // Simular actualización de datos
  const refreshAllData = () => {
    console.log('[v0] Refreshing all data across sections');
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'promotions', label: 'Promociones', icon: Tag },
    { id: 'coupons', label: 'Cupones', icon: Gift },
    { id: 'campaigns', label: 'Campañas', icon: Calendar },
  ];

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-slate-900 border-r border-slate-800`}
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
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-6 bg-gray-50">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
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
                    );
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
                          <TableHead>Estado</TableHead>
                          <TableHead>Expira</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {promociones.slice(0, 4).map((promo) => (
                          <TableRow key={promo.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{promo.nombre}</div>
                                <div className="text-sm text-muted-foreground">{promo.id}</div>
                              </div>
                            </TableCell>
                            <TableCell>{promo.tipoPromocion}</TableCell>
                            <TableCell className="font-medium text-purple-600">
                              {promo.valorDescuento * 100}%
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={promo.estaActiva ? 'default' : 'secondary'}
                                className={promo.estaActiva ? 'bg-purple-600 hover:bg-purple-700' : ''}
                              >
                                {promo.estaActiva ? 'Activa' : 'Pausada'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(promo.fechaFin).toLocaleDateString()}
                            </TableCell>
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
                            variant={activity.type === 'success' ? 'default' : 'secondary'}
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

            {activeTab === 'promotions' && (
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
                          <TableHead>Estado</TableHead>
                          <TableHead>Expira</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {promociones.map((promo) => (
                          <TableRow key={promo.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{promo.nombre}</div>
                                <div className="text-sm text-muted-foreground">{promo.descripcion}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{promo.tipoPromocion}</Badge>
                            </TableCell>
                            <TableCell className="font-medium text-purple-600">
                              {promo.valorDescuento * 100}%
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3" />
                                {new Date(promo.fechaInicio).toLocaleTimeString()} -{' '}
                                {new Date(promo.fechaFin).toLocaleTimeString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={promo.estaActiva ? 'default' : 'secondary'}
                                className={
                                  promo.estaActiva
                                    ? 'bg-purple-600 hover:bg-purple-700 cursor-pointer'
                                    : 'cursor-pointer'
                                }
                                onClick={() => handleTogglePromotionStatus(promo.id)}
                              >
                                {promo.estaActiva ? 'Activa' : 'Pausada'}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(promo.fechaFin).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditPromotion(promo)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePromotion(promo.id)}
                                >
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

            {activeTab === 'coupons' && (
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
                                variant={coupon.status === 'Activo' ? 'default' : 'destructive'}
                                className={
                                  coupon.status === 'Activo'
                                    ? 'bg-purple-500 hover:bg-purple-600 cursor-pointer'
                                    : 'cursor-pointer'
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

            {activeTab === 'campaigns' && (
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
                                  {campaign.spent} / {campaign.budget}
                                </div>
                                <div className="w-full bg-secondary rounded-full h-1.5">
                                  <div
                                    className="bg-purple-500 h-1.5 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        (parseFloat(campaign.spent.replace(/[$,]/g, '')) /
                                          parseFloat(campaign.budget.replace(/[$,]/g, ''))) *
                                          100,
                                        100,
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{campaign.conversions}</TableCell>
                            <TableCell>
                              <Badge
                                variant={campaign.status === 'Activa' ? 'default' : 'secondary'}
                                className={
                                  campaign.status === 'Activa'
                                    ? 'bg-purple-500 hover:bg-purple-600 cursor-pointer'
                                    : 'cursor-pointer'
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
                    {editingPromotion ? 'Editar Promoción' : 'Crear Nueva Promoción'}
                  </DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Configura todos los detalles de tu promoción incluyendo fechas, horarios y condiciones.
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
                        <Label htmlFor="nombre">Nombre de la Promoción</Label>
                        <Input
                          id="nombre"
                          value={promotionForm.nombre}
                          onChange={(e) => setPromotionForm({ ...promotionForm, nombre: e.target.value })}
                          placeholder="Ej: Descuento Verano 2024"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tipoPromocion">Tipo de Promoción</Label>
                        <Select
                          value={promotionForm.tipoPromocion}
                          onValueChange={(value) => setPromotionForm({ ...promotionForm, tipoPromocion: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DESCUENTO_PORCENTAJE">Porcentaje (%)</SelectItem>
                            <SelectItem value="DESCUENTO_MONTO_FIJO">Monto Fijo ($)</SelectItem>
                            <SelectItem value="DOS_POR_UNO">2x1</SelectItem>
                            <SelectItem value="TRES_POR_DOS">3x2</SelectItem>
                            <SelectItem value="ENVIO_GRATIS">Envío Gratis</SelectItem>
                            <SelectItem value="REGALO_PRODUCTO">Regalo de Producto</SelectItem>
                            <SelectItem value="CASHBACK">Cashback</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        value={promotionForm.descripcion}
                        onChange={(e) => setPromotionForm({ ...promotionForm, descripcion: e.target.value })}
                        placeholder="Describe los detalles de la promoción..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="valorDescuento">Valor del Descuento</Label>
                        <Input
                          id="valorDescuento"
                          type="number"
                          step="0.01"
                          value={promotionForm.valorDescuento}
                          onChange={(e) => setPromotionForm({ ...promotionForm, valorDescuento: e.target.value })}
                          placeholder="30"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tipoCondicion">Tipo de Condición</Label>
                        <Select
                          value={promotionForm.tipoCondicion}
                          onValueChange={(value) => setPromotionForm({ ...promotionForm, tipoCondicion: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MONTO_MINIMO">Monto Mínimo de Compra</SelectItem>
                            <SelectItem value="CANTIDAD_PRODUCTOS">Cantidad Mínima de Productos</SelectItem>
                            <SelectItem value="CATEGORIA_ESPECIFICA">Categoría Específica</SelectItem>
                            <SelectItem value="PRODUCTO_ESPECIFICO">Producto Específico</SelectItem>
                            <SelectItem value="PRIMER_COMPRA">Primera Compra del Usuario</SelectItem>
                            <SelectItem value="CLIENTE_VIP">Solo Clientes VIP</SelectItem>
                            <SelectItem value="DIA_SEMANA">Día de la Semana Específico</SelectItem>
                            <SelectItem value="HORA_ESPECIFICA">Horario Específico</SelectItem>
                            <SelectItem value="SIN_CONDICION">Sin Condición Especial</SelectItem>
                            <SelectItem value="POR_HORA">Por Hora</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="conditions" className="space-y-4 bg-white p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="esAcumulable"
                        checked={promotionForm.esAcumulable}
                        onCheckedChange={(checked) => setPromotionForm({ ...promotionForm, esAcumulable: checked })}
                      />
                      <Label htmlFor="esAcumulable">Permitir combinar con otras promociones</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="estaActiva"
                        checked={promotionForm.estaActiva}
                        onCheckedChange={(checked) => setPromotionForm({ ...promotionForm, estaActiva: checked })}
                      />
                      <Label htmlFor="estaActiva">Activar promoción inmediatamente</Label>
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule" className="space-y-4 bg-white p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fechaInicio">Fecha y Hora de Inicio</Label>
                        <Input
                          id="fechaInicio"
                          type="datetime-local"
                          value={promotionForm.fechaInicio}
                          onChange={(e) => setPromotionForm({ ...promotionForm, fechaInicio: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fechaFin">Fecha y Hora de Fin</Label>
                        <Input
                          id="fechaFin"
                          type="datetime-local"
                          value={promotionForm.fechaFin}
                          onChange={(e) => setPromotionForm({ ...promotionForm, fechaFin: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium mb-2 text-slate-800">Vista Previa del Horario</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {promotionForm.fechaInicio
                            ? new Date(promotionForm.fechaInicio).toLocaleString()
                            : 'Fecha inicio'}{' '}
                          -{' '}
                          {promotionForm.fechaFin
                            ? new Date(promotionForm.fechaFin).toLocaleString()
                            : 'Fecha fin'}
                        </span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="bg-white pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreatePromotion(false);
                      resetPromotionForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreatePromotion}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingPromotion ? 'Guardar Cambios' : 'Crear Promoción'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateCoupon} onOpenChange={setShowCreateCoupon}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-2 border-purple-200">
                <DialogHeader>
                  <DialogTitle className="text-slate-800">
                    {editingCoupon ? 'Editar Cupón' : 'Crear Nuevo Cupón'}
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
                          onValueChange={(value) => setCouponForm({ ...couponForm, type: value })}
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
                          placeholder={couponForm.type === 'percentage' ? '30' : '20'}
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
                        {['Ropa', 'Electrónicos', 'Hogar', 'Deportes', 'Libros', 'Juguetes'].map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`coupon-${category}`}
                              checked={couponForm.categories.includes(category)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCouponForm({ ...couponForm, categories: [...couponForm.categories, category] });
                                } else {
                                  setCouponForm({
                                    ...couponForm,
                                    categories: couponForm.categories.filter((c) => c !== category),
                                  });
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
                        onCheckedChange={(checked) => setCouponForm({ ...couponForm, isStackable: checked })}
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
                        onCheckedChange={(checked) => setCouponForm({ ...couponForm, isActive: checked })}
                      />
                      <Label htmlFor="couponActive">Activar cupón inmediatamente</Label>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="bg-white pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateCoupon(false);
                      resetCouponForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateCoupon}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingCoupon ? 'Guardar Cambios' : 'Crear Cupón'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateCampaign} onOpenChange={setShowCreateCampaign}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-2 border-purple-200">
                <DialogHeader>
                  <DialogTitle className="text-slate-800">
                    {editingCampaign ? 'Editar Campaña' : 'Crear Nueva Campaña'}
                  </DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Configura los detalles de la campaña promocional incluyendo fechas, presupuesto y audiencia objetivo.
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
                        {['Email', 'Redes Sociales', 'Google Ads', 'Facebook Ads', 'Influencers', 'Banner Web'].map(
                          (channel) => (
                            <div key={channel} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`campaign-${channel}`}
                                checked={campaignForm.channels.includes(channel)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setCampaignForm({ ...campaignForm, channels: [...campaignForm.channels, channel] });
                                  } else {
                                    setCampaignForm({
                                      ...campaignForm,
                                      channels: campaignForm.channels.filter((c) => c !== channel),
                                    });
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
                        onValueChange={(value) => setCampaignForm({ ...campaignForm, targetAudience: value })}
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
                        onCheckedChange={(checked) => setCampaignForm({ ...campaignForm, isActive: checked })}
                      />
                      <Label htmlFor="campaignActive">Activar campaña inmediatamente</Label>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="bg-white pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateCampaign(false);
                      resetCampaignForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateCampaign}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingCampaign ? 'Guardar Cambios' : 'Crear Campaña'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}