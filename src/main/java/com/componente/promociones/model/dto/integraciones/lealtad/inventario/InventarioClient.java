package com.componente.promociones.model.dto.integraciones.lealtad.inventario;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(
        name = "inventario-service",
        url = "${inventario.url}"
)
public interface InventarioClient {

    // === PRODUCTOS ===
    @GetMapping("/productos")
    List<ProductoDTO> listarProductos();

    @GetMapping("/productos/{id}")
    ProductoDTO obtenerProducto(@PathVariable("id")Long id);

    @GetMapping("/productos/by-name")
    List<ProductoDTO> buscarPorNombre(@RequestParam("name") String nombre);

    @GetMapping("/productos/categoria/{id}")
    List<ProductoDTO> listarPorCategoria(@PathVariable("id")Long categoriaId);

    @PutMapping("/productos/aumentar-stock/{id}")
    ProductoDTO aumentarStock(@PathVariable("id")Long id, @RequestParam("quantity")Integer cantidad);

    @PutMapping("/productos/disminuir-stock/{id}")
    ProductoDTO disminuirStock(@PathVariable("id")Long id, @RequestParam("quantity")Integer cantidad);

    // === CATEGORIAS ===
    @GetMapping("/categorias")
    List<CategoriaDTO> listarCategorias();

    @GetMapping("/categorias/{id}")
    CategoriaDTO obtenerCategoriaPorId(@PathVariable("id") Long id);

}
