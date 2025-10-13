package com.componente.promociones.model.dto.integraciones.lealtad;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "lealtad-service"
)
public interface LealtadClient {

    /**
     * Endpoint para obtener el nivel de lealtad, puntos o status VIP del cliente.
     * Endpoint que el equipo de lealtad debe exponer
     */
    @GetMapping("/api/lealtad/clientes/{clienteId}/status")
    //Retorna un DTO simple que indica el status o nivel de puntos
    PromocionesDisponiblesResponse getClienteStatus(@PathVariable("clienteId")Long clienteId);
}
