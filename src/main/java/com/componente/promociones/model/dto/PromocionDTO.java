package com.componente.promociones.model.dto;

import com.componente.promociones.enums.TipoCondicion;
import com.componente.promociones.enums.TipoPromocion;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PromocionDTO {
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min =3, max=100, message= "El nombre debe tener entre 3 y 100 caracteres")
    private String nombre;

    @NotBlank(message = "El codigo es obligatorio")
    @Size(min = 4, max = 10, message = "El codigo debe tener entre 4 y 10 caracteres")
    private String codigo;

    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    private String descripcion;

    @NotNull(message = "El tipo de promoción es obligatorio")
    private TipoPromocion tipoPromocion;

    @NotNull(message = "El tipo de condición es obligatorio")
    private TipoCondicion tipoCondicion;

    @NotNull(message = "El valor del descuento es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El valor del descuento debe ser mayor que 0")
    private float valorDescuento;

    @NotNull(message = "La fecha de inicio es obligatoria")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime fechaFin;

    private boolean esAcumulable;
    private boolean estaActiva;
}
