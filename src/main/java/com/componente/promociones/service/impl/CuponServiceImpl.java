package com.componente.promociones.service.impl;

import com.componente.promociones.model.dto.CuponesDTO;
import com.componente.promociones.model.dto.entity.Cupon;
import com.componente.promociones.repository.CuponRepository;
import com.componente.promociones.service.CuponService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CuponServiceImpl implements CuponService {

    private final CuponRepository cuponesRepository;

    @Override
    public CuponesDTO crearCupon(CuponesDTO dto) {
        Cupon cupon = convertirDtoAEntity(dto);
        Cupon cuponGuardado = cuponesRepository.save(cupon);
        return convertirEntityADTO(cuponGuardado);
    }

    @Override
    public CuponesDTO obtenerCuponPorCodigo(String codigo) {
        Cupon cupon = cuponesRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RuntimeException("Cupón no encontrado con código: " + codigo));
        return convertirEntityADTO(cupon);
    }

    @Override
    public List<CuponesDTO> listarCupones() {
        List<Cupon> cupones = cuponesRepository.findAll();
        return cupones.stream()
                .map(this::convertirEntityADTO)
                .collect(Collectors.toList());
    }

    @Override
    public CuponesDTO actualizarCupon(Long id, CuponesDTO dto) {
        Cupon cuponExistente = cuponesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cupón no encontrado con ID: " + id));

        cuponExistente.setCodigo(dto.getCodigo());
        cuponExistente.setTipo(dto.getTipo());
        cuponExistente.setDescuento(dto.getDescuento());
        cuponExistente.setUsos(dto.getUsos());
        cuponExistente.setEstado(dto.getEstado());
        cuponExistente.setCreado(dto.getCreado());

        Cupon cuponActualizado = cuponesRepository.save(cuponExistente);
        return convertirEntityADTO(cuponActualizado);
    }

    @Override
    public void eliminarCupon(Long id) {
        if (!cuponesRepository.existsById(id)) {
            throw new RuntimeException("Cupón no encontrado con ID: " + id);
        }
        cuponesRepository.deleteById(id);
    }

    private Cupon convertirDtoAEntity(CuponesDTO dto) {
        Cupon cupon = new Cupon();
        cupon.setCodigo(dto.getCodigo());
        cupon.setTipo(dto.getTipo());
        cupon.setDescuento(dto.getDescuento());
        cupon.setUsos(dto.getUsos());
        cupon.setEstado(dto.getEstado());
        cupon.setCreado(dto.getCreado());
        return cupon;
    }

    private CuponesDTO convertirEntityADTO(Cupon cupon) {
        CuponesDTO dto = new CuponesDTO();
        dto.setId(cupon.getId());
        dto.setCodigo(cupon.getCodigo());
        dto.setTipo(cupon.getTipo());
        dto.setDescuento(cupon.getDescuento());
        dto.setUsos(cupon.getUsos());
        dto.setEstado(cupon.getEstado());
        dto.setCreado(cupon.getCreado());
        return dto;
    }
}