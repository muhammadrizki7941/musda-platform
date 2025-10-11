<?php
// Check guests table structure

$host = getenv('DB_HOST') ?: 'localhost';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') ?: '';
$database = getenv('DB_NAME') ?: 'musda1';
$table = getenv('DB_TABLE') ?: 'guests';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== TABLE STRUCTURE: $table ===\n";
    try {
        $stmt = $pdo->query("DESCRIBE `$table`");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($columns as $column) {
            echo "- {$column['Field']} ({$column['Type']}) - {$column['Null']} - {$column['Key']}\n";
        }
    } catch (PDOException $e) {
        echo "❌ Failed to describe table: " . $e->getMessage() . "\n";
        exit(1);
    }

    // Count records
    echo "\n=== DATA COUNT: $table ===\n";
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM `$table`");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "Total records: $count\n";
    } catch (PDOException $e) {
        echo "❌ Failed to count records: " . $e->getMessage() . "\n";
        exit(1);
    }

    if ($count > 0) {
        echo "\n=== SAMPLE DATA: $table ===\n";
        try {
            $stmt = $pdo->query("SELECT * FROM `$table` LIMIT 3");
            $samples = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($samples as $sample) {
                echo json_encode($sample, JSON_PRETTY_PRINT) . "\n\n";
            }
        } catch (PDOException $e) {
            echo "❌ Failed to fetch sample data: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n=== AUDIT SUMMARY ===\n";
    echo "Table: $table | DB: $database | Host: $host\n";
    echo "Audit completed.\n";
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>