// app/page.tsx (o app/page.jsx)

// ELIMINA: import { AdminDashboard } from "@/components/admin-dashboard" 👈 ESTE YA NO SE USA DIRECTAMENTE

// REEMPLAZA CON ESTE:
import { ProtectedDashboard } from '@/components/protectedDashboard'

export default function Page() {
    // REEMPLAZA: return <AdminDashboard />
    
    // CON ESTO:
    return <ProtectedDashboard />
}