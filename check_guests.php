<?php
// Check guests table structure
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'musda1';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== GUESTS TABLE STRUCTURE ===\n";
    $stmt = $pdo->query("DESCRIBE guests");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $column) {
        echo "- {$column['Field']} ({$column['Type']}) - {$column['Null']} - {$column['Key']}\n";
    }
    
    // Count records
    echo "\n=== GUESTS DATA COUNT ===\n";
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM guests");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "Total records: $count\n";
    
    if ($count > 0) {
        echo "\n=== SAMPLE GUESTS DATA ===\n";
        $stmt = $pdo->query("SELECT * FROM guests LIMIT 3");
        $samples = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($samples as $sample) {
            echo json_encode($sample, JSON_PRETTY_PRINT) . "\n\n";
        }
    }
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}
?>