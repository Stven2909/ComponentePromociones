package com.componente.promociones.repository;

import com.componente.promociones.model.dto.entity.Cupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CuponRepository extends JpaRepository<Cupon, Long> {

    Optional<Cupon> findByCodigo(String codigo);

    @Query("SELECT c FROM Cupon c WHERE c.estado = 'ACTIVO' AND c.fechaInicio <= :fechaHora AND c.fechaFin >= :fechaHora AND c.usosActuales < c.usosMaximos")
    List<Cupon> findCuponesValidosParaUso(@Param("fechaHora") LocalDateTime fechaHora);

    // Si tu entidad Cupon tiene un campo 'estaActiva' en lugar de 'estado', la consulta original es correcta.
    // Si tienes ambos, asegúrate de usar el correcto. La DTO CuponesDTO que proporcionaste usa 'estado'.

}