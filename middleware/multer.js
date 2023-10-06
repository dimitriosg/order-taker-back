// src/middleware/multer.js
import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import storage from './gridfsStorage.js';

const router = express.Router();

const getGfs = () => {
  if (!mongoose.connection.readyState) {
    return null;
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
};

const upload = multer({ storage: storage });


router.post('/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({ imageUrl: `/image/${req.file.filename}` });
  } else {
    res.status(400).json({ error: 'File not uploaded' });
  }
});

router.get('/image/:filename', (req, res) => {
  const gfs = getGfs();
  if (!gfs) {
    return res.status(500).json({ error: 'Server is not ready yet. Please try again later.' });
  }

  if (err) {
    return res.status(500).json({ error: err.message });
  }
  if (!files || files.length === 0) {
    return res.status(404).json({ error: 'No file exists' });
  }

  // Check if image
  const file = files[0];
  if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
    const readstream = gfs.openDownloadStreamByName(req.params.filename);
    readstream.on('error', err => {
      res.status(500).json({ error: err.message });
    });
    readstream.pipe(res);
  } else {
    res.status(404).json({ error: 'Not an image' });
  }
});

router.get('/all-images', async (req, res) => {
  const gfs = getGfs();
  if (!gfs) {
    return res.status(500).json({ error: 'Server is not ready yet. Please try again later.' });
  }
  
  try {
    gfs.files.find({}, { filename: 1 }).limit(10).toArray((err, files) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!files || files.length === 0) {
        return res.status(404).json({
          message: 'No files exist'
        });
      }
      const filenames = files.map(file => file.filename);
      return res.json(filenames);
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).send('Server Error');
  }
});

export { upload };
export default router;
