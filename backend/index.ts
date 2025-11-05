// backend/index.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRouter = require('./routers/auth.router');
const userRouter = require('./routers/user.router');
const teacherRouter = require('./routers/teacher.router');
const classRouter = require('./routers/class.router');
const studentRouter = require('./routers/student.router');
const disciplineRouter = require('./routers/discipline.router');

const app = express();



// CORS — ставим ПЕРЕД cookieParser и express.json()
const corsOptions = {
  origin: ['http://localhost:3000', // для локальной разработки
           'http://45.149.235.33',  // для продакшена
           'https://45.149.235.33'  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // 👈 обязательно передай те же настройки

// чтобы res.cookie и req.cookies работали
app.use(cookieParser());
app.use(express.json());

// Регистрация и логин
app.use('/api/auth', authRouter);

// Работа с пользователями (только после verifyToken и, где нужно, authorize)
app.use('/api/users', userRouter);

// Работа с преподавателями
app.use('/api/teachers', teacherRouter);

// Работа с классами
app.use('/api/classes', classRouter);

// Работа со студентами
app.use('/api/students', studentRouter);

// Работа с дисциплинами
app.use('/api/disciplines', disciplineRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
