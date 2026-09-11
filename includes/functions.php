<?php
/**
 * AdmissionEU — Helper Functions
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/constants.php';

// ── Slug Generator ──────────────────────────────────────────
function createSlug($text) {
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
    $text = preg_replace('/[\s-]+/', '-', $text);
    return rtrim($text, '-');
}

// ── Sanitize Input ──────────────────────────────────────────
function clean($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

// ── Redirect ────────────────────────────────────────────────
function redirect($path) {
    header("Location: " . BASE_URL . $path);
    exit;
}

// ── Flash Messages ──────────────────────────────────────────
function setFlash($type, $message) {
    $_SESSION['flash'] = ['type' => $type, 'message' => $message];
}

function getFlash() {
    if (isset($_SESSION['flash'])) {
        $flash = $_SESSION['flash'];
        unset($_SESSION['flash']);
        return $flash;
    }
    return null;
}

function showFlash() {
    $flash = getFlash();
    if ($flash) {
        $type = $flash['type']; // success, error, warning, info
        echo '<div class="flash-message flash-' . $type . '">';
        echo '<span>' . clean($flash['message']) . '</span>';
        echo '<button class="flash-close" onclick="this.parentElement.remove()">&times;</button>';
        echo '</div>';
    }
}

// ── Pagination ──────────────────────────────────────────────
function getPagination($totalItems, $currentPage, $perPage = ITEMS_PER_PAGE) {
    $totalPages = ceil($totalItems / $perPage);
    $currentPage = max(1, min($currentPage, $totalPages));
    $offset = ($currentPage - 1) * $perPage;

    return [
        'total'       => $totalItems,
        'per_page'    => $perPage,
        'current'     => $currentPage,
        'total_pages' => $totalPages,
        'offset'      => $offset,
        'has_prev'    => $currentPage > 1,
        'has_next'    => $currentPage < $totalPages,
    ];
}

function renderPagination($pagination, $baseUrl) {
    if ($pagination['total_pages'] <= 1) return;

    echo '<nav class="pagination">';

    // Previous
    if ($pagination['has_prev']) {
        echo '<a href="' . $baseUrl . '?page=' . ($pagination['current'] - 1) . '" class="page-link prev">&larr; Previous</a>';
    }

    // Page numbers
    $range = 2;
    $start = max(1, $pagination['current'] - $range);
    $end = min($pagination['total_pages'], $pagination['current'] + $range);

    if ($start > 1) {
        echo '<a href="' . $baseUrl . '?page=1" class="page-link">1</a>';
        if ($start > 2) echo '<span class="page-dots">...</span>';
    }

    for ($i = $start; $i <= $end; $i++) {
        $active = ($i == $pagination['current']) ? ' active' : '';
        echo '<a href="' . $baseUrl . '?page=' . $i . '" class="page-link' . $active . '">' . $i . '</a>';
    }

    if ($end < $pagination['total_pages']) {
        if ($end < $pagination['total_pages'] - 1) echo '<span class="page-dots">...</span>';
        echo '<a href="' . $baseUrl . '?page=' . $pagination['total_pages'] . '" class="page-link">' . $pagination['total_pages'] . '</a>';
    }

    // Next
    if ($pagination['has_next']) {
        echo '<a href="' . $baseUrl . '?page=' . ($pagination['current'] + 1) . '" class="page-link next">Next &rarr;</a>';
    }

    echo '</nav>';
}

// ── Format Currency ─────────────────────────────────────────
function formatMoney($amount, $currency = 'EUR') {
    if ($amount == 0) return 'Free';
    $symbols = ['EUR' => '€', 'GBP' => '£', 'CHF' => 'CHF ', 'SEK' => 'SEK ', 'DKK' => 'DKK ', 'NOK' => 'NOK ', 'PLN' => 'PLN ', 'CZK' => 'CZK ', 'HUF' => 'HUF ', 'RON' => 'RON '];
    $symbol = $symbols[$currency] ?? $currency . ' ';
    return $symbol . number_format($amount, 0);
}

// ── Tuition Display ─────────────────────────────────────────
function tuitionRange($min, $max, $currency = 'EUR') {
    if ($min == 0 && $max == 0) return '<span class="tuition-free">Free</span>';
    if ($min == $max) return formatMoney($min, $currency) . '/yr';
    return formatMoney($min, $currency) . ' – ' . formatMoney($max, $currency) . '/yr';
}

// ── Time Ago ────────────────────────────────────────────────
function timeAgo($datetime) {
    $now = new DateTime();
    $ago = new DateTime($datetime);
    $diff = $now->diff($ago);

    if ($diff->y > 0) return $diff->y . ' year' . ($diff->y > 1 ? 's' : '') . ' ago';
    if ($diff->m > 0) return $diff->m . ' month' . ($diff->m > 1 ? 's' : '') . ' ago';
    if ($diff->d > 0) return $diff->d . ' day' . ($diff->d > 1 ? 's' : '') . ' ago';
    if ($diff->h > 0) return $diff->h . ' hour' . ($diff->h > 1 ? 's' : '') . ' ago';
    if ($diff->i > 0) return $diff->i . ' minute' . ($diff->i > 1 ? 's' : '') . ' ago';
    return 'Just now';
}

// ── Truncate Text ───────────────────────────────────────────
function truncate($text, $length = 150) {
    if (strlen($text) <= $length) return $text;
    return rtrim(substr($text, 0, $length)) . '...';
}

// ── Get Setting ─────────────────────────────────────────────
function getSetting($key, $default = '') {
    static $settings = null;
    if ($settings === null) {
        $db = getDB();
        $stmt = $db->query("SELECT setting_key, setting_value FROM site_settings");
        $settings = [];
        while ($row = $stmt->fetch()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
    }
    return $settings[$key] ?? $default;
}

// ── Count Records ───────────────────────────────────────────
function countRecords($table, $where = '1=1') {
    $db = getDB();
    $stmt = $db->query("SELECT COUNT(*) as total FROM {$table} WHERE {$where}");
    return $stmt->fetch()['total'];
}

// ── File Upload ─────────────────────────────────────────────
function uploadFile($file, $directory = 'uploads') {
    if ($file['error'] !== UPLOAD_ERR_OK) return ['error' => 'Upload failed'];
    if ($file['size'] > MAX_UPLOAD_SIZE) return ['error' => 'File too large (max 5MB)'];

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ALLOWED_EXTENSIONS)) return ['error' => 'File type not allowed'];

    $filename = uniqid('doc_') . '_' . time() . '.' . $ext;
    $path = ROOT_PATH . '/' . $directory . '/' . $filename;

    if (move_uploaded_file($file['tmp_name'], $path)) {
        return ['success' => true, 'filename' => $filename, 'path' => $directory . '/' . $filename];
    }
    return ['error' => 'Failed to save file'];
}

// ── CSRF Token ──────────────────────────────────────────────
function generateCSRF() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCSRF($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

function csrfField() {
    return '<input type="hidden" name="csrf_token" value="' . generateCSRF() . '">';
}
