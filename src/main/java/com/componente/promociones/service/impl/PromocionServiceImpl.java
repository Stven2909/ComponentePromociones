package com.componente.promociones.service.impl;

import com.componente.promociones.enums.TipoPromocion;
import com.componente.promociones.model.dto.PromocionDTO;
import com.componente.promociones.model.dto.entity.Cupon;
import com.componente.promociones.model.dto.entity.Promocion;
import com.componente.promociones.model.dto.integraciones.lealtad.PromocionesDisponiblesResponse;
import com.componente.promociones.repository.CuponRepository;
import com.componente.promociones.repository.PromocionRepository;
import com.componente.promociones.service.PromocionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromocionServiceImpl implements PromocionService {

    private final PromocionRepository promocionRepository;
    private final CuponRepository cuponRepository;

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
        LocalDateTime ahora = LocalDateTime.now();
        List<Promocion> promocionesActivas = promocionRepository.findPromocionesActivasYVigentes(ahora);
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
    public long contarCuponesActivos() {
        return cuponRepository.countByEstado("ACTIVO");
    }

    @Override
    public long contarCuponesUtilizados() {
        return cuponRepository.countByUsosActualesGreaterThan(0);
    }

    // 🔗 Para lealtad
    @Override
    public PromocionesDisponiblesResponse obtenerPromocionesParaPuntos(Long clienteId, int puntos, String tipoPromocionStr) {
        // Validación y conversión a Enum
        TipoPromocion tipoPromocion;
        try {
            tipoPromocion = TipoPromocion.valueOf(tipoPromocionStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Tipo de promoción inválido: " + tipoPromocionStr);
        }

        // Buscar promociones por tipo y filtrar activas
        List<Promocion> promociones = promocionRepository.findByTipoPromocion(tipoPromocion);

        List<String> nombresPromociones = promociones.stream()
                .filter(Promocion::getEstaActiva)
                .map(Promocion::getNombre)
                .collect(Collectors.toList());

        // Crear DTO de respuesta
        PromocionesDisponiblesResponse response = new PromocionesDisponiblesResponse();
        response.setClienteId(clienteId);
        response.setPromociones(nombresPromociones);
        return response;
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




