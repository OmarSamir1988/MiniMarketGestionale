<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

$file = __DIR__ . "/products.json";

if (!file_exists($file)) {
    file_put_contents($file, json_encode([]));
}

$products = json_decode(file_get_contents($file), true);

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    echo json_encode($products);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    $newProduct = [
        "id" => time(),
        "name" => $data["name"],
        "category" => $data["category"],
        "price" => (float) $data["price"],
        "quantity" => (int) $data["quantity"]
    ];

    $products[] = $newProduct;

    file_put_contents($file, json_encode($products, JSON_PRETTY_PRINT));

    echo json_encode($newProduct);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    $id = $_GET["id"] ?? null;
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$id) {
        echo json_encode(["error" => "Missing product id"]);
        exit;
    }

    foreach ($products as &$product) {
        if ($product["id"] == $id) {
            $product["name"] = $data["name"];
            $product["category"] = $data["category"];
            $product["price"] = (float) $data["price"];
            $product["quantity"] = (int) $data["quantity"];

            file_put_contents($file, json_encode($products, JSON_PRETTY_PRINT));

            echo json_encode($product);
            exit;
        }
    }

    echo json_encode(["error" => "Product not found"]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    $id = $_GET["id"] ?? null;

    if (!$id) {
        echo json_encode(["error" => "Missing product id"]);
        exit;
    }

    $products = array_values(array_filter($products, function ($product) use ($id) {
        return $product["id"] != $id;
    }));

    file_put_contents($file, json_encode($products, JSON_PRETTY_PRINT));

    echo json_encode(["message" => "Product deleted"]);
    exit;
}