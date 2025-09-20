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

// URL base del backend para las promociones
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
      if (
        !promotionForm.nombre.trim() ||
        promotionForm.valorDescuento === '' ||
        !promotionForm.fechaInicio ||
        !promotionForm.fechaFin
      ) {
        throw new Error('Por favor, completa todos los campos requeridos');
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
  const handleEditPromotion = (promotion: Promocion) => {
    console.log('Editing promotion:', promotion); // Debug log
    setEditingPromotion(promotion);
    setPromotionForm({
      nombre: promotion.nombre,
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

  // Función para resetear el formulario del cupón
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
    });
    setEditingCoupon(null);
  };

  // Función para crear un nuevo cupón (método POST)
  const handleCreateCoupon = async () => {
    // Validar campos requeridos
    if (!couponForm.codigo || !couponForm.descuento || !couponForm.fecha_inicio || !couponForm.fecha_fin) {
      toast({
        title: 'Error',
        description: 'Por favor, completa todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    // Convertir fechas de datetime-local (YYYY-MM-DDTHH:mm) a ISO 8601 (YYYY-MM-DDTHH:mm:ss)
    const formatDateForBackend = (dateString: string): string => {
      if (!dateString) return '';
      return `${dateString}:00`; // Añade :00 para segundos
    };

    const dtoData = {
      codigo: couponForm.codigo,
      tipo: couponForm.tipo === 'porcentaje' ? 'Porcentaje' : 'Fijo',
      descuento: parseFloat(couponForm.descuento),
      usos: parseInt(couponForm.usos, 10) || 0,
      estado: couponForm.isActive ? 'ACTIVO' : 'INACTIVO',
      fecha_inicio: formatDateForBackend(couponForm.fecha_inicio),
      fecha_fin: formatDateForBackend(couponForm.fecha_fin),
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
        fetchCupones(); // Refrescar la lista de cupones
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

  // Función para poblar el formulario con los datos de un cupón existente
  const handleEditCoupon = async (coupon: any) => {
    console.log('Attempting to edit coupon:', coupon); // Debug log to verify the coupon object
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

      console.log('Response status:', response.status); // Debug log for response status
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: No se pudo cargar el cupón con código ${coupon.code}`);
      }

      const data = await response.json();
      console.log('Fetched coupon data:', data); // Debug log for fetched data

      // Función para formatear fechas al formato datetime-local (YYYY-MM-DDTHH:mm)
      const formatDateForInput = (dateString: string | null | undefined): string => {
        if (!dateString || typeof dateString !== 'string') {
          console.warn(`Invalid or missing date: ${dateString}`);
          return '';
        }
        // Manejar formato ISO 8601 (YYYY-MM-DDTHH:mm:ss) o formato con espacio (YYYY-MM-DD HH:mm:ss)
        const isoMatch = dateString.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
        const spaceMatch = dateString.match(/^(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2})/);

        if (isoMatch) {
          return `${isoMatch[1]}T${isoMatch[2]}`; // Convierte 2025-09-17T12:00:00 a 2025-09-17T12:00
        } else if (spaceMatch) {
          return `${spaceMatch[1]}T${spaceMatch[2]}`; // Convierte 2025-09-17 12:00:00 a 2025-09-17T12:00
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

  // Función para actualizar un cupón existente (método PUT)
  const handleUpdateCoupon = async () => {
    // Validar campos requeridos
    if (!couponForm.codigo || !couponForm.descuento || !couponForm.fecha_inicio || !couponForm.fecha_fin) {
      toast({
        title: 'Error',
        description: 'Por favor, completa todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    // Convertir fechas de datetime-local (YYYY-MM-DDTHH:mm) a ISO 8601 (YYYY-MM-DDTHH:mm:ss)
    const formatDateForBackend = (dateString: string): string => {
      if (!dateString) return '';
      return `${dateString}:00`; // Añade :00 para segundos
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
        fetchCupones(); // Refrescar la lista de cupones
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

  // Función para eliminar un cupón
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
        fetchCupones(); // Refrescar la lista
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

  // Función para cambiar el estado de un cupón
  const handleToggleCouponStatus = async (couponId: number) => {
    try {
      // Obtiene los datos actuales del cupón (usamos ID para obtener el cupón)
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
      console.log('Fetched coupon for toggle:', couponToUpdate); // Debug log

      // Determina el nuevo estado y el DTO para el PUT
      const newStatus = couponToUpdate.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
      const updatedDto = {
        ...couponToUpdate,
        estado: newStatus,
      };

      // Envía la solicitud PUT al backend con el estado actualizado
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
        fetchCupones(); // Refrescar la lista
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
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descuento</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Expira</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
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
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    console.log('Clicked View for promotion:', promo.id); // Debug log
                                    handleViewPromotion(promo);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Sección de actividad reciente */}
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
                {/* Header de la sección de promociones */}
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

                {/* Filtros y búsqueda */}
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

                {/* Tabla de promociones */}
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewPromotion(promo)}
                                >
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

                {/* Diálogo para crear/editar promoción */}
                <Dialog open={showCreatePromotion} onOpenChange={setShowCreatePromotion}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingPromotion ? 'Editar Promoción' : 'Crear Promoción'}</DialogTitle>
                      <DialogDescription>
                        {editingPromotion ? 'Edita los detalles de la promoción.' : 'Crea una nueva promoción.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                          id="nombre"
                          value={promotionForm.nombre}
                          onChange={(e) => setPromotionForm({ ...promotionForm, nombre: e.target.value })}
                          placeholder="Nombre de la promoción"
                        />
                      </div>
                      <div>
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea
                          id="descripcion"
                          value={promotionForm.descripcion}
                          onChange={(e) => setPromotionForm({ ...promotionForm, descripcion: e.target.value })}
                          placeholder="Descripción de la promoción"
                        />
                      </div>
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
                            <SelectItem value="DESCUENTO_PORCENTAJE">Descuento Porcentaje</SelectItem>
                            <SelectItem value="DESCUENTO_FIJO">Descuento Fijo</SelectItem>
                            <SelectItem value="2X1">2x1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="tipoCondicion">Condición</Label>
                        <Select
                          value={promotionForm.tipoCondicion}
                          onValueChange={(value) => setPromotionForm({ ...promotionForm, tipoCondicion: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una condición" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MONTO_MINIMO">Monto Mínimo</SelectItem>
                            <SelectItem value="CANTIDAD_MINIMA">Cantidad Mínima</SelectItem>
                            <SelectItem value="PRODUCTO_ESPECIFICO">Producto Específico</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="valorDescuento">Valor del Descuento</Label>
                        <Input
                          id="valorDescuento"
                          type="number"
                          value={promotionForm.valorDescuento}
                          onChange={(e) => setPromotionForm({ ...promotionForm, valorDescuento: e.target.value })}
                          placeholder="Ej. 0.1 para 10%"
                        />
                      </div>
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
                      <div className="flex items-center gap-2">
                        <Switch
                          id="esAcumulable"
                          checked={promotionForm.esAcumulable}
                          onCheckedChange={(checked) => setPromotionForm({ ...promotionForm, esAcumulable: checked })}
                        />
                        <Label htmlFor="esAcumulable">Acumulable</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="estaActiva"
                          checked={promotionForm.estaActiva}
                          onCheckedChange={(checked) => setPromotionForm({ ...promotionForm, estaActiva: checked })}
                        />
                        <Label htmlFor="estaActiva">Activa</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => { setShowCreatePromotion(false); resetPromotionForm(); }}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreatePromotion}>
                        {editingPromotion ? 'Actualizar' : 'Crear'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {activeTab === 'coupons' && (
              <div className="space-y-6">
                {/* Header de la sección de cupones */}
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

                {/* Filtros y búsqueda */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar cupones..." className="pl-10 w-80" />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="inactive">Inactivos</SelectItem>
                        <SelectItem value="expired">Expirados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tabla de cupones */}
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
                          <TableHead>Expira</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {coupons.map((coupon) => (
                          <TableRow key={coupon.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{coupon.code}</div>
                                <div className="text-sm text-muted-foreground">{coupon.id}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{coupon.type}</Badge>
                            </TableCell>
                            <TableCell className="font-medium text-purple-600">
                              {coupon.type === 'Porcentaje' ? `${coupon.discount}%` : `$${coupon.discount}`}
                            </TableCell>
                            <TableCell>{`${coupon.uses}/${coupon.maxUses}`}</TableCell>
                            <TableCell>
                              <Badge
                                variant={coupon.status === 'Activo' ? 'default' : 'secondary'}
                                className={
                                  coupon.status === 'Activo'
                                    ? 'bg-purple-600 hover:bg-purple-700 cursor-pointer'
                                    : 'cursor-pointer'
                                }
                                onClick={() => handleToggleCouponStatus(coupon.id)}
                              >
                                {coupon.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(coupon.created).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditCoupon(coupon)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteCoupon(coupon.id)}
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

                {/* Diálogo para crear/editar cupón */}
                <Dialog open={showCreateCoupon} onOpenChange={setShowCreateCoupon}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingCoupon ? 'Editar Cupón' : 'Crear Cupón'}</DialogTitle>
                      <DialogDescription>
                        {editingCoupon ? 'Edita los detalles del cupón.' : 'Crea un nuevo cupón.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="codigo">Código</Label>
                        <Input
                          id="codigo"
                          value={couponForm.codigo}
                          onChange={(e) => setCouponForm({ ...couponForm, codigo: e.target.value })}
                          placeholder="Código del cupón"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipo">Tipo de Descuento</Label>
                        <Select
                          value={couponForm.tipo}
                          onValueChange={(value) => setCouponForm({ ...couponForm, tipo: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="porcentaje">Porcentaje</SelectItem>
                            <SelectItem value="fijo">Fijo</SelectItem>
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
                          placeholder="Ej. 10 para 10% o $10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="usos">Usos Máximos</Label>
                        <Input
                          id="usos"
                          type="number"
                          value={couponForm.usos}
                          onChange={(e) => setCouponForm({ ...couponForm, usos: e.target.value })}
                          placeholder="Número de usos máximos"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                        <Input
                          id="fecha_inicio"
                          type="datetime-local"
                          value={couponForm.fecha_inicio}
                          onChange={(e) => setCouponForm({ ...couponForm, fecha_inicio: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="fecha_fin">Fecha de Fin</Label>
                        <Input
                          id="fecha_fin"
                          type="datetime-local"
                          value={couponForm.fecha_fin}
                          onChange={(e) => setCouponForm({ ...couponForm, fecha_fin: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="isActive"
                          checked={couponForm.isActive}
                          onCheckedChange={(checked) => setCouponForm({ ...couponForm, isActive: checked })}
                        />
                        <Label htmlFor="isActive">Activo</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => { setShowCreateCoupon(false); resetCouponForm(); }}>
                        Cancelar
                      </Button>
                      <Button onClick={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}>
                        {editingCoupon ? 'Actualizar' : 'Crear'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Diálogo para mostrar detalles de la promoción */}
            <Dialog open={!!viewingPromotion} onOpenChange={(open) => { if (!open) setViewingPromotion(null); }}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Detalles de la Promoción</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 py-4 text-sm">
                  {viewingPromotion && (
                    <>
                      <p><strong>Nombre:</strong> {viewingPromotion.nombre}</p>
                      <p><strong>Descripción:</strong> {viewingPromotion.descripcion}</p>
                      <p><strong>Tipo:</strong> {viewingPromotion.tipoPromocion}</p>
                      <p><strong>Condición:</strong> {viewingPromotion.tipoCondicion}</p>
                      <p><strong>Descuento:</strong> {viewingPromotion.valorDescuento * 100}%</p>
                      <p><strong>Inicio:</strong> {new Date(viewingPromotion.fechaInicio).toLocaleString()}</p>
                      <p><strong>Fin:</strong> {new Date(viewingPromotion.fechaFin).toLocaleString()}</p>
                      <p><strong>Acumulable:</strong> {viewingPromotion.esAcumulable ? 'Sí' : 'No'}</p>
                      <p><strong>Estado:</strong> {viewingPromotion.estaActiva ? 'Activa' : 'Pausada'}</p>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={() => setViewingPromotion(null)}>Cerrar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>

          {/* Footer del dashboard */}
          <Footer />
        </div>
      </div>
    </div>
  );
}