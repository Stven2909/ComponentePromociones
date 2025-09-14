package com.componente.promociones.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardStatsDTO {

    private long promocionesActivas;
    private long cuponesUtilizados;

    //aqui se agregarian mas stats para mostrar
}
