-- =========================
-- ESQUEMA DE INVENTARIO CORREGIDO
-- =========================
CREATE TABLE categorias (
 id SERIAL PRIMARY KEY,
 nombre VARCHAR(100) NOT NULL UNIQUE,
 descripcion TEXT
);

CREATE TABLE proveedores (
 id SERIAL PRIMARY KEY,
 nombre VARCHAR(150) NOT NULL,
 contacto VARCHAR(100),
 telefono VARCHAR(50),
 email VARCHAR(120),
 direccion TEXT
);

CREATE TABLE productos (
 id SERIAL PRIMARY KEY,
 nombre VARCHAR(150) NOT NULL,
 descripcion TEXT,
 precio NUMERIC(10,2) NOT NULL,
 stock INT NOT NULL DEFAULT 0,
 stock_minimo INT NOT NULL DEFAULT 0,
 categoria_id INT NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
 proveedor_id INT NOT NULL REFERENCES proveedores(id) ON DELETE RESTRICT
);

CREATE TABLE movimientos (
 id SERIAL PRIMARY KEY,
 producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
 tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada','salida')),
 cantidad INT NOT NULL,
 fecha TIMESTAMP NOT NULL DEFAULT NOW(),
 proveedor_id INT REFERENCES proveedores(id),
 motivo VARCHAR(150),
 observacion TEXT
);

-- =========================
-- DATOS SEMILLA
-- =========================
INSERT INTO categorias (nombre, descripcion) VALUES
('Bebidas', 'Productos líquidos y gaseosas'),
('Lácteos', 'Leche, queso, yogurt'),
('Aseo', 'Limpieza y desinfección'),
('Snacks', 'Botanas y galletas'),
('Panadería', 'Pan y productos horneados');

INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES
('Distribuidora Norte', 'Carlos Pérez', '0987654321', 'carlos@norte.com', 'Av. Norte 123'),
('Lácteos del Sur', 'María López', '0991122334', 'maria@lacteos.com', 'Calle Sur 45'),
('Aseo Total', 'Pedro Ruiz', '0977788899', 'pedro@aseo.com', 'Av. Central 789'),
('Panificadora Don Luis', 'Luis Torres', '0964455667', 'luis@pan.com', 'Calle Pan 12'),
('Snacks Express', 'Ana Ríos', '0952233445', 'ana@snacks.com', 'Zona Comercial 99');

INSERT INTO productos (nombre, descripcion, precio, stock, stock_minimo, categoria_id, proveedor_id) VALUES
('Coca Cola 1L', 'Bebida gaseosa', 1.50, 50, 10, 1, 1),
('Agua Mineral 500ml', 'Agua sin gas', 0.80, 30, 5, 1, 1),
('Leche Entera 1L', 'Leche de vaca', 1.10, 40, 15, 2, 2),
('Queso Mozzarella', 'Queso fresco', 2.50, 20, 5, 2, 2),
('Detergente 1kg', 'Limpieza ropa', 3.20, 25, 8, 3, 3),
('Jabón Líquido', 'Limpieza manos', 2.00, 18, 6, 3, 3),
('Galletas Chocolate', 'Snacks dulces', 1.80, 35, 10, 4, 5),
('Papas Fritas', 'Snacks salados', 1.25, 28, 10, 4, 5),
('Pan Blanco', 'Pan de molde', 1.00, 45, 15, 5, 4),
('Croissant', 'Pan hojaldrado', 1.50, 22, 5, 5, 4),
('Yogurt Fresa', 'Yogurt saborizado', 1.30, 32, 10, 2, 2),
('Yogurt Natural', 'Yogurt sin azúcar', 1.20, 15, 8, 2, 2),
('Desinfectante 1L', 'Limpieza pisos', 2.70, 12, 5, 3, 3),
('Refresco Limón 600ml', 'Bebida gaseosa', 1.10, 40, 12, 1, 1),
('Pan Integral', 'Pan saludable', 1.30, 18, 6, 5, 4),
('Chips Picantes', 'Snack picante', 1.40, 25, 10, 4, 5),
('Leche Descremada 1L', 'Leche baja grasa', 1.15, 20, 10, 2, 2),
('Jabón Barra', 'Limpieza general', 0.90, 50, 15, 3, 3),
('Gaseosa Naranja 1L', 'Bebida gaseosa', 1.45, 14, 8, 1, 1),
('Pan de Queso', 'Pan horneado', 1.60, 10, 5, 5, 4);

-- 30 movimientos de ejemplo
INSERT INTO movimientos (producto_id, tipo, cantidad, fecha, proveedor_id, motivo, observacion) VALUES
(1,'entrada',20,'2026-02-01',1,'compra','lote inicial'),
(2,'entrada',15,'2026-02-01',1,'compra','lote inicial'),
(3,'entrada',25,'2026-02-02',2,'compra','lote inicial'),
(4,'entrada',10,'2026-02-02',2,'compra','lote inicial'),
(5,'entrada',12,'2026-02-03',3,'compra','lote inicial'),
(6,'entrada',10,'2026-02-03',3,'compra','lote inicial'),
(7,'entrada',18,'2026-02-04',5,'compra','lote inicial'),
(8,'entrada',20,'2026-02-04',5,'compra','lote inicial'),
(9,'entrada',30,'2026-02-05',4,'compra','lote inicial'),
(10,'entrada',12,'2026-02-05',4,'compra','lote inicial'),
(1,'salida',5,'2026-02-06',NULL,'venta',''),
(2,'salida',3,'2026-02-06',NULL,'venta',''),
(3,'salida',8,'2026-02-07',NULL,'venta',''),
(4,'salida',2,'2026-02-07',NULL,'venta',''),
(5,'salida',4,'2026-02-08',NULL,'venta',''),
(6,'salida',3,'2026-02-08',NULL,'venta',''),
(7,'salida',6,'2026-02-09',NULL,'venta',''),
(8,'salida',4,'2026-02-09',NULL,'venta',''),
(9,'salida',7,'2026-02-10',NULL,'venta',''),
(10,'salida',3,'2026-02-10',NULL,'venta',''),
(11,'entrada',10,'2026-02-11',2,'compra','reposición'),
(12,'entrada',6,'2026-02-11',2,'compra','reposición'),
(13,'entrada',8,'2026-02-12',3,'compra','reposición'),
(14,'entrada',10,'2026-02-12',1,'compra','reposición'),
(15,'entrada',5,'2026-02-13',4,'compra','reposición'),
(16,'entrada',7,'2026-02-13',5,'compra','reposición'),
(17,'salida',4,'2026-02-14',NULL,'venta',''),
(18,'salida',6,'2026-02-14',NULL,'venta',''),
(19,'salida',5,'2026-02-15',NULL,'venta',''),
(20,'salida',4,'2026-02-15',NULL,'venta','');