const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const teacherRouter = require('./routers/teacher.router');
const registerRouter = require('./routers/register.router');
const loginRouter = require('./routers/login.router');
const userRouter = require('./routers/user.router');
const classRouter = require('./routers/class.router');
const studentRouter = require('./routers/student.router')


const app = express();

// чтобы res.cookie и req.cookies работали
app.use(cookieParser());
app.use(express.json());

// CORS с куками для всех роутов
app.use(cors({
  origin: 'http://localhost:3000',  // тот же origin, что и фронт
  credentials: true,                // разрешаем браузеру принимать и отправлять куки
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// необязательно, но коректно обрабатывать preflight
app.options('*', cors());

// теперь все ваши маршруты уже «под» этим CORS-мидлваром
app.use('/api/teachers', teacherRouter);
app.use('/api/auth/register', registerRouter);
app.use('/api/auth/login', loginRouter);
app.use('/api/users', userRouter);
app.use('/api/classes', classRouter);
app.use('/api/students', studentRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
