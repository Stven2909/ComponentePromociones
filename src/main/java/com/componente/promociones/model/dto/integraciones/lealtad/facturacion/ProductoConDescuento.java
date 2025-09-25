package com.componente.promociones.model.dto.integraciones.lealtad.facturacion;

import lombok.Data;

@Data
public class ProductoConDescuento {
    private Long id;
    private String name;
    private Integer quantity;
    private Double precioOriginal;
    private Double precioConDescuento;
    private Double descuentoAplicado;
}
