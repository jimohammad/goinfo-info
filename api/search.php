<?php
/**
 * AdmissionEU — Search API (AJAX)
 * Returns JSON results for university/program autocomplete
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/constants.php';

$query = trim($_GET['q'] ?? '');

if (strlen($query) < 2) {
    echo json_encode(['results' => []]);
    exit;
}

$db = getDB();
$search = '%' . $query . '%';
$results = [];

// Search universities
$stmt = $db->prepare("
    SELECT u.name, u.slug, u.city, c.name AS country, c.flag_emoji
    FROM universities u
    JOIN countries c ON u.country_id = c.id
    WHERE u.is_active = 1 AND (u.name LIKE ? OR u.city LIKE ?)
    ORDER BY u.is_featured DESC, u.views_count DESC
    LIMIT 6
");
$stmt->execute([$search, $search]);
$universities = $stmt->fetchAll();

foreach ($universities as $uni) {
    $results[] = [
        'name'     => $uni['name'],
        'subtitle' => ($uni['flag_emoji'] ?? '') . ' ' . $uni['city'] . ', ' . $uni['country'],
        'url'      => BASE_URL . '/university/' . $uni['slug'],
        'icon'     => '🏛️',
    ];
}

// Search countries
$stmt = $db->prepare("
    SELECT name, slug, flag_emoji
    FROM countries
    WHERE is_active = 1 AND name LIKE ?
    ORDER BY sort_order
    LIMIT 3
");
$stmt->execute([$search]);
$countries = $stmt->fetchAll();

foreach ($countries as $country) {
    $results[] = [
        'name'     => $country['name'],
        'subtitle' => 'View all universities',
        'url'      => BASE_URL . '/country/' . $country['slug'],
        'icon'     => $country['flag_emoji'] ?? '🌍',
    ];
}

// Search programs
$stmt = $db->prepare("
    SELECT p.name, p.slug, p.level, u.name AS uni_name
    FROM programs p
    JOIN universities u ON p.university_id = u.id
    WHERE p.is_active = 1 AND p.name LIKE ?
    LIMIT 4
");
$stmt->execute([$search]);
$programs = $stmt->fetchAll();

foreach ($programs as $prog) {
    $results[] = [
        'name'     => $prog['name'],
        'subtitle' => ucfirst($prog['level']) . ' at ' . $prog['uni_name'],
        'url'      => BASE_URL . '/programs?search=' . urlencode($prog['name']),
        'icon'     => '🎓',
    ];
}

echo json_encode(['results' => array_slice($results, 0, 10)]);
