package com.componente.promociones.controller;

import com.componente.promociones.model.dto.DashboardStatsDTO;
import com.componente.promociones.model.dto.PromocionDTO;
import com.componente.promociones.model.dto.entity.Promocion;
import com.componente.promociones.service.CuponService;
import com.componente.promociones.service.PromocionService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promociones")
@RequiredArgsConstructor
public class PromocionController {

    private final PromocionService promocionService;
    private final CuponService cuponService;

    //Crear Promo
    @PostMapping
    public ResponseEntity<PromocionDTO> crear(@Valid @RequestBody PromocionDTO promocionDTO){
        PromocionDTO creada = promocionService.crearPromocion(promocionDTO);
        return new ResponseEntity<>(creada, HttpStatus.CREATED);
    }

    //Listar todas las promos
    @GetMapping
    public ResponseEntity<List<PromocionDTO>> listarPromociones(){
        List<PromocionDTO> promociones = promocionService.listarPromociones();
        return ResponseEntity.ok(promociones);
    }

    //Obtener promo por ID
    @GetMapping("/{id}")
    public ResponseEntity<PromocionDTO> obtenerPromocionPorId(@PathVariable Long id){
        PromocionDTO promocionDTO = promocionService.obtenerPromocionPorID(id);
        return ResponseEntity.ok(promocionDTO);
    }

    //Listar promos activas
    @GetMapping("/activas")
    public ResponseEntity<List<PromocionDTO>> listarPromocionesActivas() {
        List<PromocionDTO> promocionesActivas = promocionService.listarPromocionesActivas();
        return ResponseEntity.ok(promocionesActivas);
    }

    //Actualizar promo
    @PutMapping("/{id}")
    public ResponseEntity<PromocionDTO> actualizarPromocion(@PathVariable Long id, @Valid @RequestBody PromocionDTO promocionDTO){
        PromocionDTO promocionActualizada = promocionService.actualizarPromocion(id, promocionDTO);
        return ResponseEntity.ok(promocionActualizada);
    }

    //Borrar promo
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPromocion(@PathVariable Long id){
        promocionService.eliminarPromocion(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint para obtener las estadisticas del dashboard
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> obtenerEstadisticasDashboard(){
        long promocionesActivas = promocionService.contarPromocionesActivas();
        long cuponesUtilizados = promocionService.contarCuponesUtilizados();
        long cuponesActivos = promocionService.contarCuponesActivos();

        DashboardStatsDTO stats = new DashboardStatsDTO(
                promocionesActivas,
                cuponesUtilizados,
                cuponesActivos
        );

        return ResponseEntity.ok(stats);
    }


}

