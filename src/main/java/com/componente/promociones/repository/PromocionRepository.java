package com.componente.promociones.repository;

import com.componente.promociones.enums.TipoPromocion;
import com.componente.promociones.model.dto.entity.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PromocionRepository extends JpaRepository<Promocion, Long> {

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
    @Query("SELECT p FROM Promocion p WHERE p.estaActiva = true AND p.fechaInicio <= :fecha AND p.fechaFin >= :fecha")
    List<Promocion> findPromocionesActivasYVigentes(@Param("fecha") LocalDateTime fecha);

    /**
     * Busca promociones por nombre (contiene)
     */
    List<Promocion> findByNombreContainingIgnoreCase(String nombre);

    /**
     * Cuenta las promociones activas
     */
    long countByEstaActivaTrue();

    //para facturacion
    Optional<Promocion> findByCodigo(String codigo);


}
