# NoliChisme - Red Social Universitaria 🎓💬

![Estado del Proyecto](https://img.shields.io/badge/Estado-Finalizado-success)
![Licencia](https://img.shields.io/badge/Licencia-MIT-blue)

## 📖 Sobre el Proyecto

**NoliChisme** es una aplicación web Full Stack tipo red social desarrollada como proyecto final de cuatrimestre. El objetivo fue diseñar, desarrollar y desplegar una plataforma funcional en un plazo estricto de **4 semanas**, trabajando de manera individual. La tematica de red social que elegí fue de ✨chismess✨.

Este proyecto representa mi capacidad para abarcar el ciclo completo de desarrollo de software: desde el diseño de la base de datos y la arquitectura del backend, hasta la implementación de una interfaz de usuario reactiva y moderna.

### 🎯 Propósito
Más allá de ser una red social, este proyecto sirvió como una demostración técnica de competencias en:
* Arquitectura de software escalable (NestJS + Angular).
* Manejo de autenticación y seguridad (JWT, Hashing, Guards).
* Gestión de estado y consumo de APIs RESTful.

---

## 🛠️ Tecnologías Utilizadas

El stack tecnológico fue seleccionado para garantizar robustez, tipado estático y escalabilidad.

### Backend (API REST)
* **Framework:** [NestJS](https://nestjs.com/) (Node.js) - *Para una arquitectura modular y testable.*
* **Lenguaje:** TypeScript.
* **Base de Datos:** MongoDB (con Mongoose ODM).
* **Seguridad:**
    * `Passport` & `JWT` para autenticación (Access + Refresh Tokens).
    * `Bcrypt` para hasheo de contraseñas.
    * Validación de datos con `class-validator` y DTOs.
* **Manejo de Archivos:** `Multer` para subida de imágenes de perfil y publicaciones.

### Frontend (SPA)
* **Framework:** [Angular](https://angular.io/) (v17+ Standalone Components).
* **Lenguaje:** TypeScript.
* **Estilos:** CSS3 (Diseño responsivo y personalizado).
* **Arquitectura:** Uso de Servicios, Interceptors para manejo de tokens, Guards para protección de rutas y Pipes personalizados.

---

## ✨ Funcionalidades Principales

### 🔐 Módulo de Autenticación y Seguridad
* **Registro de Usuarios:** Validación de edad (+13), unicidad de email/usuario y subida de avatar.
* **Login Seguro:** Implementación de estrategia JWT con Refresh Tokens para mantener la sesión.
* **Protección de Rutas:** Guards específicos para usuarios autenticados y administradores.

### 👤 Gestión de Usuarios
* Edición de perfil (descripción, foto, nombre).
* Panel de Administración: Permite a los roles 'admin' ver métricas y desactivar usuarios que incumplan normas.

### 📝 Publicaciones e Interacción
* **CRUD de Publicaciones:** Crear posts con texto e imágenes.
* **Feed Social:** Visualización de posts ordenados cronológicamente con paginación.
* **Sistema de Comentarios:** Interacción en tiempo real en las publicaciones.
* **Dashboard de Estadísticas:** Visualización de métricas de uso (solo admin).

---

## 🚀 Instalación y Despliegue Local

Sigue estos pasos para correr el proyecto en tu máquina local.

### Prerrequisitos
* Node.js (v18 o superior)
* MongoDB (corriendo localmente o una URI de MongoDB Atlas)

### 1. Clonar el repositorio
* bash
* git clone [https://github.com/tu-usuario/nolichisme.git](https://github.com/tu-usuario/nolichisme.git)
* cd nolichisme

### 2. Configurar el Backend
* cd backend
* npm install
* Crea un archivo .env en la carpeta backend con las siguientes variables:
MONGO_URI=mongodb://localhost:27017/nolichisme
JWT_SECRET=tu_secreto_super_seguro
JWT_REFRESH_SECRET=tu_otro_secreto
# Otras variables que uses...
* Iniciar el servidor: npm run start:dev

### 3. Configurar el Frontend
* En una nueva terminal: 
cd frontend
npm install
* Asegúrate de que el environment.ts apunte a tu backend (por defecto http://localhost:3000). Iniciar la aplicación: npm start
* Abre tu navegador en http://localhost:4200.

## 🧠 **Desafíos y Aprendizaje**

Durante el mes de desarrollo, los mayores retos fueron:

* **Manejo de Imágenes:** Implementar la subida de archivos con Multer y servirlos correctamente como recursos estáticos tanto en el perfil como en los posts.
* **Seguridad (Auth Flow):** Comprender e implementar correctamente el ciclo de vida de los JWT y los Refresh Tokens para una experiencia de usuario fluida pero segura.
* **Arquitectura Modular:** Mantener el código limpio y separado por responsabilidades (Controllers, Services, DTOs) para facilitar el mantenimiento, pensando en que el proyecto pudiera escalar.

## 🔮 **Próximos Pasos (Roadmap)**

Si continuara el desarrollo, estas serían las siguientes mejoras:

* [ ] Implementar WebSockets (Gateway en NestJS) para notificaciones en tiempo real.

* [ ] Agregar tests unitarios (Jest) y E2E para aumentar la cobertura de código.

* [ ] Dockerizar la aplicación para facilitar el despliegue.

* [ ] Mejorar las políticas de seguridad (Rate Limiting, Helmet) enfocado a Ciberseguridad.

## 📧 **Contacto**

Este proyecto fue desarrollado por [Noelia].

* **LinkedIn:** [www.linkedin.com/in/noelia-storgato-dev]

* **Email:** [noelia.storgato@gmail.com]

* **Enlace a la pagina:** [noli-chisme.vercel.app]

<div align="center"> *Desarrollado con 💙 para UTN Avellaneda* </div>