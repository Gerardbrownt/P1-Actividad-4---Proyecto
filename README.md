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
 ```mermaid
flowchart TD
    Cliente["🌐 Navegador Web del Usuario"]

    subgraph VPN ["Red Segura Tailscale (VPN)"]
        
        subgraph M1 ["💻 Máquina 1 (Frontend + API)"]
            APP["App Web (React + Express)\nPuerto: 8080"]
        end
        
        subgraph M2 ["🗄️ Máquina 2 (Base de Datos)"]
            DB[("PostgreSQL\nPuerto expuesto: 5050")]
            PGA["pgAdmin\nPuerto: 8082"]
        end

        subgraph M3 ["📊 Máquina 3 (Reportes)"]
            REP["API Reportes (Express)\nPuerto: 8081"]
        end

        APP -- "CRUD de Inventario\n(DB_HOST)" --> DB
        APP -- "Pide Reportes\n(REPORT_SERVICE_URL)" --> REP
        REP -- "Consulta Datos\n(DB_HOST)" --> DB
        PGA -. "Administración BD" .-> DB
    end

    Cliente == "Accede a la interfaz" ==> APP
```
## Diagrama de base de datos (ER o modelo de documentos)
<img width="450" height="765" alt="Screenshot 2026-02-22 195100" src="https://github.com/user-attachments/assets/2951a461-c862-444f-805b-4c1f8a4aa3b9" />

## Instrucciones de despliegue paso a paso
Para levantar el proyecto correctamente, es importante respetar el orden de inicio de los servicios (la base de datos debe ir primero).

### Paso 1: Configurar la Red (Todas las máquinas)
1. Instalar [Tailscale](https://tailscale.com/) en las 3 máquinas físicas y loguearse con la misma cuenta del equipo.
2. Anotar la IP de Tailscale de la Máquina 2 (Base de Datos) y la Máquina 3 (Reportes).

### Paso 2: Desplegar Máquina 2 (Base de Datos)
*Responsable: Estudiante B*
1. Clonar el repositorio y entrar a la carpeta `/base-datos/`.
2. Crear el archivo `.env` basado en `.env.example`.
3. Levantar los contenedores:
   ```bash
   docker compose up -d
   ```
*(La BD ya incluirá las tablas y los datos semilla gracias al script de inicialización).*

### Paso 3: Desplegar Máquina 3 (Servicio de Reportes)
*Responsable: Estudiante C*
1. Clonar el repositorio y entrar a la carpeta `/servicio-reportes/`.
2. Crear el archivo `.env` y configurar `DB_HOST` con la IP de Tailscale de la **Máquina 2**.
3. Compilar y levantar el servicio:
   ```bash
   docker compose down
   docker compose up --build -d
   ```

### Paso 4: Desplegar Máquina 1 (App Web / Frontend)
*Responsable: Estudiante A*
1. Clonar el repositorio y entrar a la carpeta `/app-web/`.
2. Crear el archivo `.env` configurando:
   * `DB_HOST`: Con la IP de Tailscale de la Máquina 2.
   * `REPORT_SERVICE_URL`: Con la IP de Tailscale de la Máquina 3 (Ej: `http://100.x.x.x:8081`).
3. Compilar el frontend localmente:
   ```bash
   cd client
   npm install
   npm run build
   cd ..
   ```
4. Levantar el contenedor principal:
   ```bash
   docker compose down
   docker compose up --build -d
   ```
5. 🌐 **¡Listo!** Abrir el navegador en `http://localhost:8080` (o desde la IP de Tailscale de la Máquina 1).
   
## Captura de pantalla de Tailscale mostrando las 3 máquinas conectadas
<img width="1847" height="945" alt="image" src="https://github.com/user-attachments/assets/2b7efd16-84cb-4de1-a4f6-6ddeeae62111" />

## Capturas de los servicios funcionando
<img width="1852" height="943" alt="image" src="https://github.com/user-attachments/assets/d7db7d3e-bb9a-4591-b3d5-81dc6f742f5e" />

<img width="1852" height="950" alt="image" src="https://github.com/user-attachments/assets/d650436d-d00c-4532-8804-9cc9ad5dfc21" />
<img width="1919" height="569" alt="Screenshot 2026-02-22 202506" src="https://github.com/user-attachments/assets/b34a8b23-483e-4e90-bd68-a22f58932b40" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d08d3b04-29db-40e4-b415-74d135698993" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/da80cebe-630d-4a0c-87f8-f8db49c44115" />

