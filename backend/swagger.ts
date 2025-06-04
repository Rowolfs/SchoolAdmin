// backend/swagger.js

const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * Настройки swagger-jsdoc. 
 * Обратите внимание: в поле "apis" нужно указать все файлы, в которых вы будете
 * описывать роуты через JSDoc-комментарии (например, контроллеры).
 */
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SchoolAdmin API',
            version: '1.0.0',
            description: 'Документация REST API для SchoolAdmin',
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Локальный сервер',
            },
        ],
    },
    apis: [
        path.join(__dirname, '/controllers/*.ts'),
        path.join(__dirname, '/routers/*.ts'),
    ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

/**
 * Функция для регистрации middleware Swagger в вашем Express-приложении.
 */
function setupSwagger(app) {
    app.get('/api-docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
