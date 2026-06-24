import sequelize from './lib/sequelize';
import { seedAdmin } from './utils/seed';
import app from './app';

import './models/UsuarioModel';
import './models/ServicoModel';
import './models/VeiculoModel';
import './models/AgendamentoModel';

const PORT = process.env.PORT || 3001;

async function main() {
  await sequelize.authenticate();
  console.log('MySQL conectado via Sequelize');
  await sequelize.sync({ alter: false });
  console.log('Tabelas sincronizadas');
  await seedAdmin();
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}

main().catch((err) => {
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});
