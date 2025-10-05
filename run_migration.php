<?php
// Database Migration Script for MUSDA Admin Dashboard
// This script creates the missing database tables and inserts default data

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'musda1';

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🔗 Connected to database: $database\n\n";
    
    // 1. Create content table
    echo "📄 Creating content table...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS content (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            content TEXT,
            status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
            type ENUM('page', 'post', 'news') DEFAULT 'page',
            meta_description TEXT,
            featured_image VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_status (status),
            INDEX idx_type (type),
            INDEX idx_created_at (created_at)
        )
    ");
    echo "✅ Content table created successfully\n\n";
    
    // 2. Create system_settings table
    echo "⚙️ Creating system_settings table...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS system_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(100) UNIQUE NOT NULL,
            setting_value TEXT,
            description VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_setting_key (setting_key)
        )
    ");
    echo "✅ System settings table created successfully\n\n";
    
    // 3. Create admin_activities table
    echo "📊 Creating admin_activities table...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS admin_activities (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT NOT NULL,
            activity_type ENUM('login', 'logout', 'create', 'update', 'delete', 'export') NOT NULL,
            target_type VARCHAR(50),
            target_id INT,
            description TEXT,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_admin_id (admin_id),
            INDEX idx_activity_type (activity_type),
            INDEX idx_created_at (created_at)
        )
    ");
    echo "✅ Admin activities table created successfully\n\n";
    
    // 4. Insert default system settings
    echo "📝 Inserting default system settings...\n";
    $settings = [
        ['site_name', 'MUSDA HIMPERRA', 'Website name'],
        ['site_description', 'Musyawarah Daerah HIMPERRA Lampung', 'Website description'],
        ['registration_open', 'true', 'Enable/disable registration'],
        ['max_participants', '500', 'Maximum number of participants'],
        ['email_notifications', 'true', 'Enable email notifications'],
        ['maintenance_mode', 'false', 'Enable maintenance mode'],
        ['contact_email', 'admin@himperra.org', 'Contact email address'],
        ['contact_phone', '+62-XXX-XXXX-XXXX', 'Contact phone number']
    ];
    
    $stmt = $pdo->prepare("
        INSERT IGNORE INTO system_settings (setting_key, setting_value, description) 
        VALUES (?, ?, ?)
    ");
    
    foreach ($settings as $setting) {
        $stmt->execute($setting);
    }
    echo "✅ Default settings inserted successfully\n\n";
    
    // 5. Insert sample content
    echo "📋 Inserting sample content...\n";
    $content = [
        ['Welcome to MUSDA', 'welcome-musda', '<h1>Selamat Datang di MUSDA HIMPERRA</h1><p>Musyawarah Daerah HIMPERRA Lampung</p>', 'published', 'page', 'Halaman selamat datang MUSDA HIMPERRA'],
        ['Event Information', 'event-info', '<h2>Informasi Acara</h2><p>Detail lengkap tentang acara MUSDA</p>', 'published', 'page', 'Informasi lengkap acara MUSDA'],
        ['Registration Guide', 'registration-guide', '<h2>Panduan Pendaftaran</h2><p>Cara mendaftar untuk mengikuti acara MUSDA</p>', 'published', 'post', 'Panduan pendaftaran MUSDA']
    ];
    
    $stmt = $pdo->prepare("
        INSERT IGNORE INTO content (title, slug, content, status, type, meta_description) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    foreach ($content as $item) {
        $stmt->execute($item);
    }
    echo "✅ Sample content inserted successfully\n\n";
    
    // 6. Verify tables and show statistics
    echo "📊 Database Migration Summary:\n";
    echo "==============================\n";
    
    // Check content table
    $result = $pdo->query("SELECT COUNT(*) as count FROM content");
    $count = $result->fetch()['count'];
    echo "📄 Content items: $count\n";
    
    // Check system settings
    $result = $pdo->query("SELECT COUNT(*) as count FROM system_settings");
    $count = $result->fetch()['count'];
    echo "⚙️ System settings: $count\n";
    
    // Check admin activities table
    $result = $pdo->query("SELECT COUNT(*) as count FROM admin_activities");
    $count = $result->fetch()['count'];
    echo "📊 Admin activities: $count\n";
    
    // List all tables
    echo "\n📋 Available Tables:\n";
    $result = $pdo->query("SHOW TABLES");
    while ($row = $result->fetch()) {
        echo "  - " . $row[0] . "\n";
    }
    
    echo "\n🎉 DATABASE MIGRATION COMPLETED SUCCESSFULLY! 🎉\n";
    echo "All admin dashboard tables are now ready.\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>