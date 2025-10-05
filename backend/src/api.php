<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database configuration (consistent with Node.js backend)
$dbConfig = [
    'host' => 'localhost',
    'dbname' => 'musda1',
    'username' => 'root',
    'password' => ''
];

// Create PDO connection
try {
    $pdo = new PDO(
        "mysql:host={$dbConfig['host']};dbname={$dbConfig['dbname']};charset=utf8",
        $dbConfig['username'],
        $dbConfig['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

// Get request info
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/MUSDA/backend/src/api.php', '', $uri);

// Get request body for POST/PUT
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// Simple routing
function route($path, $method, $pdo, $input) {
    switch ($path) {
        case '/health':
            return ['success' => true, 'message' => 'API is working', 'timestamp' => date('c')];
            
        case '/sponsors':
            return handleSponsors($method, $pdo, $input);
            
        case '/agendas':
            return handleAgendas($method, $pdo, $input);
            
        case '/gallery':
            return handleGallery($method, $pdo, $input);
            
        case '/countdown':
            return handleCountdown($method, $pdo, $input);
            
        case '/auth/login':
            return handleAuth($method, $pdo, $input);
            
        case '/sph-participants':
            return handleSphParticipants($method, $pdo, $input);
            
        case '/sph-settings':
            return handleSphSettings($method, $pdo, $input);
            
        case '/sph-settings/registration-status':
            return handleSphRegistrationStatus($method, $pdo, $input);
            
        case '/sph-settings/frontend-content':
            return handleSphFrontendContent($method, $pdo, $input);
            
        case '/sph-content/frontend':
            return handleSphContentFrontend($method, $pdo, $input);
            
        case '/poster/active':
            return handleActivePosters($method, $pdo, $input);
            
        case '/gallery/admin/all':
            return handleGalleryAdmin($method, $pdo, $input);
            
        case '/sph-payment-settings/pricing':
            return handleSphPaymentPricing($method, $pdo, $input);
            
        case '/sph-payment-settings/bank-info':
            return handleSphPaymentBankInfo($method, $pdo, $input);
            
        default:
            // Handle dynamic routes like /sponsors/1, /agendas/1, etc.
            $parts = explode('/', trim($path, '/'));
            if (count($parts) >= 2) {
                $resource = $parts[0];
                $id = $parts[1];
                return handleResourceWithId($resource, $id, $method, $pdo, $input);
            }
            
            http_response_code(404);
            return ['success' => false, 'error' => 'Endpoint not found', 'path' => $path];
    }
}

// Sponsors handler
function handleSponsors($method, $pdo, $input) {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM sponsors WHERE status = 'active' ORDER BY display_order ASC");
            return ['success' => true, 'data' => $stmt->fetchAll()];
            
        case 'POST':
            $stmt = $pdo->prepare("INSERT INTO sponsors (name, website_url, status, display_order) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $input['name'] ?? '',
                $input['website_url'] ?? '#',
                $input['status'] ?? 'active',
                $input['display_order'] ?? 1
            ]);
            return ['success' => true, 'id' => $pdo->lastInsertId()];
            
        default:
            return ['success' => false, 'error' => 'Method not allowed'];
    }
}

// Agendas handler
function handleAgendas($method, $pdo, $input) {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM agendas ORDER BY agenda_date ASC, start_time ASC");
            return ['success' => true, 'data' => $stmt->fetchAll()];
            
        case 'POST':
            $stmt = $pdo->prepare("INSERT INTO agendas (title, description, start_time, end_time, agenda_date, location) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['title'] ?? '',
                $input['description'] ?? '',
                $input['start_time'] ?? '',
                $input['end_time'] ?? '',
                $input['agenda_date'] ?? '',
                $input['location'] ?? ''
            ]);
            return ['success' => true, 'id' => $pdo->lastInsertId()];
            
        default:
            return ['success' => false, 'error' => 'Method not allowed'];
    }
}

// Gallery handler
function handleGallery($method, $pdo, $input) {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM gallery_items ORDER BY display_order ASC");
            return ['success' => true, 'data' => $stmt->fetchAll()];
            
        case 'POST':
            $stmt = $pdo->prepare("INSERT INTO gallery_items (image_path, description, display_order) VALUES (?, ?, ?)");
            $stmt->execute([
                $input['image_path'] ?? '',
                $input['description'] ?? '',
                $input['display_order'] ?? 1
            ]);
            return ['success' => true, 'id' => $pdo->lastInsertId()];
            
        default:
            return ['success' => false, 'error' => 'Method not allowed'];
    }
}

