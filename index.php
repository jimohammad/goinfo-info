<?php
/**
 * Domain front: GoInfo app catalog.
 * HTML lives in index.html so the page still works on hosts that prefer index.php.
 */
header('Content-Type: text/html; charset=UTF-8');
readfile(__DIR__ . '/index.html');
