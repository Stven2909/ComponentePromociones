package com.componente.promociones.service.impl;

import com.componente.promociones.enums.TipoCondicion;
import com.componente.promociones.enums.TipoPromocion;
import com.componente.promociones.model.dto.PromocionDTO;
import com.componente.promociones.model.dto.entity.Cupon;
import com.componente.promociones.model.dto.entity.Promocion;
import com.componente.promociones.model.dto.entity.UsoDescuento;
import com.componente.promociones.model.dto.integraciones.lealtad.PromocionesDisponiblesResponse;
import com.componente.promociones.model.dto.integraciones.lealtad.facturacion.*;
import com.componente.promociones.model.dto.integraciones.lealtad.inventario.InventarioClient;
import com.componente.promociones.model.dto.integraciones.lealtad.inventario.ProductoDTO;
import com.componente.promociones.model.dto.tracking.AplicarDescuentoRequest;
import com.componente.promociones.model.dto.tracking.AplicarDescuentoResponse;
import com.componente.promociones.repository.CuponRepository;
import com.componente.promociones.repository.PromocionRepository;
import com.componente.promociones.repository.UsosDescuentoRepository;
import com.componente.promociones.service.PromocionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PromocionServiceImpl implements PromocionService {

    private final PromocionRepository promocionRepository;
    private final CuponRepository cuponRepository;
    private final InventarioClient inventarioClient;

    private final UsosDescuentoRepository usosDescuentoRepository;

    @Override
    public PromocionDTO crearPromocion(PromocionDTO dto) {
        //Convertir DTO a Entity
        Promocion promocion = convertirDtoAEntity(dto);
        //Guardar en la db
        Promocion promocionGuardada = promocionRepository.save(promocion);
        //Convertir Entity a DTO
        return convertirEntityaDTO(promocionGuardada);

    }

    @Override
    public List<PromocionDTO> listarPromociones() {
        List<Promocion> promociones = promocionRepository.findAll();
        return promociones.stream()
                .map(this::convertirEntityaDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PromocionDTO obtenerPromocionPorID(Long id) {
        Promocion promocion = promocionRepository.findById(id)
                .orElseThrow(() ->new RuntimeException("Promocion no encontrada con ID: " + id));
        return convertirEntityaDTO(promocion);
    }

    @Override
    public PromocionDTO actualizarPromocion(Long id, PromocionDTO promocionDTO) {
        // Verificar existencia
        Promocion promocionExiste = promocionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promoción no encontrada con ID: " + id));

        // Validación defensiva
        if (promocionDTO.getFechaFin().isBefore(promocionDTO.getFechaInicio())) {
            throw new IllegalArgumentException("La fecha de fin no puede ser anterior a la fecha de inicio");
        }

        // Logging para trazabilidad
        log.info("Actualizando promoción ID {} con datos: {}", id, promocionDTO);

        // Actualizar campos sobre la entidad existente
        promocionExiste.setNombre(promocionDTO.getNombre());
        promocionExiste.setCodigo(promocionDTO.getCodigo());
        promocionExiste.setDescripcion(promocionDTO.getDescripcion());
        promocionExiste.setTipoPromocion(promocionDTO.getTipoPromocion());
        promocionExiste.setTipoCondicion(promocionDTO.getTipoCondicion());
        promocionExiste.setValorDescuento(promocionDTO.getValorDescuento());
        promocionExiste.setFechaInicio(promocionDTO.getFechaInicio());
        promocionExiste.setFechaFin(promocionDTO.getFechaFin());
        promocionExiste.setEsAcumulable(promocionDTO.isEsAcumulable());
        promocionExiste.setEstaActiva(promocionDTO.isEstaActiva());
        promocionExiste.setCategoriaId(promocionDTO.getCategoriaId());
        promocionExiste.setProductoId(promocionDTO.getProductoId()); // ⚠️ este campo no se estaba asignando

        // Guardar cambios
        Promocion promocionGuardada = promocionRepository.save(promocionExiste);

        // Retornar DTO actualizado
        return convertirEntityaDTO(promocionGuardada);
    }


    @Override
    public void eliminarPromocion(Long id) {
        if (!promocionRepository.existsById(id)){
            throw new RuntimeException("Promocion no encontrada con ID: " + id);
        }
        promocionRepository.deleteById(id);

    }

    @Override
    public List<PromocionDTO> listarPromocionesActivas() {
        LocalDateTime ahora = LocalDateTime.now();
        List<Promocion> promocionesActivas = promocionRepository.findPromocionesActivasYVigentes(ahora);
        return promocionesActivas.stream()
                .map(this::convertirEntityaDTO)
                .collect(Collectors.toList());
    }

    @Override
    public long contarPromocionesActivas() {
        //Usar el metodo del repositorio
        return promocionRepository.countByEstaActivaTrue();
    }

    //para los usos totales (puede requerir revision)
    @Override
    public long contarUsosTotales() {
        return cuponRepository.countByUsosActualesGreaterThan(0);
    }

    @Override
    public Optional<PromocionDTO> obtenerPromocionPorCodigo(String codigo) {
        return promocionRepository.findByCodigo(codigo)
                .map(promocion -> new PromocionDTO(
                        promocion.getId(),
                        promocion.getNombre(),
                        promocion.getCodigo(),
                        promocion.getDescripcion(),
                        promocion.getTipoPromocion(),
                        promocion.getTipoCondicion(),
                        promocion.getValorDescuento(),
                        promocion.getFechaInicio(),
                        promocion.getFechaFin(),
                        promocion.getEsAcumulable(),
                        promocion.getEstaActiva(),
                        promocion.getUsosTotales(),
                        promocion.getUsosMaximos(),
                        promocion.getProductoId(),
                        promocion.getCategoriaId()
                ));

    }

    @Override
    public PromocionDTO crearPromocionPorProducto(Long productoId, PromocionDTO promocionDTO) {
        if (productoId == null) {
            throw new IllegalArgumentException("El ID del producto no puede ser null");
        }

        ProductoDTO producto;
        try {
            producto = inventarioClient.obtenerProducto(productoId);
        } catch (Exception e) {
            throw new RuntimeException("Error al consultar el producto en Inventario: " + e.getMessage(), e);
        }

        if (producto == null || producto.getActivo() == null || !producto.getActivo()) {
            throw new RuntimeException("Producto no encontrado o no activo en Inventario");
        }

        // Ajustar la promoción según el producto
        promocionDTO.setNombre(promocionDTO.getNombre() + " - " + producto.getNombre());
        promocionDTO.setValorDescuento(
                producto.getStockMaximo() != null ? producto.getStockMaximo().floatValue() : 0f
        );

        return crearPromocion(promocionDTO);
    }


    // para tracking (nuevo)
    @Override
    public AplicarDescuentoResponse AplicarYRegistarUso(AplicarDescuentoRequest request) {
        AplicarDescuentoResponse response = new AplicarDescuentoResponse();
        response.setCodigo(request.getCodigo()); // Establecer código desde el inicio

        // 1. Logica: Buscar promo o cupon por codigo
        Optional<Promocion> promocionOpt = promocionRepository.findByCodigo(request.getCodigo());

        if(promocionOpt.isEmpty()){
            response.setMensaje("Promocion o Cupon no encontrado.");
            response.setMontoDescuento(0.0);
            response.setMontoFinal(request.getMontoOriginal());
            return response;
        }

        Promocion promocion = promocionOpt.get();

        // 2. Logica: Validar que este activa y no haya expirado
        // Se añade validación de fecha, asumiendo que no se hizo antes.
        if(!promocion.getEstaActiva() || promocion.getFechaFin().isBefore(LocalDateTime.now())){
            response.setMensaje("Promocion Inactiva o Expirada.");
            response.setMontoDescuento(0.0);
            response.setMontoFinal(request.getMontoOriginal());
            return response;
        }

        // 3. Logica: Calcular descuento (usando precio original)
        double montoDescuento = calcularMontoDescuentoParaTracking(promocion, request.getMontoOriginal());

        //Calculo y declaracion de montofinal
        double montoFinal = request.getMontoOriginal() - montoDescuento;

        if (montoDescuento <= 0) {
            response.setMensaje("La promoción no generó descuento para el monto original o no aplica.");
            response.setMontoDescuento(0.0);
            response.setMontoFinal(request.getMontoOriginal());
            return response;
        }

        // ----------------------------------------------------------------------
        // 4. PERSISTENCIA REAL Y ACTUALIZACIÓN DE CONTADORES (PUNTO CRÍTICO)
        // ----------------------------------------------------------------------

        String tipoDescuento = promocion.getTipoPromocion().name().contains("CUPON") ? "CUPON" : "PROMOCION";
        Integer usosRestantes = null;

        // A. Lógica Específica para CUPONES (Actualización de Contadores)
        if ("CUPON".equals(tipoDescuento)) {
            Optional<Cupon> cuponOpt = cuponRepository.findByCodigo(request.getCodigo());

            if (cuponOpt.isPresent()) {
                Cupon cupon = cuponOpt.get();

                // Validación de límites de uso del Cupón
                if (cupon.getUsosActuales() >= cupon.getUsosMaximos()) {
                    response.setMensaje("Cupón ha alcanzado su límite de usos.");
                    response.setMontoDescuento(0.0);
                    response.setMontoFinal(request.getMontoOriginal());
                    return response; // Se rechaza la operación
                }

                // Actualizar y guardar el cupón
                cupon.setUsosActuales(cupon.getUsosActuales() + 1);
                // Actualizar estado si ya no quedan usos
                if (cupon.getUsosActuales() >= cupon.getUsosMaximos()) {
                    cupon.setEstado("FINALIZADO");
                }
                cuponRepository.save(cupon); // 🔄 Persistencia 1: Actualiza el contador del Cupón

                // Establecer usos restantes para la respuesta DTO
                usosRestantes = cupon.getUsosMaximos() - cupon.getUsosActuales();
            } else {
                // Caso de error: el código existe como Promoción pero no como Cupón individual
                response.setMensaje("El código es de cupón, pero el cupón individual no fue encontrado.");
                response.setMontoDescuento(0.0);
                response.setMontoFinal(request.getMontoOriginal());
                return response;
            }
        }

        //Persistencia del Registro de Auditoría (Tracking)
        UsoDescuento nuevoUso = new UsoDescuento();
        nuevoUso.setTipoDescuento(tipoDescuento);
        nuevoUso.setDescuentoId(promocion.getId());
        nuevoUso.setCodigoUsado(request.getCodigo());
        nuevoUso.setUsuarioId(request.getUsuarioId());
        nuevoUso.setMontoDescuento(montoDescuento);
        nuevoUso.setMontoOriginal(request.getMontoOriginal());
        nuevoUso.setMontoFinal(montoFinal);

        usosDescuentoRepository.save(nuevoUso); //Persistencia

       //----------------------------------------------------------------
        // **Continuando con la respuesta del DTO de Tracking**
        response.setTipo(tipoDescuento);
        response.setValorDescuento(Double.valueOf(promocion.getValorDescuento()));
        response.setTipoDescuento(promocion.getTipoPromocion().name());
        response.setMontoDescuento(montoDescuento);
        response.setMontoFinal(montoFinal);
        response.setUsosRestantes(usosRestantes);
        response.setMensaje("Uso registrado y descuento calculado correctamente.");
        return response;
    }

// ---------------------------------------------------------------------------------

    /**
     * Calcula el monto de descuento para fines de tracking, basándose en el monto original.
     * Este método implementa la lógica que faltaba.
     */
    private double calcularMontoDescuentoParaTracking(Promocion promocion, Double montoOriginal) {
        if (montoOriginal == null || montoOriginal <= 0) {
            return 0.0;
        }

        switch (promocion.getTipoPromocion()) {
            case DESCUENTO_PORCENTAJE:
                // Asegurarse de que el porcentaje sea válido (e.g., no más de 100)
                double porcentaje = promocion.getValorDescuento();
                if (porcentaje > 100) porcentaje = 100;
                return montoOriginal * (porcentaje / 100);

            case DESCUENTO_MONTO_FIJO:
                // El descuento no puede ser mayor que el monto original
                return Math.min(promocion.getValorDescuento(), montoOriginal);

            case ENVIO_GRATIS:
            case DOS_POR_UNO:
            case TRES_POR_DOS:
            case REGALO_PRODUCTO:
            case CASHBACK:
                // Estos tipos de promoción no tienen un descuento simple basado en el monto original.
                // Retorna 0.0 y se asume que la lógica compleja se maneja en el método de Facturación.
                return 0.0;

            default:
                return 0.0;
        }
    }

    @Override
    public long contarCuponesActivos() {
        return cuponRepository.countByEstado("ACTIVO");
    }

    @Override
    public long contarCuponesUtilizados() {
        return cuponRepository.countByUsosActualesGreaterThan(0);
    }

    // 🔗 Para lealtad

    /**
     * Obtiene las promociones disponibles para un cliente especifico, basado en tipo y cantidad de puntos
     * @param clienteId El id del cliente
     * @param puntos los puntos del cliente (actualmente no se usan en la logica de fitlrado)
     * @param tipoPromocionStr el tipo de promo a buscar
     * @return un dto de respuesta con la lista de nombres de promos disponibles
     */
    @Override
    public PromocionesDisponiblesResponse obtenerPromocionesParaPuntos(Long clienteId, int puntos, String tipoPromocionStr) {
        // Validación y conversión a Enum
        TipoPromocion tipoPromocion;
        try {
            tipoPromocion = TipoPromocion.valueOf(tipoPromocionStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Tipo de promoción inválido: " + tipoPromocionStr);
        }

        // Buscar promociones por tipo y filtrar activas
        List<Promocion> promociones = promocionRepository.findByTipoPromocion(tipoPromocion);

        //Filtra la lista para incluir solo las promos activas y extra los nombres
        List<String> nombresPromociones = promociones.stream()
                .filter(Promocion::getEstaActiva)
                .map(Promocion::getNombre)
                .collect(Collectors.toList());

        // Crear DTO de respuesta
        PromocionesDisponiblesResponse response = new PromocionesDisponiblesResponse();
        response.setClienteId(clienteId);
        response.setPromociones(nombresPromociones);
        return response;
    }

    //🔗 Para Facturacion

    /**
     * Obtiene la lista de promociones aplicables a una compra antes de finalizarla
     * @param account el identificador de la cuenta o del cliente
     * @param productos la lista de productos en la compra
     * @return un DTO de respuesta con las promos disponibles y un descuento estimado
     */
    @Override
    public PromocionesDisponiblesFacturacionResponse obtenerPromocionesParaFacturacion(String account, List<ProductoFactura> productos) {
        // --- Filtrar productos por STOCK y Estado ---
        List<ProductoFactura> productosConStock = productos.stream()
                .filter(this::tieneStockYActivo) //metodo privado
                .collect(Collectors.toList());
        // Si despues de filtrar no queda nada, no hay promo aplicables
        if (productosConStock.isEmpty()){
            return new PromocionesDisponiblesFacturacionResponse(account, 0.0, Collections.emptyList());
        }
        // -----------------------------------------------------------------------------

        //Obtener todas las promos activas y vigentes
        List<Promocion> promocionesActivas = promocionRepository.findPromocionesActivasYVigentes(LocalDateTime.now());

        //Mapear promociones a DTOs de respuesta, filtrando las aplicables
        List<PromocionDisponible> promocionesDisponibles = promocionesActivas.stream()
                .filter(promo -> aplicaCondicion(promo, productos))
                .map(promo -> {
                    PromocionDisponible disponible = new PromocionDisponible();
                    disponible.setCodigo(promo.getCodigo());
                    disponible.setNombre(promo.getNombre());
                    disponible.setDescripcion(promo.getDescripcion());
                    disponible.setTipoPromocion(promo.getTipoPromocion());

                    //Calcular descuento estimado segun tipo y totalCompra
                    double descuentoEstimado = calcularDescuentoEstimado(promo, productos);
                    disponible.setDescuentoEstimado(descuentoEstimado);
                    return disponible;
                })
                .filter(p -> p.getDescuentoEstimado() > 0) //solo mostrar promos aplicables
                .collect(Collectors.toList());

        //Calcular total de la compra
        double totalCompra = productos.stream()
                .mapToDouble(p -> p.getPrice() * p.getQuantity())
                .sum();

        //Construir respuesta
        PromocionesDisponiblesFacturacionResponse response = new PromocionesDisponiblesFacturacionResponse();
        response.setAccount(account);
        response.setTotalCompra(totalCompra);
        response.setPromocionesDisponibles(promocionesDisponibles);
        return response;
    }

    /**
     * Aplica una promocion a una compra especifica, calculando los descuentos reales
     * @param request la solicitud que contiene el codigo de la promo y los productos de la compra
     * @return un DTO de respuesta que detalla el descuento aplicado y los nuevos precios
     */
    @Override
    public FacturacionPromocionResponse aplicarPromocionParaFacturacion(FacturacionPromocionRequest request) {
        FacturacionPromocionResponse response = new FacturacionPromocionResponse();
        response.setAccount(request.getAccount());

        //Busca la promocion por su codigo en el repositorio
        Optional<Promocion> promocionOpt = promocionRepository.findByCodigo(request.getCodigoPromocion());

        //Validar que la promocion exista, este activa y sea aplicable a la compra
        if (promocionOpt.isEmpty() || !promocionOpt.get().getEstaActiva() || !aplicaCondicion(promocionOpt.get(), request.getProductos())) {
            response.setPromocionAplicada(false);
            response.setMensaje("Promocion no encontrada, inactiva o no aplicable");
            return response;
        }

        Promocion promocion = promocionOpt.get();

        //Distribuir el descuento entre los productos
        List<ProductoConDescuento> productosConDescuento = aplicarDescuento(promocion, request.getProductos());

        //Calcular el monto total del descuento
        double montoDescuentoTotal = productosConDescuento.stream()
                .mapToDouble(ProductoConDescuento::getDescuentoAplicado)
                .sum();

        //Calcular la compra original
        double totalOriginal = request.getProductos().stream()
                .mapToDouble(p-> p.getPrice() * p.getQuantity())
                .sum();

        // Construir respuesta final
        response.setPromocionAplicada(true);
        response.setCodigoPromocionUsada(promocion.getCodigo());
        response.setNombrePromocion(promocion.getNombre());
        response.setMontoDescuento(montoDescuentoTotal);
        response.setPorcentajeDescuento((montoDescuentoTotal / totalOriginal) * 100);
        response.setProductosConDescuento(productosConDescuento);
        response.setMensaje("Promoción aplicada correctamente");

        return response;
    }

    // --- Métodos Privados para la Lógica---

    /**
     * Determina si una promo aplica a una lista de productos basandose en su tipo de condicion
     * @param promocion la promo a evaluar
     * @param productos la lista de productos de la compra
     * @return 'true' si la condicion se cumple, 'false' en caso de que no
     */
    private boolean aplicaCondicion(Promocion promocion, List<ProductoFactura> productos) {
        switch (promocion.getTipoCondicion()) {
            case MONTO_MINIMO:
                double totalCompra = productos.stream().mapToDouble(p -> p.getPrice() * p.getQuantity()).sum();
                return totalCompra >= promocion.getValorDescuento(); //Verifica si la compra supera el monto minimo
            case CANTIDAD_PRODUCTOS:
                int cantidadTotalProductos = productos.stream().mapToInt(ProductoFactura::getQuantity).sum();
                return cantidadTotalProductos >= promocion.getValorDescuento(); //verifica si la cantidad de productos supera la minima
            case PRODUCTO_ESPECIFICO:
            case CATEGORIA_ESPECIFICA:
                // Requiere una lógica para buscar si al menos un producto de la lista cumple la condición
                return false; // Logica pendiente
            case DIA_SEMANA:
            case HORA_ESPECIFICA:
            case POR_HORA:
                // Requiere verificar el día y la hora actuales
                return false; // Logica pendiente
            case SIN_CONDICION:
                return true; // Siempre aplica
            case PRIMER_COMPRA:
            case CLIENTE_VIP:
                // Estas condiciones no pueden ser validadas solo con los datos de facturación (request).
                // Requieren una integración mas avanzada con el microservicio de lealtad o de usuarios para validar.
                return false;
            default:
                return false;
        }
    }

    /**
     * Calcula el monto de descuento estimado para una compra, basandose en el tipo de promocion
     * @param promocion la promocion para la cual se calcula el descuento
     * @param productos la lista de productos en la compra
     * @return el monto estimado del descuento
     */
    private double calcularDescuentoEstimado(Promocion promocion, List<ProductoFactura> productos) {
        double totalCompra = productos.stream().mapToDouble(p -> p.getPrice() * p.getQuantity()).sum();

        switch (promocion.getTipoPromocion()) {
            case DESCUENTO_PORCENTAJE:
                return totalCompra * (promocion.getValorDescuento() / 100);
            case DESCUENTO_MONTO_FIJO:
                return promocion.getValorDescuento(); //Retorna el valor fijo del descuento
            case ENVIO_GRATIS:
            case DOS_POR_UNO:
            case TRES_POR_DOS:
            case REGALO_PRODUCTO:
            case CASHBACK:
                // El cálculo para estos tipos de promociones es más complejo que un simple monto fijo y no se puede estimar tan facil.
                return 0.0;
            default:
                return 0.0;
        }
    }

    /**
     * Aplica el descuento real a cada producto en la lista, segun el tipo de promocion
     * @param promocion la promo a aplicar
     * @param productos la lista de productos
     * @return una lista de productos con el descuento aplicado
     */
    private List<ProductoConDescuento> aplicarDescuento(Promocion promocion, List<ProductoFactura> productos) {
        double totalOriginal = productos.stream().mapToDouble(p -> p.getPrice() * p.getQuantity()).sum();

        switch (promocion.getTipoPromocion()) {
            case DESCUENTO_PORCENTAJE:
                double montoPorcentaje = totalOriginal * (promocion.getValorDescuento() / 100);
                return distribuirDescuentoProporcional(productos, montoPorcentaje, totalOriginal); //Llama a un metodo para distribuir el descuento
            case DESCUENTO_MONTO_FIJO:
                return distribuirDescuentoProporcional(productos, promocion.getValorDescuento(), totalOriginal);
            case DOS_POR_UNO:
            case TRES_POR_DOS:
            case ENVIO_GRATIS:
            case REGALO_PRODUCTO:
            case CASHBACK:
                //Estos tipos de promociones requieren una lógica de negocio más específica y no se aplican proporcionalmente.
                return Collections.emptyList();
            default:
                return Collections.emptyList();
        }
    }

    /**
     * Distribuye un monto de descuento de manera proporcional al valor de cada producto en la compra
     * @param productos la lista de productos
     * @param montoDescuento el monto total del descuento a distribuir
     * @param totalOriginal el total original de la compra
     * @return una lista de DTOs que contiene el precio original y el de descuento
     */
    private List<ProductoConDescuento> distribuirDescuentoProporcional(List<ProductoFactura> productos, double montoDescuento, double totalOriginal) {
        //Usa Stream API para iterar sobre cada producto y calcular el descuento
        return productos.stream().map(p -> {
            ProductoConDescuento pd = new ProductoConDescuento();
            pd.setId(p.getId());
            pd.setName(p.getName());
            pd.setQuantity(p.getQuantity());
            pd.setPrecioOriginal(p.getPrice());

            //Calcula que porcentaje del total representa el producto y aplica ese mismo al descuento total
            double descuentoProporcional = (p.getPrice() * p.getQuantity() / totalOriginal) * montoDescuento;
            pd.setDescuentoAplicado(descuentoProporcional);

            //CAlcula el precio final del producto con el descuento aolicado
            double precioTotalConDescuento = (p.getPrice() * p.getQuantity()) - descuentoProporcional;
            pd.setPrecioConDescuento(precioTotalConDescuento / p.getQuantity());

            return pd;
        }).collect(Collectors.toList());
    }

    // --- Métodos de Conversión (DTO <-> Entidad) ---

    /**
     * Convierte un objeto DTO a una entidad
     * @param dto el dto a convertir
     * @return la entidad resultante
     */
    private Promocion convertirDtoAEntity(PromocionDTO dto) {
        Promocion promocion = new Promocion();
        if (dto.getId() != null) {
            promocion.setId(dto.getId());
        }
        promocion.setNombre(dto.getNombre());
        promocion.setCodigo(dto.getCodigo());
        promocion.setDescripcion(dto.getDescripcion());
        promocion.setTipoPromocion(dto.getTipoPromocion());
        promocion.setTipoCondicion(dto.getTipoCondicion());
        promocion.setValorDescuento(dto.getValorDescuento());
        promocion.setFechaInicio(dto.getFechaInicio());
        promocion.setFechaFin(dto.getFechaFin());
        promocion.setEsAcumulable(dto.isEsAcumulable());
        promocion.setEstaActiva(dto.isEstaActiva());
        promocion.setCategoriaId(dto.getCategoriaId()); //nuevo
        promocion.setProductoId(dto.getProductoId()); //nuevo
        promocion.setUsosTotales(dto.getUsosTotales()); //nuevo
        promocion.setUsosMaximos(dto.getUsosMaximos());//nuevo
        return promocion;
    }

    /**
     * Convierte una entidad Promocion a un objeto DTO para ser pasados al frontend
     * @param promocion la entidad a convertir
     * @return el dto resultante
     */
    private PromocionDTO convertirEntityaDTO(Promocion promocion) {
        PromocionDTO dto = new PromocionDTO();
        dto.setId(promocion.getId());
        dto.setNombre(promocion.getNombre());
        dto.setCodigo(promocion.getCodigo());
        dto.setDescripcion(promocion.getDescripcion());
        dto.setTipoPromocion(promocion.getTipoPromocion());
        dto.setTipoCondicion(promocion.getTipoCondicion());
        dto.setValorDescuento(promocion.getValorDescuento());
        dto.setFechaInicio(promocion.getFechaInicio());
        dto.setFechaFin(promocion.getFechaFin());
        dto.setEsAcumulable(promocion.getEsAcumulable());
        dto.setEstaActiva(promocion.getEstaActiva());
        dto.setCategoriaId(promocion.getCategoriaId());//nuevo
        dto.setProductoId(promocion.getProductoId()); //nuevo
        dto.setUsosMaximos(promocion.getUsosMaximos());//nuevo
        dto.setUsosTotales(promocion.getUsosTotales());//nuevo
        return dto;
    }

    // --- Nuevo método privado para validar Stock con el Feign Client ---

/**
 * Llama al microservicio de Inventarios para verificar el stock y el estado 'activo' de un producto.
 * @param productoFactura El DTO de producto de la solicitud de Facturación.
 * @return true si el producto está activo y tiene suficiente stock, false en caso contrario.
 */
private boolean tieneStockYActivo(ProductoFactura productoFactura) {
    Long productoId = productoFactura.getId();

    if (productoId == null) {
        System.err.println("⚠️ ProductoFactura sin ID — no se puede consultar en Inventario.");
        return false;
    }

    try {
        ProductoDTO inventarioData = inventarioClient.obtenerProducto(productoId);

        if (inventarioData == null) {
            System.err.println("❌ InventarioClient devolvió null para producto ID " + productoId);
            return false;
        }

        if (Boolean.FALSE.equals(inventarioData.getActivo())) {
            System.err.println("🔒 Producto ID " + productoId + " no está activo");
            return false;
        }

        if (inventarioData.getStockMaximo() == null) {
            System.err.println("📦 Producto ID " + productoId + " no tiene stockMaximo definido");
            return false;
        }

        boolean tieneStock = inventarioData.getStockMaximo() >= productoFactura.getQuantity();

        if (!tieneStock) {
            System.err.println("⚠️ Producto ID " + productoId + " stock insuficiente. Disponible: "
                    + inventarioData.getStockMaximo() + ", Requerido: " + productoFactura.getQuantity());
        }

        return tieneStock;

    } catch (Exception e) {
        System.err.println("💥 Error al consultar Inventario para ID " + productoId + ": " + e.getMessage());
        return false;
    }
}

}