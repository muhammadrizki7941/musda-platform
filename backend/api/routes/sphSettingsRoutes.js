const express = require('express');
const router = express.Router();
const SPHSettingsModel = require('../models/sphSettingsModel');
const sphContentModel = require('../models/sphContentModel');

// Get SPH settings
router.get('/', async (req, res) => {
  try {
    const settings = await SPHSettingsModel.getSettings();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting SPH settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving settings'
    });
  }
});

// Update SPH settings
router.put('/', async (req, res) => {
  try {
    const { countdown_target_date, max_participants, current_participants, registration_open } = req.body;
    
    const settings = {
      countdown_target_date,
      max_participants,
      current_participants,
      registration_open
    };
    
    await SPHSettingsModel.updateSettings(settings);
    
    // Get updated settings
    const updatedSettings = await SPHSettingsModel.getSettings();
    
    console.log('SPH settings updated:', updatedSettings);
    
    res.json({
      success: true,
      message: 'SPH settings updated successfully',
      data: updatedSettings
    });
  } catch (error) {
    console.error('Error updating SPH settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings'
    });
  }
});

// Get registration status
router.get('/registration-status', async (req, res) => {
  try {
    const settings = await SPHSettingsModel.getSettings();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }
    
    // Update participant count from database
    const currentParticipants = await SPHSettingsModel.getCurrentParticipantCount();
    
    const isQuotaFull = currentParticipants >= settings.max_participants;
    const canRegister = settings.registration_open && !isQuotaFull;
    
    res.json({
      success: true,
      data: {
        can_register: canRegister,
        current_participants: currentParticipants,
        max_participants: settings.max_participants,
        registration_open: settings.registration_open,
        quota_full: isQuotaFull,
        remaining_slots: Math.max(0, settings.max_participants - currentParticipants),
        countdown_target_date: settings.countdown_target_date
      }
    });
  } catch (error) {
    console.error('Error getting registration status:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving registration status'
    });
  }
});

// Frontend content endpoint dengan SPH settings integrated
router.get('/frontend-content', async (req, res) => {
  try {
    const settings = await SPHSettingsModel.getSettings();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }
    
    // Get content from sph_content database
    const [heroContent, aboutContent, sliderContent, featuresContent, registrationContent, countdownContent] = await Promise.all([
      sphContentModel.getBySection('hero'),
      sphContentModel.getBySection('about'),
      sphContentModel.getBySection('slider'),
      sphContentModel.getBySection('features'),
      sphContentModel.getBySection('registration'),
      sphContentModel.getBySection('countdown')
    ]);
    
    // Helper function to convert content array to object
    const contentToObject = (contentArray) => {
      const obj = {};
      if (Array.isArray(contentArray)) {
        contentArray.forEach(item => {
          obj[item.content_key] = item.content_value;
        });
      }
      return obj;
    };
    
    const hero = contentToObject(heroContent);
    const about = contentToObject(aboutContent);
    const slider = contentToObject(sliderContent);
    const features = contentToObject(featuresContent);
    const registration = contentToObject(registrationContent);
    const countdown = contentToObject(countdownContent);
    
    // Update participant count from database
    const currentParticipants = await SPHSettingsModel.getCurrentParticipantCount();
    
    const isQuotaFull = currentParticipants >= settings.max_participants;
    const canRegister = settings.registration_open && !isQuotaFull;
    const remainingSlots = Math.max(0, settings.max_participants - currentParticipants);
    
    res.json({
      success: true,
      data: {
        // Hero content from database
        hero: {
          title: hero.title || 'Sekolah Properti Himperra',
          subtitle: hero.subtitle || 'Membangun Masa Depan Properti Indonesia',
          description: hero.description || 'Program pendidikan terdepan untuk mengembangkan pengetahuan dan keterampilan di bidang properti dengan standar internasional.',
          cta_text: hero.cta_text || 'Daftar Sekarang'
        },
        
        // About content from database
        about: {
          title: about.title || 'Tentang Sekolah Properti',
          description: about.description || 'Properti merupakan salah satu instrumen investasi paling stabil dengan potensi return yang menarik.'
        },
        
        // Features content from database
        features: {
          title: features.title || 'Keunggulan Program',
          benefit_1_title: features.benefit_1_title || 'Strategi Investasi Terpilih',
          benefit_1_description: features.benefit_1_description || 'Pelajari teknik-teknik investasi properti yang terbukti menguntungkan dari para ahli berpengalaman.',
          benefit_2_title: features.benefit_2_title || 'Analisis Pasar Mendalam',
          benefit_2_description: features.benefit_2_description || 'Dapatkan wawasan tentang tren pasar properti Lampung dan cara mengidentifikasi peluang terbaik.',
          benefit_3_title: features.benefit_3_title || 'Simulasi Pembiayaan',
          benefit_3_description: features.benefit_3_description || 'Pelajari skema pembiayaan KPR, perhitungan cash flow, dan strategi leverage yang optimal.',
          benefit_4_title: features.benefit_4_title || 'Study Kasus Nyata',
          benefit_4_description: features.benefit_4_description || 'Analisis proyek-proyek properti sukses di Lampung dengan ROI tinggi dan risiko terukur.'
        },
        
        // Features pills for hero section from database (with dynamic participant data)
        feature_1_text: features.feature_1_text || `${remainingSlots}+ Sisa Kuota`,
        feature_1_icon: features.feature_1_icon || 'Users',
        feature_2_text: features.feature_2_text || '6 Jam Intensif',
        feature_2_icon: features.feature_2_icon || 'Clock',
        feature_3_text: features.feature_3_text || 'Sertifikat Resmi',
        feature_3_icon: features.feature_3_icon || 'Award',
        feature_4_text: features.feature_4_text || 'Modul Lengkap',
        feature_4_icon: features.feature_4_icon || 'BookOpen',
        
        // Countdown settings from database
        countdown_target_date: countdown.target_date || settings.countdown_target_date,
        countdown_title: countdown.title || (canRegister ? 'Segera Daftar!' : 'Event Berakhir Dalam'),
        countdown_subtitle: countdown.subtitle || (canRegister 
          ? 'Jangan sampai terlewat kesempatan emas ini untuk mengembangkan skill properti Anda!'
          : 'Pendaftaran telah ditutup. Terima kasih atas antusiasme Anda!'),
          
        // Registration status
        registration_status: {
          can_register: canRegister,
          current_participants: currentParticipants,
          max_participants: settings.max_participants,
          registration_open: settings.registration_open,
          quota_full: isQuotaFull,
          remaining_slots: remainingSlots
        }
      }
    });
  } catch (error) {
    console.error('Error getting frontend content:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving content'
    });
  }
});

module.exports = router;