/**
 * DTO que representa un producto en el contexto de facturación
 * Contiene la información básica necesaria para calcular promociones
 */
package com.componente.promociones.model.dto.integraciones.lealtad.facturacion;

import lombok.Data;

@Data
public class ProductoFactura {
    private Long id; //Id del producto
    private String name; //Nombre del producto
    private Integer quantity; //Cantidad a comprar
    private Double price; //Precio unitario
}
