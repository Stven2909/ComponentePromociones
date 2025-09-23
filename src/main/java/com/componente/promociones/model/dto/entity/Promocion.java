package com.componente.promociones.model.dto.entity;

import com.componente.promociones.enums.TipoCondicion;
import com.componente.promociones.enums.TipoPromocion;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "promociones")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Promocion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "tipo_promocion")
    private TipoPromocion tipoPromocion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "tipo_condicion")
    private TipoCondicion tipoCondicion;

    @Column(nullable = false, name = "valor_descuento")
    private Float valorDescuento; // Float en lugar de float para manejar nulls


    //Agregue el localdatetime para que agarrara la hora tambien
    @Column(nullable = false, name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(nullable = false, name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(name = "es_acumulable", columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean esAcumulable = false;

    @Column(name = "esta_activa", columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean estaActiva = true;

    // 🔗 Relación con Cupones (la promocion debe conocer a sus cupones)
    @OneToMany(mappedBy = "promocion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Cupon> cupones = new ArrayList<>();

}
