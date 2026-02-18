<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$statsFile = __DIR__ . '/stats.json';
$data = ['total_downloads' => 0];

if (file_exists($statsFile)) {
    $content = file_get_contents($statsFile);
    $data = json_decode($content, true) ?? ['total_downloads' => 0];
}

$data['total_downloads']++;

// Atomic write using flock
$fp = fopen($statsFile, 'w');
if (flock($fp, LOCK_EX)) {
    fwrite($fp, json_encode($data));
    flock($fp, LOCK_UN);
}
fclose($fp);

echo json_encode(['success' => true, 'total_downloads' => $data['total_downloads']]);
?>