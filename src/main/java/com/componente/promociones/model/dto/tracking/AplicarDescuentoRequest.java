package com.componente.promociones.model.dto.tracking;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para registrar el uso interno de una promoción/cupón
 * Usado para tracking y estadísticas
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AplicarDescuentoRequest {
    private String codigo; // Código de la promoción
    private Long usuarioId; // ID del usuario (puede ser null)
    private Double montoOriginal; // Monto antes del descuento
}