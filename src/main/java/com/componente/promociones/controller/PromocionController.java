package com.componente.promociones.controller;

import com.componente.promociones.model.dto.DashboardStatsDTO;
import com.componente.promociones.model.dto.PromocionDTO;
import com.componente.promociones.model.dto.integraciones.lealtad.PromocionesDisponiblesResponse;
import com.componente.promociones.model.dto.integraciones.lealtad.PuntosLealtadRequest;
import com.componente.promociones.model.dto.integraciones.lealtad.facturacion.FacturacionConsultaRequest;
import com.componente.promociones.model.dto.integraciones.lealtad.facturacion.FacturacionPromocionRequest;
import com.componente.promociones.model.dto.integraciones.lealtad.facturacion.FacturacionPromocionResponse;
import com.componente.promociones.model.dto.integraciones.lealtad.facturacion.PromocionesDisponiblesFacturacionResponse;
import com.componente.promociones.model.dto.integraciones.lealtad.inventario.CategoriaDTO;
import com.componente.promociones.model.dto.integraciones.lealtad.inventario.InventarioClient;
import com.componente.promociones.model.dto.integraciones.lealtad.inventario.ProductoDTO;
import com.componente.promociones.repository.PromocionRepository;
import com.componente.promociones.service.CuponService;
import com.componente.promociones.service.PromocionService;
import feign.FeignException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/promociones")
@RequiredArgsConstructor
public class PromocionController {

    private final PromocionService promocionService;
    private final CuponService cuponService;
    private final PromocionRepository promocionRepository;
    private final InventarioClient inventarioClient;


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

    // Obtener promoción por código
    @GetMapping("/by-codigo")
    public ResponseEntity<PromocionDTO> obtenerPromocionPorCodigo(@RequestParam String codigo) {
        return promocionService.obtenerPromocionPorCodigo(codigo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }



    /**
     * Endpoint para obtener las estadisticas del dashboard
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> obtenerEstadisticasDashboard(){
        long promocionesActivas = promocionService.contarPromocionesActivas();
        long cuponesUtilizados = promocionService.contarCuponesUtilizados();
        long cuponesActivos = promocionService.contarCuponesActivos();
        long usosTotales = promocionService.contarUsosTotales();

        DashboardStatsDTO stats = new DashboardStatsDTO();

        stats.setPromocionesActivas(promocionesActivas);
        stats.setCuponesActivos(cuponesActivos);
        stats.setCuponesUtilizados(cuponesUtilizados);
        stats.setUsosTotales((int) usosTotales);

        return ResponseEntity.ok(stats);
    }

    // 🔗 Integracion con Lealtad
    @PostMapping("/integracion/puntos")
    public ResponseEntity<PromocionesDisponiblesResponse> recibirPuntosDeLealtad(
            @RequestBody PuntosLealtadRequest request
            ) {
                PromocionesDisponiblesResponse response = promocionService.obtenerPromocionesParaPuntos(
                        request.getClienteId(),
                        request.getPuntosDisponibles(),
                        request.getTipoPromocionAplicable()
                );
                return ResponseEntity.ok(response);
    }

    //🔗 Integracion con Facturacion
    @PostMapping("/integracion/facturacion/promociones-disponibles")
    public ResponseEntity<PromocionesDisponiblesFacturacionResponse> obtenerPromocionesParaFacturacion(
            @RequestBody @Valid FacturacionConsultaRequest request) {
        return ResponseEntity.ok(promocionService.obtenerPromocionesParaFacturacion(request.getAccount(), request.getProductos()));
    }

    @PostMapping("/integracion/facturacion/aplicar-promocion")
    public ResponseEntity<FacturacionPromocionResponse> aplicarPromocionParaFacturacion(
            @RequestBody @Valid FacturacionPromocionRequest request) {
        return ResponseEntity.ok(promocionService.aplicarPromocionParaFacturacion(request));
    }

    // 🔗 Integración con Inventario
    @GetMapping("/integracion/inventario/productos")
    public ResponseEntity<List<ProductoDTO>> obtenerProductosDeInventario() {
        List<ProductoDTO> productos = inventarioClient.listarProductos();
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/integracion/inventario/productos/{id}")
    public ResponseEntity<ProductoDTO> obtenerProductoPorId(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            ProductoDTO producto = inventarioClient.obtenerProducto(id);
            return ResponseEntity.ok(producto);
        } catch (FeignException.NotFound e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        }
    }

    @GetMapping("/integracion/inventario/productos/by-name")
    public ResponseEntity<List<ProductoDTO>> buscarProductoPorNombre(@RequestParam String name) {
        List<ProductoDTO> productos = inventarioClient.buscarPorNombre(name);
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/integracion/inventario/productos/categoria/{id}")
    public ResponseEntity<List<ProductoDTO>> listarPorCategoria(@PathVariable Long id) {
        List<ProductoDTO> productos = inventarioClient.listarPorCategoria(id);
        return ResponseEntity.ok(productos);
    }

    @PostMapping("/crear-por-inventario")
    public ResponseEntity<?> crearPromoPorInventario(
            @RequestParam(required = true) Long productoId,
            @RequestBody PromocionDTO promocionDTO
    ) {
        if (productoId == null) {
            return ResponseEntity.badRequest().body("El parámetro productoId es obligatorio");
        }

        try {
            PromocionDTO creada = promocionService.crearPromocionPorProducto(productoId, promocionDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(creada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(e.getMessage());
        }
    }





    // 🔗para las categorias
    @GetMapping("/integracion/inventario/categorias")
    public ResponseEntity<List<CategoriaDTO>> obtenerCategoriasDeInventario() {
        List<CategoriaDTO> categorias = inventarioClient.listarCategorias();
        return ResponseEntity.ok(categorias);
    }

    @GetMapping("/integracion/inventario/categorias/{id}")
    public ResponseEntity<?> obtenerCategoriaPorId(@PathVariable Long id) {
        try {
            log.info("🔍 Intentando obtener categoría ID: {} desde Inventario", id);

            CategoriaDTO categoria = inventarioClient.obtenerCategoriaPorId(id);

            log.info("✅ Categoría obtenida exitosamente: {}", categoria);
            return ResponseEntity.ok(categoria);

        } catch (FeignException.NotFound e) {
            log.error("❌ Categoría no encontrada en Inventario - Status 404: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Categoría no encontrada", "id", id));

        } catch (FeignException.ServiceUnavailable e) {
            log.error("❌ Servicio de Inventario no disponible - Status 503: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Servicio de Inventario temporalmente no disponible"));

        } catch (FeignException e) {
            log.error("❌ Error de Feign - Status {}: {}", e.status(), e.contentUTF8());
            return ResponseEntity.status(e.status())
                    .body(Map.of("error", "Error al comunicarse con Inventario", "details", e.getMessage()));

        } catch (Exception e) {
            log.error("❌ Error inesperado al consultar Inventario: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno", "message", e.getMessage()));
        }
    }
}



