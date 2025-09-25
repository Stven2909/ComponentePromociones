/**
 * DTO que recibe del microservicio de facturación cuando ya decidió
 * qué promoción aplicar y quiere que calculemos los descuentos exactos
 */
package com.componente.promociones.model.dto.integraciones.lealtad.facturacion;

import lombok.Data;
import java.util.List;

@Data
public class FacturacionPromocionRequest {
    private String account;                    // Cuenta del cliente
    private List<ProductoFactura> productos;   // Productos de la compra
    private String codigoPromocion;           // Código de la promoción a aplicar
}
