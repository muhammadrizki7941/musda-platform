// Simple agendas endpoint
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
    // Return default agendas
    const defaultAgendas = [
      {
        id: 1,
        title: "Pembukaan MUSDA",
        description: "Pembukaan acara MUSDA dengan sambutan-sambutan",
        start_time: "09:00",
        end_time: "10:00",
        agenda_date: "2025-12-31",
        location: "Aula Utama"
      },
      {
        id: 2,
        title: "Presentasi Laporan",
        description: "Presentasi laporan kegiatan periode sebelumnya",
        start_time: "10:00",
        end_time: "12:00",
        agenda_date: "2025-12-31",
        location: "Aula Utama"
      },
      {
        id: 3,
        title: "Diskusi & Evaluasi",
        description: "Diskusi dan evaluasi program kerja",
        start_time: "13:00",
        end_time: "15:00",
        agenda_date: "2025-12-31",
        location: "Aula Utama"
      }
    ];
    
    res.status(200).json({
      success: true,
      data: defaultAgendas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};