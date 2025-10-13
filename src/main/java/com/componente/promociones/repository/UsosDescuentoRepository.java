package com.componente.promociones.repository;

import com.componente.promociones.model.dto.entity.UsoDescuento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UsosDescuentoRepository extends JpaRepository<UsoDescuento, Long> {

    /**
     * Buscar usos de un usuario específico para un descuento
     */
    List<UsoDescuento> findByUsuarioIdAndDescuentoIdAndTipoDescuento(
            Long usuarioId, Long descuentoId, String tipoDescuento
    );

    /**
     * Contar usos por descuento específico
     */
    @Query("SELECT COUNT(u) FROM UsoDescuento u WHERE u.descuentoId = :id " +
            "AND u.tipoDescuento = :tipo")
    Integer contarUsosPorDescuento(@Param("id") Long id, @Param("tipo") String tipo);

    /**
     * Suma de descuentos en un período
     */
    @Query("SELECT COALESCE(SUM(u.montoDescuento), 0.0) FROM UsoDescuento u " +
            "WHERE u.fechaUso BETWEEN :inicio AND :fin")
    Double sumarDescuentosEnPeriodo(
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin
    );

    /**
     * Contar usuarios únicos que han usado descuentos
     */
    @Query("SELECT COUNT(DISTINCT u.usuarioId) FROM UsoDescuento u WHERE u.usuarioId IS NOT NULL")
    Long contarUsuariosUnicos();

    /**
     * Usos realizados hoy
     */
    @Query("SELECT COUNT(u) FROM UsoDescuento u WHERE CAST(u.fechaUso AS date) = CURRENT_DATE")
    Integer contarUsosHoy();

    /**
     * Usos desde una fecha específica
     */
    @Query("SELECT COUNT(u) FROM UsoDescuento u WHERE u.fechaUso >= :fecha")
    Integer contarUsosDesde(@Param("fecha") LocalDateTime fecha);

    /**
     * Calcular ahorro promedio
     */
    @Query("SELECT AVG(u.montoDescuento) FROM UsoDescuento u")
    Double calcularAhorroPromedio();

    /**
     * Historial de usos de un usuario
     */
    @Query("SELECT u FROM UsoDescuento u WHERE u.usuarioId = :usuarioId ORDER BY u.fechaUso DESC")
    List<UsoDescuento> findByUsuarioIdOrderByFechaUsoDesc(@Param("usuarioId") Long usuarioId);

    /**
     * Contar usos por tipo (PROMOCION o CUPON)
     */
    @Query("SELECT COUNT(u) FROM UsoDescuento u WHERE u.tipoDescuento = :tipo")
    Integer contarUsosPorTipo(@Param("tipo") String tipo);

    /**
     * Descuentos aplicados a un pedido específico
     */
    @Query("SELECT u FROM UsoDescuento u WHERE u.pedidoId = :pedidoId")
    List<UsoDescuento> findByPedidoId(@Param("pedidoId") Long pedidoId);

    /**
     * Suma total de descuentos por usuario
     */
    @Query("SELECT COALESCE(SUM(u.montoDescuento), 0.0) FROM UsoDescuento u WHERE u.usuarioId = :usuarioId")
    Double sumarDescuentosUsuario(@Param("usuarioId") Long usuarioId);

    /**
     * Últimos N usos registrados
     */
    @Query("SELECT u FROM UsoDescuento u ORDER BY u.fechaUso DESC")
    List<UsoDescuento> findUltimosUsos();
}