package com.componente.promociones.model.dto.tracking;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Respuesta al registrar un uso de promoción/cupón
 * Incluye información del descuento aplicado
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AplicarDescuentoResponse {
    private String tipo; // "PROMOCION" o "CUPON"
    private String codigo;
    private Double valorDescuento; // Porcentaje o monto
    private String tipoDescuento; // "DESCUENTO_PORCENTAJE" o "DESCUENTO_MONTO_FIJO"
    private Double montoDescuento; // Cuánto se descontó
    private Double montoFinal; // Monto después del descuento
    private String mensaje;
    private Integer usosRestantes; // Usos disponibles (null si ilimitado)
}