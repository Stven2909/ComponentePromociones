"use client"
//Agregado
import { ProtectedDashboard } from './protectedDashboard';


import { PROMOCIONES_URL, CUPONES_URL, STATS_URL, BASE_URL } from '@/lib/apiRoutes';

import React, { useState, useEffect, use } from 'react';
import { useToast } from './ui/use-toast';
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Tag,
  Ticket,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  Shuffle,
  HelpCircle,
  Search,
  X,
  Menu,
  User,
  Package,
  Warehouse,
  Award,
  FileText,
  Calendar,
  Copy, Gift,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { LoginWidget } from "./login-widget"
import { parse } from 'path';


// Al inicio del componente, después de los imports
interface PromocionBackend {
  id: number
  nombre: string
  codigo: string
  descripcion: string
  tipoPromocion: 'DESCUENTO_PORCENTAJE' | 'DESCUENTO_MONTO_FIJO' | 'DOS_POR_UNO' | 'TRES_POR_DOS' | 'ENVIO_GRATIS' | 'REGALO_PRODUCTO' | 'CASHBACK'
  tipoCondicion: 'MONTO_MINIMO' | 'CANTIDAD_PRODUCTOS' | 'SIN_CONDICION'
  valorDescuento: number
  fechaInicio: string
  fechaFin: string
  esAcumulable: boolean
  estaActiva: boolean
  usosTotales: number        // AGREGAR
  usosMaximos: number | null // AGREGAR
  productoId: number | null  // AGREGAR
  categoriaId: number | null // AGREGAR
}

interface CuponBackend {
  id: number
  codigo: string
  tipo: 'Porcentaje' | 'Fijo'
  descuento: number
  usos: number
  estado: 'ACTIVO' | 'INACTIVO'
  fecha_inicio: string // "YYYY-MM-DDTHH:mm:ss"
  fecha_fin: string
  promocionId: number
  categoriaId?: number
}

interface StatsBackend {
  promocionesActivas: number
  cuponesUtilizados: number
  cuponesActivos: number
}

interface ProductoDTO {
  productoId: number
  sku: string
  nombre: string
  categoriaId: number
  codigoBarras: string
  stockMinimo: number
  stockMaximo: number
  precio: number
  activo: boolean
  creadoEn: string
  actualizadoEn: string
}

const generateRandomCode = (prefix: string, length = 8): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = prefix
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false)
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<PromocionBackend | null>(null)
  const [editingCoupon, setEditingCoupon] = useState<CuponBackend | null>(null)
  const [selectedMainCategory, setSelectedMainCategory] = useState("")
  const [selectedSubCategory, setSelectedSubCategory] = useState("")
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState("")
  const [bulkGeneration, setBulkGeneration] = useState({ enabled: false, quantity: 10, prefix: "COUPON" })

  const [promotionSearch, setPromotionSearch] = useState("")
  const [promotionStatusFilter, setPromotionStatusFilter] = useState<"all" | "active" | "paused">("all")
  const [couponSearch, setCouponSearch] = useState("")
  const [couponStatusFilter, setCouponStatusFilter] = useState<"all" | "active" | "paused">("all")

  const [dashboardStats, setDashboardStats] = useState([]);

  //estados para las categorias desde inventario
  const [categoriasInventario, setCategoriasInventario] = useState<any[]>([]); 
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [errorCategorias, setErrorCategorias] = useState(null);

  //estados para los productos desde inventario
  const [productosInventario, setProductosInventario] = useState<ProductoDTO[]>([])
  const [loadingProductos, setLoadingProductos] = useState(true)


  //estado para los datos
  const [statsData, setStatsData] = useState({
    promocionesActivas: 0,
    promocionesTotales: 0,
    promocionesUsadas: 0,
    usosTotalesPromociones: 0,
    montoDescontadoPromociones: 0,
    cuponesActivos: 0,
    cuponesTotales: 0,
    cuponesUtilizados: 0,
    usosTotalesCupones: 0,
    montoDescontadoCupones: 0,
    usosTotales: 0,
    montoDescontadoTotal: 0,
    ahorroPromedio: 0,
    usuariosUnicos: 0,
    tasaConversion: 0,
    usosHoy: 0,
    usosSemana: 0,
    usosMes: 0, 
  })


  const [promociones, setPromociones] = useState<PromocionBackend[]>([])

  const [cupones, setCupones] = useState<CuponBackend[]>([])

  // 2. Estados de Carga y Error (ya los usas en las funciones fetch)
 const [isLoadingPromos, setIsLoadingPromos] = useState(true);
 const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
 const [loadingStats, setLoadingStats] = useState(true);
 const [errorStats, setErrorStats] = useState<string | null>(null);