// Countdown handler
function handleCountdown($method, $pdo, $input) {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT countdown_date FROM countdown WHERE id = 1");
            $result = $stmt->fetch();
            return [
                'success' => true, 
                'countdown_date' => $result ? $result['countdown_date'] : '2025-12-31 17:00:00'
            ];
            
        default:
            return ['success' => false, 'error' => 'Method not allowed'];
    }
}

// Auth handler
function handleAuth($method, $pdo, $input) {
    if ($method === 'POST') {
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
        
        if ($username === 'admin' && $password === 'admin123') {
            return [
                'success' => true,
                'message' => 'Login successful',
                'token' => 'simple-admin-token',
                'user' => ['id' => 1, 'username' => 'admin']
            ];
        }
        
        return ['success' => false, 'error' => 'Invalid credentials'];
    }
    
    return ['success' => false, 'error' => 'Method not allowed'];
}

// SPH Participants handler
function handleSphParticipants($method, $pdo, $input) {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM sph_participants ORDER BY created_at DESC");
            return ['success' => true, 'data' => $stmt->fetchAll()];
            
        case 'POST':
            $stmt = $pdo->prepare("INSERT INTO sph_participants (name, email, phone, organization, payment_status) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['name'] ?? '',
                $input['email'] ?? '',
                $input['phone'] ?? '',
                $input['organization'] ?? '',
                $input['payment_status'] ?? 'pending'
            ]);
            return ['success' => true, 'id' => $pdo->lastInsertId()];
            
        default:
            return ['success' => false, 'error' => 'Method not allowed'];
    }
}

// Handle resources with ID (PUT, DELETE)
function handleResourceWithId($resource, $id, $method, $pdo, $input) {
    switch ($resource) {
        case 'sponsors':
            return handleSponsorWithId($id, $method, $pdo, $input);
        case 'agendas':
            return handleAgendaWithId($id, $method, $pdo, $input);
        case 'gallery':
            return handleGalleryWithId($id, $method, $pdo, $input);
        case 'sph-participants':
            return handleSphParticipantWithId($id, $method, $pdo, $input);
        default:
            return ['success' => false, 'error' => 'Resource not found'];
    }
}

function handleSponsorWithId($id, $method, $pdo, $input) {
    switch ($method) {
        case 'PUT':
            $stmt = $pdo->prepare("UPDATE sponsors SET name = ?, website_url = ?, status = ?, display_order = ? WHERE id = ?");
            $stmt->execute([
                $input['name'] ?? '',
                $input['website_url'] ?? '#',
                $input['status'] ?? 'active',
                $input['display_order'] ?? 1,
                $id
            ]);
            return ['success' => true, 'message' => 'Sponsor updated'];
            
        case 'DELETE':
            $stmt = $pdo->prepare("DELETE FROM sponsors WHERE id = ?");
            $stmt->execute([$id]);
            return ['success' => true, 'message' => 'Sponsor deleted'];
            
        default:
            return ['success' => false, 'error' => 'Method not allowed'];
    }
}

function handleAgendaWithId($id, $method, $pdo, $input) {
    switch ($method) {
        case 'PUT':
            $stmt = $pdo->prepare("UPDATE agendas SET title = ?, description = ?, start_time = ?, end_time = ?, agenda_date = ?, location = ? WHERE id = ?");
            $stmt->execute([
                $input['title'] ?? '',
                $input['description'] ?? '',
                $input['start_time'] ?? '',
                $input['end_time'] ?? '',
                $input['agenda_date'] ?? '',
                $input['location'] ?? '',
                $id
            ]);
            return ['success' => true, 'message' => 'Agenda updated'];
            
        case 'DELETE':
            $stmt = $pdo->prepare("DELETE FROM agendas WHERE id = ?");
            $stmt->execute([$id]);
            return ['success' => true, 'message' => 'Agenda deleted'];
            
        default:
            return ['success' => false, 'error' => 'Method not allowed'];
    }
}

