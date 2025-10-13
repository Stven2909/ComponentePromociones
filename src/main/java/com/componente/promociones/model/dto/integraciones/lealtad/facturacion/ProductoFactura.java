/**
 * DTO que representa un producto en el contexto de facturación
 * Contiene la información básica necesaria para calcular promociones
 */
package com.componente.promociones.model.dto.integraciones.lealtad.facturacion;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ProductoFactura {
    @JsonProperty("idProducto")
    private Long id; //Id del producto
    private String name; //Nombre del producto
    @JsonProperty("cantidad")
    private Integer quantity; //Cantidad a comprar
    @JsonProperty("precioUnitario")
    private Double price; //Precio unitario
}
