package com.componente.promociones.service;

import com.componente.promociones.model.dto.PromocionDTO;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.List;

public interface PromocionService {
    PromocionDTO crearPromocion (PromocionDTO promocionDTO);
    List<PromocionDTO> listarPromociones();
    PromocionDTO obtenerPromocionPorID(Long id);
    PromocionDTO actualizarPromocion(Long id, PromocionDTO promocionDTO);
    void eliminarPromocion(Long id);

    List<PromocionDTO> listarPromocionesActivas();
}
