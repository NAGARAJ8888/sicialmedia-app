import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import { clerkMiddleware } from '@clerk/express'
import userRouter from './routes/userRoutes.js';
import postRouter from './routes/postRoutes.js';
import storyRouter from './routes/storyRoutes.js';
import messageRouter from './routes/messageRoutes.js';

const app = express();
await connectDB();

// CORS should be before other middleware
app.use(cors());

// Only parse JSON/urlencoded for non-multipart requests
// This middleware will skip requests with Content-Type: multipart/form-data
app.use((req, res, next) => {
  const contentType = req.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    // Skip body parsing for multipart requests (file uploads)
    return next();
  }
  express.json()(req, res, next);
});

app.use((req, res, next) => {
  const contentType = req.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    return next();
  }
  express.urlencoded({ extended: true })(req, res, next);
});

app.use(clerkMiddleware());

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/message", messageRouter);

app.get('/', (req, res) => res.send("server is running"));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`app listening on port ${PORT}`))