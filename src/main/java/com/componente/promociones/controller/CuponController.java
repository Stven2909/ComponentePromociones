package com.componente.promociones.controller;

import com.componente.promociones.model.dto.CuponesDTO;
import com.componente.promociones.service.CuponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cupones")
@RequiredArgsConstructor
public class CuponController {

    private final CuponService cuponesService;

    @PostMapping
    public ResponseEntity<CuponesDTO> crearCupon(@Valid @RequestBody CuponesDTO cuponesDTO) {
        CuponesDTO nuevoCupon = cuponesService.crearCupon(cuponesDTO);
        return new ResponseEntity<>(nuevoCupon, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CuponesDTO>> listarTodosLosCupones() {
        List<CuponesDTO> cupones = cuponesService.listarCupones();
        return ResponseEntity.ok(cupones);
    }

    @GetMapping("/{codigo}")
    public ResponseEntity<CuponesDTO> obtenerCuponPorCodigo(@PathVariable String codigo) {
        CuponesDTO cupon = cuponesService.obtenerCuponPorCodigo(codigo);
        return ResponseEntity.ok(cupon);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CuponesDTO> actualizarCupon(@PathVariable Long id, @Valid @RequestBody CuponesDTO cuponesDTO) {
        CuponesDTO cuponActualizado = cuponesService.actualizarCupon(id, cuponesDTO);
        return ResponseEntity.ok(cuponActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCupon(@PathVariable Long id) {
        cuponesService.eliminarCupon(id);
        return ResponseEntity.noContent().build();
    }
}