package com.componente.promociones.model.dto.integraciones.lealtad.facturacion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PromocionesDisponiblesFacturacionResponse {
    private String account;
    private Double totalCompra;
    private List<PromocionDisponible> promocionesDisponibles;
}
