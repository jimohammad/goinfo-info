<?php
/**
 * AdmissionEU — Authentication Helper
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ── Check if user is logged in ──────────────────────────────
function isLoggedIn() {
    return isset($_SESSION['user_id']) && $_SESSION['user_id'] > 0;
}

// ── Check if admin is logged in ─────────────────────────────
function isAdmin() {
    return isset($_SESSION['admin_id']) && $_SESSION['admin_id'] > 0;
}

// ── Get current user ────────────────────────────────────────
function getCurrentUser() {
    if (!isLoggedIn()) return null;
    $db = getDB();
    $stmt = $db->prepare("SELECT id, name, email, phone, nationality, avatar_url FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch();
}

// ── Get current admin ───────────────────────────────────────
function getCurrentAdmin() {
    if (!isAdmin()) return null;
    $db = getDB();
    $stmt = $db->prepare("SELECT id, name, email, role FROM admins WHERE id = ?");
    $stmt->execute([$_SESSION['admin_id']]);
    return $stmt->fetch();
}

// ── Login user ──────────────────────────────────────────────
function loginUser($email, $password) {
    $db = getDB();
    $stmt = $db->prepare("SELECT id, name, email, password_hash, is_verified FROM users WHERE email = ?");
    $stmt->execute([strtolower(trim($email))]);
    $user = $stmt->fetch();

    if (!$user) return ['error' => 'Invalid email or password.'];
    if (!password_verify($password, $user['password_hash'])) return ['error' => 'Invalid email or password.'];
    if (!$user['is_verified']) return ['error' => 'Please verify your email before logging in.'];

    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];

    // Update last login
    $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?")->execute([$user['id']]);

    return ['success' => true, 'user' => $user];
}

// ── Login admin ─────────────────────────────────────────────
function loginAdmin($email, $password) {
    $db = getDB();
    $stmt = $db->prepare("SELECT id, name, email, password_hash, role FROM admins WHERE email = ?");
    $stmt->execute([strtolower(trim($email))]);
    $admin = $stmt->fetch();

    if (!$admin) return ['error' => 'Invalid credentials.'];
    if (!password_verify($password, $admin['password_hash'])) return ['error' => 'Invalid credentials.'];

    $_SESSION['admin_id'] = $admin['id'];
    $_SESSION['admin_name'] = $admin['name'];
    $_SESSION['admin_role'] = $admin['role'];

    $db->prepare("UPDATE admins SET last_login = NOW() WHERE id = ?")->execute([$admin['id']]);

    return ['success' => true];
}

// ── Register user ───────────────────────────────────────────
function registerUser($name, $email, $password) {
    $db = getDB();
    $email = strtolower(trim($email));

    // Check if email already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) return ['error' => 'An account with this email already exists.'];

    // Create account
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $token = bin2hex(random_bytes(32));

    $stmt = $db->prepare("INSERT INTO users (name, email, password_hash, verification_token) VALUES (?, ?, ?, ?)");
    $stmt->execute([trim($name), $email, $hash, $token]);

    return ['success' => true, 'token' => $token, 'user_id' => $db->lastInsertId()];
}

// ── Logout ──────────────────────────────────────────────────
function logoutUser() {
    unset($_SESSION['user_id'], $_SESSION['user_name'], $_SESSION['user_email']);
}

function logoutAdmin() {
    unset($_SESSION['admin_id'], $_SESSION['admin_name'], $_SESSION['admin_role']);
}

// ── Require login (redirect if not logged in) ───────────────
function requireLogin() {
    if (!isLoggedIn()) {
        setFlash('error', 'Please login to continue.');
        redirect('/login');
    }
}

function requireAdmin() {
    if (!isAdmin()) {
        redirect('/admin/login');
    }
}
