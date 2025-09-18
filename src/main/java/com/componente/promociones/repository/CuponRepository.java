package com.componente.promociones.repository;

import com.componente.promociones.model.dto.entity.Cupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

public interface CuponRepository extends JpaRepository<Cupon, Long> {

    Optional<Cupon> findByCodigo(String codigo);

    @Query("SELECT c FROM Cupon c WHERE c.estado = 'ACTIVO' " +
            "AND c.fechaInicio <= :fechaHora " +
            "AND c.fechaFin >= :fechaHora " +
            "AND c.usosActuales < c.usosMaximos")
    List<Cupon> findCuponesValidosParaUso(@Param("fechaHora") Timestamp fechaHora);

    // ✅ contar cupones con estado ACTIVO
    long countByEstado(String estado);

    // ✅ contar cupones que ya fueron usados al menos una vez
    long countByUsosActualesGreaterThan(int valor);
}
