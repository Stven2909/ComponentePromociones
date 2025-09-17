package com.componente.promociones.model.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CuponesDTO {

    private Long id;

    @NotBlank(message = "El codigo es obligatorio")
    @Size(min = 4, max = 10, message = "El codigo debe tener entre 4 y 10 caracteres")
    private String codigo;

    @NotBlank(message = "El tipo de promoción no puede estar vacío")
    private String tipo;

    @NotNull(message = "El valor del descuento no puede ser nulo")
    private Double descuento;

    @NotNull(message = "El número de usos no puede ser nulo")
    private Integer usos;

    @NotBlank(message = "El estado no puede estar vacío")
    private String estado;

    @NotNull(message = "La fecha de inicio no puede ser nula")
    private LocalDateTime fecha_inicio;

    @NotNull(message = "La fecha de fin no puede ser nula")
    private LocalDateTime fecha_fin;

}
