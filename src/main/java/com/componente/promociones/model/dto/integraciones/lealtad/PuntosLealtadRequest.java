package com.componente.promociones.model.dto.integraciones.lealtad;

import lombok.Data;

@Data
public class PuntosLealtadRequest {
    private Long clienteId;
    private int puntosDisponibles;
    private String tipoPromocionAplicable; //Ej: "DESCUENTO_PORCENTAJE"
}
