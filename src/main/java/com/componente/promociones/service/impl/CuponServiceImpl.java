package com.componente.promociones.service.impl;

import com.componente.promociones.model.dto.CuponesDTO;
import com.componente.promociones.model.dto.entity.Cupon;
import com.componente.promociones.model.dto.entity.Promocion;
import com.componente.promociones.repository.CuponRepository;
import com.componente.promociones.repository.PromocionRepository;
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
    private final PromocionRepository promocionRepository;

    /**
     * Crea un nuevo cupón en la base de datos.
     * Este método es crucial porque establece la relación entre el cupón y su promoción.
     *
     * @param dto El objeto de transferencia de datos con la información del cupón.
     * @return Un DTO del cupón creado, incluyendo su nuevo ID.
     */
    @Override
    public CuponesDTO crearCupon(CuponesDTO dto) {
        // 1. Convierte el DTO (que llega del exterior) a una entidad de base de datos.
        Cupon cupon = convertirDtoAEntity(dto);

        // 2. Busca la entidad Promocion a la que se vinculará el cupón, usando el ID del DTO.
        // Se usa orElseThrow para lanzar una excepción si la promoción no existe,
        // lo que evita guardar un cupón con una relación nula.
        Promocion promocion = promocionRepository.findById(dto.getPromocionId())
                .orElseThrow(() -> new RuntimeException("Promoción no encontrada con ID: " + dto.getPromocionId()));

        // 3. Establece la relación: asocia la entidad Promocion encontrada con el cupón.
        cupon.setPromocion(promocion);

        // 4. Inicializa los usos actuales del cupón a cero.
        cupon.setUsosActuales(0);

        // 5. Guarda el cupón en la base de datos. El repositorio se encarga de la persistencia.
        Cupon cuponGuardado = cuponRepository.save(cupon);

        // 6. Convierte la entidad guardada (ahora con ID) de nuevo a DTO y la retorna.
        return convertirEntityADTO(cuponGuardado);
    }

    /**
     * Busca y obtiene un cupón por su código único.
     *
     * @param codigo El código del cupón.
     * @return El DTO del cupón encontrado.
     * @throws RuntimeException Si el cupón no se encuentra.
     */
    @Override
    public CuponesDTO obtenerCuponPorCodigo(String codigo) {
        // Busca en el repositorio por el código del cupón.
        Cupon cupon = cuponRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RuntimeException("Cupón no encontrado con código: " + codigo));
        // Convierte y retorna el cupón encontrado.
        return convertirEntityADTO(cupon);
    }

    /**
     * Lista todos los cupones existentes en la base de datos.
     *
     * @return Una lista de DTOs con la información de todos los cupones.
     */
    @Override
    public List<CuponesDTO> listarCupones() {
        // Obtiene todas las entidades de cupón del repositorio.
        List<Cupon> cupones = cuponRepository.findAll();
        // Utiliza un stream para mapear cada entidad a un DTO.
        return cupones.stream()
                .map(this::convertirEntityADTO)
                .collect(Collectors.toList());
    }

    /**
     * Actualiza la información de un cupón existente.
     *
     * @param id El ID del cupón a actualizar.
     * @param dto El DTO con los datos actualizados.
     * @return El DTO del cupón actualizado.
     * @throws RuntimeException Si el cupón no se encuentra.
     */
    @Override
    public CuponesDTO actualizarCupon(Long id, CuponesDTO dto) {
        // 1. Busca el cupón por su ID para verificar si existe.
        Cupon cuponExistente = cuponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cupón no encontrado con ID: " + id));

        // 2. Actualiza los campos de la entidad con los datos del DTO.
        cuponExistente.setCodigo(dto.getCodigo());
        cuponExistente.setTipo(dto.getTipo());
        cuponExistente.setDescuento(dto.getDescuento());
        cuponExistente.setUsosMaximos(dto.getUsos());
        cuponExistente.setEstado(dto.getEstado());
        cuponExistente.setFechaInicio(dto.getFecha_inicio());
        cuponExistente.setFechaFin(dto.getFecha_fin());

        if (dto.getPromocionId() != null){
            Promocion promocion = promocionRepository.findById(dto.getPromocionId())
                    .orElseThrow(() -> new RuntimeException("Promocion no encontrada con ID: " + dto.getTipo()));
            cuponExistente.setPromocion(promocion);
        }

        // 3. Guarda la entidad. Spring Data JPA realiza una operación de "update" porque el objeto tiene un ID.
        Cupon cuponActualizado = cuponRepository.save(cuponExistente);
        // 4. Convierte y retorna la entidad actualizada.
        return convertirEntityADTO(cuponActualizado);
    }

    /**
     * Elimina un cupón de la base de datos por su ID.
     *
     * @param id El ID del cupón a eliminar.
     * @throws RuntimeException Si el cupón no existe.
     */
    @Override
    public void eliminarCupon(Long id) {
        // 1. Verifica si el cupón existe antes de intentar eliminarlo.
        if (!cuponRepository.existsById(id)) {
            throw new RuntimeException("Cupón no encontrado con ID: " + id);
        }
        // 2. Llama al método del repositorio para eliminar el cupón.
        cuponRepository.deleteById(id);
    }

    // --- Métodos Privados de Conversión ---

    /**
     * Convierte un DTO de Cupón a su entidad correspondiente.
     *
     * @param dto El objeto DTO a convertir.
     * @return Una entidad Cupon.
     */
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

    /**
     * Convierte una entidad Cupon a su DTO correspondiente.
     *
     * @param cupon La entidad a convertir.
     * @return Un objeto CuponesDTO.
     */
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

        if (cupon.getPromocion() != null){
            dto.setPromocionId(cupon.getPromocion().getId());
        }
        return dto;
    }
}