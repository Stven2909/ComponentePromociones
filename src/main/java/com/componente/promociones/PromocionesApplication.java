package com.componente.promociones;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@SpringBootApplication
@EnableFeignClients
public class PromocionesApplication {

	public static void main(String[] args) {
		SpringApplication.run(PromocionesApplication.class, args);
	}

	@Bean
	public CorsFilter corsFilter() {
		CorsConfiguration corsConfiguration = new CorsConfiguration();
		corsConfiguration.setAllowCredentials(true);

		// ----------------------------------------------------------------------
		// AJUSTE CRUCIAL: Se agrega el dominio HTTPS del frontend
		// ----------------------------------------------------------------------
		corsConfiguration.setAllowedOrigins(Arrays.asList(
				// Origen HTTPS de Producción (donde entra el frontend)
				"https://promotions.beckysflorist.site",
				// Orígenes de Desarrollo y pruebas internas (se dejan por si acaso)
				"http://localhost:3000",
				"http://localhost:3001",
				"http://localhost:4200",
				"http://37.60.238.21",
				"https://37.60.238.21" // IP con HTTPS (opcional)

				// Los orígenes "localhost:3001" y "http://37.60.238.21:3001"
				// se eliminan o simplifican ya que el tráfico entra por Nginx (puerto 80/443)
		));
		// ----------------------------------------------------------------------

		corsConfiguration.setAllowedHeaders(Arrays.asList(
				"Origin",
				"Access-Control-Allow-Origin",
				"Content-Type",
				"Accept",
				"Authorization",
				"Origin, Accept",
				"X-Requested-With",
				"Access-Control-Request-Method",
				"Access-Control-Request-Headers"
		));
		corsConfiguration.setExposedHeaders(Arrays.asList(
				"Origin",
				"Content-Type",
				"Accept",
				"Authorization",
				"Access-Control-Allow-Origin",
				"Access-Control-Allow-Credentials"
		));
		corsConfiguration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
		urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);
		return new CorsFilter(urlBasedCorsConfigurationSource);
	}
}