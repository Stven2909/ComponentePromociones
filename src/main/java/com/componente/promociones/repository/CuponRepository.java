package com.componente.promociones.repository;

import com.componente.promociones.model.dto.entity.Cupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CuponRepository extends JpaRepository<Cupon, Long> {

    // ========== MÉTODOS EXISTENTES ==========
    Optional<Cupon> findByCodigo(String codigo);

    @Query("SELECT c FROM Cupon c WHERE c.estado = 'ACTIVO' " +
            "AND c.fechaInicio <= :fechaHora " +
            "AND c.fechaFin >= :fechaHora " +
            "AND c.usosActuales < c.usosMaximos")
    List<Cupon> findCuponesValidosParaUso(@Param("fechaHora") Timestamp fechaHora);

    // Contar cupones con estado ACTIVO
    long countByEstado(String estado);

    // Contar cupones que ya fueron usados al menos una vez
    long countByUsosActualesGreaterThan(int valor);

    // ========== NUEVOS MÉTODOS PARA TRACKING ==========

    /**
     * Suma total de usos de todos los cupones
     */
    @Query("SELECT COALESCE(SUM(c.usosActuales), 0) FROM Cupon c")
    Integer sumUsosTotales();

    /**
     * Suma total del monto descontado por todos los cupones
     */
    @Query("SELECT COALESCE(SUM(c.montoTotalDescontado), 0.0) FROM Cupon c")
    Double sumMontoTotalDescontado();

    /**
     * Buscar cupones de una promoción específica
     */
    @Query("SELECT c FROM Cupon c WHERE c.promocion.id = :promocionId")
    List<Cupon> findByPromocionId(@Param("promocionId") Long promocionId);

    /**
     * Cupones vigentes y activos con usos disponibles
     */
    @Query("SELECT c FROM Cupon c WHERE c.estado = 'ACTIVO' " +
            "AND c.fechaInicio <= :fecha AND c.fechaFin >= :fecha " +
            "AND c.usosActuales < c.usosMaximos")
    List<Cupon> findCuponesDisponibles(@Param("fecha") LocalDateTime fecha);

    /**
     * Top cupones más usados (para analytics)
     */
    @Query("SELECT c FROM Cupon c ORDER BY c.usosActuales DESC")
    List<Cupon> findTopCuponesUsados();

    /**
     * Cupones próximos a expirar (últimos 7 días)
     */
    @Query("SELECT c FROM Cupon c WHERE c.estado = 'ACTIVO' " +
            "AND c.fechaFin BETWEEN :fechaActual AND :fechaLimite")
    List<Cupon> findCuponesProximosExpirar(
            @Param("fechaActual") LocalDateTime fechaActual,
            @Param("fechaLimite") LocalDateTime fechaLimite
    );

    /**
     * Cupones que alcanzaron su límite de usos
     */
    @Query("SELECT c FROM Cupon c WHERE c.usosActuales >= c.usosMaximos")
    List<Cupon> findCuponesAgotados();

    /**
     * Contar cupones activos de una promoción específica
     */
    @Query("SELECT COUNT(c) FROM Cupon c WHERE c.promocion.id = :promocionId AND c.estado = 'ACTIVO'")
    Long countCuponesActivosByPromocionId(@Param("promocionId") Long promocionId);

    /**
     * Suma de usos de cupones por promoción
     */
    @Query("SELECT COALESCE(SUM(c.usosActuales), 0) FROM Cupon c WHERE c.promocion.id = :promocionId")
    Integer sumUsosPromocion(@Param("promocionId") Long promocionId);

    /**
     * Promedio de usos por cupón
     */
    @Query("SELECT AVG(c.usosActuales) FROM Cupon c WHERE c.estado = 'ACTIVO'")
    Double calcularPromedioUsos();
}