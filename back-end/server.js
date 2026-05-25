require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión a PostgreSQL establecida');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✓ Modelos sincronizados');
    }

    app.listen(PORT, () => {
      console.log(`✓ ChemSystem API en http://localhost:${PORT}`);
      console.log(`  Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('✗ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
}

startServer();
