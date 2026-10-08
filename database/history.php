<?php
// Sends the saved price changes to the Price History page as JSON.
require_once __DIR__ . "/db.php";

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

$num = fn($v) => $v === null ? null : (float)$v;

try {
    $stations = db()->query(
        "SELECT id, name, city FROM stations ORDER BY name"
    )->fetchAll();

    $rows = db()->query(
        "SELECT station_id, g91, g95, diesel,
                DATE_FORMAT(recorded_at, '%Y-%m-%d') AS day
         FROM price_history
         ORDER BY recorded_at, id"
    )->fetchAll();

    echo json_encode([
        "stations" => array_map(fn($s) => [
            "id"   => (int)$s["id"],
            "name" => $s["name"],
            "city" => $s["city"],
        ], $stations),
        "history" => array_map(fn($r) => [
            "sid" => (int)$r["station_id"],
            "day" => $r["day"],
            "g91" => $num($r["g91"]),
            "g95" => $num($r["g95"]),
            "d"   => $num($r["diesel"]),   // diesel is "d" like in stations.php
        ], $rows),
    ]);
} catch (Throwable $e) {
    error_log("history.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Database error. Did you create the price_history table?"]);
}
