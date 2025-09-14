package com.componente.promociones.service.impl;

import com.componente.promociones.model.dto.PromocionDTO;
import com.componente.promociones.model.dto.entity.Promocion;
import com.componente.promociones.repository.PromocionRepository;
import com.componente.promociones.service.PromocionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromocionServiceImpl implements PromocionService {

    private final PromocionRepository promocionRepository;

    @Override
    public PromocionDTO crearPromocion(PromocionDTO dto) {
        //Convertir DTO a Entity
        Promocion promocion = convertirDtoAEntity(dto);
        //Guardar en la db
        Promocion promocionGuardada = promocionRepository.save(promocion);
        //Convertir Entity a DTO
        return convertirEntityaDTO(promocionGuardada);

    }

    @Override
    public List<PromocionDTO> listarPromociones() {
        List<Promocion> promociones = promocionRepository.findAll();
        return promociones.stream()
                .map(this::convertirEntityaDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PromocionDTO obtenerPromocionPorID(Long id) {
        Promocion promocion = promocionRepository.findById(id)
                .orElseThrow(() ->new RuntimeException("Promocion no encontrada con ID: " + id));
        return convertirEntityaDTO(promocion);
    }

    @Override
    public PromocionDTO actualizarPromocion(Long id, PromocionDTO promocionDTO) {
        //Verificar que exista
        Promocion promocionExiste = promocionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promocion no encontrada con ID: " + id));
        //Convertir DTO a Entidad
        Promocion promocionActualizada = convertirDtoAEntity(promocionDTO);
        promocionActualizada.setId(id);

        //Guardar cambios
        Promocion promocionGuardada = promocionRepository.save(promocionActualizada);
        return convertirEntityaDTO(promocionGuardada);
    }

    @Override
    public void eliminarPromocion(Long id) {
        if (!promocionRepository.existsById(id)){
            throw new RuntimeException("Promocion no encontrada con ID: " + id);
        }
        promocionRepository.deleteById(id);

    }

    @Override
    public List<PromocionDTO> listarPromocionesActivas() {
        List<Promocion> promocionesActivas = promocionRepository.findByEstaActivaTrue();
        return promocionesActivas.stream()
                .map(this::convertirEntityaDTO)
                .collect(Collectors.toList());
    }

    @Override
    public long contarPromocionesActivas() {
        //Usar el metodo del repositorio
        return promocionRepository.countByEstaActivaTrue();
    }

    @Override
    public long contarCuponesUtilizados() {
        return 1234; //valor de ejemplo, hasta que se haga el CuponesRepository
    }

    /**
     * Convierte un PromocionDTO a una entidad
     */
    private Promocion convertirDtoAEntity(PromocionDTO dto){
        Promocion promocion = new Promocion();
        //promocion.setId(dto.getId());
        promocion.setNombre(dto.getNombre());
        promocion.setDescripcion(dto.getDescripcion());
        promocion.setTipoPromocion(dto.getTipoPromocion());
        promocion.setTipoCondicion(dto.getTipoCondicion());
        promocion.setValorDescuento(dto.getValorDescuento());
        promocion.setFechaInicio(dto.getFechaInicio());
        promocion.setFechaFin(dto.getFechaFin());
        promocion.setEsAcumulable(dto.isEsAcumulable());
        promocion.setEstaActiva(dto.isEstaActiva());
        return promocion;
    }


    /**
     * Convierte una entidad a un DTO
     */
    private PromocionDTO convertirEntityaDTO(Promocion promocion){
        PromocionDTO dto = new PromocionDTO();
        dto.setId(promocion.getId());
        dto.setNombre(promocion.getNombre());
        dto.setDescripcion(promocion.getDescripcion());
        dto.setTipoPromocion(promocion.getTipoPromocion());
        dto.setTipoCondicion(promocion.getTipoCondicion());
        dto.setValorDescuento(promocion.getValorDescuento());
        dto.setFechaInicio(promocion.getFechaInicio());
        dto.setFechaFin(promocion.getFechaFin());
        dto.setEsAcumulable(promocion.getEsAcumulable());
        dto.setEstaActiva(promocion.getEstaActiva());
        return dto;
    }
}




