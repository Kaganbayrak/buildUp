// app.js
console.log('app.js başladı');
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import projectRoutes from './routes/projects.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.get('/', (req, res) => res.send('BuildUp API Çalışıyor!'));

app.use('/api/projects', projectRoutes);

app.listen(3001, () => console.log('Server running on port 3001'));