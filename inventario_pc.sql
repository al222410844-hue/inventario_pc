
CREATE DATABASE IF NOT EXISTS inventario_pc;

USE inventario_pc;

CREATE TABLE IF NOT EXISTS equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0
);

-- REGISTROS INICIALES DE EJEMPLO

INSERT INTO equipos (nombre, categoria, precio, stock) VALUES
('Laptop HP', 'Laptops', 12500.00, 8),
('Monitor Samsung', 'Monitores', 3200.00, 3),
('Teclado Logitech', 'Periféricos', 650.00, 0),
('Mouse Logitech', 'Periféricos', 350.00, 15),
('Computadora Dell', 'PC Escritorio', 15000.00, 5);
