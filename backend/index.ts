require('dotenv').config();
console.log('→ DATABASE_URL:', process.env.DATABASE_URL);
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const teachersRouter = require('./routers/teachers.router');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/teachers', teachersRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
