[# 🎯 Microservicio de Promociones (Backend)

Este proyecto implementa el **microservicio de promociones** utilizando **Spring Boot**.Se encarga de la gestión completa de promociones: creación, actualización, validación y consulta.

---

## 🧩 Funcionalidades principales

- Crear, editar y eliminar promociones.
- Validación de fechas (inicio y fin) y control de acumulación de descuentos.
- Activar y desactivar promociones.
- Exposición de endpoints REST para integración con frontend.
- Gestión de reglas de aplicación (tipo de promoción y condiciones).
- Control de estado de promociones: activa, inactiva o expirada.

---

## 🛠️ Tecnologías utilizadas

- **Java 17+**
- **Spring Boot** con:- Spring Web
  - Spring Data JPA
  - Spring Validation
  - Lombok
- **Gestor de dependencias:** Gradle
- **Base de datos:** PostgreSQL / MySQL / H2 (configurable vía ```
  application.yml
  ```

  )

---

## ⚙️ Configuración y ejecución

### 1. Clonar el repositorio

```
git clone https://github.com/Stven2909/ComponentePromociones.git
cd ComponentePromociones/backend
```

### 2. Configurar la base de datos

Editar el archivo ```
src/main/resources/application.yml
```

 para ajustar la conexión a la base de datos:

```
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/promociones
    username: usuario
    password: clave
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

### 3. Ejecutar el proyecto

```
./gradlew bootRun
```

El servicio quedará disponible en:

```
http://localhost:8080
```

---

## 📌 Endpoints principales

---

## ✅ Validaciones implementadas

---

## 📂 Estructura del proyecto

```
backend/
 ├── src/main/java/com/promociones
 │    ├── controller/       # Controladores REST
 │    ├── dto/              # Data Transfer Objects
 │    ├── entity/           # Entidades JPA
 │    ├── repository/       # Interfaces JPA
 │    ├── service/          # Servicios
 │    └── service/impl/     # Implementaciones de servicios
 ├── src/main/resources/
 │    └── application.yml   # Configuración de la aplicación
 └── build.gradle          # Configuración de Gradle
```

---

## 👥 Equipo

- **Steven Rivera** – Backend Developer  
- **Isaac Renderos** – Frontend Developer  
- **Javier Herrera** – QA / Documentación  
- **José Vigil** – Arquitecto / Líder Técnico](https://www.blackbox.ai/share/c1e8bc0d-a1de-4133-8eb7-3519e1916447)
