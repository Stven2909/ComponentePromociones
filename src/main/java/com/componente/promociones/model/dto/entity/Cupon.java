package com.componente.promociones.model.dto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "cupones")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Cupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String codigo;

    @Column(nullable = false)
    private String tipo;

    @Column(nullable = false)
    private Double descuento;

    // Campos de uso para la validación
    @Column(nullable = false, name = "usos_maximos")
    private Integer usosMaximos;

    @Column(nullable = false, name = "usos_actuales", columnDefinition = "INT DEFAULT 0")
    private Integer usosActuales = 0;

    @Column(nullable = false)
    private String estado;

    // Campos de fecha para la validación
    @Column(nullable = false, name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(nullable = false, name = "fecha_fin")
    private LocalDateTime fechaFin;
}