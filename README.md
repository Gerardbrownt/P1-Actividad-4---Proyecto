# Sistema de Inventario Distribuido - Proyecto Final

## Arquitectura del Sistema
El sistema está distribuido en 3 máquinas físicas conectadas mediante una VPN de Tailscale:
- **Máquina 1 (App Web):** Frontend en React + API en Node.js (Puerto 8080).
- **Máquina 2 (Base de Datos):** PostgreSQL/MongoDB (Puerto 5432).
- **Máquina 3 (Reportes):** Servicio de analítica (Puerto 8081).

## Configuración de Red (Tailscale)
- **IP Máquina 1:** 100.72.35.32
- **IP Máquina 2:** [Insertar IP aquí]
- **IP Máquina 3:** [Insertar IP aquí]

## Requisitos
1. Docker y Docker Desktop instalado.
2. Tailscale conectado a la red del equipo.

## Instrucciones de Despliegue (Máquina 1)
1. Entrar a la carpeta `app-web`.
2. Configurar el archivo `.env` con las IPs de Tailscale de los compañeros.
3. Ejecutar: `docker-compose up --build`
