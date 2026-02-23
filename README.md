# Sistema de Inventario Distribuido - Proyecto Final

## Arquitectura del Sistema
El sistema está distribuido en 3 máquinas físicas conectadas mediante una VPN de Tailscale:
- **Máquina 1 (App Web):** Frontend en React + API en Node.js (Puerto 8080).
- **Máquina 2 (Base de Datos):** PostgreSQL/MongoDB (Puerto 5432).
- **Máquina 3 (Reportes):** Servicio de analítica (Puerto 8081).

## Configuración de Red (Tailscale)
- **IP Máquina 1:** 100.72.35.32
- **IP Máquina 2:** 100.113.243.28
- **IP Máquina 3:** 100.106.84.125

## Requisitos
1. Docker y Docker Desktop instalado.
2. Tailscale conectado a la red del equipo.

## Instrucciones de Despliegue (Máquina 1)
1. Entrar a la carpeta `app-web`.
2. Configurar el archivo `.env` con las IPs de Tailscale de los compañeros.
3. Ejecutar: `docker-compose up --build`

## Diagrama de arquitectura del sistema

## Diagrama de base de datos (ER o modelo de documentos)
<img width="450" height="765" alt="Screenshot 2026-02-22 195100" src="https://github.com/user-attachments/assets/2951a461-c862-444f-805b-4c1f8a4aa3b9" />

## Instrucciones de despliegue paso a paso

## Captura de pantalla de Tailscale mostrando las 3 máquinas conectadas
<img width="1847" height="945" alt="image" src="https://github.com/user-attachments/assets/2b7efd16-84cb-4de1-a4f6-6ddeeae62111" />

## Capturas de los servicios funcionando
<img width="1852" height="943" alt="image" src="https://github.com/user-attachments/assets/d7db7d3e-bb9a-4591-b3d5-81dc6f742f5e" />

<img width="1852" height="950" alt="image" src="https://github.com/user-attachments/assets/d650436d-d00c-4532-8804-9cc9ad5dfc21" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d08d3b04-29db-40e4-b415-74d135698993" />


