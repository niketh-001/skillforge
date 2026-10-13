const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { generalLimiter } = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');

const app = express();

// ============ SECURITY ============
app.use(helmet());

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? [process.env.CLIENT_URL]
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

app.use('/api', generalLimiter);

// ============ BODY PARSING ============
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============ SANITIZATION ============
app.use(mongoSanitize());
app.use(xss());

// ============ COMPRESSION ============
app.use(compression());

// ============ LOGGING ============
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// ============ API DOCS ============
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SkillForge API Documentation',
  })
);

// ============ ROUTES ============
app.use('/api/v1', routes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SkillForge API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/api/v1/health',
  });
});

// ============ ERROR HANDLING ============
app.use(notFound);
app.use(errorHandler);

module.exports = app;