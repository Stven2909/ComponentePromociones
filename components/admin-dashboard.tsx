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
  SelectGroup,
  SelectItem,
  SelectLabel,
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

// URL base del backend para las promociones
const API_BASE_URL = 'http://localhost:8502/service-main/api/promociones';

// Interface para Promocion (mapea con PromocionDTO del backend)
// **MODIFICACIÓN:** Se ha agregado el campo 'codigo'.
interface Promocion {
  id: number;
  nombre: string;
  codigo: string; // Nuevo campo agregado
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
  // Estados generales para la UI
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewingPromotion, setViewingPromotion] = useState<Promocion | null>(null);

  // Estados para diálogos y edición
  const [showCreatePromotion, setShowCreatePromotion] = useState(false);
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promocion | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const { toast } = useToast();

  // Estado del formulario para promociones (ajustado al PromocionDTO)
  // **MODIFICACIÓN:** Se ha agregado el campo 'codigo' en el estado inicial.
  const [promotionForm, setPromotionForm] = useState({
    nombre: '',
    codigo: '', // Nuevo campo en el estado del formulario
    descripcion: '',
    tipoPromocion: 'DESCUENTO_PORCENTAJE',
    tipoCondicion: 'MONTO_MINIMO',
    valorDescuento: '',
    fechaInicio: '',
    fechaFin: '',
    esAcumulable: false,
    estaActiva: true,
  });

  // Estado para cupones (ajustado al DTO)
  const [couponForm, setCouponForm] = useState({
    codigo: '',
    tipo: 'porcentaje',
    descuento: '',
    usos: '',
    estado: 'ACTIVO',
    fecha_inicio: '',
    fecha_fin: '',
    isActive: true,
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

  // Estados para dashboard stats (cargados desde API)
  const [dashboardStats, setDashboardStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);

  // Datos mockeados para campañas
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

  // Datos mockeados para actividad reciente
  const recentActivity = [
    { action: 'Nueva promoción "Verano"', time: 'Hace 5 minutos', status: 'Activa', type: 'success' },
    { action: 'Cupón "FREESHIP" expirado', time: 'Hace 1 hora', status: 'Expirado', type: 'warning' },
    { action: 'Campaña "Black Friday" creada', time: 'Ayer', status: 'Borrador', type: 'info' },
  ];

  // Función para fetch de promociones activas desde el backend
  const fetchPromociones = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
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

  // Función para fetch de cupones activos desde el backend
  const fetchCupones = async () => {
    try {
      const response = await fetch(`http://localhost:8502/service-main/api/cupones`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: No se pudieron cargar los cupones`);
      }

      const data = await response.json();
      // Mapear los datos para que coincidan con la estructura esperada en la tabla
      const formattedCoupons = data.map((coupon: any) => ({
        id: coupon.id,
        code: coupon.codigo,
        type: coupon.tipo,
        discount: coupon.descuento,
        uses: coupon.usos || 0,
        maxUses: coupon.usos || 0, // Ajustar según el backend
        status: coupon.estado === 'ACTIVO' ? 'Activo' : 'Inactivo',
        created: coupon.fecha_inicio,
      }));
      setCoupons(formattedCoupons);
      console.log('Formatted coupons:', formattedCoupons); // Debug log
    } catch (error) {
      console.error('Error fetching cupones:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudieron cargar los cupones',
        variant: 'destructive',
      });
    }
  };

  // Función para fetch de estadísticas del dashboard desde el backend
  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      setErrorStats(null);
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (!response.ok) {
        throw new Error('Error al obtener las estadísticas del dashboard');
      }
      const data = await response.json();

      // Formatear las stats para la UI
      const formattedStats = [
        {
          title: 'Promociones Activas',
          value: data?.promocionesActivas?.toString() ?? '0',
          change: '+2.5%',
          changeType: 'positive',
          icon: Tag,
        },
        {
          title: 'Cupones Activos',
          value: data?.cuponesActivos?.toString() ?? '0',
          change: '+12.3%',
          changeType: 'positive',
          icon: Gift,
        },
        {
          title: 'Cupones Utilizados',
          value: data?.cuponesUtilizados?.toString() ?? '0',
          change: '+8.4%',
          changeType: 'positive',
          icon: Copy,
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

      setDashboardStats(formattedStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setErrorStats(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoadingStats(false);
    }
  };

  // Effect para cargar datos según la pestaña activa
  useEffect(() => {
    if (activeTab === 'promotions') {
      fetchPromociones();
    }
    if (activeTab === 'coupons') {
      fetchCupones();
    }
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeTab]);

  // Función para ver detalles de una promoción (abre diálogo modal)
  const handleViewPromotion = (promotion: Promocion) => {
    setViewingPromotion(promotion);
  };

  // Función para crear o actualizar una promoción
  const handleCreatePromotion = async () => {
    console.log('handleCreatePromotion called with form:', promotionForm);
    try {
      // **MODIFICACIÓN:** Se agrega la validación para el campo 'codigo'.
      if (
        !promotionForm.nombre.trim() ||
        !promotionForm.codigo.trim() || // Nueva validación
        promotionForm.valorDescuento === '' ||
        !promotionForm.fechaInicio ||
        !promotionForm.fechaFin
      ) {
        throw new Error('Por favor, completa todos los campos requeridos, incluyendo el código.');
      }

      // Convertir fechas al formato ISO para el backend (LocalDateTime)
      const fechaInicio = new Date(promotionForm.fechaInicio).toISOString().slice(0, 19).replace('T', ' ');
      const fechaFin = new Date(promotionForm.fechaFin).toISOString().slice(0, 19).replace('T', ' ');

      console.log('Formatted dates:', fechaInicio, fechaFin);

      const payload = {
        ...promotionForm,
        valorDescuento: parseFloat(promotionForm.valorDescuento) || 0,
        fechaInicio,
        fechaFin,
      };

      console.log('Payload to send:', payload);

      const url = editingPromotion ? `${API_BASE_URL}/${editingPromotion.id}` : API_BASE_URL;
      const method = editingPromotion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      const responseData = await response.json().catch(() => null);
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            `Error ${response.status}: ${editingPromotion ? 'Error al actualizar promoción' : 'Error al crear promoción'}`
        );
      }

      toast({
        title: 'Éxito',
        description: editingPromotion ? 'Promoción actualizada correctamente' : 'Promoción creada correctamente',
      });

      setShowCreatePromotion(false);
      resetPromotionForm();
      fetchPromociones(); // Recargar la lista
    } catch (error) {
      console.error('Error creating/updating promoción:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : editingPromotion
            ? 'No se pudo actualizar la promoción'
            : 'No se pudo crear la promoción',
        variant: 'destructive',
      });
    }
  };

  // Función para editar una promoción (abre el diálogo con datos precargados)
  // **MODIFICACIÓN:** Se agrega el campo 'codigo' a la función de edición.
  const handleEditPromotion = (promotion: Promocion) => {
    console.log('Editing promotion:', promotion); // Debug log
    setEditingPromotion(promotion);
    setPromotionForm({
      nombre: promotion.nombre,
      codigo: promotion.codigo, // Copia el valor de 'codigo' al estado del formulario
      descripcion: promotion.descripcion,
      tipoPromocion: promotion.tipoPromocion,
      tipoCondicion: promotion.tipoCondicion,
      valorDescuento: promotion.valorDescuento.toString(),
      fechaInicio: promotion.fechaInicio.split(' ')[0] + 'T' + promotion.fechaInicio.split(' ')[1].slice(0, 5), // Ajustar para datetime-local
      fechaFin: promotion.fechaFin.split(' ')[0] + 'T' + promotion.fechaFin.split(' ')[1].slice(0, 5),
      esAcumulable: promotion.esAcumulable,
      estaActiva: promotion.estaActiva,
    });
    setShowCreatePromotion(true);
  };

  // Función para eliminar una promoción
  const handleDeletePromotion = async (id: number) => {
    console.log('Deleting promotion ID:', id); // Debug log
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // **MODIFICACIÓN:** Manejo de error específico para llave foránea
        if (response.status === 409) { // 409 Conflict es un buen código para este tipo de error
          throw new Error('No se puede eliminar la promoción porque está asociada a cupones. Por favor, elimine los cupones asociados primero.');
        }

        throw new Error(errorData.message || `Error ${response.status}: Error al eliminar promoción`);
      }
      toast({
        title: 'Éxito',
        description: 'Promoción eliminada correctamente',
      });
      fetchPromociones(); // Recargar la lista
    } catch (error) {
      console.error('Error deleting promoción:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar la promoción',
        variant: 'destructive',
      });
    }
  };

  // Función para togglear el estado de una promoción (activa/pausada)
  const handleTogglePromotionStatus = async (id: number) => {
    try {
      const promocion = promociones.find((p) => p.id === id);
      if (!promocion) return;

      // Preparar payload para actualización (solo cambiar estaActiva)
      const payload = {
        ...promocion,
        estaActiva: !promocion.estaActiva,
      };

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: Error al actualizar estado`);
      }
      toast({
        title: 'Éxito',
        description: `Promoción ${payload.estaActiva ? 'activada' : 'pausada'} correctamente`,
      });
      fetchPromociones(); // Recargar la lista
    } catch (error) {
      console.error('Error toggling promoción status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar el estado de la promoción',
        variant: 'destructive',
      });
    }
  };

  // Función para resetear el formulario de promoción
  // **MODIFICACIÓN:** Se ha agregado el campo 'codigo' a la función de reseteo.
  const resetPromotionForm = () => {
    setPromotionForm({
      nombre: '',
      codigo: '', // Resetea el campo 'codigo'
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

  // Funciones para cupones
  const resetCouponForm = () => {
    setCouponForm({
      codigo: '',
      tipo: 'porcentaje',
      descuento: '',
      usos: '',
      estado: 'ACTIVO',
      fecha_inicio: '',
      fecha_fin: '',
      isActive: true,
      promocionId: null,
    });
    setEditingCoupon(null);
  };

  const handleCreateCoupon = async () => {
    if (!couponForm.codigo || !couponForm.descuento || !couponForm.fecha_inicio || !couponForm.fecha_fin) {
      toast({
        title: 'Error',
        description: 'Por favor, completa todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    const formatDateForBackend = (dateString: string): string => {
      if (!dateString) return '';
      return `${dateString}:00`;
    };

    const dtoData = {
      codigo: couponForm.codigo,
      tipo: couponForm.tipo === 'porcentaje' ? 'Porcentaje' : 'Fijo',
      descuento: parseFloat(couponForm.descuento),
      usos: parseInt(couponForm.usos, 10) || 0,
      estado: couponForm.isActive ? 'ACTIVO' : 'INACTIVO',
      fecha_inicio: formatDateForBackend(couponForm.fecha_inicio),
      fecha_fin: formatDateForBackend(couponForm.fecha_fin),
      promocionId: couponForm.promocionId,
    };

    try {
      const response = await fetch(`http://localhost:8502/service-main/api/cupones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dtoData),
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Cupón creado correctamente',
        });
        setShowCreateCoupon(false);
        resetCouponForm();
        fetchCupones();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear cupón');
      }
    } catch (error) {
      console.error('Error creating cupón:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo crear el cupón',
        variant: 'destructive',
      });
    }
  };

  const handleEditCoupon = async (coupon: any) => {
    console.log('Attempting to edit coupon:', coupon);
    if (!coupon || !coupon.code) {
      console.error('Invalid coupon object or missing code:', coupon);
      toast({
        title: 'Error',
        description: 'No se proporcionó un código de cupón válido',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:8502/service-main/api/cupones/${coupon.code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: No se pudo cargar el cupón con código ${coupon.code}`);
      }

      const data = await response.json();
      console.log('Fetched coupon data:', data);

      const formatDateForInput = (dateString: string | null | undefined): string => {
        if (!dateString || typeof dateString !== 'string') {
          console.warn(`Invalid or missing date: ${dateString}`);
          return '';
        }
        const isoMatch = dateString.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
        const spaceMatch = dateString.match(/^(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2})/);

        if (isoMatch) {
          return `${isoMatch[1]}T${isoMatch[2]}`;
        } else if (spaceMatch) {
          return `${spaceMatch[1]}T${spaceMatch[2]}`;
        } else {
          console.warn(`Unexpected date format: ${dateString}`);
          return '';
        }
      };

      setCouponForm({
        codigo: data.codigo || '',
        tipo: data.tipo ? data.tipo.toLowerCase() : 'porcentaje',
        descuento: data.descuento ? data.descuento.toString() : '',
        usos: data.usos ? data.usos.toString() : '',
        estado: data.estado || 'ACTIVO',
        fecha_inicio: formatDateForInput(data.fecha_inicio),
        fecha_fin: formatDateForInput(data.fecha_fin),
        isActive: data.estado === 'ACTIVO',
      });
      setEditingCoupon(data);
      setShowCreateCoupon(true);
    } catch (error) {
      console.error('Error al obtener cupón para editar:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `No se pudo cargar el cupón con código ${coupon.code}`,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCoupon = async () => {
    if (!couponForm.codigo || !couponForm.descuento || !couponForm.fecha_inicio || !couponForm.fecha_fin) {
      toast({
        title: 'Error',
        description: 'Por favor, completa todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    const formatDateForBackend = (dateString: string): string => {
      if (!dateString) return '';
      return `${dateString}:00`;
    };

    const updatedDto = {
      id: editingCoupon.id,
      codigo: couponForm.codigo,
      tipo: couponForm.tipo === 'porcentaje' ? 'Porcentaje' : 'Fijo',
      descuento: parseFloat(couponForm.descuento),
      usos: parseInt(couponForm.usos, 10) || 0,
      estado: couponForm.isActive ? 'ACTIVO' : 'INACTIVO',
      fecha_inicio: formatDateForBackend(couponForm.fecha_inicio),
      fecha_fin: formatDateForBackend(couponForm.fecha_fin),
    };

    try {
      const response = await fetch(`http://localhost:8502/service-main/api/cupones/${editingCoupon.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDto),
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Cupón actualizado correctamente',
        });
        setShowCreateCoupon(false);
        resetCouponForm();
        fetchCupones();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar cupón');
      }
    } catch (error) {
      console.error('Error updating cupón:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar el cupón',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8502/service-main/api/cupones/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Cupón eliminado correctamente',
        });
        fetchCupones();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: No se pudo eliminar el cupón con ID ${id}`);
      }
    } catch (error) {
      console.error('Error deleting cupón:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar el cupón',
        variant: 'destructive',
      });
    }
  };

  const handleToggleCouponStatus = async (couponId: number) => {
    try {
      const response = await fetch(`http://localhost:8502/service-main/api/cupones/${coupons.find(c => c.id === couponId)?.code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: No se pudo cargar el cupón con ID ${couponId}`);
      }

      const couponToUpdate = await response.json();
      console.log('Fetched coupon for toggle:', couponToUpdate);

      const newStatus = couponToUpdate.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
      const updatedDto = {
        ...couponToUpdate,
        estado: newStatus,
      };

      const putResponse = await fetch(`http://localhost:8502/service-main/api/cupones/${couponToUpdate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDto),
        credentials: 'include',
      });

      if (putResponse.ok) {
        toast({
          title: 'Éxito',
          description: `Cupón ${newStatus === 'ACTIVO' ? 'activado' : 'desactivado'} correctamente`,
        });
        fetchCupones();
      } else {
        const errorData = await putResponse.json();
        throw new Error(errorData.message || 'Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error toggling cupón status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar el estado del cupón',
        variant: 'destructive',
      });
    }
  };

  // Funciones para campañas (mockeadas por ahora)
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
    fetchDashboardStats();
  };

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

  const handleDeleteCampaign = (id: number) => {
    setCampaigns(campaigns.filter((c) => c.id !== id));
    fetchDashboardStats();
  };

  const handleToggleCampaignStatus = (campaignId: number) => {
    setCampaigns(
      campaigns.map((c) =>
        c.id === campaignId ? { ...c, status: c.status === 'Activa' ? 'Pausada' : 'Activa' } : c,
      ),
    );
    fetchDashboardStats();
  };

  // Función para refrescar todos los datos (incluyendo stats)
  const refreshAllData = () => {
    console.log('[v0] Refreshing all data across sections');
    fetchDashboardStats();
    if (activeTab === 'coupons') {
      fetchCupones();
    }
  };

  // Items del sidebar
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'promotions', label: 'Promociones', icon: Tag },
    { id: 'coupons', label: 'Cupones', icon: Gift },
    { id: 'campaigns', label: 'Campañas', icon: Calendar },
  ];

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header del dashboard */}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar navegable */}
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

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-6 bg-gray-50">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Grid de estadísticas del dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {loadingStats ? (
                    <p>Cargando estadísticas...</p>
                  ) : errorStats ? (
                    <p className="text-red-500">Error: {errorStats}</p>
                  ) : (
                    dashboardStats.map((stat, index) => {
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
                    })
                  )}
                </div>

                {/* Tabla de promociones activas en dashboard */}
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
                          <TableHead>Código</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descuento</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Expira</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {promociones.map((promocion) => (
                          <TableRow key={promocion.id}>
                            <TableCell className="font-medium">
                              {promocion.nombre}
                            </TableCell>
                            <TableCell>{promocion.codigo}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  promocion.tipoPromocion === 'DESCUENTO_PORCENTAJE'
                                    ? 'secondary'
                                    : promocion.tipoPromocion === 'ENVIO_GRATIS'
                                    ? 'info'
                                    : 'default'
                                }
                              >
                                {promocion.tipoPromocion.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {promocion.tipoPromocion === 'DESCUENTO_PORCENTAJE' ? `${promocion.valorDescuento}%` : `$${promocion.valorDescuento}`}
                            </TableCell>
                            <TableCell>
                              <Badge variant={promocion.estaActiva ? 'success' : 'destructive'}>
                                {promocion.estaActiva ? 'Activa' : 'Inactiva'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span>{promocion.fechaFin.split(' ')[0]}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewPromotion(promocion)}
                                >
                                  <Eye className="h-4 w-4 text-gray-500 hover:text-purple-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditPromotion(promocion)}
                                >
                                  <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePromotion(promocion.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Actividad reciente */}
                <Card>
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                    <CardDescription>Eventos y cambios recientes en el sistema.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <li key={index} className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gray-400 mt-2" />
                          <div>
                            <p className="font-medium text-gray-800">{activity.action}</p>
                            <p className="text-sm text-gray-500">
                              {activity.time} &middot;{' '}
                              <Badge
                                variant={
                                  activity.type === 'success'
                                    ? 'success'
                                    : activity.type === 'warning'
                                    ? 'warning'
                                    : 'info'
                                }
                              >
                                {activity.status}
                              </Badge>
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeTab === 'promotions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Gestión de Promociones</h2>
                  <Button onClick={() => { setShowCreatePromotion(true); resetPromotionForm(); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Promoción
                  </Button>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Promoción</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Condición</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Fechas</TableHead>
                          <TableHead>Acumulable</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {promociones.map((promocion) => (
                          <TableRow key={promocion.id}>
                            <TableCell className="font-medium">{promocion.nombre}</TableCell>
                            <TableCell>{promocion.codigo}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{promocion.tipoPromocion.replace(/_/g, ' ')}</Badge>
                            </TableCell>
                            <TableCell>{promocion.tipoCondicion.replace(/_/g, ' ')}</TableCell>
                            <TableCell>{promocion.valorDescuento}</TableCell>
                            <TableCell>
                              <div className="flex flex-col text-xs text-gray-500">
                                <span>{promocion.fechaInicio.split(' ')[0]}</span>
                                <span>{promocion.fechaFin.split(' ')[0]}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={promocion.esAcumulable}
                                disabled
                                className="pointer-events-none"
                              />
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={promocion.estaActiva}
                                onCheckedChange={() => handleTogglePromotionStatus(promocion.id)}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewPromotion(promocion)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditPromotion(promocion)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePromotion(promocion.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
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
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Gestión de Cupones</h2>
                  <Button onClick={() => { setShowCreateCoupon(true); resetCouponForm(); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Cupón
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descuento</TableHead>
                          <TableHead>Usos</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fechas</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {coupons.map((coupon) => (
                          <TableRow key={coupon.id}>
                            <TableCell className="font-medium">{coupon.code}</TableCell>
                            <TableCell>{coupon.type}</TableCell>
                            <TableCell>{coupon.discount}</TableCell>
                            <TableCell>{coupon.uses}</TableCell>
                            <TableCell>
                              <Badge variant={coupon.status === 'Activo' ? 'success' : 'destructive'}>
                                {coupon.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col text-xs text-gray-500">
                                <span>Inicio: {coupon.created.split(' ')[0]}</span>
                                <span>Fin: {coupon.created.split(' ')[0]}</span> {/* Ajustar según el backend */}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEditCoupon(coupon)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteCoupon(coupon.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleToggleCouponStatus(coupon.id)}>
                                  <Switch checked={coupon.status === 'Activo'} />
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
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Gestión de Campañas</h2>
                  <Button onClick={() => { setShowCreateCampaign(true); resetCampaignForm(); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Campaña
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Presupuesto</TableHead>
                          <TableHead>Inversión</TableHead>
                          <TableHead>Conversiones</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fechas</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {campaigns.map((campaign) => (
                          <TableRow key={campaign.id}>
                            <TableCell className="font-medium">{campaign.name}</TableCell>
                            <TableCell>{campaign.budget}</TableCell>
                            <TableCell>{campaign.spent}</TableCell>
                            <TableCell>{campaign.conversions}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  campaign.status === 'Activa'
                                    ? 'success'
                                    : campaign.status === 'Programada'
                                    ? 'info'
                                    : 'secondary'
                                }
                              >
                                {campaign.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col text-xs text-gray-500">
                                <span>{campaign.startDate}</span>
                                <span>{campaign.endDate}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEditCampaign(campaign)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteCampaign(campaign.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleCampaignStatus(campaign.id)}
                                >
                                  <Switch checked={campaign.status === 'Activa'} />
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
          </main>
          <Footer />
        </div>
      </div>

      {/* Diálogo para crear/editar promociones */}
      <Dialog open={showCreatePromotion} onOpenChange={setShowCreatePromotion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPromotion ? 'Editar Promoción' : 'Crear Promoción'}</DialogTitle>
            <DialogDescription>
              {editingPromotion
                ? 'Modifica los detalles de la promoción existente.'
                : 'Crea una nueva promoción para tu tienda.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={promotionForm.nombre}
                  onChange={(e) => setPromotionForm({ ...promotionForm, nombre: e.target.value })}
                />
              </div>
              {/* **MODIFICACIÓN:** Nuevo campo de código */}
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={promotionForm.codigo}
                  onChange={(e) => setPromotionForm({ ...promotionForm, codigo: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={promotionForm.descripcion}
                onChange={(e) => setPromotionForm({ ...promotionForm, descripcion: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipoPromocion">Tipo de Promoción</Label>
                <Select
                  value={promotionForm.tipoPromocion}
                  onValueChange={(value) => setPromotionForm({ ...promotionForm, tipoPromocion: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tipos</SelectLabel>
                      <SelectItem value="DESCUENTO_PORCENTAJE">Descuento Porcentaje</SelectItem>
                      <SelectItem value="DESCUENTO_MONTO_FIJO">Descuento por Monto</SelectItem>
                      <SelectItem value="DOS_POR_UNO">Dos por Uno (2x1)</SelectItem>
                      <SelectItem value="ENVIO_GRATIS">Envío Gratis</SelectItem>
                      <SelectItem value="REGALO_PRODUCTO">Regalo de Producto</SelectItem>
                      <SelectItem value="CASHBACK">Cashback</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tipoCondicion">Condicion de Aplicacion</Label>
                <Select
                  value={promotionForm.tipoCondicion}
                  onValueChange={(value) => setPromotionForm({ ...promotionForm, tipoCondicion: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la condicion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {/* Mapeo de las opciones basado en tu lista de ENUMS del backend */}
                <SelectItem value="SIN_CONDICION">Sin Condición Especial</SelectItem>
                <SelectItem value="MONTO_MINIMO">Monto Mínimo de Compra</SelectItem>
                <SelectItem value="CANTIDAD_PRODUCTOS">Cantidad Mínima de Productos</SelectItem>
                <SelectItem value="CATEGORIA_ESPECIFICA">Categoría Específica</SelectItem>
                <SelectItem value="PRODUCTO_ESPECIFICO">Producto Específico</SelectItem>
                <SelectItem value="DIA_SEMANA">Día de la Semana Específico</SelectItem>
                <SelectItem value="HORA_ESPECIFICA">Horario Específico</SelectItem>
                <SelectItem value="POR_HORA">Hora Específica para Condiciones</SelectItem>
                
                {/* Estas condiciones son generalmente validadas por el servicio de Lealtad/Usuarios */}
                <SelectItem value="PRIMER_COMPRA">Primera Compra del Usuario</SelectItem>
                <SelectItem value="CLIENTE_VIP">Solo Clientes VIP</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="valorDescuento">Valor de Descuento</Label>
                <Input
                  id="valorDescuento"
                  type="number"
                  value={promotionForm.valorDescuento}
                  onChange={(e) => setPromotionForm({ ...promotionForm, valorDescuento: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                <Input
                  id="fechaInicio"
                  type="datetime-local"
                  value={promotionForm.fechaInicio}
                  onChange={(e) => setPromotionForm({ ...promotionForm, fechaInicio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fechaFin">Fecha de Fin</Label>
                <Input
                  id="fechaFin"
                  type="datetime-local"
                  value={promotionForm.fechaFin}
                  onChange={(e) => setPromotionForm({ ...promotionForm, fechaFin: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="esAcumulable"
                checked={promotionForm.esAcumulable}
                onCheckedChange={(checked) => setPromotionForm({ ...promotionForm, esAcumulable: checked })}
              />
              <Label htmlFor="esAcumulable">Acumulable</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="estaActiva"
                checked={promotionForm.estaActiva}
                onCheckedChange={(checked) => setPromotionForm({ ...promotionForm, estaActiva: checked })}
              />
              <Label htmlFor="estaActiva">Activa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePromotion(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePromotion}>
              {editingPromotion ? <><Save className="h-4 w-4 mr-2" />Guardar</> : <><Plus className="h-4 w-4 mr-2" />Crear</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para ver detalles de promociones */}
      <Dialog open={!!viewingPromotion} onOpenChange={() => setViewingPromotion(null)}>
        <DialogContent>
          {viewingPromotion && (
            <Card>
              <CardHeader>
                <DialogTitle>{viewingPromotion.nombre}</DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-2 mt-2">
                    {/* **MODIFICACIÓN:** Se ha añadido esta línea para mostrar el código */}
                    <Badge variant="outline">Código: {viewingPromotion.codigo}</Badge>
                    <Badge variant={viewingPromotion.estaActiva ? 'success' : 'destructive'}>
                      {viewingPromotion.estaActiva ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                </DialogDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Descripción</Label>
                    <p className="text-sm text-gray-600">{viewingPromotion.descripcion}</p>
                  </div>
                  <div>
                    <Label>Tipo de Promoción</Label>
                    <p className="text-sm font-medium">{viewingPromotion.tipoPromocion.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Condición</Label>
                    <p className="text-sm font-medium">{viewingPromotion.tipoCondicion.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <Label>Valor de Descuento</Label>
                    <p className="text-sm font-medium">
                      {viewingPromotion.tipoPromocion === 'DESCUENTO_PORCENTAJE'
                        ? `${viewingPromotion.valorDescuento}%`
                        : `$${viewingPromotion.valorDescuento}`}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha de Inicio</Label>
                    <p className="text-sm font-medium">{viewingPromotion.fechaInicio.split(' ')[0]}</p>
                  </div>
                  <div>
                    <Label>Fecha de Fin</Label>
                    <p className="text-sm font-medium">{viewingPromotion.fechaFin.split(' ')[0]}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Label>Acumulable</Label>
                  <Badge variant={viewingPromotion.esAcumulable ? 'success' : 'destructive'}>
                    {viewingPromotion.esAcumulable ? 'Sí' : 'No'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para crear/editar cupones */}
<Dialog open={showCreateCoupon} onOpenChange={setShowCreateCoupon}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{editingCoupon ? 'Editar Cupón' : 'Crear Cupón'}</DialogTitle>
      <DialogDescription>
        {editingCoupon
          ? 'Modifica los detalles del cupón existente.'
          : 'Crea un nuevo cupón de descuento para tus clientes.'}
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      
      <div>
        <Label htmlFor="codigo">Código</Label>
        <Input
          id="codigo"
          value={couponForm.codigo}
          onChange={(e) => setCouponForm({ ...couponForm, codigo: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipo">Tipo</Label>
          <Select
            value={couponForm.tipo}
            onValueChange={(value) => setCouponForm({ ...couponForm, tipo: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tipos</SelectLabel>
                <SelectItem value="porcentaje">Porcentaje</SelectItem>
                <SelectItem value="fijo">Fijo</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="descuento">Descuento</Label>
          <Input
            id="descuento"
            type="number"
            value={couponForm.descuento}
            onChange={(e) => setCouponForm({ ...couponForm, descuento: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="usos">Usos máximos</Label>
        <Input
          id="usos"
          type="number"
          value={couponForm.usos}
          onChange={(e) => setCouponForm({ ...couponForm, usos: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
          <Input
            id="fechaInicio"
            type="datetime-local"
            value={couponForm.fecha_inicio}
            onChange={(e) => setCouponForm({ ...couponForm, fecha_inicio: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="fechaFin">Fecha de Fin</Label>
          <Input
            id="fechaFin"
            type="datetime-local"
            value={couponForm.fecha_fin}
            onChange={(e) => setCouponForm({ ...couponForm, fecha_fin: e.target.value })}
          />
        </div>
      </div>

      {/* Select para elegir la promoción */}
      <div>
        <Label htmlFor="promocionId">Promoción Asociada</Label>
        <Select
          value={couponForm.promocionId?.toString() || ''}
          onValueChange={(value) => setCouponForm({ ...couponForm, promocionId: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una promoción" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {promociones.map((promo) => (
                <SelectItem key={promo.id} value={promo.id.toString()}>
                  {promo.nombre}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={couponForm.isActive}
          onCheckedChange={(checked) => setCouponForm({ ...couponForm, isActive: checked })}
        />
        <Label htmlFor="isActive">Activo</Label>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowCreateCoupon(false)}>
        Cancelar
      </Button>
      <Button onClick={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}>
        {editingCoupon ? <><Save className="h-4 w-4 mr-2" />Guardar</> : <><Plus className="h-4 w-4 mr-2" />Crear</>}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </div>
  );
}