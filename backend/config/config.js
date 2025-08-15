const config = {
  development: {
    mongoUri: process.env.MONGODB_URI,
    port: process.env.PORT || 5000,
    corsOrigin: 'http://localhost:5173',
    jwtSecret: process.env.JWT_SECRET,
    nodeEnv: 'development'
  },
  production: {
    mongoUri: process.env.MONGODB_URI,
    port: process.env.PORT || 5000,
    corsOrigin: process.env.FRONTEND_URL,
    jwtSecret: process.env.JWT_SECRET,
    nodeEnv: 'production'
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
