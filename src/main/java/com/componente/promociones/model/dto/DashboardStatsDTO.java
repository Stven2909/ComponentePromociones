package com.componente.promociones.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDTO {

    // ========== ESTADÍSTICAS DE PROMOCIONES ==========
    private Long promocionesActivas;
    private Long promocionesTotales;
    private Long promocionesUsadas; // Promociones con al menos 1 uso
    private Integer usosTotalesPromociones;
    private Double montoDescontadoPromociones;

    // ========== ESTADÍSTICAS DE CUPONES ==========
    private Long cuponesActivos;
    private Long cuponesTotales;
    private Long cuponesUtilizados; // Cupones con al menos 1 uso
    private Integer usosTotalesCupones;
    private Double montoDescontadoCupones;

    // ========== ESTADÍSTICAS GENERALES ==========
    private Integer usosTotales; // Suma de usos de promociones y cupones
    private Double montoDescontadoTotal; // Suma total de descuentos aplicados
    private Double ahorroPromedio; // Promedio de ahorro por uso
    private Long usuariosUnicos; // Cantidad de usuarios diferentes que han usado descuentos

    // ========== ESTADÍSTICAS DE CONVERSIÓN (OPCIONAL) ==========
    private Double tasaConversion; // Porcentaje de cupones/promociones usados vs creados
    private Integer usosHoy; // Usos realizados hoy
    private Integer usosSemana; // Usos en los últimos 7 días
    private Integer usosMes; // Usos en los últimos 30 días
}