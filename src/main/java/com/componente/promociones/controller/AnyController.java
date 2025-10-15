package com.componente.promociones.controller;

import com.componente.promociones.model.dto.integraciones.lealtad.users.ValidationServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import shareddtos.usersmodule.auth.SimpleUserDto;

@RestController
@RequestMapping("/any")
public class AnyController {
    @Autowired
    private ValidationServiceClient validationServiceClient;

    @GetMapping("/validate")
    public ResponseEntity<SimpleUserDto> validateSession(
        @RequestHeader(value = "Authorization", required = true) String authorization
    ){
        SimpleUserDto user = validationServiceClient.validateSession(authorization);
        return ResponseEntity.ok(user);
    }

}
