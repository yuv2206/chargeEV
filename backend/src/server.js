import app from './app.js';
import { pool } from './config/db.js';

const port = process.env.PORT || 5000;

pool
  .connect()
  .then((client) => {
    client.release();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  });

