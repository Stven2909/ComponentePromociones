package com.componente.promociones.model.dto.integraciones.lealtad.facturacion;

import lombok.Data;

import java.util.List;

@Data
public class PromocionesDisponiblesFacturacionResponse {
    private String account;
    private Double totalCompra;
    private List<PromocionDisponible> promocionesDisponibles;
}
