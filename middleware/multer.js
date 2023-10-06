// src/middleware/multer.js
import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import storage from './gridfsStorage.js';
import { gfs } from './gridfsStorage.js';


const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('image'), async (req, res) => {
    if (req.file) {
      res.json({ imageUrl: `/uploads/${req.file.filename}` });
    } else {
      res.status(400).json({ error: 'File not uploaded' });
    }
});

router.get('/uploads/:filename', (req, res) => {
  const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
  });

  gfs.find({ filename: req.params.filename }).toArray((err, files) => {
      if (!files || files.length === 0) {
          return res.status(404).json({
              err: 'No files exist'
          });
      }

      gfs.openDownloadStreamByName(req.params.filename).pipe(res);
  });
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

router.get('/all-images', async (req, res) => {
  try {
    gfs.files.find().toArray((err, files) => {
      // Check if files exist
      if (!files || files.length === 0) {
        return res.status(404).json({
          message: 'No files exist'
        });
      }

      // Return the list of files
      return res.json(files);
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).send('Server Error');
  }
});

export { upload };
export default router;
