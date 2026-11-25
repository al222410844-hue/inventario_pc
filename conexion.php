
<?php

header("Content-Type: application/json; charset=utf-8");

$host = "localhost";
$dbname = "inventario_pc";
$user = "root";
$password = "";

try {

    $conexion = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

    $metodo = $_SERVER["REQUEST_METHOD"];

    if ($metodo === "GET") {

        $consulta = $conexion->query(
            "SELECT * FROM equipos ORDER BY id DESC"
        );

        echo json_encode($consulta->fetchAll());
        exit;
    }

    if ($metodo === "POST") {

        $datos = json_decode(file_get_contents("php://input"), true);

        if (!is_array($datos)) {
            http_response_code(400);
            exit(json_encode(["error" => "Datos inválidos."]));
        }

        $id = $datos["id"] ?? null;
        $nombre = trim($datos["nombre"] ?? "");
        $categoria = $datos["categoria"] ?? "";
        $precio = $datos["precio"] ?? "";
        $stock = $datos["stock"] ?? "";

        $categorias = [
            "Laptops",
            "PC Escritorio",
            "Monitores",
            "Componentes",
            "Periféricos"
        ];

        if (
            $nombre === "" ||
            !in_array($categoria, $categorias, true) ||
            !is_numeric($precio) ||
            !is_numeric($stock) ||
            (float)$precio < 0 ||
            (int)$stock < 0 ||
            (float)$stock != (int)$stock
        ) {
            http_response_code(400);
            exit(json_encode(["error" => "Verifica los datos ingresados."]));
        }

        if ($id !== null && $id !== "") {

            if (filter_var($id, FILTER_VALIDATE_INT) === false || (int)$id <= 0) {
                http_response_code(400);
                exit(json_encode(["error" => "ID inválido."]));
            }

            $consulta = $conexion->prepare(
                "UPDATE equipos SET nombre=?, categoria=?, precio=?, stock=? WHERE id=?"
            );

            $consulta->execute([
                $nombre, $categoria, $precio, $stock, $id
            ]);

            echo json_encode(["mensaje" => "Equipo actualizado correctamente."]);

        } else {

            $consulta = $conexion->prepare(
                "INSERT INTO equipos (nombre, categoria, precio, stock) VALUES (?, ?, ?, ?)"
            );

            $consulta->execute([
                $nombre, $categoria, $precio, $stock
            ]);

            echo json_encode(["mensaje" => "Equipo registrado correctamente."]);
        }

        exit;
    }

    if ($metodo === "DELETE") {

        $datos = json_decode(file_get_contents("php://input"), true);
        $id = $datos["id"] ?? null;

        if (
            filter_var($id, FILTER_VALIDATE_INT) === false ||
            (int)$id <= 0
        ) {
            http_response_code(400);
            exit(json_encode(["error" => "ID inválido."]));
        }

        $consulta = $conexion->prepare(
            "DELETE FROM equipos WHERE id = ?"
        );

        $consulta->execute([$id]);

        if ($consulta->rowCount() === 0) {
            http_response_code(404);
            exit(json_encode(["error" => "Equipo no encontrado."]));
        }

        echo json_encode(["mensaje" => "Equipo eliminado correctamente."]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["error" => "Método no permitido."]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "error" => "Error al procesar la solicitud."
    ]);
}
