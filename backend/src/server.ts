import 'dotenv/config';
import { createApp } from './app';
import { connectDB } from './db';

const PORT = process.env.PORT ?? 4000;
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/mindx-teacher';

connectDB(MONGO_URI)
  .then(() => {
    const app = createApp();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
