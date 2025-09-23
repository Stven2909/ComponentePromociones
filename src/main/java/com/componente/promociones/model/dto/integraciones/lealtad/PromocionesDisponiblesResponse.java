package com.componente.promociones.model.dto.integraciones.lealtad;

import lombok.Data;

import java.util.List;

@Data
public class PromocionesDisponiblesResponse {
    private Long clienteId;
    private List<String> promociones; //nombres o codigos de las promociones que se pueden usar

}
