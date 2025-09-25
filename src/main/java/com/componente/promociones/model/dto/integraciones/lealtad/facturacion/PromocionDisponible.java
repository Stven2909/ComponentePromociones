package com.componente.promociones.model.dto.integraciones.lealtad.facturacion;

import com.componente.promociones.enums.TipoPromocion;
import lombok.Data;

@Data
public class PromocionDisponible {
    private String codigo;
    private String nombre;
    private String descripcion;
    private TipoPromocion tipoPromocion;
    private Double descuentoEstimado; //estimado basado en la compra real
}
