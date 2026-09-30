<?php
// Sends all stations to the page as JSON. table.js draws the table and the map pins.
require_once __DIR__ . "/db.php";

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

$num = fn($v) => $v === null ? null : (float)$v;

try {
    $rows = db()->query(
        "SELECT id, name, city, lat, lng, g91, g95, diesel,
                DATE_FORMAT(updated, '%b. %e, %Y') AS updated
         FROM stations
         ORDER BY name"
    )->fetchAll();

    $out = array_map(fn($r) => [
        "id"      => (int)$r["id"],
        "name"    => $r["name"],
        "city"    => $r["city"],
        "lat"     => (float)$r["lat"],
        "lng"     => (float)$r["lng"],
        "g91"     => $num($r["g91"]),
        "g95"     => $num($r["g95"]),
        "d"       => $num($r["diesel"]),   // table.js calls diesel "d"
        "updated" => $r["updated"],
    ], $rows);

    echo json_encode($out);
} catch (Throwable $e) {
    error_log("stations.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
