<?php
/**
 * GoInfo — Database Connection (PDO)
 * Copy from database.example.php and fill in your credentials.
 * Do not commit real passwords.
 */

define('DB_HOST', getenv('GOINFO_DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('GOINFO_DB_NAME') ?: 'your_database');
define('DB_USER', getenv('GOINFO_DB_USER') ?: 'your_username');
define('DB_PASS', getenv('GOINFO_DB_PASS') ?: 'your_password');
define('DB_CHARSET', 'utf8mb4');

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            die("Sorry, we're experiencing technical difficulties. Please try again later.");
        }
    }
    return $pdo;
}
