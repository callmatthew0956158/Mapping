<?php
// Page for adding gas stations by hand. Open: http://localhost/gasprices/database/add_station.php
session_start();
require_once __DIR__ . "/db.php";

function h($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, "UTF-8"); }

if (empty($_SESSION["csrf"])) {
    $_SESSION["csrf"] = bin2hex(random_bytes(16));
}

$msg = "";
$err = "";
$old = ["name" => "", "city" => "", "lat" => "", "lng" => "",
        "g91" => "", "g95" => "", "diesel" => "", "updated" => date("Y-m-d")];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $action = $_POST["action"] ?? "";

    if ($action === "login") {
        $pw = $_POST["password"] ?? "";
        if (is_string($pw) && hash_equals(ADMIN_PASSWORD, $pw)) {
            session_regenerate_id(true);
            $_SESSION["admin"] = true;
        } else {
            $err = "Wrong password.";
        }

    } elseif ($action === "logout") {
        $_SESSION = [];
        session_destroy();
        header("Location: add_station.php");
        exit;

    } elseif ($action === "add" && !empty($_SESSION["admin"])) {
        foreach ($old as $k => $_) {
            $v = $_POST[$k] ?? "";
            $old[$k] = is_string($v) ? trim($v) : "";
        }

        $token = $_POST["csrf"] ?? "";
        if (!is_string($token) || !hash_equals($_SESSION["csrf"], $token)) {
            $err = "Your session expired. Reload the page and try again.";
        } else {
            $errors = [];

            if ($old["name"] === "" || mb_strlen($old["name"]) > 100) $errors[] = "Enter a station name (up to 100 characters).";
            if ($old["city"] === "" || mb_strlen($old["city"]) > 100) $errors[] = "Enter a city or municipality (up to 100 characters).";

            if (!is_numeric($old["lat"]) || $old["lat"] < -90  || $old["lat"] > 90)  $errors[] = "Latitude must be a number from -90 to 90.";
            if (!is_numeric($old["lng"]) || $old["lng"] < -180 || $old["lng"] > 180) $errors[] = "Longitude must be a number from -180 to 180.";

            $prices = [];
            foreach (["g91" => "Gas 91", "g95" => "Gas 95", "diesel" => "Diesel"] as $k => $label) {
                if ($old[$k] === "") { $prices[$k] = null; continue; }
                if (!is_numeric($old[$k]) || $old[$k] < 20 || $old[$k] > 300) {
                    $errors[] = "$label must be a price between 20 and 300, or left empty.";
                } else {
                    $prices[$k] = round((float)$old[$k], 2);
                }
            }
            if (!$errors && count(array_filter($prices, fn($p) => $p !== null)) === 0) {
                $errors[] = "Enter at least one fuel price.";
            }

            $d = DateTime::createFromFormat("Y-m-d", $old["updated"]);
            if (!$d || $d->format("Y-m-d") !== $old["updated"]) $errors[] = "Enter a valid date.";

            if ($errors) {
                $err = implode(" ", $errors);
            } else {
                try {
                    $stmt = db()->prepare(
                        "INSERT INTO stations (name, city, lat, lng, g91, g95, diesel, updated)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
                    );
                    $stmt->execute([
                        $old["name"], $old["city"],
                        round((float)$old["lat"], 6), round((float)$old["lng"], 6),
                        $prices["g91"], $prices["g95"], $prices["diesel"],
                        $old["updated"],
                    ]);
                    $msg = "Added " . $old["name"] . ".";
                    $old = ["name" => "", "city" => "", "lat" => "", "lng" => "",
                            "g91" => "", "g95" => "", "diesel" => "", "updated" => date("Y-m-d")];
                } catch (Throwable $e) {
                    error_log("add_station.php: " . $e->getMessage());
                    $err = "Couldn't save the station. Check that MySQL is running.";
                }
            }
        }
    }
}

