import express from 'express';
import { router } from '../server/routes.ts';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount API router
app.use('/api', router);

export default app;
