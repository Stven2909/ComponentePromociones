package com.componente.promociones.model.dto.integraciones.lealtad.users;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import shareddtos.usersmodule.auth.SimpleUserDto;

@FeignClient(name = "validation-service", url = "${usuarios.url}")
public interface ValidationServiceClient {
    @GetMapping("/api/auth/validation/header")
    SimpleUserDto validateSession(
            @RequestHeader(value = "Authorization", required = true)  String token
    );
}