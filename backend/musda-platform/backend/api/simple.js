// API handler for Vercel with real database
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'shinkansen.proxy.rlwy.net',
  port: 50232,
  user: 'root',
  password: 'LagVYzdUYBwGVQEarPCNDojPhBhJNRIa',
  database: 'railway',
  ssl: false, // Try without SSL first
  connectTimeout: 30000,
  acquireTimeout: 30000,
  timeout: 30000,
  charset: 'utf8mb4'
};

// Helper function to create database connection with retry
async function createDbConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting database connection (attempt ${i + 1}/${retries})`);
      console.log('DB Config:', { 
        host: dbConfig.host, 
        port: dbConfig.port, 
        user: dbConfig.user, 
        database: dbConfig.database,
        ssl: dbConfig.ssl 
      });
      
      const connection = await mysql.createConnection(dbConfig);
      console.log('Database connection successful!');
      return connection;
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error.message);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))); // Wait longer before retry
    }
  }
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Parse request body for POST requests synchronously
  if (req.method === 'POST' && !req.body) {
    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk.toString();
      }
      req.body = body ? JSON.parse(body) : {};
    } catch (e) {
      req.body = {};
    }
  }
  
  const { url, method } = req;
  
  // Debug logging
  console.log('Request URL:', url);
  console.log('Request Method:', method);
  
  try {
    // Parse URL more carefully
    const path = url.split('?')[0]; // Remove query parameters
    
    if (path === '/api/health' || path === '/health' || path === '/') {
      res.status(200).json({
        status: 'OK',
        message: 'Backend is working with database!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        requestedPath: path
      });
    }
    else if (path === '/api/sponsors' || path === '/sponsors') {
      try {
        const connection = await createDbConnection();
        const [rows] = await connection.execute('SELECT * FROM sponsors WHERE status = "active" ORDER BY display_order ASC');
        await connection.end();
        
        res.status(200).json({
          success: true,
          data: rows,
          count: rows.length
        });
      } catch (dbError) {
        console.error('Database error for sponsors:', dbError);
        // Return mock data as fallback
        const mockSponsors = [
          {
            id: 1,
            name: "HIMPERRA Lampung",
            logo_path: "/images/logo-himperra.png",
            website_url: "https://himperra.org",
            status: "active",
            display_order: 1
          },
          {
            id: 2,
            name: "MUSDA Sponsor",
            logo_path: "/images/logo-musda.png",
            website_url: "https://musda.org",
            status: "active",
            display_order: 2
          }
        ];
        
        res.status(200).json({
          success: true,
          data: mockSponsors,
          source: 'fallback',
          error: 'Database connection failed, using mock data'
        });
      }
    }
    else if (path === '/api/countdown' || path === '/countdown') {
      try {
        const connection = await createDbConnection();
        const [rows] = await connection.execute('SELECT countdown_date FROM countdown WHERE id = 1');
        await connection.end();
        
        if (rows.length > 0) {
          res.status(200).json({
            success: true,
            countdown_date: rows[0].countdown_date
          });
        } else {
          res.status(200).json({
            success: true,
            countdown_date: new Date('2025-12-31T17:00:00')
          });
        }
      } catch (dbError) {
        console.error('Database error for countdown:', dbError);
        res.status(200).json({
          success: true,
          countdown_date: new Date('2025-12-31T17:00:00'),
          source: 'fallback',
          error: 'Database connection failed, using default date'
        });
      }
    }
    else if (path === '/api/agendas' || path === '/agendas') {
      try {
        const connection = await createDbConnection();
        const [rows] = await connection.execute('SELECT * FROM agendas ORDER BY agenda_date ASC, start_time ASC');
        await connection.end();
        
        res.status(200).json({
          success: true,
          data: rows,
          count: rows.length
        });
      } catch (dbError) {
        console.error('Database error for agendas:', dbError);
        const defaultAgendas = [
          {
            id: 1,
            title: "MUSDA HIMPERRA Lampung",
            description: "Musyawarah Daerah HIMPERRA Lampung",
            start_time: "09:00",
            end_time: "17:00",
            agenda_date: "2025-12-31",
            location: "Lampung"
          }
        ];
        
        res.status(200).json({
          success: true,
          data: defaultAgendas,
          error: 'Database connection failed, using fallback'
        });
      }
    }
    else if (path === '/api/auth/login' || path === '/auth/login') {
      if (method === 'POST') {
        try {
          // Simple admin login
          const { username, password } = req.body || {};
          
          if (username === 'admin' && password === 'admin123') {
            res.status(200).json({
              success: true,
              message: 'Login successful',
              token: 'simple-admin-token',
              user: { username: 'admin', role: 'admin' }
            });
          } else {
            res.status(401).json({
              success: false,
              message: 'Invalid credentials'
            });
          }
        } catch (error) {
          res.status(500).json({
            success: false,
            message: 'Login error',
            error: error.message
          });
        }
      } else {
        res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
      }
    }
    else if (path === '/api/gallery' || path === '/gallery') {
      try {
        const connection = await createDbConnection();
        const [rows] = await connection.execute('SELECT * FROM gallery_items ORDER BY display_order ASC');
        await connection.end();
        
        res.status(200).json({
          success: true,
          data: rows,
          count: rows.length
        });
      } catch (dbError) {
        console.error('Database error for gallery:', dbError);
        const defaultGallery = [
          {
            id: 1,
            title: "Gallery Item 1",
            image_path: "/images/gallery-1.jpg",
            display_order: 1
          },
          {
            id: 2,
            title: "Gallery Item 2", 
            image_path: "/images/gallery-2.jpg",
            display_order: 2
          }
        ];
        res.status(200).json({
          success: true,
          data: defaultGallery,
          count: defaultGallery.length,
          error: 'Database connection failed, using fallback'
        });
      }
    }
    else if (path === '/api/poster/active' || path === '/poster/active') {
      try {
        const connection = await createDbConnection();
        const [rows] = await connection.execute('SELECT * FROM poster_flyers WHERE status = "active" ORDER BY created_at DESC LIMIT 1');
        await connection.end();
        
        res.status(200).json({
          success: true,
          data: rows.length > 0 ? rows[0] : {
            id: 1,
            title: "MUSDA HIMPERRA Lampung 2025",
            image_path: "/images/default-poster.jpg",
            status: "active",
            created_at: new Date().toISOString()
          }
        });
      } catch (dbError) {
        console.error('Database error for poster:', dbError);
        res.status(200).json({
          success: true,
          data: {
            id: 1,
            title: "MUSDA HIMPERRA Lampung 2025",
            image_path: "/images/default-poster.jpg",
            status: "active",
            created_at: new Date().toISOString()
          },
          error: 'Database connection failed, using fallback'
        });
      }
    }
    // Sponsor management endpoints
    else if (path === '/api/sponsor' || path === '/sponsor') {
      if (method === 'POST') {
        try {
          const connection = await createDbConnection();
          const { name, website_url, status = 'active', display_order = 1 } = req.body;
          const [result] = await connection.execute(
            'INSERT INTO sponsors (name, website_url, status, display_order) VALUES (?, ?, ?, ?)',
            [name, website_url, status, display_order]
          );
          await connection.end();
          
          res.status(201).json({
            success: true,
            message: 'Sponsor created successfully',
            id: result.insertId
          });
        } catch (dbError) {
          console.error('Database error creating sponsor:', dbError);
          res.status(500).json({
            success: false,
            error: 'Failed to create sponsor'
          });
        }
      } else if (method === 'PUT') {
        try {
          const connection = await createDbConnection();
          const { id, name, website_url, status, display_order } = req.body;
          await connection.execute(
            'UPDATE sponsors SET name = ?, website_url = ?, status = ?, display_order = ? WHERE id = ?',
            [name, website_url, status, display_order, id]
          );
          await connection.end();
          
          res.status(200).json({
            success: true,
            message: 'Sponsor updated successfully'
          });
        } catch (dbError) {
          console.error('Database error updating sponsor:', dbError);
          res.status(500).json({
            success: false,
            error: 'Failed to update sponsor'
          });
        }
      }
    }
    else if (path.startsWith('/api/sponsor/') && method === 'DELETE') {
      try {
        const id = path.split('/')[3];
        const connection = await createDbConnection();
        await connection.execute('DELETE FROM sponsors WHERE id = ?', [id]);
        await connection.end();
        
        res.status(200).json({
          success: true,
          message: 'Sponsor deleted successfully'
        });
      } catch (dbError) {
        console.error('Database error deleting sponsor:', dbError);
        res.status(500).json({
          success: false,
          error: 'Failed to delete sponsor'
        });
      }
    }
    // Gallery endpoints
    else if (path === '/api/gallery/admin/all' || path === '/gallery/admin/all') {
      try {
        const connection = await createDbConnection();
        const [rows] = await connection.execute('SELECT * FROM gallery_items ORDER BY display_order ASC');
        await connection.end();
        
        res.status(200).json({
          success: true,
          data: rows
        });
      } catch (dbError) {
        console.error('Database error for gallery admin:', dbError);
        res.status(200).json({
          success: true,
          data: [],
          error: 'Database connection failed'
        });
      }
    }
    else if (path.startsWith('/api/gallery/') && method === 'DELETE') {
      try {
        const id = path.split('/')[3];
        const connection = await createDbConnection();
        await connection.execute('DELETE FROM gallery_items WHERE id = ?', [id]);
        await connection.end();
        
        res.status(200).json({
          success: true,
          message: 'Gallery item deleted successfully'
        });
      } catch (dbError) {
        console.error('Database error deleting gallery item:', dbError);
        res.status(500).json({
          success: false,
          error: 'Failed to delete gallery item'
        });
      }
    }
    // Poster management endpoints
    else if (path === '/api/poster/admin/all' || path === '/poster/admin/all') {
      try {
        const connection = await createDbConnection();
        const [rows] = await connection.execute('SELECT * FROM poster_flyers ORDER BY created_at DESC');
        await connection.end();
        
        res.status(200).json({
          success: true,
          data: rows
        });
      } catch (dbError) {
        console.error('Database error for poster admin:', dbError);
        const defaultPosters = [
          {
            id: 1,
            title: "MUSDA HIMPERRA Lampung 2025",
            image_path: "/images/default-poster.jpg",
            status: "active",
            created_at: new Date().toISOString()
          }
        ];
        res.status(200).json({
          success: true,
          data: defaultPosters,
          error: 'Database connection failed, using fallback'
        });
      }
    }
    // Agenda management endpoints
    else if (path.startsWith('/api/agendas/') && method === 'DELETE') {
      try {
        const id = path.split('/')[3];
        const connection = await createDbConnection();
        await connection.execute('DELETE FROM agendas WHERE id = ?', [id]);
        await connection.end();
        
        res.status(200).json({
          success: true,
          message: 'Agenda deleted successfully'
        });
      } catch (dbError) {
        console.error('Database error deleting agenda:', dbError);
        res.status(500).json({
          success: false,
          error: 'Failed to delete agenda'
        });
      }
    }
    else if (path === '/api/agendas' && method === 'POST') {
      try {
        const connection = await createDbConnection();
        const { title, description, start_time, end_time, agenda_date, location } = req.body;
        const [result] = await connection.execute(
          'INSERT INTO agendas (title, description, start_time, end_time, agenda_date, location) VALUES (?, ?, ?, ?, ?, ?)',
          [title, description, start_time, end_time, agenda_date, location]
        );
        await connection.end();
        
        res.status(201).json({
          success: true,
          message: 'Agenda created successfully',
          id: result.insertId
        });
      } catch (dbError) {
        console.error('Database error creating agenda:', dbError);
        res.status(500).json({
          success: false,
          error: 'Failed to create agenda'
        });
      }
    }
    else if (path.startsWith('/api/agendas/') && method === 'PUT') {
      try {
        const id = path.split('/')[3];
        const connection = await createDbConnection();
        const { title, description, start_time, end_time, agenda_date, location } = req.body;
        await connection.execute(
          'UPDATE agendas SET title = ?, description = ?, start_time = ?, end_time = ?, agenda_date = ?, location = ? WHERE id = ?',
          [title, description, start_time, end_time, agenda_date, location, id]
        );
        await connection.end();
        
        res.status(200).json({
          success: true,
          message: 'Agenda updated successfully'
        });
      } catch (dbError) {
        console.error('Database error updating agenda:', dbError);
        res.status(500).json({
          success: false,
          error: 'Failed to update agenda'
        });
      }
    }
    // SPH Participants endpoints
    else if (path === '/api/sph-participants' || path === '/sph-participants') {
      if (method === 'GET') {
        try {
          const connection = await createDbConnection();
          const [rows] = await connection.execute('SELECT * FROM sph_participants ORDER BY created_at DESC');
          await connection.end();
          
          res.status(200).json({
            success: true,
            data: rows
          });
        } catch (dbError) {
          console.error('Database error for sph participants:', dbError);
          res.status(200).json({
            success: true,
            data: [],
            error: 'Database connection failed'
          });
        }
      } else if (method === 'POST') {
        try {
          const connection = await createDbConnection();
          const { name, email, phone, organization, payment_status = 'pending' } = req.body;
          const [result] = await connection.execute(
            'INSERT INTO sph_participants (name, email, phone, organization, payment_status) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, organization, payment_status]
          );
          await connection.end();
          
          res.status(201).json({
            success: true,
            message: 'SPH participant created successfully',
            id: result.insertId
          });
        } catch (dbError) {
          console.error('Database error creating sph participant:', dbError);
          res.status(500).json({
            success: false,
            error: 'Failed to create participant'
          });
        }
      }
    }
    else if (path.includes('/api/sph-participants/') && path.includes('/accept-payment')) {
      try {
        const id = path.split('/')[3];
        const connection = await createDbConnection();
        await connection.execute('UPDATE sph_participants SET payment_status = "confirmed" WHERE id = ?', [id]);
        await connection.end();
        
        res.status(200).json({
          success: true,
          message: 'Payment accepted successfully'
        });
      } catch (dbError) {
        console.error('Database error accepting payment:', dbError);
        res.status(500).json({
          success: false,
          error: 'Failed to accept payment'
        });
      }
    }
    else if (path.includes('/api/sph-participants/') && path.includes('/reject-payment')) {
      try {
        const id = path.split('/')[3];
        const connection = await createDbConnection();
        await connection.execute('UPDATE sph_participants SET payment_status = "rejected" WHERE id = ?', [id]);
        await connection.end();
        
        res.status(200).json({
          success: true,
          message: 'Payment rejected successfully'
        });
      } catch (dbError) {
        console.error('Database error rejecting payment:', dbError);
        res.status(500).json({
          success: false,
          error: 'Failed to reject payment'
        });
      }
    }
    else if (path === '/api/sponsor/upload-logo' || path === '/sponsor/upload-logo') {
      if (method === 'POST') {
        // For now, return success (file upload would need more complex handling in serverless)
        res.status(200).json({
          success: true,
          message: 'Logo upload simulated (file handling not implemented in serverless)',
          logo_path: '/images/default-sponsor-logo.png'
        });
      }
    }
    else if (path.startsWith('/api/sph-participants/') && method === 'DELETE') {
      try {
        const id = path.split('/')[3];
        const connection = await createDbConnection();
        await connection.execute('DELETE FROM sph_participants WHERE id = ?', [id]);
        await connection.end();
        
        res.status(200).json({
          success: true,
          message: 'SPH participant deleted successfully'
        });
      } catch (dbError) {
        console.error('Database error deleting sph participant:', dbError);
        res.status(500).json({
          success: false,
          error: 'Failed to delete participant'
        });
      }
    }
    // Admin management endpoints
    else if (path === '/api/admin/admins' || path === '/admin/admins') {
      if (method === 'GET') {
        try {
          const connection = await createDbConnection();
          const [rows] = await connection.execute('SELECT id, username, role, created_at FROM admins ORDER BY created_at DESC');
          await connection.end();
          
          res.status(200).json({
            success: true,
            data: rows
          });
        } catch (dbError) {
          console.error('Database error for admin list:', dbError);
          res.status(200).json({
            success: true,
            data: [
              {
                id: 1,
                username: 'admin',
                role: 'super_admin',
                created_at: new Date().toISOString()
              }
            ],
            error: 'Database connection failed, using fallback'
          });
        }
      } else if (method === 'POST') {
        try {
          const connection = await createDbConnection();
          const { username, password, role = 'admin' } = req.body;
          const [result] = await connection.execute(
            'INSERT INTO admins (username, password, role) VALUES (?, ?, ?)',
            [username, password, role]
          );
          await connection.end();
          
          res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            id: result.insertId
          });
        } catch (dbError) {
          console.error('Database error creating admin:', dbError);
          res.status(500).json({
            success: false,
            error: 'Failed to create admin'
          });
        }
      }
    }
    else if (path === '/api/admin/admins/activities' || path === '/admin/admins/activities') {
      try {
        const connection = await createDbConnection();
        const [rows] = await connection.execute('SELECT * FROM admin_activities ORDER BY created_at DESC LIMIT 50');
        await connection.end();
        
        res.status(200).json({
          success: true,
          data: rows
        });
      } catch (dbError) {
        console.error('Database error for admin activities:', dbError);
        res.status(200).json({
          success: true,
          data: [],
          error: 'Database connection failed'
        });
      }
    }
    // Gallery upload endpoint
    else if (path === '/api/gallery/admin/upload-image' || path === '/gallery/admin/upload-image') {
      if (method === 'POST') {
        res.status(200).json({
          success: true,
          message: 'Image upload simulated (file handling not implemented in serverless)',
          image_path: '/images/default-gallery-image.jpg'
        });
      }
    }
    // Poster admin endpoints
    else if (path.includes('/api/poster/admin/') && path.includes('/toggle-status')) {
      try {
        const id = path.split('/')[4];
        const connection = await createDbConnection();
        await connection.execute(
          'UPDATE poster_flyers SET status = CASE WHEN status = "active" THEN "inactive" ELSE "active" END WHERE id = ?',
          [id]
        );
        await connection.end();
        
        res.status(200).json({
          success: true,
          message: 'Poster status toggled successfully'
        });
      } catch (dbError) {
        console.error('Database error toggling poster status:', dbError);
        res.status(500).json({
          success: false,
          error: 'Failed to toggle poster status'
        });
      }
    }
    else if (path.startsWith('/api/poster/admin/') && method === 'DELETE') {
      try {
        const id = path.split('/')[4];
        const connection = await createDbConnection();
        await connection.execute('DELETE FROM poster_flyers WHERE id = ?', [id]);
        await connection.end();
        
        res.status(200).json({
          success: true,
          message: 'Poster deleted successfully'
        });
      } catch (dbError) {
        console.error('Database error deleting poster:', dbError);
        res.status(500).json({
          success: false,
          error: 'Failed to delete poster'
        });
      }
    }
    else {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        requestedPath: path,
        available_endpoints: [
          '/api/health', 
          '/api/sponsors', 
          '/api/sponsor (POST/PUT/DELETE)',
          '/api/sponsor/upload-logo',
          '/api/sph-participants (GET/POST)',
          '/api/sph-participants/{id}/accept-payment',
          '/api/sph-participants/{id}/reject-payment',
          '/api/countdown', 
          '/api/agendas',
          '/api/agendas (POST/PUT/DELETE)',
          '/api/auth/login',
          '/api/gallery',
          '/api/gallery/admin/all',
          '/api/poster/active',
          '/api/poster/admin/all'
        ],
        debug: {
          originalUrl: url,
          parsedPath: path,
          method: method
        }
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      requestedUrl: url
    });
  }
};