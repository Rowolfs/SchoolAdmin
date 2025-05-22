const express = require('express');
const { getAllTeachers } = require('../controllers/teachers.controller');

const router = express.Router();

router.get('/', getAllTeachers);


module.exports = router;
