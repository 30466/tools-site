<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Load configuration safely
$configPath = dirname(__DIR__) . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Configuration missing']);
    exit;
}
$config = require $configPath;

$password = $_POST['password'] ?? '';
// Password check for Member Archive
if ($password !== $config['member_archive_password']) {
    http_response_code(403);
    echo json_encode(['error' => '密码错误']);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => '文件上传失败']);
    exit;
}

$versionName = $_POST['version'] ?? 'unknown';
$notes = $_POST['notes'] ?? '';
$uploadDir = __DIR__ . '/';
$fileName = basename($_FILES['file']['name']);
$targetFile = $uploadDir . $fileName;

if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
    // Update version.json
    $jsonFile = $uploadDir . 'version.json';
    $currentData = [];
    if (file_exists($jsonFile)) {
        $currentData = json_decode(file_get_contents($jsonFile), true) ?? [];
    }

    $newEntry = [
        'name' => $versionName,
        'filename' => $fileName,
        'url' => '/apks/member_archive/' . $fileName,
        'date' => date('Y-m-d'),
        'notes' => array_filter(explode(';', str_replace('；', ';', $notes)), function($value) { return !empty(trim($value)); })
    ];

    // Prepend new version
    array_unshift($currentData, $newEntry);
    
    file_put_contents($jsonFile, json_encode($currentData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode(['success' => true, 'message' => '上传成功']);
} else {
    http_response_code(500);
    echo json_encode(['error' => '保存文件失败']);
}
?>