$recent = [];
if (!empty($_SESSION["admin"])) {
    try {
        $recent = db()->query(
            "SELECT name, city, lat, lng, g91, g95, diesel, updated
             FROM stations ORDER BY id DESC LIMIT 10"
        )->fetchAll();
    } catch (Throwable $e) {
        error_log("add_station.php: " . $e->getMessage());
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Add gas station</title>
<style>
  body { font: 14px/1.5 system-ui, Arial, sans-serif; background: #f2f5fa; color: #18263c; margin: 0; padding: 24px; }
  .box { max-width: 720px; margin: 0 auto 20px; background: #fff; border: 1px solid #e4e9f2; border-radius: 12px; padding: 20px; }
  h1 { font-size: 20px; margin: 0 0 14px; }
  label { display: block; font-weight: 600; margin: 12px 0 4px; }
  input { width: 100%; padding: 10px; border: 1px solid #cfd8e6; border-radius: 8px; font: inherit; box-sizing: border-box; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  button { margin-top: 16px; padding: 10px 18px; border: 0; border-radius: 8px; background: #1668e3; color: #fff; font: inherit; font-weight: 600; cursor: pointer; }
  button.link { background: none; color: #1668e3; padding: 0; margin: 0; }
  .ok { background: #e3f6ea; color: #0f9d3f; padding: 10px; border-radius: 8px; margin-bottom: 12px; }
  .bad { background: #fdecee; color: #b00020; padding: 10px; border-radius: 8px; margin-bottom: 12px; }
  .hint { color: #66758c; font-size: 12px; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e4e9f2; }
  .top { display: flex; justify-content: space-between; align-items: center; }
</style>
</head>
<body>

<?php if (empty($_SESSION["admin"])): ?>
  <div class="box">
    <h1>Admin login</h1>
    <?php if ($err): ?><div class="bad"><?= h($err) ?></div><?php endif; ?>
    <form method="post">
      <input type="hidden" name="action" value="login">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" required autofocus>
      <button type="submit">Log in</button>
    </form>
  </div>

<?php else: ?>
  <div class="box">
    <div class="top">
      <h1>Add gas station</h1>
      <form method="post"><input type="hidden" name="action" value="logout"><button class="link" type="submit">Log out</button></form>
    </div>

    <?php if ($msg): ?><div class="ok"><?= h($msg) ?></div><?php endif; ?>
    <?php if ($err): ?><div class="bad"><?= h($err) ?></div><?php endif; ?>

    <form method="post">
      <input type="hidden" name="action" value="add">
      <input type="hidden" name="csrf" value="<?= h($_SESSION["csrf"]) ?>">

      <label for="name">Station name</label>
      <input id="name" name="name" maxlength="100" required value="<?= h($old["name"]) ?>" placeholder="Shell Lacson">

      <label for="city">City / Municipality</label>
      <input id="city" name="city" maxlength="100" required value="<?= h($old["city"]) ?>" placeholder="Bacolod City">

      <div class="row">
        <div>
          <label for="lat">Latitude</label>
          <input id="lat" name="lat" required inputmode="decimal" value="<?= h($old["lat"]) ?>" placeholder="10.687000">
        </div>
        <div>
          <label for="lng">Longitude</label>
          <input id="lng" name="lng" required inputmode="decimal" value="<?= h($old["lng"]) ?>" placeholder="122.957000">
        </div>
      </div>
      <div class="hint">In Google Maps, right-click the station and click the coordinates at the top of the menu to copy them. You can paste both numbers into the Latitude box and they will be split for you.</div>

      <div class="row3">
        <div>
          <label for="g91">Gas 91 (₱/L)</label>
          <input id="g91" name="g91" inputmode="decimal" value="<?= h($old["g91"]) ?>" placeholder="89.21">
        </div>
        <div>
          <label for="g95">Gas 95 (₱/L)</label>
          <input id="g95" name="g95" inputmode="decimal" value="<?= h($old["g95"]) ?>" placeholder="90.23">
        </div>
        <div>
          <label for="diesel">Diesel (₱/L)</label>
          <input id="diesel" name="diesel" inputmode="decimal" value="<?= h($old["diesel"]) ?>" placeholder="95.98">
        </div>
      </div>
      <div class="hint">Leave a price empty if the station doesn't sell that fuel.</div>

      <label for="updated">Updated</label>
      <input type="date" id="updated" name="updated" required value="<?= h($old["updated"]) ?>">

      <button type="submit">Add station</button>
    </form>
  </div>

  <div class="box">
    <h1>Last 10 added</h1>
    <?php if (!$recent): ?>
      <p>No stations yet.</p>
    <?php else: ?>
      <table>
        <tr><th>Station</th><th>City</th><th>Lat, Lng</th><th>Gas 91</th><th>Gas 95</th><th>Diesel</th><th>Updated</th></tr>
        <?php foreach ($recent as $r): ?>
          <tr>
            <td><?= h($r["name"]) ?></td>
            <td><?= h($r["city"]) ?></td>
            <td><?= h($r["lat"]) ?>, <?= h($r["lng"]) ?></td>
            <td><?= $r["g91"] === null ? "—" : h($r["g91"]) ?></td>
            <td><?= $r["g95"] === null ? "—" : h($r["g95"]) ?></td>
            <td><?= $r["diesel"] === null ? "—" : h($r["diesel"]) ?></td>
            <td><?= h($r["updated"]) ?></td>
          </tr>
        <?php endforeach; ?>
      </table>
    <?php endif; ?>
    <p class="hint">To edit or delete a station, use phpMyAdmin (table <b>stations</b>).</p>
  </div>

  <script>
    // Paste "10.687, 122.957" into Latitude and it splits into both boxes
    document.getElementById("lat").addEventListener("input", function () {
      const m = this.value.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)\s*$/);
      if (m) {
        this.value = m[1];
        document.getElementById("lng").value = m[2];
      }
    });
  </script>
<?php endif; ?>

</body>
</html>
