

require('dotenv').config();
console.log('→ DATABASE_URL:', process.env.DATABASE_URL);
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const teachersRouter = require('./routers/teachers.router');
const registerRouter = require('./routers/register.router');
const loginRouter = require('./routers/login.router')

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/teachers', teachersRouter);
app.use('/api/auth/register', registerRouter);
app.use('/api/auth/login', loginRouter);

app.use(cors({
  origin: 'http://localhost:3000',   // your Next.js dev server
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true                  // if you ever send cookies
}))

app.options('*', cors())

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
