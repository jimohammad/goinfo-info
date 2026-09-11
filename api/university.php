<?php
/**
 * AdmissionEU — Fetch university data for popup (AJAX)
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/constants.php';

$id = intval($_GET['id'] ?? 0);
if (!$id) { echo json_encode(['error' => 'No ID']); exit; }

$db = getDB();

$stmt = $db->prepare("
    SELECT u.*, c.name AS country_name, c.flag_emoji, c.currency
    FROM universities u
    JOIN countries c ON u.country_id = c.id
    WHERE u.id = ?
");
$stmt->execute([$id]);
$u = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$u) { echo json_encode(['error' => 'Not found']); exit; }

// Get living cost
$cost = $db->prepare("SELECT rent_shared, food_monthly, transport_monthly, insurance_monthly, misc_monthly FROM living_costs WHERE country_id = ? LIMIT 1");
$cost->execute([$u['country_id']]);
$lc = $cost->fetch(PDO::FETCH_ASSOC);
$monthly = 0;
if ($lc) $monthly = array_sum($lc);

echo json_encode([
    'name' => $u['name'],
    'city' => $u['city'] ?? '',
    'country' => $u['country_name'],
    'flag' => $u['flag_emoji'] ?? '',
    'type' => $u['type'],
    'desc' => $u['description'] ?? '',
    'founded' => $u['founded_year'],
    'rank' => $u['ranking_world'],
    'students' => $u['student_count'],
    'english' => (stripos($u['language_of_instruction'] ?? '', 'English') !== false),
    'langs' => $u['language_of_instruction'] ?? 'German',
    'website' => $u['website_url'] ?? '',
    'monthly' => $monthly,
], JSON_UNESCAPED_UNICODE);
