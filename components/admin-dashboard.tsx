'use client';

import React, { useState, useEffect, use } from 'react';
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
  //Agregada para la actividad reciente
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
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

  // Funcionar para generar activad reciente real con promos y cupones
  const generateRecentActivity = () => {
    const activity: any[] = [];
    //Promos
    promociones.forEach((promo) => {
      activity.push({ 
        action: `Nueva promoción "${promo.nombre}"`, 
        time: promo.fechaInicio ? new Date(promo.fechaInicio).toLocaleString() : 'Fecha no disponible',
        status: promo.estaActiva ? 'Activa' : 'Inactiva',
        type: promo.estaActiva ? 'success' : 'warning',
      });
  });

  //Cupones
  coupons.forEach((c) => {
    activity.push({
      action: `Cupón "${c.code}" - ${c.promocionNombre}`, // Incluir promoción
      time: c.fecha_inicio ? new Date(c.fecha_inicio).toLocaleString() : 'Fecha no disponible',
      status: c.status, // Usar c.status en lugar de c.isActive
      type: c.isActive ? 'success' : 'warning',
    });
  });

  // Ordenar por fecha más reciente
  activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  setRecentActivity(activity);
};

  //Fetch para actualizar actividad reciente
  useEffect(() => {
    generateRecentActivity();
  }, [promociones, coupons]);


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
        const fetchCupones = async (promocionesData: Promocion[] = promociones) => {
          try {
            console.log('Cargando cupones con promociones:', promocionesData); // Debug
        
            const response = await fetch(`http://localhost:8502/service-main/api/cupones`, {
              method: 'GET',
              credentials: 'include',
            });
        
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || `Error ${response.status}: No se pudieron cargar los cupones`);
            }
        
            const data = await response.json();
            console.log('Datos raw de cupones:', data); // Debug
        
            // Mapear los datos para que coincidan con la estructura esperada en la tabla
            const formattedCoupons = data.map((coupon: any) => {
              // USAR promocionesData en lugar de promociones del estado
              const promocionAsociada = promocionesData.find((p) => p.id === coupon.promocionId);
              
              console.log(`Cupón ${coupon.codigo}: promocionId=${coupon.promocionId}, promoción encontrada:`, promocionAsociada?.nombre || 'No encontrada');
        
              return {
                id: coupon.id,
                code: coupon.codigo,
                type: coupon.tipo,
                discount: coupon.descuento,
                uses: coupon.usos || 0,
                maxUses: coupon.usos || 0,
                status: coupon.estado === 'ACTIVO' ? 'Activo' : 'Inactivo',
                created: coupon.fecha_inicio,
                fechaFin: coupon.fecha_fin,
                promocionId: coupon.promocionId, // Guardar referencia
                promocionNombre: promocionAsociada?.nombre || 'Sin promoción asignada',
              };
            });
        
            setCoupons(formattedCoupons);
            console.log('Cupones formateados:', formattedCoupons); // Debug
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
    const loadData = async () => {
      if (activeTab === 'promotions') {
        await fetchPromociones();
      }
      
      if (activeTab === 'coupons') {
        let promos = promociones;
  
        // Si no hay promociones cargadas, obtenlas primero
        if (promos.length === 0) {
          try {
            const response = await fetch(`${API_BASE_URL}`, {
              method: 'GET',
              credentials: 'include',
            });
            
            if (response.ok) {
              const data = await response.json();
              setPromociones(data);
              promos = data; // usar directamente para mapear cupones
            }
          } catch (error) {
            console.error('Error cargando promociones:', error);
          }
        }
  
        // PASAR promos como parámetro
        await fetchCupones(promos);
      }
      
      if (activeTab === 'dashboard') {
        await fetchDashboardStats();
      }
    }
    loadData();
  }, [activeTab]);
  
  // Y también en el segundo useEffect:
  useEffect(() => {
    if(promociones.length > 0 && activeTab === 'coupons'){
      fetchCupones(promociones); // PASAR promociones como parámetro
    }
  }, [promociones]);;
  
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

      if (!response.ok) throw new Error('Error al cambiar el estado de la promoción');
      
      toast({
          title: 'Éxito',
          description: `Promoción ${newStatus ? 'activada' : 'pausada'} correctamente.`,
      });

      // 3. Recargar la lista para mostrar el nuevo estado
      fetchPromociones();

  } catch (error) {
      toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'No se pudo cambiar el estado',
          variant: 'destructive',
      });
  }
};

  const handleCreateCoupon = () => {
    if (bulkGeneration.enabled && bulkGeneration.quantity > 1) {
      // Generate multiple coupons
      const newCoupons: CuponBackend[] = []
      for (let i = 0; i < bulkGeneration.quantity; i++) {
        const coupon: CuponBackend = {
          id: cupones.length + newCoupons.length + 1,
          codigo: generateRandomCode(bulkGeneration.prefix),
          discount: newCoupon.discount,
          expiryDate: newCoupon.expiryDate,
          startDate: newCoupon.startDate,
          status: "active",
          usage: 0,
          maxUsage: newCoupon.maxUsage ? Number.parseInt(newCoupon.maxUsage) : 999999,
          usagePerUser: newCoupon.usagePerUser ? Number.parseInt(newCoupon.usagePerUser) : 999999,
          type: newCoupon.type,
          description: newCoupon.description,
          category: newCoupon.category,
          minPurchase: Number.parseInt(newCoupon.minPurchase) || 0,
          isStackable: newCoupon.isStackable,
          applicableProducts: newCoupon.applicableProducts
            ? newCoupon.applicableProducts.split(",").map((p) => p.trim())
            : [],
          excludedProducts: newCoupon.excludedProducts
            ? newCoupon.excludedProducts.split(",").map((p) => p.trim())
            : [],
        }
        newCoupons.push(coupon)
      }
      setCupones([...cupones, ...newCupones])
    } else {
      // Generate single coupon
      const cupon: CuponBackend = {
        id: cupones.length + 1,
        codigo: newCoupon.code || generateRandomCode("COUPON"),
        discount: newCoupon.discount,
        expiryDate: newCoupon.expiryDate,
        startDate: newCoupon.startDate,
        status: "active",
        usage: 0,
        maxUsage: newCoupon.maxUsage ? Number.parseInt(newCoupon.maxUsage) : 999999,
        usagePerUser: newCoupon.usagePerUser ? Number.parseInt(newCoupon.usagePerUser) : 999999,
        type: newCoupon.type,
        description: newCoupon.description,
        category: newCoupon.category,
        minPurchase: Number.parseInt(newCoupon.minPurchase) || 0,
        isStackable: newCoupon.isStackable,
        applicableProducts: newCoupon.applicableProducts
          ? newCoupon.applicableProducts.split(",").map((p) => p.trim())
          : [],
        excludedProducts: newCoupon.excludedProducts ? newCoupon.excludedProducts.split(",").map((p) => p.trim()) : [],
      }
      setCupones([...cupones, cupon])
    }

    setNewCoupon({
      code: "",
      discount: "",
      expiryDate: "",
      startDate: "",
      maxUsage: "",
      usagePerUser: "",
      type: "percentage",
      description: "",
      category: "",
      minPurchase: "",
      isStackable: false,
      applicableProducts: "",
      excludedProducts: "",
    })
    setBulkGeneration({ enabled: false, quantity: 1, prefix: "COUPON" })
    setIsCouponDialogOpen(false)
  }

  const handleEditCoupon = () => {
    if (editingCoupon) {
      setCupones(cupones.map((c) => (c.id === editingCoupon.id ? editingCoupon : c)))
      setEditingCoupon(null)
      setIsCouponDialogOpen(false)
    }
  }

  const handleDeleteCoupon = (id: number) => {
    setCupones(cupones.filter((c) => c.id !== id))
  }

  const handleToggleCouponStatus = (id: number) => {
    setCupones(cupones.map((c) => (c.id === id ? { ...c, status: c.status === "active" ? "paused" : "active" } : c)))
  }

  const usageData = [
    { name: "Promociones", usos: promociones.reduce((acc, p) => acc + p.usage, 0) },
    { name: "Cupones", usos: cupones.reduce((acc, c) => acc + c.usage, 0) },
  ]

  const statusData = [
    {
      name: "Activas",
      value:
        promociones.filter((p) => p.status === "active").length + cupones.filter((c) => c.status === "active").length,
    },
    {
      name: "Pausadas",
      value:
        promociones.filter((p) => p.status === "paused").length + cupones.filter((c) => c.status === "paused").length,
    },
  ]

  const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"]
  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];


  const weeklyData = diasSemana.map((dia, idx) => ({
    dia,
    promociones: promociones.filter(p => new Date(p.startDate).getDay() === idx).length,
    cupones: cupones.filter(c => new Date(c.startDate).getDay() === idx).length,
  }));

  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const monthlyRevenueData = meses.map((mes, i) => {
  const ingresos = promociones.reduce((sum, p) => sum + (p.ingresosMes?.[i] || 0), 0);
  const descuentos = promociones.reduce((sum, p) => sum + (p.descuentosMes?.[i] || 0), 0);
  return { mes, ingresos, descuentos };
});


  const categoryPerformance = [
    { categoria: "Temporada", valor: 85 },
    { categoria: "Evento Especial", valor: 92 },
    { categoria: "Bienvenida", valor: 78 },
    { categoria: "General", valor: 88 },
    { categoria: "Primera Compra", valor: 95 },
  ]

  const conversionData = Array.from({ length: 24 }, (_, h) => ({
    hora: `${h}:00`,
    conversiones: [...promociones, ...cupones].filter(item => new Date(item.startDate).getHours() === h).length,
  }));
  

  const filteredPromotions = promociones.filter((promocion) => {
    const matchesSearch =
      (promocion.nombre || "").toLowerCase().includes(promotionSearch.toLowerCase()) ||
      (promocion.descripcion || "").toLowerCase().includes(promotionSearch.toLowerCase()) ||
      (promocion.codigo || "").toLowerCase().includes(promotionSearch.toLowerCase()) ||
      String(promocion.valorDescuento || "").toLowerCase().includes(promotionSearch.toLowerCase());
  
    const matchesStatus =
      promotionStatusFilter === "all" ||
      (promocion.estaActiva ? "activa" : "inactiva") === promotionStatusFilter;
  
    return matchesSearch && matchesStatus;
  });
  
  const filteredCoupons = cupones.filter((cupon) => {
    const matchesSearch =
      (cupon.codigo || "").toLowerCase().includes(couponSearch.toLowerCase()) ||
      (cupon.descripcion || "").toLowerCase().includes(couponSearch.toLowerCase()) ||
      String(cupon.promocionId || "").toLowerCase().includes(couponSearch.toLowerCase());
  
    const matchesStatus =
      couponStatusFilter === "all" ||
      (cupon.estaActivo ? "active" : "paused") === couponStatusFilter;
  
    return matchesSearch && matchesStatus;
  });
  

  const [newPromotion, setNewPromotion] = useState({
    id: 0,
    nombre: "",
    codigo: "",
    descripcion: "",
    tipoPromocion: "DESCUENTO_PORCENTAJE" as
      | "DESCUENTO_PORCENTAJE"
      | "DESCUENTO_MONTO_FIJO"
      | "DOS_POR_UNO"
      | "TRES_POR_DOS"
      | "ENVIO_GRATIS"
      | "REGALO_PRODUCTO"
      | "CASHBACK",
    tipoCondicion: "SIN_CONDICION" as "MONTO_MINIMO" | "CANTIDAD_PRODUCTOS" | "SIN_CONDICION",
    valorDescuento: 0,
    fechaInicio: "",
    fechaFin: "",
    esAcumulable: false,
    estaActiva: true,  
    maxUsage: "",
  })

  const [newCoupon, setNewCoupon] = useState({
    id: 0,
    codigo: "",
    tipo: "Porcentaje" as "Porcentaje" | "Fijo",
    descuento: "",
    usos: 0,
    estado: "ACTIVO" as "ACTIVO" | "INACTIVO",
    fecha_inicio: "",
    fecha_fin: "",
    promocionId: 0,
  })

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { toast } = useToast()

