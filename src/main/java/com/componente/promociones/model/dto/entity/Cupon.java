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

    @Column(nullable = false)
    private Integer usos;

    @Column(nullable = false)
    private String estado;

    @Column(nullable = false)
    private LocalDateTime creado;

}