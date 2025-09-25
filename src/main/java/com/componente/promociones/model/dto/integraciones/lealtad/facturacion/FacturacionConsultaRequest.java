package com.componente.promociones.model.dto.integraciones.lealtad.facturacion;

import lombok.Data;

import java.util.List;

@Data
public class FacturacionConsultaRequest {
    private String account;
    private List<ProductoFactura> productos;
}