// ==================== FUNCIÓN AUXILIAR ====================
const formatDate = (date: string, hour: string): string => {
  if (!date) return '';

  // Si ya tiene 'T', devolvemos la parte sin 'Z' ni zona
  if (date.includes('T')) {
    // Limpia cualquier 'Z' o zona horaria (+00:00)
    return date.replace('Z', '').replace(/\+\d{2}:\d{2}$/, '');
  }

  // Normaliza el formato con 'T' pero sin zona
  return `${date}T${hour}`;
};

// Función para extraer el valor numérico del descuento
const extractDiscountValue = (discount: string): number => {
  // ✅ Validar que discount no sea null/undefined/vacío
  if (!discount) return 0;
  
  // Elimina cualquier símbolo de % o $ y convierte a número
  const cleanValue = discount.replace(/[%$\s]/g, '');
  const value = parseFloat(cleanValue);
  
  // ✅ Validar que sea un número válido y positivo
  return !isNaN(value) && value >= 0 ? value : 0;
};

// -------------------------------------------------------------------

 const handleCreatePromotion = async () => {
  try {
    // Validar campos requeridos
    if (!newPromotion.name || !newPromotion.discount || !newPromotion.startDate || !newPromotion.endDate) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive',
      })
      return
    }

     // Validar que el descuento sea válido
     const valorDescuento = extractDiscountValue(newPromotion.discount)
     if (valorDescuento <= 0) {
       toast({
         title: 'Error',
         description: 'El valor del descuento debe ser mayor a 0',
         variant: 'destructive',
       })
       return
     }

    // Mapear al formato del backend
    const payload = {
      nombre: newPromotion.name,
      codigo: newPromotion.name.toUpperCase().replace(/\s+/g, '_').substring(0, 20),
      descripcion: newPromotion.description || '',
      tipoPromocion: newPromotion.type === 'percentage' ? 'DESCUENTO_PORCENTAJE' : 'DESCUENTO_MONTO_FIJO',
      tipoCondicion: 'MONTO_MINIMO',
      valorDescuento: valorDescuento,
      fechaInicio: formatDate(newPromotion.startDate, '00:00:00'),
      fechaFin: formatDate(newPromotion.endDate, '23:59:59'),
      esAcumulable: true,
      estaActiva: true,
      categoriaId: newPromotion.categoriaId || null,
      productoId: newPromotion.productoId || null,
      usosMaximos: newPromotion.maxUsage ? parseInt(newPromotion.maxUsage) : null,
    }

    console.log("📦 Payload CREATE:", payload);

    const response = await fetch(PROMOCIONES_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error ${response.status}: No se pudo crear la promoción`)
    }

    toast({
      title: 'Éxito',
      description: 'Promoción creada correctamente',
    })

    setIsPromotionDialogOpen(false)
    setNewPromotion({
      name: '', 
      discount: '', 
      startDate: '', 
      endDate: '', 
      maxUsage: '',
      type: 'percentage', 
      description: '', 
      category: '', 
      minPurchase: '',
      categoriaId: null,
      productoId: null,
    })
    
    await fetchPromociones()
  } catch (error) {
    console.error('Error creando promoción:', error)
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'No se pudo crear la promoción',
      variant: 'destructive',
    })
  }
}

  const handleEditPromotion = async () => {
    if (!editingPromotion) {
      console.log("❌ No hay promoción para editar");
      return;
    }
  
    console.log("✅ Editando promoción:", editingPromotion);
  
    try {
      console.log("💸 Raw discount:", editingPromotion.discount);
      
      // Extraer valor numérico del descuento
      const discountValue = extractDiscountValue(editingPromotion.discount);
      console.log("💰 Discount value parsed:", discountValue);
  
      const payload = {
        nombre: editingPromotion.name,
        codigo: editingPromotion.codigo.substring(0, 10), // Limita a 10 caracteres
        descripcion: editingPromotion.description,
        tipoPromocion: editingPromotion.type === 'percentage' ? 'DESCUENTO_PORCENTAJE' : 'DESCUENTO_MONTO_FIJO',
        tipoCondicion: 'MONTO_MINIMO',
        valorDescuento: discountValue,
        fechaInicio: formatDate(editingPromotion.startDate, '00:00:00'),
        fechaFin: formatDate(editingPromotion.endDate, '23:59:59'),
        esAcumulable: editingPromotion.stackable ?? true,
        estaActiva: editingPromotion.status === 'active',
        categoriaId: editingPromotion.categoriaId || 0,
        productoId: editingPromotion.productoId || 0,
        usosMaximos: parseInt(editingPromotion.maxUsage?.toString() || '0'),
        usosTotales: editingPromotion.usage || 0,
      }
  
      console.log("📦 Payload EDIT:", payload);
  
      const response = await fetch(`${PROMOCIONES_URL}/${editingPromotion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar promoción');
      }
      
      toast({
        title: 'Éxito',
        description: 'Promoción actualizada correctamente',
      });
      
      setEditingPromotion(null)
      setIsPromotionDialogOpen(false)
      fetchPromociones()
    } catch (error) {
      console.error("❌ Error en handleEditPromotion:", error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar la promoción',
        variant: 'destructive',
      })
    }
  }

  const handleDeletePromotion = async (id: number) => {
    try {
        const response = await fetch(`${PROMOCIONES_URL}/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
             throw new Error('Error al eliminar promoción');
        }

        toast({ title: 'Éxito', description: 'Promoción eliminada correctamente' });

        // En lugar de filtrar el array, recargamos la lista desde el backend
        fetchPromociones(); 
        // También recargar cupones si el backend elimina las referencias asociadas (opcional)
        // fetchCupones(); 

    } catch (error) {
        toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'No se pudo eliminar la promoción',
            variant: 'destructive',
        });
    }
};

const handleTogglePromotionStatus = async (id: number) => {
  const promoToToggle = promociones.find((p) => p.id === id);
  if (!promoToToggle) return;

  const newStatus = !promoToToggle.estaActiva;
  
  try {
    // Convertir tipo a enum
    const tipoPromocionMap = {
      'percentage': 'DESCUENTO_PORCENTAJE',
      'fixed': 'DESCUENTO_MONTO_FIJO'
    };

    const payload = {
      nombre: promoToToggle.name,
      codigo: promoToToggle.codigo,
      descripcion: promoToToggle.description,
      tipoPromocion: tipoPromocionMap[promoToToggle.type as keyof typeof tipoPromocionMap],
      tipoCondicion: promoToToggle.condition,
      valorDescuento: parseFloat(promoToToggle.discount.replace(/[%$]/g, '')),
      fechaInicio: promoToToggle.startDate.includes('T') 
        ? promoToToggle.startDate 
        : `${promoToToggle.startDate}T00:00:00`,
      fechaFin: promoToToggle.endDate.includes('T')
        ? promoToToggle.endDate
        : `${promoToToggle.endDate}T23:59:59`,
      esAcumulable: promoToToggle.stackable,
      estaActiva: newStatus,
      usosTotales: promoToToggle.usage || 0,
      usosMaximos: promoToToggle.maxUsage || 0,
      productoId: promoToToggle.productoId || 0,
      categoriaId: promoToToggle.categoriaId || 0,
    };

    console.log('Payload TOGGLE:', payload);

    const response = await fetch(`${PROMOCIONES_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Error al cambiar el estado');

    toast({
      title: 'Éxito',
      description: `Promoción ${newStatus ? 'activada' : 'pausada'}.`,
    });

    fetchPromociones();

  } catch (error) {
    console.error('Error:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'No se pudo cambiar el estado',
      variant: 'destructive',
    });
  }
};

const handleCreateCoupon = () => {
  if (bulkGeneration.enabled && bulkGeneration.quantity > 1) {
    // 🚀 Generar múltiples cupones
    const newCoupons: CuponBackend[] = [];

    for (let i = 0; i < bulkGeneration.quantity; i++) {
      const coupon: CuponBackend = {
        id: cupones.length + newCoupons.length + 1,
        codigo: generateRandomCode(bulkGeneration.prefix),
        tipo: newCoupon.tipo,
        descuento: parseFloat(newCoupon.descuento) || 0,
        usos: 0,
        estado: "ACTIVO",
        fecha_inicio: newCoupon.fecha_inicio,
        fecha_fin: newCoupon.fecha_fin,
        promocionId: newCoupon.promocionId || 0,
        categoriaId: newCoupon.categoriaId || 0, // ✅ nuevo campo
      };

      newCoupons.push(coupon);
    }

    setCupones([...cupones, ...newCoupons]);
  } else {
    // 🎯 Generar cupón único
    const cupon: CuponBackend = {
      id: cupones.length + 1,
      codigo: newCoupon.codigo || generateRandomCode("COUPON"),
      tipo: newCoupon.tipo,
      descuento: parseFloat(newCoupon.descuento) || 0,
      usos: 0,
      estado: "ACTIVO",
      fecha_inicio: newCoupon.fecha_inicio,
      fecha_fin: newCoupon.fecha_fin,
      promocionId: newCoupon.promocionId || 0,
      categoriaId: newCoupon.categoriaId || 0, // ✅ nuevo campo
    };

    setCupones([...cupones, cupon]);
  }

  // 🔄 Limpiar formulario
  setNewCoupon({
    id: 0,
    codigo: "",
    tipo: "Porcentaje",
    descuento: "",
    usos: 0,
    estado: "ACTIVO",
    fecha_inicio: "",
    fecha_fin: "",
    promocionId: 0,
    categoriaId: 0,
  });

  setBulkGeneration({ enabled: false, quantity: 1, prefix: "COUPON" });
  setIsCouponDialogOpen(false);
};


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
      (promocion.name || "").toLowerCase().includes(promotionSearch.toLowerCase()) ||
      (promocion.description || "").toLowerCase().includes(promotionSearch.toLowerCase()) ||
      (promocion.codigo || "").toLowerCase().includes(promotionSearch.toLowerCase()) ||
      String(promocion.discount || "").toLowerCase().includes(promotionSearch.toLowerCase());
    return matchesSearch;
  });
  
  
  const filteredCoupons = cupones.filter((cupon) => {
    const matchesSearch =
      (cupon.code || "").toLowerCase().includes(couponSearch.toLowerCase()) ||
      (cupon.description || "").toLowerCase().includes(couponSearch.toLowerCase()) ||
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
    categoriaId: null as number | null,
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
    categoriaId: 0, // 👈 agregado
  });
  

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { toast } = useToast()

  //========Funciones FETCH=============================

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

      const formattedPromos = data.map((promo: any) => ({
          id: promo.id,
          codigo: promo.codigo || "",
          name: promo.nombre,
          productoId: promo.productoId || null,
          description: promo.descripcion,
          type: promo.tipoPromocion === 'DESCUENTO_PORCENTAJE' ? 'percentage' : 'fixed',
          condition: promo.tipoCondicion,
          // Asegurar que el descuento siempre tenga el formato correcto
          discount: promo.valorDescuento != null 
          ? `${promo.valorDescuento}${promo.tipoPromocion === 'DESCUENTO_PORCENTAJE' ? '%' : '$'}`
          : '0',
          
          // 🚨 CORRECCIÓN APLICADA AQUÍ:
          startDate: promo.fechaInicio?.split(' ')[0] ?? null, // Si es undefined, se asigna null
          endDate: promo.fechaFin?.split(' ')[0] ?? null, // Si es undefined, se asigna null
          
          stackable: promo.esAcumulable,
          estaActiva: !!promo.estaActiva,
          status: promo.estaActiva ? "active" : "paused",
          usage: promo.usosTotales || 0,
          maxUsage: promo.usosMaximos || 0,
          minPurchase: 0,
          categoriaId: promo.categoriaId || null,
      }));

      setPromociones(formattedPromos);
      return formattedPromos;
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

    //guardar los datos para mostrarlos
    setStatsData(data);

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
  title: 'Usos Totales',
  value: data?.usosTotales?.toString() ?? '0',
  change: '+5.1%',
  changeType: 'positive',
  icon: Calendar,
}, 
{
  title: 'Conversión Total',
  value: data?.tasaConversion 
    ? `${data.tasaConversion.toFixed(2)}%` 
    : '0%',
  change: data?.tasaConversion && data.tasaConversion > 0 ? '+1.2%' : '0%',
  changeType: data?.tasaConversion && data.tasaConversion > 0 ? 'positive' : 'neutral',
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

// ✅ Función de Fetch para traer las categorías desde Inventario
const fetchCategoriasInventario = async () => {
  try {
    setLoadingCategorias(true);
    const CATEGORIAS_INVENTARIO_URL = `${BASE_URL}/api/promociones/integracion/inventario/categorias`;

    const response = await fetch(CATEGORIAS_INVENTARIO_URL, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Error al cargar categorías');

    const data = await response.json();
    console.log('Categorías de Inventario (raw):', data);

    // ✅ Filtrar y mapear categorías válidas
    const categoriasValidas = data
      .filter((cat: any) => (cat.id ?? cat.categoriaId) != null && cat.nombre)
      .map((cat: any) => ({
        id: cat.id ?? cat.categoriaId,
        nombre: cat.nombre,
        descripcion: cat.descripcion,
      }));

    console.log(`Categorías válidas: ${categoriasValidas.length} de ${data.length}`);
    setCategoriasInventario(categoriasValidas);
  } catch (error) {
    console.error('Error fetching categorías:', error);
    toast({
      title: 'Error',
      description: 'No se pudieron cargar las categorías de inventario',
      variant: 'destructive',
    });
  } finally {
    setLoadingCategorias(false);
  }
};

//Funcion de Fetch para traer los productos desde inventario
const PRODUCTOS_URL = `${BASE_URL}/api/promociones/integracion/inventario/productos`;

const fetchProductos = async () => {
  try {
    const res = await fetch(PRODUCTOS_URL, {
      method: 'GET',
      credentials: 'include',
    })
    const data = await res.json()
    setProductosInventario(data)
  } catch (error) {
    console.error("💥 Error al cargar productos desde inventario:", error)
  } finally {
    setLoadingProductos(false)
  }
}


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
      
      // 3️⃣ cargar estadísticas del dashboard
      await fetchDashboardStats();

      // Cargar categorias de inventario para el formulario
      await fetchCategoriasInventario();

      // Cargar productos de inventario para el formulario
      await fetchProductos();

      console.log('--- [EFFECT OK] Datos iniciales cargados correctamente.');
    } catch (err) {
      console.error('Error cargando datos iniciales del dashboard:', err);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos iniciales del panel',
        variant: 'destructive',
      });
    }
  };

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

                    {/* Valor dinamico */}
                    <p className="text-3xl font-bold text-purple-600">
                      {statsData?.usosTotales ?? 0}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {statsData?.usosTotalesPromociones + statsData?.usosTotalesCupones || 0} usos de promociones y cupones
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
  console.log("🔎 Datos de promociones:", filteredPromotions);
  console.log("🔎 Categorías:", categoriasInventario);
  console.log("🔎 Productos:", productosInventario);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Promociones</h2>
        <Dialog open={isPromotionDialogOpen} onOpenChange={setIsPromotionDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                console.log("🆕 Abriendo diálogo para NUEVA promoción");
                setEditingPromotion(null); // Limpiar cualquier promoción en edición
                setNewPromotion({
                  name: '', 
                  discount: '', 
                  startDate: '', 
                  endDate: '', 
                  maxUsage: '',
                  usage: 0,
                  type: 'percentage', 
                  description: '', 
                  category: '', 
                  minPurchase: '',
                  categoriaId: null,
                  productoId: null,
                });
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Nueva Promoción
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? "Editar Promoción" : "Crear Nueva Promoción"}
              </DialogTitle>
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
                      
  <div className="flex items-center gap-2 mb-2">
    <Label htmlFor="categoria">Categoría del Producto</Label>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="text-purple-600 hover:text-purple-700">
            <HelpCircle className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            Selecciona la categoría de productos de Inventario para esta promoción
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
  
  {loadingCategorias ? (
    <div className="text-sm text-gray-500">Cargando categorías...</div>
  ) : (
    <Select
      value={
        editingPromotion?.categoriaId?.toString() || 
        newPromotion.categoriaId?.toString() || 
        "none"
      }
      onValueChange={(value) => {
        const categoriaId = value !== "none" ? parseInt(value) : null
        if (editingPromotion) {
          setEditingPromotion({ ...editingPromotion, categoriaId })
        } else {
          setNewPromotion({ ...newPromotion, categoriaId })
        }
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Seleccionar categoría de inventario" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Sin categoría específica</SelectItem>
        {categoriasInventario.map((categoria) => (
          <SelectItem key={categoria.categoriaId} value={String(categoria.categoriaId)}>
            {categoria.nombre}
            {categoria.descripcion && (
              <span className="text-xs text-gray-500 ml-2">
                - {categoria.descripcion}
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
  
  {/* Mostrar categoría seleccionada */}
  {(newPromotion.categoriaId || editingPromotion?.categoriaId) && (
    <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
      <p className="text-xs text-gray-600">Categoría seleccionada:</p>
      <p className="text-sm font-medium text-purple-700">
        {categoriasInventario.find(
          c => c.categoriaId === (editingPromotion?.categoriaId || newPromotion.categoriaId)
        )?.nombre || 'Cargando...'}
      </p>
    </div>
  )}
</div>

<div>
  <div className="flex items-center gap-2 mb-2">
    <Label htmlFor="producto">Producto específico</Label>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="text-purple-600 hover:text-purple-700">
            <HelpCircle className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            Selecciona un producto específico para esta promoción (opcional)
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
  {loadingProductos ? (
    <div className="text-sm text-gray-500">Cargando productos...</div>
  ) : (
    <Select
      value={
        editingPromotion?.productoId?.toString() || 
        newPromotion.productoId?.toString() || 
        "none"
      }
      onValueChange={(value) => {
        const productoId = value !== "none" ? parseInt(value) : null
        if (editingPromotion) {
          setEditingPromotion({ ...editingPromotion, productoId })
        } else {
          setNewPromotion({ ...newPromotion, productoId })
        }
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Seleccionar producto (opcional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Sin producto específico</SelectItem>
        {productosInventario.map((producto) => (
          <SelectItem key={producto.productoId} value={producto.productoId.toString()}>
            {producto.nombre}
            {producto.descripcion && (
              <span className="text-xs text-gray-500 ml-2">
                - {producto.descripcion}
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
  
  {/* Mostrar producto seleccionado */}
  {(newPromotion.productoId || editingPromotion?.productoId) && (
    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
      <p className="text-xs text-gray-600">Producto seleccionado:</p>
      <p className="text-sm font-medium text-green-700">
        {productosInventario.find(
          p => p.productoId === (editingPromotion?.productoId || newPromotion.productoId)
        )?.nombre || 'Cargando...'}
      </p>
    </div>
  )}
</div>

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
          <p className="text-sm">
            {(editingPromotion?.type || newPromotion.type) === 'percentage'
              ? 'Valor del descuento (ej: 20 para 20%)'
              : 'Monto del descuento (ej: 50 para $50)'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
  <div className="relative">
    <Input
      id="discount"
      type="number"
      placeholder={(editingPromotion?.type || newPromotion.type) === 'percentage' ? '20' : '50'}
      value={extractDiscountValue(editingPromotion ? editingPromotion.discount : newPromotion.discount)}
      onChange={(e) => {
        const value = e.target.value;
        const symbol = (editingPromotion?.type || newPromotion.type) === 'percentage' ? '%' : '$';
        const formattedValue = value ? `${value}${symbol}` : '';
        
        editingPromotion
          ? setEditingPromotion({ ...editingPromotion, discount: formattedValue })
          : setNewPromotion({ ...newPromotion, discount: formattedValue })
      }}
      className="pr-8"
    />
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
      {(editingPromotion?.type || newPromotion.type) === 'percentage' ? '%' : '$'}
    </span>
  </div>
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
              minPurchase: e.target.value,
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
        ? setEditingPromotion({ 
            ...editingPromotion, 
            maxUsage: e.target.value 
          })
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
        <TableHead>Producto</TableHead>
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
        filteredPromotions.map((promo) => (
<TableRow key={promo.id?.toString() || `promo-${Math.random()}`}>
            <TableCell>
              <div>
                <p className="font-medium">{promo.name}</p>
                <p className="text-xs text-gray-500">{promo.description}</p>
              </div>
            </TableCell>
            <TableCell>
              {promo.categoriaId ? (
                (() => {
                  const categoria = categoriasInventario.find(
                    (c) => c.id === promo.categoriaId
                  );
                  return (
                    <span
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                      title={categoria?.descripcion || 'Sin descripción disponible'}
                    >
                      {categoria?.nombre || `Categoría no encontrada (ID: ${promo.categoriaId})`}
                    </span>
                  );
                })()
              ) : (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  Sin categoría
                </span>
              )}
            </TableCell>

            <TableCell className="text-purple-600 font-semibold">
              {promo.discount ? promo.discount : 'N/A'}
            </TableCell>          

            <TableCell>
              {promo.productoId ? (
               (() => {
                const producto = productosInventario.find(p => p.productoId === promo.productoId);
               return (
                 <span
                  className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                 title={producto ? `SKU: ${producto.sku} | Precio: $${producto.precio}` : ''}
               >
                {producto?.nombre || `Producto no encontrado (ID: ${promo.productoId})`}
                 </span>
                );
             })()
             ) : (
               <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                Sin producto asignado
               </span>
         )}
          </TableCell>

          <TableCell className="text-gray-600">
  {promo.minPurchase != null && promo.minPurchase > 0 
    ? `$${promo.minPurchase}` 
    : 'Sin mínimo'}
</TableCell>
            <TableCell>{promo.startDate}</TableCell>
            <TableCell>{promo.endDate}</TableCell>
            
            <TableCell>
              <div className="space-y-1">
                <div className="text-sm">
                  {promo.maxUsage
                    ? `${promo.usage}/${promo.maxUsage}`
                    : 'Sin límite'}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    title={
                      promo.maxUsage
                        ? `${((promo.usage / promo.maxUsage) * 100).toFixed(1)}% usado`
                        : 'Uso ilimitado'
                    }
                    style={{
                      width: `${
                        promo.maxUsage
                          ? Math.min(100, (promo.usage / promo.maxUsage) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </TableCell>

            <TableCell>
              <Button
                size="sm"
                variant={promo.status === "active" ? "default" : "secondary"}
                className={
                  promo.status === "active"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-blue-800 hover:bg-blue-900 text-white"
                }
                onClick={() => promo.id && handleTogglePromotionStatus(promo.id)}
                >
                {promo.status === "active" ? (
                  <Power className="h-4 w-4 mr-1" />
                ) : (
                  <PowerOff className="h-4 w-4 mr-1" />
                )}
                {promo.status === "active" ? "Activa" : "Pausada"}
              </Button>
            </TableCell>
            
            <TableCell>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log("🔧 Editando promoción:", promo);
                    setEditingPromotion(promo);
                    setIsPromotionDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 bg-transparent"
                  onClick={() => handleDeletePromotion(promo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={10} className="text-center py-8 text-gray-500">
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
                              value={editingCoupon ? editingCoupon.codigo : newCoupon.codigo}
                              onChange={(e) =>
                                editingCoupon
                                  ? setEditingCoupon({ ...editingCoupon, codigo: e.target.value.toUpperCase() })
                                  : setNewCoupon({ ...newCoupon, codigo: e.target.value.toUpperCase() })
                              }
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const randomCode = generateRandomCode("COUPON")
                                if (editingCoupon) {
                                  setEditingCoupon({ ...editingCoupon, codigo: randomCode })
                                } else {
                                  setNewCoupon({ ...newCoupon, codigo: randomCode })
                                }
                              }}
                            >
                              <Shuffle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

<div>
                  <Label htmlFor='promocionSelect'>Promocion Vinculada</Label>
                  <Select
                    value={
                      editingCoupon
                      ? editingCoupon.promocionId?.toString() || "none"
                      : newCoupon.promocionId?.toString() || "none"
                    }
                    onValueChange={(value) => {
                      if(editingCoupon){
                        setEditingCoupon({ ...editingCoupon, promocionId: parseInt(value) })
                      } else {
                        setNewCoupon({ ...newCoupon, promocionId: parseInt(value) })
                      }
                    }}
                    >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar promoción" />
                    </SelectTrigger>  
                    <SelectContent>
                      {promociones.length > 0 ? (
                        promociones.map((promo) => (
                          <SelectItem key={promo.id} value={promo.id.toString()}>
                            {promo.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value=''>
                          No hay promociones disponibles
                        </SelectItem>
                      )}    
                    </SelectContent>
                  </Select>
                </div>


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
                            const categoriaId = Number(value) // Convertir a número
    if (editingCoupon) {
      setEditingCoupon({ ...editingCoupon, categoriaId })
    } else {
      setNewCoupon({ ...newCoupon, categoriaId })
    }
  }}
>
      <SelectTrigger>
    <SelectValue placeholder="Seleccionar categoría" />
  </SelectTrigger>
  <SelectContent>
    {categoriasInventario.map((cat) => (
      <SelectItem key={cat.categoriaId} value={cat.categoriaId.toString()}>
        {cat.nombre}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
  </div>
</div>

{(editingCoupon?.categoriaId || newCoupon.categoriaId) && (
  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
    <p className="text-sm text-gray-600">Categoría seleccionada:</p>
    <p className="font-semibold text-purple-700">
      {categoriasInventario.find(c => c.categoriaId === (editingCoupon?.categoriaId || newCoupon.categoriaId))?.nombre}
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
  value={editingCoupon ? editingCoupon.fecha_inicio : newCoupon.fecha_inicio}
  onChange={(e) =>
    editingCoupon
      ? setEditingCoupon({ ...editingCoupon, fecha_inicio: e.target.value })
      : setNewCoupon({ ...newCoupon, fecha_inicio: e.target.value })
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
  value={editingCoupon ? editingCoupon.fecha_fin : newCoupon.fecha_fin}
  onChange={(e) =>
    editingCoupon
      ? setEditingCoupon({ ...editingCoupon, fecha_fin: e.target.value })
      : setNewCoupon({ ...newCoupon, fecha_fin: e.target.value })
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
                    <TableHead>Promo Vinculada</TableHead>
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
                            <p className="font-mono font-bold">{coupon.codigo}</p>
                            <p className="text-xs text-gray-500">{coupon.description}</p>
                            {coupon.isStackable && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Acumulable
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
  {coupon.promocionId ? (
    (() => {
      const promo = promociones.find((p) => p.id === coupon.promocionId);
      return promo ? (
        <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
          {promo.nombre || promo.name || `Promo #${promo.id}`}
        </Badge>
      ) : (
        <Badge variant="outline" className="text-xs bg-gray-200 text-gray-500">
          Promo #{coupon.promocionId}
        </Badge>
      );
    })()
  ) : (
    <span className="text-gray-400 text-xs">No vinculada</span>
  )}
</TableCell>

<TableCell>
  {coupon.categoriaId ? (
    (() => {
      const categoria = categoriasInventario.find((c) => c.id === coupon.categoriaId);
      return categoria ? (
        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
          {categoria.nombre || categoria.name}
        </span>
      ) : (
        <span className="px-2 py-1 bg-gray-200 text-gray-500 rounded-full text-xs">
          Categoría #{coupon.categoriaId}
        </span>
      );
    })()
  ) : (
    <span className="text-gray-400 text-xs">Sin categoría asignada</span>
  )}
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
                            <div>{coupon.endDate}</div>
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
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-800 text-white p-6 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white hover:text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="space-y-2">
          <button
            onClick={() => {
              setActiveTab("dashboard")
              setSidebarOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "dashboard" ? "bg-purple-600" : "hover:bg-slate-700"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("promociones")
              setSidebarOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "promociones" ? "bg-purple-600" : "hover:bg-slate-700"
            }`}
          >
            <Tag className="h-5 w-5" />
            <span>Promociones</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("coupons")
              setSidebarOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "coupons" ? "bg-purple-600" : "hover:bg-slate-700"
            }`}
          >
            <Ticket className="h-5 w-5" />
            <span>Cupones</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("analytics")
              setSidebarOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "analytics" ? "bg-purple-600" : "hover:bg-slate-700"
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Análisis</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">Panel de Control</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                    <Menu className="h-5 w-5 text-gray-600 hover:text-purple-600 transition-colors" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Menú Principal</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    <span>Productos</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Warehouse className="mr-2 h-4 w-4" />
                    <span>Inventario</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Award className="mr-2 h-4 w-4" />
                    <span>Puntos de Lealtad</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Facturación</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">{renderContent()}</div>
      </main>

      <LoginWidget />
    </div>
  )
}
