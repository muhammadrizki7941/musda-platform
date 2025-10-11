<?php
// Check database tables and participants data
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'musda1';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== DATABASE CONNECTION SUCCESSFUL ===\n\n";
    
    // Show all tables
    echo "=== ALL TABLES ===\n";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $table) {
        echo "- $table\n";
    }
    
    // Check if participants table exists
    echo "\n=== PARTICIPANTS TABLE CHECK ===\n";
    if (in_array('participants', $tables)) {
        echo "✅ Table 'participants' exists\n\n";
        
        // Get table structure
        echo "=== PARTICIPANTS TABLE STRUCTURE ===\n";
        $stmt = $pdo->query("DESCRIBE participants");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($columns as $column) {
            echo "- {$column['Field']} ({$column['Type']}) - {$column['Null']} - {$column['Key']}\n";
        }
        
        // Count records
        echo "\n=== PARTICIPANTS DATA COUNT ===\n";
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM participants");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "Total records: $count\n";
        
        if ($count > 0) {
            echo "\n=== SAMPLE PARTICIPANTS DATA ===\n";
            $stmt = $pdo->query("SELECT id, nama, email, status, created_at FROM participants LIMIT 5");
            $samples = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($samples as $sample) {
                echo "ID: {$sample['id']} | {$sample['nama']} | {$sample['email']} | {$sample['status']} | {$sample['created_at']}\n";
            }
        }
        
    } else {
        echo "❌ Table 'participants' does NOT exist\n";
        echo "Available tables related to participants:\n";
        foreach ($tables as $table) {
            if (strpos(strtolower($table), 'participant') !== false || strpos(strtolower($table), 'guest') !== false) {
                echo "- $table\n";
            }
        }
    }
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}
?>