function handleGalleryWithId($id, $method, $pdo, $input) {
    switch ($method) {
        case 'DELETE':
            $stmt = $pdo->prepare("DELETE FROM gallery_items WHERE id = ?");
            $stmt->execute([$id]);
            return ['success' => true, 'message' => 'Gallery item deleted'];
            
        default:
            return ['success' => false, 'error' => 'Method not allowed'];
    }
}

function handleSphParticipantWithId($id, $method, $pdo, $input) {
    switch ($method) {
        case 'PUT':
            $stmt = $pdo->prepare("UPDATE sph_participants SET payment_status = ? WHERE id = ?");
            $stmt->execute([$input['payment_status'] ?? 'pending', $id]);
            return ['success' => true, 'message' => 'Participant updated'];
            
        case 'DELETE':
            $stmt = $pdo->prepare("DELETE FROM sph_participants WHERE id = ?");
            $stmt->execute([$id]);
            return ['success' => true, 'message' => 'Participant deleted'];
            
        default:
            return ['success' => false, 'error' => 'Method not allowed'];
    }
}

// SPH Settings handler
function handleSphSettings($method, $pdo, $input) {
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM sph_settings LIMIT 1");
            $settings = $stmt->fetch();
            return ['success' => true, 'data' => $settings ?: []];
            
        case 'POST':
        case 'PUT':
            $stmt = $pdo->prepare("INSERT INTO sph_settings (registration_open, event_date, pricing) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE registration_open = VALUES(registration_open), event_date = VALUES(event_date), pricing = VALUES(pricing)");
            $stmt->execute([
                $input['registration_open'] ?? 1,
                $input['event_date'] ?? null,
                $input['pricing'] ?? 50000
            ]);
            return ['success' => true, 'message' => 'Settings updated'];
            
        default:
            return ['success' => false, 'error' => 'Method not allowed'];
    }
}

// SPH Registration Status handler
function handleSphRegistrationStatus($method, $pdo, $input) {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT registration_open FROM sph_settings LIMIT 1");
        $result = $stmt->fetch();
        return ['success' => true, 'registration_open' => $result['registration_open'] ?? true];
    }
    return ['success' => false, 'error' => 'Method not allowed'];
}

// SPH Frontend Content handler
function handleSphFrontendContent($method, $pdo, $input) {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM sph_content WHERE status = 'active' ORDER BY section, display_order");
        $content = $stmt->fetchAll();
        return ['success' => true, 'data' => $content];
    }
    return ['success' => false, 'error' => 'Method not allowed'];
}

// SPH Content Frontend handler (alias)
function handleSphContentFrontend($method, $pdo, $input) {
    return handleSphFrontendContent($method, $pdo, $input);
}

// Active Posters handler
function handleActivePosters($method, $pdo, $input) {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM poster_flyers WHERE is_active = 1 ORDER BY created_at DESC");
        $posters = $stmt->fetchAll();
        return ['success' => true, 'data' => $posters];
    }
    return ['success' => false, 'error' => 'Method not allowed'];
}

// Gallery Admin handler
function handleGalleryAdmin($method, $pdo, $input) {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM gallery_items ORDER BY sort_order ASC, created_at DESC");
        $items = $stmt->fetchAll();
        return ['success' => true, 'data' => $items];
    }
    return ['success' => false, 'error' => 'Method not allowed'];
}

// SPH Payment Pricing handler
function handleSphPaymentPricing($method, $pdo, $input) {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT pricing FROM sph_payment_settings LIMIT 1");
        $result = $stmt->fetch();
        return ['success' => true, 'pricing' => $result['pricing'] ?? 50000];
    }
    return ['success' => false, 'error' => 'Method not allowed'];
}

// SPH Payment Bank Info handler
function handleSphPaymentBankInfo($method, $pdo, $input) {
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT bank_name, account_number, account_holder FROM sph_payment_settings LIMIT 1");
        $result = $stmt->fetch();
        return ['success' => true, 'data' => $result ?: [
            'bank_name' => 'Bank BRI',
            'account_number' => '1234567890',
            'account_holder' => 'HIMPERRA LAMPUNG'
        ]];
    }
    return ['success' => false, 'error' => 'Method not allowed'];
}

// Execute routing and return response
try {
    $response = route($path, $method, $pdo, $input);
    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>