// Setup partilhado para testes de rotas
// Mocka o sequelize antes de qualquer model ser carregado

const mockModelClass = {
  init: jest.fn(),
  belongsTo: jest.fn(),
  hasMany: jest.fn(),
  findOne: jest.fn(),
  findByPk: jest.fn(),
  findAndCountAll: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
};

jest.mock('../../lib/sequelize', () => ({
  __esModule: true,
  default: { authenticate: jest.fn(), define: jest.fn() },
}));

jest.mock('../../models/UsuarioModel', () => ({ UsuarioModel: { ...mockModelClass } }));
jest.mock('../../models/ServicoModel', () => ({ ServicoModel: { ...mockModelClass } }));
jest.mock('../../models/VeiculoModel', () => ({ VeiculoModel: { ...mockModelClass } }));
jest.mock('../../models/AgendamentoModel', () => ({ AgendamentoModel: { ...mockModelClass } }));
