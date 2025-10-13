package com.componente.promociones.repository;

import com.componente.promociones.enums.TipoPromocion;
import com.componente.promociones.model.dto.entity.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromocionRepository extends JpaRepository<Promocion, Long> {

    // ========== MÉTODOS EXISTENTES ==========

    /**
     * Busca promos activas
     */
    List<Promocion> findByEstaActivaTrue();

    /**
     * Busca promos por tipo
     */
    List<Promocion> findByTipoPromocion(TipoPromocion tipoPromocion);

    /**
     * Busca promociones vigentes (entre fechas)
     */
    @Query("SELECT p FROM Promocion p WHERE p.fechaInicio <= :fecha AND p.fechaFin >= :fecha")
    List<Promocion> findPromocionesVigentes(@Param("fecha") LocalDateTime fecha);

    /**
     * Busca promociones activas y vigentes
     */
    @Query("SELECT p FROM Promocion p WHERE p.estaActiva = true " +
            "AND p.fechaInicio <= :fecha AND p.fechaFin >= :fecha")
    List<Promocion> findPromocionesActivasYVigentes(@Param("fecha") LocalDateTime fecha);

    /**
     * Busca promociones por nombre (contiene)
     */
    List<Promocion> findByNombreContainingIgnoreCase(String nombre);

    /**
     * Cuenta las promociones activas
     */
    long countByEstaActivaTrue();

    /**
     * Para facturación
     */
    Optional<Promocion> findByCodigo(String codigo);

    // ========== NUEVOS MÉTODOS PARA TRACKING ==========

    /**
     * Contar promociones con al menos 1 uso
     */
    Long countByUsosTotalesGreaterThan(Integer usos);

    /**
     * Suma total de usos de todas las promociones
     */
    @Query("SELECT COALESCE(SUM(p.usosTotales), 0) FROM Promocion p")
    Integer sumUsosTotales();

    /**
     * Suma total del monto descontado por todas las promociones
     */
    @Query("SELECT COALESCE(SUM(p.montoTotalDescontado), 0.0) FROM Promocion p")
    Double sumMontoTotalDescontado();

    /**
     * Promociones con usos disponibles (que no han alcanzado el límite)
     */
    @Query("SELECT p FROM Promocion p WHERE p.estaActiva = true " +
            "AND (p.usosMaximos IS NULL OR p.usosTotales < p.usosMaximos)")
    List<Promocion> findPromocionesDisponibles();

    /**
     * Top promociones más usadas
     */
    @Query("SELECT p FROM Promocion p WHERE p.usosTotales > 0 ORDER BY p.usosTotales DESC")
    List<Promocion> findTopPromocionesUsadas();

    /**
     * Promociones próximas a expirar (últimos 7 días)
     */
    @Query("SELECT p FROM Promocion p WHERE p.estaActiva = true " +
            "AND p.fechaFin BETWEEN :fechaActual AND :fechaLimite")
    List<Promocion> findPromocionesProximasExpirar(
            @Param("fechaActual") LocalDateTime fechaActual,
            @Param("fechaLimite") LocalDateTime fechaLimite
    );

    /**
     * Promociones que alcanzaron su límite de usos
     */
    @Query("SELECT p FROM Promocion p WHERE p.usosMaximos IS NOT NULL " +
            "AND p.usosTotales >= p.usosMaximos")
    List<Promocion> findPromocionesAgotadas();

    /**
     * Promociones activas, vigentes y con usos disponibles
     */
    @Query("SELECT p FROM Promocion p WHERE p.estaActiva = true " +
            "AND p.fechaInicio <= :fecha AND p.fechaFin >= :fecha " +
            "AND (p.usosMaximos IS NULL OR p.usosTotales < p.usosMaximos)")
    List<Promocion> findPromocionesAplicables(@Param("fecha") LocalDateTime fecha);

    /**
     * Contar promociones por tipo que están activas
     */
    @Query("SELECT COUNT(p) FROM Promocion p WHERE p.tipoPromocion = :tipo AND p.estaActiva = true")
    Long countByTipoPromocionAndActiva(@Param("tipo") TipoPromocion tipo);

    /**
     * Promedio de usos por promoción
     */
    @Query("SELECT AVG(p.usosTotales) FROM Promocion p WHERE p.estaActiva = true")
    Double calcularPromedioUsos();

    /**
     * Promociones creadas en un período
     */
    @Query("SELECT p FROM Promocion p WHERE p.fechaInicio BETWEEN :inicio AND :fin")
    List<Promocion> findPromocionesEnPeriodo(
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin
    );

    /**
     * Promociones por rango de descuento
     */
    @Query("SELECT p FROM Promocion p WHERE p.valorDescuento BETWEEN :min AND :max")
    List<Promocion> findByRangoDescuento(
            @Param("min") Float min,
            @Param("max") Float max
    );
}