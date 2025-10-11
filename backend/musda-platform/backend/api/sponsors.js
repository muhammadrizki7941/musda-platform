// Simple sponsors endpoint
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    // For now, return mock data until database connection is stable
    const mockSponsors = [
      {
        id: 1,
        name: "Sponsor 1",
        logo_path: "/images/logo-himperra.png",
        website_url: "https://example.com",
        status: "active",
        display_order: 1
      },
      {
        id: 2,
        name: "Sponsor 2", 
        logo_path: "/images/logo-musda.png",
        website_url: "https://example2.com",
        status: "active",
        display_order: 2
      }
    ];
    
    res.status(200).json({
      success: true,
      data: mockSponsors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};