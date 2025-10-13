package com.componente.promociones.model.dto.integraciones.lealtad.inventario;

import lombok.Data;

@Data
public class ProductoDTO {
    private Long productoId;        // Cambio de "id" a "productoId"
    private String sku;
    private String nombre;
    private Long categoriaId;
    private String codigoBarras;
    private Double stockMinimo;
    private Double stockMaximo;
    private Double precio;
    private Boolean activo;
    private String creadoEn;
    private String actualizadoEn;
}
