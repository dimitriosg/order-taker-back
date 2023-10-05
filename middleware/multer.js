// src/middleware/multer.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import storage from './gridfsStorage.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('image'), async (req, res) => {
    if (req.file) {
      res.json({ imageUrl: `/uploads/${req.file.filename}` });
    } else {
      res.status(400).json({ error: 'File not uploaded' });
    }
});

router.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      if (!file || file.length === 0) {
        return res.status(404).json({ error: 'No file exists' });
      }
  
      // Check if image
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else {
        res.status(404).json({ error: 'Not an image' });
      }
    });
});

export { upload };
export default router;
