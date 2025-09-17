package com.componente.promociones.service;

import com.componente.promociones.model.dto.CuponesDTO;
import java.util.List;

public interface CuponService {
    CuponesDTO crearCupon(CuponesDTO dto);
    CuponesDTO obtenerCuponPorCodigo(String codigo);
    List<CuponesDTO> listarCupones();
    CuponesDTO actualizarCupon(Long id, CuponesDTO dto);
    void eliminarCupon(Long id);
}