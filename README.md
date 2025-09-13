# 🎯 Microservicio de Promociones (Backend)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17+-orange.svg)](https://www.oracle.com/java/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://www.postgresql.org/)
[![Gradle](https://img.shields.io/badge/Gradle-8.x-green.svg)](https://gradle.org/)

Este proyecto implementa el **microservicio de promociones** utilizando **Spring Boot**. Se encarga de la gestión completa de promociones: creación, actualización, validación y consulta.

## 📋 Tabla de Contenidos

- [Funcionalidades](#-funcionalidades-principales)
- [Tecnologías](#️-tecnologías-utilizadas)
- [Instalación](#-instalación-y-configuración)
- [Endpoints](#-endpoints-principales)
- [Validaciones](#-validaciones-implementadas)
- [Estructura](#-estructura-del-proyecto)
- [Equipo](#-equipo)

## 🚀 Funcionalidades principales

- ✅ **Gestión CRUD** de promociones
- ✅ **Validación automática** de fechas de inicio y fin
- ✅ **Control de acumulación** de descuentos
- ✅ **Activación/Desactivación** de promociones
- ✅ **API REST** completa para integración con frontend
- ✅ **Gestión de reglas** de aplicación y condiciones
- ✅ **Control de estados**: activa, inactiva, expirada

## 🛠️ Tecnologías utilizadas

### Backend
- **Java 17+** - Lenguaje de programación
- **Spring Boot 3.x** - Framework principal
  - Spring Web - API REST
  - Spring Data JPA - Persistencia de datos
  - Spring Validation - Validación de datos
  - Lombok - Reducción de código boilerplate

### Base de Datos
- **PostgreSQL** (recomendado para producción)
- **MySQL** (alternativo)
- **H2** (desarrollo y testing)

### Herramientas
- **Gradle 8.x** - Gestor de dependencias y build
- **Docker** - Contenerización (opcional)

## 🔧 Instalación y Configuración

### Prerrequisitos

- Java 17 o superior
- PostgreSQL 13+ (o base de datos preferida)
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/Stven2909/ComponentePromociones.git
cd ComponentePromociones/backend
```

### 2. Configurar la base de datos

Editar el archivo `src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: promociones-service
  
  datasource:
    url: jdbc:postgresql://localhost:5432/promociones
    username: usuario
    password: clave
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

server:
  port: 8080
  servlet:
    context-path: /api/v1

logging:
  level:
    com.promociones: DEBUG
    org.springframework.web: INFO
```

### 3. Ejecutar el proyecto

#### Usando Gradle Wrapper
```bash
./gradlew bootRun
```

#### Usando JAR compilado
```bash
./gradlew build
java -jar build/libs/promociones-service-1.0.0.jar
```

El servicio estará disponible en: `http://localhost:8080/api/v1`

## 📌 Endpoints principales

### Promociones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `service-main/promociones` | Listar todas las promociones |
| `GET` | `service-main/promociones/{id}` | Obtener promoción por ID |
| `POST` | `service-main/promociones` | Crear nueva promoción |
| `PUT` | `service-main/promociones/{id}` | Actualizar promoción existente |
| `DELETE` | `service-main/promociones/{id}` | Eliminar promoción |
| `PATCH` | `service-main/promociones/{id}/activar` | Activar promoción |
| `PATCH` | `service-main/promociones/{id}/desactivar` | Desactivar promoción |

### Validaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/promociones/validar` | Validar aplicabilidad de promoción |
| `GET` | `/promociones/activas` | Obtener promociones activas |
| `GET` | `/promociones/vigentes` | Obtener promociones vigentes por fecha |

### Ejemplo de Request

```json
{
  "nombre": "Descuento Verano 2024",
  "descripcion": "Descuento del 20% en toda la tienda",
  "tipoDescuento": "PORCENTAJE",
  "valorDescuento": 20.0,
  "fechaInicio": "2024-06-01T00:00:00",
  "fechaFin": "2024-08-31T23:59:59",
  "montoMinimo": 100.0,
  "esAcumulable": false,
  "activa": true,
  "condiciones": [
    {
      "tipoCondicion": "CATEGORIA",
      "valor": "ROPA"
    }
  ]
}
```

## ✅ Validaciones implementadas

- 🔍 **Fechas coherentes**: La fecha de fin debe ser posterior a la de inicio
- 💰 **Valores positivos**: Descuentos y montos mínimos deben ser mayores a 0
- 🔄 **Estado consistente**: Control de estados mutuamente excluyentes
- 📅 **Vigencia automática**: Actualización automática de estados por fecha
- 🚫 **Acumulación controlada**: Validación de reglas de acumulación
- 📝 **Datos requeridos**: Validación de campos obligatorios
- 🎯 **Condiciones válidas**: Validación de reglas de aplicación

## 📂 Estructura del proyecto

```
backend/
├── src/main/java/com/promociones/
│   ├── controller/           # 🎮 Controladores REST
│   │   ├── PromocionController.java
│   │   └── ValidacionController.java
│   ├── dto/                  # 📦 Data Transfer Objects
│   │   ├── PromocionDTO.java
│   │   ├── PromocionRequestDTO.java
│   │   └── ValidacionDTO.java
│   ├── entity/               # 🗃️ Entidades JPA
│   │   ├── Promocion.java
│   │   ├── Condicion.java
│   │   └── EstadoPromocion.java
│   ├── repository/           # 🔍 Repositorios JPA
│   │   ├── PromocionRepository.java
│   │   └── CondicionRepository.java
│   ├── service/              # 🔧 Interfaces de servicios
│   │   ├── PromocionService.java
│   │   └── ValidacionService.java
│   ├── service/impl/         # ⚙️ Implementaciones
│   │   ├── PromocionServiceImpl.java
│   │   └── ValidacionServiceImpl.java
│   ├── config/               # ⚙️ Configuraciones
│   │   ├── DatabaseConfig.java
│   │   └── WebConfig.java
│   ├── exception/            # ⚠️ Manejo de excepciones
│   │   ├── PromocionNotFoundException.java
│   │   └── GlobalExceptionHandler.java
│   └── util/                 # 🛠️ Utilidades
│       ├── DateUtils.java
│       └── ValidationUtils.java
├── src/main/resources/
│   ├── application.yml       # ⚙️ Configuración principal
│   ├── application-dev.yml   # 🔧 Configuración desarrollo
│   ├── application-prod.yml  # 🚀 Configuración producción
│   └── db/migration/         # 📊 Scripts de migración
└── build.gradle             # 📋 Configuración de Gradle
```

## 🧪 Testing

### Ejecutar tests
```bash
# Todos los tests
./gradlew test

# Tests de integración
./gradlew integrationTest

# Reporte de cobertura
./gradlew jacocoTestReport
```

### Cobertura actual
- **Servicios**: 95%+
- **Controladores**: 90%+
- **Repositorios**: 85%+

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 👥 Equipo

| Rol | Nombre | | Responsabilidades |
|-----|--------|--------|-------------------|
| **Backend Developer** | Steven Rivera |  | Desarrollo backend, APIs, base de datos |
| **Frontend Developer** | Isaac Renderos | | Interfaces de usuario, integración |
| **QA Engineer** | Javier Herrera | | Testing, documentación, QA |
| **Tech Lead** | José Vigil | | Arquitectura, liderazgo técnico |



## 📞 Soporte

Para reportar bugs o solicitar nuevas funcionalidades:
- 📧 Email: steven.melendez001@gmail.com

---

⭐ **¡No olvides dar una estrella al proyecto si te fue útil!** ⭐
