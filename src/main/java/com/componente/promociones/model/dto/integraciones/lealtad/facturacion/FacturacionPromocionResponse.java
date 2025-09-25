package com.componente.promociones.model.dto.integraciones.lealtad.facturacion;

import lombok.Data;

import java.util.List;

@Data
public class FacturacionPromocionResponse {
    private String account;
    private boolean promocionAplicada;
    private String codigoPromocionUsada;
    private String nombrePromocion;
    private double montoDescuento;
    private double porcentajeDescuento;
    private List<ProductoConDescuento> productosConDescuento;
    private String mensaje;
}
