package com.componente.promociones.enums;

public enum TipoCondicion {
        MONTO_MINIMO("Monto Mínimo de Compra"),
        CANTIDAD_PRODUCTOS("Cantidad Mínima de Productos"),
        CATEGORIA_ESPECIFICA("Categoría Específica"),
        PRODUCTO_ESPECIFICO("Producto Específico"),
        PRIMER_COMPRA("Primera Compra del Usuario"),
        CLIENTE_VIP("Solo Clientes VIP"),
        DIA_SEMANA("Día de la Semana Específico"),
        HORA_ESPECIFICA("Horario Específico"),
        SIN_CONDICION("Sin Condición Especial"),
        POR_HORA("Hora especifica para usar condiciones");

        private final String descripcion;

        TipoCondicion(String descripcion) {
            this.descripcion = descripcion;
        }

        public String getDescripcion() {
            return descripcion;
        }
}
