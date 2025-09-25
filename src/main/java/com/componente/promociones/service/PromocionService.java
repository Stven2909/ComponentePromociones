package com.componente.promociones.service;

import com.componente.promociones.model.dto.PromocionDTO;
import com.componente.promociones.model.dto.integraciones.lealtad.PromocionesDisponiblesResponse;
import com.componente.promociones.model.dto.integraciones.lealtad.facturacion.FacturacionPromocionRequest;
import com.componente.promociones.model.dto.integraciones.lealtad.facturacion.FacturacionPromocionResponse;
import com.componente.promociones.model.dto.integraciones.lealtad.facturacion.ProductoFactura;
import com.componente.promociones.model.dto.integraciones.lealtad.facturacion.PromocionesDisponiblesFacturacionResponse;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.List;

public interface PromocionService {
    PromocionDTO crearPromocion (PromocionDTO promocionDTO);
    List<PromocionDTO> listarPromociones();
    PromocionDTO obtenerPromocionPorID(Long id);
    PromocionDTO actualizarPromocion(Long id, PromocionDTO promocionDTO);
    void eliminarPromocion(Long id);

    List<PromocionDTO> listarPromocionesActivas();
    long contarPromocionesActivas();

    //para cupones
    long contarCuponesActivos();
    long contarCuponesUtilizados();

    //🔗 integrar con lealtad
    PromocionesDisponiblesResponse obtenerPromocionesParaPuntos(Long clienteId, int puntos, String tipoPromocion);

    // 🔗integrar con facturacion
    PromocionesDisponiblesFacturacionResponse obtenerPromocionesParaFacturacion(String account, List<ProductoFactura> productos);
    FacturacionPromocionResponse aplicarPromocionParaFacturacion(FacturacionPromocionRequest request);
}
