<?php
/**
 * AdmissionEU — Budget Calculator API
 * Returns living cost data by country/city
 */
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

$db = getDB();

$action = $_GET['action'] ?? 'countries';

if ($action === 'countries') {
    $rows = $db->query("
        SELECT c.id, c.name, c.flag_emoji, c.currency,
               COUNT(lc.id) as city_count
        FROM countries c
        JOIN living_costs lc ON lc.country_id = c.id
        WHERE c.is_active = 1
        GROUP BY c.id
        ORDER BY c.name
    ")->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows);
    exit;
}

if ($action === 'cities') {
    $countryId = intval($_GET['country_id'] ?? 0);
    if (!$countryId) { echo json_encode([]); exit; }
    $stmt = $db->prepare("SELECT city FROM living_costs WHERE country_id = ? ORDER BY city");
    $stmt->execute([$countryId]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_COLUMN));
    exit;
}

if ($action === 'costs') {
    $countryId = intval($_GET['country_id'] ?? 0);
    $city = trim($_GET['city'] ?? '');
    if (!$countryId || !$city) { echo json_encode(['error' => 'Missing params']); exit; }

    $stmt = $db->prepare("
        SELECT lc.*, c.name as country_name, c.flag_emoji, c.currency
        FROM living_costs lc
        JOIN countries c ON c.id = lc.country_id
        WHERE lc.country_id = ? AND lc.city = ?
        LIMIT 1
    ");
    $stmt->execute([$countryId, $city]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) { echo json_encode(['error' => 'Not found']); exit; }
    echo json_encode($row);
    exit;
}

echo json_encode(['error' => 'Invalid action']);
