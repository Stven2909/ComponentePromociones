package com.componente.promociones.service.impl;

import com.componente.promociones.model.dto.CuponesDTO;
import com.componente.promociones.model.dto.entity.Cupon;
import com.componente.promociones.repository.CuponRepository;
import com.componente.promociones.service.CuponService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CuponServiceImpl implements CuponService {

    private final CuponRepository cuponRepository;

    @Override
    public CuponesDTO crearCupon(CuponesDTO dto) {
        Cupon cupon = convertirDtoAEntity(dto);
        // Al crear, se inicializa usosActuales en 0.
        cupon.setUsosActuales(0);
        Cupon cuponGuardado = cuponRepository.save(cupon);
        return convertirEntityADTO(cuponGuardado);
    }

    @Override
    public CuponesDTO obtenerCuponPorCodigo(String codigo) {
        Cupon cupon = cuponRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RuntimeException("Cupón no encontrado con código: " + codigo));
        return convertirEntityADTO(cupon);
    }

    @Override
    public List<CuponesDTO> listarCupones() {
        List<Cupon> cupones = cuponRepository.findAll();
        return cupones.stream()
                .map(this::convertirEntityADTO)
                .collect(Collectors.toList());
    }

    @Override
    public CuponesDTO actualizarCupon(Long id, CuponesDTO dto) {
        Cupon cuponExistente = cuponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cupón no encontrado con ID: " + id));

        cuponExistente.setCodigo(dto.getCodigo());
        cuponExistente.setTipo(dto.getTipo());
        cuponExistente.setDescuento(dto.getDescuento());
        cuponExistente.setUsosMaximos(dto.getUsos());
        cuponExistente.setEstado(dto.getEstado());
        cuponExistente.setFechaInicio(dto.getFecha_inicio());
        cuponExistente.setFechaFin(dto.getFecha_fin());

        Cupon cuponActualizado = cuponRepository.save(cuponExistente);
        return convertirEntityADTO(cuponActualizado);
    }

    @Override
    public void eliminarCupon(Long id) {
        if (!cuponRepository.existsById(id)) {
            throw new RuntimeException("Cupón no encontrado con ID: " + id);
        }
        cuponRepository.deleteById(id);
    }

    private Cupon convertirDtoAEntity(CuponesDTO dto) {
        Cupon cupon = new Cupon();
        cupon.setCodigo(dto.getCodigo());
        cupon.setTipo(dto.getTipo());
        cupon.setDescuento(dto.getDescuento());
        cupon.setUsosMaximos(dto.getUsos());
        cupon.setEstado(dto.getEstado());
        cupon.setFechaInicio(dto.getFecha_inicio());
        cupon.setFechaFin(dto.getFecha_fin());
        return cupon;
    }

    private CuponesDTO convertirEntityADTO(Cupon cupon) {
        CuponesDTO dto = new CuponesDTO();
        dto.setId(cupon.getId());
        dto.setCodigo(cupon.getCodigo());
        dto.setTipo(cupon.getTipo());
        dto.setDescuento(cupon.getDescuento());
        dto.setUsos(cupon.getUsosMaximos());
        dto.setEstado(cupon.getEstado());
        dto.setFecha_inicio(cupon.getFechaInicio());
        dto.setFecha_fin(cupon.getFechaFin());
        return dto;
    }
}