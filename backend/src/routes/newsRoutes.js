const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/newsController');
const { uploadThumbnail } = require('../controllers/newsUploadController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { getById } = require('../models/newsModel');
const { dbPromise: db } = require('../utils/db');
const fs = require('fs');
const path = require('path');

// Debug logging middleware (development only)
router.use((req, res, next) => {
	if (process.env.NODE_ENV !== 'production') {
		console.log('[NEWS ROUTE]', req.method, req.originalUrl, 'Auth?', !!req.headers.authorization);
	}
	next();
});

// Public
router.get('/news', ctrl.listPublic);
router.get('/news/:slug', ctrl.detail);
router.post('/news/:slug/like', ctrl.like);
router.get('/news/:slug/comments', ctrl.comments);
router.post('/news/:slug/comments', ctrl.comment);

// Admin
router.get('/admin/news', authMiddleware, adminMiddleware, ctrl.listAdmin);
router.get('/admin/news/:id', authMiddleware, adminMiddleware, async (req,res)=>{
    try {
		const article = await getById(req.params.id);
		if (!article) return res.status(404).json({ error:'Not found' });
		article.thumbnail_url = article.thumbnail_path || null;
		article.status = article.is_published ? 'published' : 'draft';
		res.json({ success:true, article });
	} catch(e){ res.status(500).json({ error:'Failed detail'}); }
});
router.post('/admin/news', authMiddleware, adminMiddleware, ctrl.create);
router.put('/admin/news/:id', authMiddleware, adminMiddleware, ctrl.update);
router.post('/admin/news/upload-thumbnail', authMiddleware, adminMiddleware, uploadThumbnail);
router.delete('/admin/news/:id/thumbnail', authMiddleware, adminMiddleware, async (req,res)=>{
	try {
		const article = await getById(req.params.id);
		if (!article) return res.status(404).json({ error:'Not found' });
		if (article.thumbnail_path) {
			const filePath = path.join(__dirname,'../../../', article.thumbnail_path.replace(/^\/+/,'').replace(/\.\.+/g,''));
			fs.unlink(filePath, ()=>{});
		}
		await db.query('UPDATE news_articles SET thumbnail_path = NULL, updated_at = NOW() WHERE id = ?', [req.params.id]);
		res.json({ success:true, removed:true });
	} catch(e){ res.status(500).json({ error:'Failed delete thumbnail'}); }
});
router.patch('/admin/news/comments/:id/approve', authMiddleware, adminMiddleware, ctrl.approveComment);
router.delete('/admin/news/comments/:id', authMiddleware, adminMiddleware, ctrl.deleteComment);

module.exports = router;
