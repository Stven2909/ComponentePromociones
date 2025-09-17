package com.componente.promociones.repository;

import com.componente.promociones.model.dto.entity.Cupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CuponRepository extends JpaRepository<Cupon, Long> {

    /**
     * Busca un cupón por su código.
     * `Optional` se usa porque el cupón podría no existir.
     */
    Optional<Cupon> findByCodigo(String codigo);

    /**
     * Busca cupones activos.
     */
    List<Cupon> findByEstaActivaTrue();

    /**
     * Busca cupones vigentes (entre fechas)
     */
    @Query("SELECT c FROM Cupon c WHERE c.fechaInicio <= :fechaHora AND c.fechaFin >= :fechaHora")
    List<Cupon> findCuponesVigentes(@Param("fechaHora") LocalDateTime fechaHora);

    /**
     * Busca cupones activos, vigentes, y con usos disponibles.
     */
    @Query("SELECT c FROM Cupon c WHERE c.estaActiva = true AND c.fechaInicio <= :fechaHora AND c.fechaFin >= :fechaHora AND c.usosActuales < c.usosMaximos")
    List<Cupon> findCuponesValidosParaUso(@Param("fechaHora") LocalDateTime fechaHora);

    /**
     * Busca cupones por nombre (contiene).
     */
    List<Cupon> findByNombreContainingIgnoreCase(String nombre);
}