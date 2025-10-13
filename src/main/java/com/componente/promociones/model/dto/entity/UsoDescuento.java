package com.componente.promociones.model.dto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "usos_descuentos")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsoDescuento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_descuento", nullable = false, length = 20)
    private String tipoDescuento; // "PROMOCION" o "CUPON"

    @Column(name = "descuento_id", nullable = false)
    private Long descuentoId; // ID de la promoción o cupón

    @Column(name = "codigo_usado", nullable = false, length = 100)
    private String codigoUsado;

    @Column(name = "usuario_id")
    private Long usuarioId; // ID del usuario que lo usó (puede ser null si es compra como invitado)

    @Column(name = "pedido_id")
    private Long pedidoId; // ID del pedido donde se aplicó

    @Column(name = "monto_descuento", nullable = false)
    private Double montoDescuento; // Monto descontado en este uso

    @Column(name = "monto_original", nullable = false)
    private Double montoOriginal; // Monto antes del descuento

    @Column(name = "monto_final", nullable = false)
    private Double montoFinal; // Monto después del descuento

    @Column(name = "fecha_uso", nullable = false)
    private LocalDateTime fechaUso = LocalDateTime.now();

    @Column(name = "ip_usuario", length = 45)
    private String ipUsuario; // Para tracking adicional (opcional)

}