// ==================== FUNCIONES DE FETCH ====================
// Función para fetch de promociones activas desde el backend
const fetchPromociones = async () => {
  console.log('--- [FETCH] Iniciando fetchPromociones...');
  try {
    const response = await fetch(PROMOCIONES_URL, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error ${response.status}: No se pudieron cargar las promociones`
      );
    }

    const data = await response.json();
    console.log('--- [FETCH Promociones OK] Promociones cargadas:', data.length);

    // 🧠 Mapear los datos del backend al formato que usa el frontend
    const formattedPromos = data.map((promo: any) => ({
      id: promo.id,
      name: promo.nombre, // antes "nombre"
      description: promo.descripcion, // antes "descripcion"
      type: promo.tipoPromocion,
      condition: promo.tipoCondicion,
      discount: promo.valorDescuento,
      startDate: promo.fechaInicio,
      endDate: promo.fechaFin,
      stackable: promo.esAcumulable,
      status: promo.estaActiva ? "active" : "paused", // antes "estaActiva"
      usage: promo.usos || 0,
      maxUsage: promo.maxUsage || 0,
    }));

    setPromociones(formattedPromos);
    return formattedPromos; // Retornar data formateada para fetchCupones
  } catch (error) {
    console.error('Error fetching promociones:', error);
    toast({
      title: 'Error',
      description:
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar las promociones',
      variant: 'destructive',
    });
    return [];
  }
};


// Función para fetch de cupones activos desde el backend
const fetchCupones = async (promocionesData: PromocionBackend[] = promociones) => {
  try {
  console.log('--- [FETCH Cupones] Iniciando carga de cupones. Promociones disponibles:', promocionesData.length); // Debug
  
  const response = await fetch(CUPONES_URL, {
  method: 'GET',
  credentials: 'include',
  });
 
  if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.message || `Error ${response.status}: No se pudieron cargar los cupones`);
  } 
  const data = await response.json();
  console.log('--- [FETCH Cupones OK] Datos raw de cupones recibidos:', data.length); // Debug
  
  // Mapear los datos para que coincidan con la estructura esperada en la tabla
  const formattedCoupons = data.map((coupon: any) => {
    // USAR promocionesData en lugar de promociones del estado
    const promocionAsociada = promocionesData.find((p) => p.id === coupon.promocionId);
  
  console.log(`--- [MAPPING] Cupón ${coupon.codigo}: ID Promoción=${coupon.promocionId}, Nombre: ${promocionAsociada?.nombre || 'No encontrada'}`);
  
  return {
    id: coupon.id,
    code: coupon.codigo,
    type: coupon.tipo,
    discount: coupon.descuento,
    uses: coupon.usos || 0,
    maxUsage: coupon.usosMaximos || 0,
    status: coupon.estado === 'ACTIVO' ? 'active' : 'paused',
    created: coupon.fecha_inicio,
    fechaFin: coupon.fecha_fin,
    promocionId: coupon.promocionId,
    promocionNombre: promocionAsociada?.name || 'Sin promoción asignada',
  };

  });
  
  setCupones(formattedCoupons);
  console.log('--- [FETCH Cupones OK] Cupones formateados y guardados.'); // Debug
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
  console.log('--- [FETCH] Iniciando fetchDashboardStats...');
  try {
    setLoadingStats(true);
    setErrorStats(null);
    const response = await fetch(STATS_URL, {
      method: 'GET',
      credentials: 'include',
    }); // ✅ Cerrar el objeto de opciones
    
    if (!response.ok) {
      throw new Error('Error al obtener las estadísticas del dashboard');
    }
    const data = await response.json();
    console.log('--- [FETCH Stats OK] Estadísticas recibidas.');

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

 // ==================== ORQUESTACIÓN DE CARGA INICIAL ====================
 useEffect(() => {
  console.log('--- [EFFECT: Initial Mount] Cargando datos iniciales...');
  
  const loadInitialData = async () => {
    try {
      // 1️⃣ Primero, cargar promociones
      const promocionesData = await fetchPromociones();
      console.log('Promociones cargadas:', promocionesData.length);
      
      // 2️⃣ Luego, cargar cupones usando las promociones ya disponibles
      await fetchCupones(promocionesData);
      
      // 3️⃣ Finalmente, cargar estadísticas del dashboard
      await fetchDashboardStats();

      console.log('--- [EFFECT OK] Datos iniciales cargados correctamente.');
    } catch (err) {
      console.error('Error cargando datos iniciales del dashboard:', err);
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
  loadInitialData();
}, []); // 👈 Solo se ejecuta una vez al montar el componente


  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Panel de Control</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-600">Total Promociones</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="text-purple-600 hover:text-purple-700">
                              <HelpCircle className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">Número total de promociones creadas en el sistema</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">{promociones.length}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {promociones.filter((p) => p.status === "active").length} activas
                    </p>
                  </div>
                  <Tag className="h-12 w-12 text-purple-600 opacity-20" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-600">Total Cupones</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="text-purple-600 hover:text-purple-700">
                              <HelpCircle className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">Número total de cupones generados en el sistema</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">{cupones.length}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {cupones.filter((c) => c.status === "active").length} activos
                    </p>
                  </div>
                  <Ticket className="h-12 w-12 text-purple-600 opacity-20" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-600">Usos Totales</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="text-purple-600 hover:text-purple-700">
                              <HelpCircle className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">Cantidad total de veces que se han usado promociones y cupones</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">
                      {promociones.reduce((acc, p) => acc + p.usage, 0) + cupones.reduce((acc, c) => acc + c.usage, 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {promociones.reduce((acc, p) => acc + p.maxUsage, 0) +
                        cupones.reduce((acc, c) => acc + c.maxUsage, 0)}{" "}
                      disponibles
                    </p>
                  </div>
                  <Users className="h-12 w-12 text-purple-600 opacity-20" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-600">Tasa de Conversión</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="text-purple-600 hover:text-purple-700">
                              <HelpCircle className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">Porcentaje de usuarios que completan una compra usando descuentos</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">68%</p>
                    {/* CHANGE: Cambiando text-green-600 por text-blue-700 para eliminar el verde */}
                    <p className="text-xs text-blue-700 mt-1 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> +12% vs mes anterior
                    </p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-purple-600 opacity-20" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Uso Semanal</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorPromociones" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorCupones" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="dia" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="promociones"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#colorPromociones)"
                    />
                    <Area
                      type="monotone"
                      dataKey="cupones"
                      stroke="#a78bfa"
                      fillOpacity={1}
                      fill="url(#colorCupones)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Distribución de Estados</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Promociones Más Usadas</h3>
              <div className="space-y-3">
                {promociones
                  .sort((a, b) => b.usage - a.usage)
                  .slice(0, 3)
                  .map((promo) => (
                    <div key={promo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{promo.name}</p>
                        <p className="text-sm text-gray-600">{promo.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{promo.usage}</p>
                        <p className="text-xs text-gray-500">usos</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )

      case "promociones":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-800">Promociones</h2>
              <Dialog open={isPromotionDialogOpen} onOpenChange={setIsPromotionDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      setEditingPromotion(null)
                      setSelectedMainCategory("")
                      setSelectedSubCategory("")
                      setSelectedSubSubCategory("")
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Nueva Promoción
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingPromotion ? "Editar Promoción" : "Crear Nueva Promoción"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="name">Nombre de la Promoción</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Nombre descriptivo para identificar la promoción</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="name"
                          placeholder="Ej: Descuento de Verano"
                          value={editingPromotion ? editingPromotion.name : newPromotion.name}
                          onChange={(e) =>
                            editingPromotion
                              ? setEditingPromotion({ ...editingPromotion, name: e.target.value })
                              : setNewPromotion({ ...newPromotion, name: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="mainCategory">Categoría Principal</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">
                                  Selecciona la categoría principal de productos para esta promoción
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Select
                          value={selectedMainCategory}
                          onValueChange={(value) => {
                            setSelectedMainCategory(value)
                            setSelectedSubCategory("")
                            setSelectedSubSubCategory("")
                            const fullCategory = value
                            if (editingPromotion) {
                              setEditingPromotion({ ...editingPromotion, category: fullCategory })
                            } else {
                              setNewPromotion({ ...newPromotion, category: fullCategory })
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría principal" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(categoryHierarchy).map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {selectedMainCategory && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="subCategory">Subcategoría</Label>
                          <Select
                            value={selectedSubCategory}
                            onValueChange={(value) => {
                              setSelectedSubCategory(value)
                              setSelectedSubSubCategory("")
                              const fullCategory = `${selectedMainCategory} > ${value}`
                              if (editingPromotion) {
                                setEditingPromotion({ ...editingPromotion, category: fullCategory })
                              } else {
                                setNewPromotion({ ...newPromotion, category: fullCategory })
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar subcategoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(
                                categoryHierarchy[selectedMainCategory as keyof typeof categoryHierarchy],
                              ).map((subCat) => (
                                <SelectItem key={subCat} value={subCat}>
                                  {subCat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedSubCategory && (
                          <div>
                            <Label htmlFor="subSubCategory">Categoría Específica</Label>
                            <Select
                              value={selectedSubSubCategory}
                              onValueChange={(value) => {
                                setSelectedSubSubCategory(value)
                                const fullCategory = `${selectedMainCategory} > ${selectedSubCategory} > ${value}`
                                if (editingPromotion) {
                                  setEditingPromotion({ ...editingPromotion, category: fullCategory })
                                } else {
                                  setNewPromotion({ ...newPromotion, category: fullCategory })
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar categoría específica" />
                              </SelectTrigger>
                              <SelectContent>
                                {categoryHierarchy[selectedMainCategory as keyof typeof categoryHierarchy][
                                  selectedSubCategory as keyof (typeof categoryHierarchy)[keyof typeof categoryHierarchy]
                                ].map((subSubCat: string) => (
                                  <SelectItem key={subSubCat} value={subSubCat}>
                                    {subSubCat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}

                    {(selectedMainCategory || (editingPromotion && editingPromotion.category)) && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-gray-600">Categoría seleccionada:</p>
                        <p className="font-semibold text-purple-700">
                          {editingPromotion ? editingPromotion.category : newPromotion.category}
                        </p>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="description">Descripción</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="text-purple-600 hover:text-purple-700">
                                <HelpCircle className="h-3 w-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">Detalles adicionales sobre la promoción y sus condiciones</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Textarea
                        id="description"
                        placeholder="Describe los detalles de la promoción..."
                        value={editingPromotion ? editingPromotion.description : newPromotion.description}
                        onChange={(e) =>
                          editingPromotion
                            ? setEditingPromotion({ ...editingPromotion, description: e.target.value })
                            : setNewPromotion({ ...newPromotion, description: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="type">Tipo de Descuento</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Porcentaje (%) o monto fijo ($) de descuento</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Select
                          value={editingPromotion ? editingPromotion.type : newPromotion.type}
                          onValueChange={(value: "percentage" | "fixed") =>
                            editingPromotion
                              ? setEditingPromotion({ ...editingPromotion, type: value })
                              : setNewPromotion({ ...newPromotion, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                            <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="discount">Descuento</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Valor del descuento (ej: 20% o $50)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="discount"
                          placeholder="Ej: 20% o $50"
                          value={editingPromotion ? editingPromotion.discount : newPromotion.discount}
                          onChange={(e) =>
                            editingPromotion
                              ? setEditingPromotion({ ...editingPromotion, discount: e.target.value })
                              : setNewPromotion({ ...newPromotion, discount: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="minPurchase">Compra Mínima ($)</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Monto mínimo de compra requerido para aplicar la promoción</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="minPurchase"
                          type="number"
                          placeholder="0"
                          value={editingPromotion ? editingPromotion.minPurchase : newPromotion.minPurchase}
                          onChange={(e) =>
                            editingPromotion
                              ? setEditingPromotion({
                                  ...editingPromotion,
                                  minPurchase: Number.parseInt(e.target.value),
                                })
                              : setNewPromotion({ ...newPromotion, minPurchase: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="startDate">Fecha de Inicio</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Fecha en que la promoción estará disponible</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="startDate"
                          type="date"
                          value={editingPromotion ? editingPromotion.startDate : newPromotion.startDate}
                          onChange={(e) =>
                            editingPromotion
                              ? setEditingPromotion({ ...editingPromotion, startDate: e.target.value })
                              : setNewPromotion({ ...newPromotion, startDate: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="endDate">Fecha de Fin</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Fecha en que la promoción expirará</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="endDate"
                          type="date"
                          value={editingPromotion ? editingPromotion.endDate : newPromotion.endDate}
                          onChange={(e) =>
                            editingPromotion
                              ? setEditingPromotion({ ...editingPromotion, endDate: e.target.value })
                              : setNewPromotion({ ...newPromotion, endDate: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="maxUsage">Usos Máximos</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="text-purple-600 hover:text-purple-700">
                                <HelpCircle className="h-3 w-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">Número máximo de veces que se puede usar esta promoción</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="maxUsage"
                        type="number"
                        placeholder="Ej: 500"
                        value={editingPromotion ? editingPromotion.maxUsage : newPromotion.maxUsage}
                        onChange={(e) =>
                          editingPromotion
                            ? setEditingPromotion({ ...editingPromotion, maxUsage: Number.parseInt(e.target.value) })
                            : setNewPromotion({ ...newPromotion, maxUsage: e.target.value })
                        }
                      />
                    </div>

                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={editingPromotion ? handleEditPromotion : handleCreatePromotion}
                    >
                      {editingPromotion ? "Guardar Cambios" : "Crear Promoción"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="promotionSearch" className="text-sm font-medium mb-2 block">
                    Buscar Promociones
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="promotionSearch"
                      placeholder="Buscar por nombre, descripción, categoría o descuento..."
                      value={promotionSearch}
                      onChange={(e) => setPromotionSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <Label htmlFor="promotionStatusFilter" className="text-sm font-medium mb-2 block">
                    Filtrar por Estado
                  </Label>
                  <Select value={promotionStatusFilter} onValueChange={(value: any) => setPromotionStatusFilter(value)}>
                    <SelectTrigger id="promotionStatusFilter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Activas</SelectItem>
                      <SelectItem value="paused">Pausadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Mostrando {filteredPromotions.length} de {promociones.length} promociones
                </span>
                {(promotionSearch || promotionStatusFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPromotionSearch("")
                      setPromotionStatusFilter("all")
                    }}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead>Compra Mín.</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromotions.length > 0 ? (
                    filteredPromotions.map((promociones) => (
                      <TableRow key={promociones.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{promociones.name}</p>
                            <p className="text-xs text-gray-500">{promociones.descripcion}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                            {promociones.category || "Sin categoria"}
                          </span>
                        </TableCell>
                        <TableCell className="text-purple-600 font-semibold">{promociones.discount}</TableCell>
                        <TableCell className="text-gray-600">${promociones.minPurchase}</TableCell>
                        <TableCell>{promociones.startDate}</TableCell>
                        <TableCell>{promociones.endDate}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {promociones.usos}/{promociones.uso}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${(promociones.usage / promociones.maxUsage) * 100}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={promociones.status === "active" ? "default" : "secondary"}
                            className={
                              promociones.status === "active"
                                ? "bg-purple-600 hover:bg-purple-700"
                                : "bg-blue-800 hover:bg-blue-900 text-white"
                            }
                            onClick={() => handleTogglePromotionStatus(promociones.id)}
                          >
                            {promociones.status === "active" ? (
                              <Power className="h-4 w-4 mr-1" />
                            ) : (
                              <PowerOff className="h-4 w-4 mr-1" />
                            )}
                            {promociones.status === "active" ? "Activa" : "Pausada"}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingPromotion(promociones)
                                setIsPromotionDialogOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50 bg-transparent"
                              onClick={() => handleDeletePromotion(promociones.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No se encontraron promociones que coincidan con los filtros
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )

      case "coupons":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-800">Cupones</h2>
              <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      setEditingCoupon(null)
                      setSelectedMainCategory("")
                      setSelectedSubCategory("")
                      setSelectedSubSubCategory("")
                      setBulkGeneration({ enabled: false, quantity: 1, prefix: "COUPON" })
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Cupón
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingCoupon ? "Editar Cupón" : "Crear Nuevo Cupón"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {!editingCoupon && (
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Shuffle className="h-5 w-5 text-purple-600" />
                            <Label htmlFor="bulkGeneration" className="text-base font-semibold">
                              Generación Masiva de Cupones
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="text-purple-600 hover:text-purple-700">
                                    <HelpCircle className="h-4 w-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-sm">Genera múltiples cupones con códigos únicos automáticamente</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Switch
                            id="bulkGeneration"
                            checked={bulkGeneration.enabled}
                            onCheckedChange={(checked) => setBulkGeneration({ ...bulkGeneration, enabled: checked })}
                          />
                        </div>
                        {bulkGeneration.enabled && (
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div>
                              <Label htmlFor="bulkQuantity" className="text-sm">
                                Cantidad de Cupones
                              </Label>
                              <Input
                                id="bulkQuantity"
                                type="number"
                                min="1"
                                max="1000"
                                value={bulkGeneration.quantity}
                                onChange={(e) =>
                                  setBulkGeneration({
                                    ...bulkGeneration,
                                    quantity: Number.parseInt(e.target.value) || 1,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="bulkPrefix" className="text-sm">
                                Prefijo del Código
                              </Label>
                              <Input
                                id="bulkPrefix"
                                placeholder="COUPON"
                                value={bulkGeneration.prefix}
                                onChange={(e) =>
                                  setBulkGeneration({ ...bulkGeneration, prefix: e.target.value.toUpperCase() })
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {!bulkGeneration.enabled && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Label htmlFor="code">Código del Cupón</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="text-purple-600 hover:text-purple-700">
                                    <HelpCircle className="h-3 w-3" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-sm">Código único que los clientes usarán para aplicar el cupón</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              id="code"
                              placeholder="Ej: WELCOME10"
                              className="font-mono uppercase"
                              value={editingCoupon ? editingCoupon.code : newCoupon.code}
                              onChange={(e) =>
                                editingCoupon
                                  ? setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })
                                  : setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })
                              }
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const randomCode = generateRandomCode("COUPON")
                                if (editingCoupon) {
                                  setEditingCoupon({ ...editingCoupon, code: randomCode })
                                } else {
                                  setNewCoupon({ ...newCoupon, code: randomCode })
                                }
                              }}
                            >
                              <Shuffle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="couponMainCategory">Categoría Principal</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">
                                  Selecciona la categoría principal de productos para este cupón
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Select
                          value={selectedMainCategory}
                          onValueChange={(value) => {
                            setSelectedMainCategory(value)
                            setSelectedSubCategory("")
                            setSelectedSubSubCategory("")
                            const fullCategory = value
                            if (editingCoupon) {
                              setEditingCoupon({ ...editingCoupon, category: fullCategory })
                            } else {
                              setNewCoupon({ ...newCoupon, category: fullCategory })
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría principal" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(categoryHierarchy).map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {selectedMainCategory && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="couponSubCategory">Subcategoría</Label>
                          <Select
                            value={selectedSubCategory}
                            onValueChange={(value) => {
                              setSelectedSubCategory(value)
                              setSelectedSubSubCategory("")
                              const fullCategory = `${selectedMainCategory} > ${value}`
                              if (editingCoupon) {
                                setEditingCoupon({ ...editingCoupon, category: fullCategory })
                              } else {
                                setNewCoupon({ ...newCoupon, category: fullCategory })
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar subcategoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(
                                categoryHierarchy[selectedMainCategory as keyof typeof categoryHierarchy],
                              ).map((subCat) => (
                                <SelectItem key={subCat} value={subCat}>
                                  {subCat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedSubCategory && (
                          <div>
                            <Label htmlFor="couponSubSubCategory">Categoría Específica</Label>
                            <Select
                              value={selectedSubSubCategory}
                              onValueChange={(value) => {
                                setSelectedSubSubCategory(value)
                                const fullCategory = `${selectedMainCategory} > ${selectedSubCategory} > ${value}`
                                if (editingCoupon) {
                                  setEditingCoupon({ ...editingCoupon, category: fullCategory })
                                } else {
                                  setNewCoupon({ ...newCoupon, category: fullCategory })
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar categoría específica" />
                              </SelectTrigger>
                              <SelectContent>
                                {categoryHierarchy[selectedMainCategory as keyof typeof categoryHierarchy][
                                  selectedSubCategory as keyof (typeof categoryHierarchy)[keyof typeof categoryHierarchy]
                                ].map((subSubCat: string) => (
                                  <SelectItem key={subSubCat} value={subSubCat}>
                                    {subSubCat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}

                    {(selectedMainCategory || (editingCoupon && editingCoupon.category)) && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-gray-600">Categoría seleccionada:</p>
                        <p className="font-semibold text-purple-700">
                          {editingCoupon ? editingCoupon.category : newCoupon.category}
                        </p>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="couponDescription">Descripción</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="text-purple-600 hover:text-purple-700">
                                <HelpCircle className="h-3 w-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">Detalles adicionales sobre el cupón y sus condiciones</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Textarea
                        id="couponDescription"
                        placeholder="Describe los detalles del cupón..."
                        value={editingCoupon ? editingCoupon.description : newCoupon.description}
                        onChange={(e) =>
                          editingCoupon
                            ? setEditingCoupon({ ...editingCoupon, description: e.target.value })
                            : setNewCoupon({ ...newCoupon, description: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="couponType">Tipo de Descuento</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Porcentaje (%) o monto fijo ($) de descuento</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Select
                          value={editingCoupon ? editingCoupon.type : newCoupon.type}
                          onValueChange={(value: "percentage" | "fixed") =>
                            editingCoupon
                              ? setEditingCoupon({ ...editingCoupon, type: value })
                              : setNewCoupon({ ...newCoupon, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                            <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="couponDiscount">Descuento</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Valor del descuento (ej: 10% o $25)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="couponDiscount"
                          placeholder="Ej: 10% o $25"
                          value={editingCoupon ? editingCoupon.discount : newCoupon.discount}
                          onChange={(e) =>
                            editingCoupon
                              ? setEditingCoupon({ ...editingCoupon, discount: e.target.value })
                              : setNewCoupon({ ...newCoupon, discount: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="couponMinPurchase">Compra Mínima ($)</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Monto mínimo de compra requerido para aplicar el cupón</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="couponMinPurchase"
                          type="number"
                          placeholder="0"
                          value={editingCoupon ? editingCoupon.minPurchase : newCoupon.minPurchase}
                          onChange={(e) =>
                            editingCoupon
                              ? setEditingCoupon({ ...editingCoupon, minPurchase: Number.parseInt(e.target.value) })
                              : setNewCoupon({ ...newCoupon, minPurchase: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="couponMaxUsage">Usos Máximos Totales</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Número máximo de veces que se puede usar este cupón en total</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="couponMaxUsage"
                          type="number"
                          placeholder="Ilimitado"
                          value={editingCoupon ? editingCoupon.maxUsage : newCoupon.maxUsage}
                          onChange={(e) =>
                            editingCoupon
                              ? setEditingCoupon({ ...editingCoupon, maxUsage: Number.parseInt(e.target.value) })
                              : setNewCoupon({ ...newCoupon, maxUsage: e.target.value })
                          }
                        />
                        <p className="text-xs text-gray-500 mt-1">Dejar vacío para ilimitado</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="usagePerUser">Usos por Usuario</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">
                                  Número máximo de veces que un solo usuario puede usar este cupón
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="usagePerUser"
                          type="number"
                          placeholder="Ilimitado"
                          value={editingCoupon ? editingCoupon.usagePerUser : newCoupon.usagePerUser}
                          onChange={(e) =>
                            editingCoupon
                              ? setEditingCoupon({ ...editingCoupon, usagePerUser: Number.parseInt(e.target.value) })
                              : setNewCoupon({ ...newCoupon, usagePerUser: e.target.value })
                          }
                        />
                        <p className="text-xs text-gray-500 mt-1">Dejar vacío para ilimitado</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="startDate">Fecha de Inicio</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Fecha en que el cupón estará disponible</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="startDate"
                          type="date"
                          value={editingCoupon ? editingCoupon.startDate : newCoupon.startDate}
                          onChange={(e) =>
                            editingCoupon
                              ? setEditingCoupon({ ...editingCoupon, startDate: e.target.value })
                              : setNewCoupon({ ...newCoupon, startDate: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="expiryDate">Fecha de Expiración</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Fecha en que el cupón expirará</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={editingCoupon ? editingCoupon.expiryDate : newCoupon.expiryDate}
                          onChange={(e) =>
                            editingCoupon
                              ? setEditingCoupon({ ...editingCoupon, expiryDate: e.target.value })
                              : setNewCoupon({ ...newCoupon, expiryDate: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="isStackable" className="text-base">
                            Cupón Acumulable
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">
                                  Permite usar este cupón junto con otros cupones en la misma compra
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-xs text-gray-500">Permite usar con otros cupones</p>
                      </div>
                      <Switch
                        id="isStackable"
                        checked={editingCoupon ? editingCoupon.isStackable : newCoupon.isStackable}
                        onCheckedChange={(checked) =>
                          editingCoupon
                            ? setEditingCoupon({ ...editingCoupon, isStackable: checked })
                            : setNewCoupon({ ...newCoupon, isStackable: checked })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="applicableProducts">Productos Aplicables</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">
                                  Lista de IDs de productos específicos a los que aplica este cupón
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Textarea
                          id="applicableProducts"
                          placeholder="IDs separados por comas (ej: 101, 102, 103)"
                          value={
                            editingCoupon ? editingCoupon.applicableProducts.join(", ") : newCoupon.applicableProducts
                          }
                          onChange={(e) =>
                            editingCoupon
                              ? setEditingCoupon({
                                  ...editingCoupon,
                                  applicableProducts: e.target.value.split(",").map((p) => p.trim()),
                                })
                              : setNewCoupon({ ...newCoupon, applicableProducts: e.target.value })
                          }
                          rows={2}
                        />
                        <p className="text-xs text-gray-500 mt-1">Dejar vacío para todos los productos</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="excludedProducts">Productos Excluidos</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <HelpCircle className="h-3 w-3" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Lista de IDs de productos que están excluidos de este cupón</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Textarea
                          id="excludedProducts"
                          placeholder="IDs separados por comas (ej: 201, 202, 203)"
                          value={editingCoupon ? editingCoupon.excludedProducts.join(", ") : newCoupon.excludedProducts}
                          onChange={(e) =>
                            editingCoupon
                              ? setEditingCoupon({
                                  ...editingCoupon,
                                  excludedProducts: e.target.value.split(",").map((p) => p.trim()),
                                })
                              : setNewCoupon({ ...newCoupon, excludedProducts: e.target.value })
                          }
                          rows={2}
                        />
                        <p className="text-xs text-gray-500 mt-1">Productos que no aplican al cupón</p>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={editingCoupon ? handleEditCoupon : handleCreateCoupon}
                    >
                      {editingCoupon
                        ? "Guardar Cambios"
                        : bulkGeneration.enabled
                          ? `Generar ${bulkGeneration.quantity} Cupones`
                          : "Crear Cupón"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="couponSearch" className="text-sm font-medium mb-2 block">
                    Buscar Cupones
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="couponSearch"
                      placeholder="Buscar por código, descripción, categoría o descuento..."
                      value={couponSearch}
                      onChange={(e) => setCouponSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <Label htmlFor="couponStatusFilter" className="text-sm font-medium mb-2 block">
                    Filtrar por Estado
                  </Label>
                  <Select value={couponStatusFilter} onValueChange={(value: any) => setCouponStatusFilter(value)}>
                    <SelectTrigger id="couponStatusFilter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="paused">Pausados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Mostrando {filteredCoupons.length} de {cupones.length} cupones
                </span>
                {(couponSearch || couponStatusFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCouponSearch("")
                      setCouponStatusFilter("all")
                    }}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead>Límites</TableHead>
                    <TableHead>Vigencia</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.length > 0 ? (
                    filteredCoupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <div>
                            <p className="font-mono font-bold">{coupon.code}</p>
                            <p className="text-xs text-gray-500">{coupon.description}</p>
                            {coupon.isStackable && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Acumulable
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                            {coupon.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-purple-600 font-semibold">{coupon.discount}</TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            <div>Total: {coupon.maxUsage === 999999 ? "∞" : coupon.maxUsage}</div>
                            <div>Por usuario: {coupon.usagePerUser === 999999 ? "∞" : coupon.usagePerUser}</div>
                            <div className="text-gray-500">Mín: ${coupon.minPurchase}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            <div>{coupon.startDate}</div>
                            <div>{coupon.expiryDate}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {coupon.usage}/{coupon.maxUsage === 999999 ? "∞" : coupon.maxUsage}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full transition-all"
                                style={{
                                  width: `${coupon.maxUsage === 999999 ? 0 : (coupon.usage / coupon.maxUsage) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={coupon.status === "active" ? "default" : "secondary"}
                            className={
                              coupon.status === "active"
                                ? "bg-purple-600 hover:bg-purple-700"
                                : "bg-blue-800 hover:bg-blue-900 text-white"
                            }
                            onClick={() => handleToggleCouponStatus(coupon.id)}
                          >
                            {coupon.status === "active" ? (
                              <Power className="h-4 w-4 mr-1" />
                            ) : (
                              <PowerOff className="h-4 w-4 mr-1" />
                            )}
                            {coupon.status === "active" ? "Activa" : "Pausada"}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingCoupon(coupon)
                                setIsCouponDialogOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50 bg-transparent"
                              onClick={() => handleDeleteCoupon(coupon.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No se encontraron cupones que coincidan con los filtros
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )

      case "analytics":
        {
          /* ... existing code with tooltips already added ... */
        }
          // --- Datos dinámicos ---
  const usageData = [
    { name: "Promociones", usos: promociones.reduce((acc, p) => acc + p.usage, 0) },
    { name: "Cupones", usos: cupones.reduce((acc, c) => acc + c.usage, 0) },
  ];

  const statusData = [
    {
      name: "Activas",
      value:
        promociones.filter((p) => p.status === "active").length +
        cupones.filter((c) => c.status === "active").length,
    },
    {
      name: "Pausadas",
      value:
        promociones.filter((p) => p.status === "paused").length +
        cupones.filter((c) => c.status === "paused").length,
    },
  ];

  const categoryPerformance = [
    { categoria: "Temporada", valor: 85 },
    { categoria: "Evento Especial", valor: 92 },
    { categoria: "Bienvenida", valor: 78 },
    { categoria: "General", valor: 88 },
    { categoria: "Primera Compra", valor: 95 },
  ];

  // --- Uso semanal dinámico ---
  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const weeklyData = diasSemana.map((dia, idx) => ({
    dia,
    promociones: promociones.filter(
      (p) => new Date(p.startDate).getDay() === (idx + 1) % 7
    ).length,
    cupones: cupones.filter((c) => new Date(c.startDate).getDay() === (idx + 1) % 7).length,
  }));

  // --- Ingresos y descuentos mensuales dinámicos ---
  const meses = ["Ene","Feb","Mar","Abr","May","Jun"];
  const monthlyRevenueData = meses.map((mes, i) => ({
    mes,
    ingresos: promociones.reduce((sum, p) => sum + (p.ingresosMes?.[i] || 0), 0) +
              cupones.reduce((sum, c) => sum + (c.ingresosMes?.[i] || 0), 0),
    descuentos: promociones.reduce((sum, p) => sum + (p.descuentosMes?.[i] || 0), 0) +
               cupones.reduce((sum, c) => sum + (c.descuentosMes?.[i] || 0), 0),
  }));

  // --- Conversiones por hora ---
  const conversionData = Array.from({ length: 6 }, (_, i) => ({
    hora: ["00:00","04:00","08:00","12:00","16:00","20:00"][i],
    conversiones: [...promociones, ...cupones].filter(
      (item) => new Date(item.startDate).getHours() === [0,4,8,12,16,20][i]
    ).length,
  }));

  const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Análisis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Tendencias de Uso */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-lg shadow-lg border border-purple-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
                    Tendencias de Uso
                  </h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-purple-600 hover:text-purple-700 transition-colors">
                          <HelpCircle className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Tendencias de Uso</p>
                        <p className="text-sm">
                          Muestra la cantidad total de veces que se han utilizado las promociones y cupones. Te ayuda a
                          identificar cuál tipo de descuento es más popular entre tus clientes.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usageData}>
                    <defs>
                      <linearGradient id="colorBar1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="usos" fill="url(#colorBar1)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

        {/* Distribución de Estados */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-lg shadow-lg border border-purple-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
                    Distribución de Estados
                  </h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-purple-600 hover:text-purple-700 transition-colors">
                          <HelpCircle className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Distribución de Estados</p>
                        <p className="text-sm">
                          Visualiza el porcentaje de promociones y cupones activos versus pausados. Útil para gestionar
                          tu inventario de ofertas y asegurar que tienes suficientes descuentos activos.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <defs>
                      <linearGradient id="pieGradient1" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#a78bfa" />
                      </linearGradient>
                      <linearGradient id="pieGradient2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#c4b5fd" />
                        <stop offset="100%" stopColor="#ddd6fe" />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "url(#pieGradient1)" : "url(#pieGradient2)"} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

        {/* Uso Semanal */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-lg shadow-lg border border-purple-100 md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5 text-purple-600" />
                    Uso Semanal
                  </h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-purple-600 hover:text-purple-700 transition-colors">
                          <HelpCircle className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Uso Semanal</p>
                        <p className="text-sm">
                          Muestra el comportamiento de uso de promociones y cupones durante la semana. Identifica los
                          días con mayor actividad para optimizar tus campañas de marketing.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorPromociones" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorCupones" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="dia" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="promociones"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorPromociones)"
                    />
                    <Area
                      type="monotone"
                      dataKey="cupones"
                      stroke="#a78bfa"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorCupones)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

        {/* Ingresos vs Descuentos */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-lg shadow-lg border border-purple-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-purple-600" />
                    Ingresos vs Descuentos
                  </h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-purple-600 hover:text-purple-700 transition-colors">
                          <HelpCircle className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Ingresos vs Descuentos</p>
                        <p className="text-sm">
                          Compara tus ingresos totales con el monto otorgado en descuentos mes a mes. Ayuda a evaluar el
                          impacto financiero de tus estrategias de descuento y mantener un balance saludable.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="ingresos"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: "#8b5cf6", r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="descuentos"
                      stroke="#a78bfa"
                      strokeWidth={3}
                      dot={{ fill: "#a78bfa", r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

        {/* Rendimiento por Categoría */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-lg shadow-lg border border-purple-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Users className="mr-2 h-5 w-5 text-purple-600" />
                    Rendimiento por Categoría
                  </h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-purple-600 hover:text-purple-700 transition-colors">
                          <HelpCircle className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Rendimiento por Categoría</p>
                        <p className="text-sm">
                          Evalúa el desempeño de cada categoría de promociones y cupones en una escala de 0-100.
                          Identifica qué tipos de ofertas generan mejor respuesta para enfocar tus esfuerzos.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={categoryPerformance}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="categoria" stroke="#6b7280" />
                    <PolarRadiusAxis stroke="#6b7280" />
                    <Radar
                      name="Rendimiento"
                      dataKey="valor"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

{/* Conversiones por Hora */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-lg shadow-lg border border-purple-100 md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
                    Conversiones por Hora
                  </h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-purple-600 hover:text-purple-700 transition-colors">
                          <HelpCircle className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Conversiones por Hora</p>
                        <p className="text-sm">
                          Muestra las horas del día con mayor tasa de conversión usando promociones y cupones. Programa
                          tus ofertas especiales en los horarios de mayor actividad para maximizar resultados.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={conversionData}>
                    <defs>
                      <linearGradient id="colorConversiones" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#c4b5fd" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="hora" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="conversiones"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorConversiones)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )

      default:
        return null
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
      promocionId: couponForm.promocionId, // Agregado
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
              <TableHead>Promoción Asociada</TableHead>
              <TableHead>Descuento</TableHead>
              <TableHead>Usos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fechas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                  No hay cupones disponibles
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell className="capitalize">{coupon.type}</TableCell>
                  <TableCell>
                    <span className={coupon.promocionNombre === 'Sin promoción asignada' ? 'text-gray-400' : 'text-green-600 font-medium'}>
                      {coupon.promocionNombre}
                    </span>
                  </TableCell>
                  <TableCell>
                    {coupon.type === 'porcentaje' ? `${coupon.discount}%` : `$${coupon.discount}`}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {coupon.uses}/{coupon.maxUses || '∞'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.status === 'Activo' ? 'default' : 'destructive'}>
                      {coupon.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs text-gray-500">
                      <span>
                        Inicio: {coupon.created ? new Date(coupon.created).toLocaleDateString('es-ES') : 'N/A'}
                      </span>
                      {/* Agregar fecha fin cuando esté disponible en el backend */}
                      <span>
                        Fin: {coupon.fechaFin ? new Date(coupon.fechaFin).toLocaleDateString('es-ES') : 'Sin límite'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditCoupon(coupon)}
                        title="Editar cupón"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        title="Eliminar cupón"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      {/* Switch corregido - no debería ser un botón */}
                      <div className="flex items-center">
                        <Switch 
                          checked={coupon.status === 'Activo'} 
                          onCheckedChange={() => handleToggleCouponStatus(coupon.id)}
                          title={`${coupon.status === 'Activo' ? 'Desactivar' : 'Activar'} cupón`}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
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