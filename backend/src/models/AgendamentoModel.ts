import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/sequelize';
import { UsuarioModel } from './UsuarioModel';
import { VeiculoModel } from './VeiculoModel';
import { ServicoModel } from './ServicoModel';

interface AtributosAgendamento {
  id: string;
  usuarioId: string;
  veiculoId: string;
  servicoId: string;
  agendadoPara: Date;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  observacoes?: string | null;
  precoTotal: number;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export interface AtributosCriacaoAgendamento
  extends Optional<AtributosAgendamento, 'id' | 'status' | 'observacoes'> {}

export class AgendamentoModel
  extends Model<AtributosAgendamento, AtributosCriacaoAgendamento>
  implements AtributosAgendamento
{
  declare id: string;
  declare usuarioId: string;
  declare veiculoId: string;
  declare servicoId: string;
  declare agendadoPara: Date;
  declare status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  declare observacoes: string | null;
  declare precoTotal: number;
  declare readonly criadoEm: Date;
  declare readonly atualizadoEm: Date;
}

AgendamentoModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    usuarioId: { type: DataTypes.UUID, allowNull: false },
    veiculoId: { type: DataTypes.UUID, allowNull: false },
    servicoId: { type: DataTypes.UUID, allowNull: false },
    agendadoPara: { type: DataTypes.DATE, allowNull: false },
    status: {
      type: DataTypes.ENUM('pendente', 'em_andamento', 'concluido', 'cancelado'),
      defaultValue: 'pendente',
      allowNull: false,
    },
    observacoes: { type: DataTypes.STRING, allowNull: true },
    precoTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  {
    sequelize,
    tableName: 'agendamento',
    timestamps: true,
    createdAt: 'criadoEm',
    updatedAt: 'atualizadoEm',
  }
);

AgendamentoModel.belongsTo(UsuarioModel, { foreignKey: 'usuarioId', as: 'usuario', onDelete: 'CASCADE' });
AgendamentoModel.belongsTo(VeiculoModel, { foreignKey: 'veiculoId', as: 'veiculo', onDelete: 'CASCADE' });
AgendamentoModel.belongsTo(ServicoModel, { foreignKey: 'servicoId', as: 'servico', onDelete: 'CASCADE' });

UsuarioModel.hasMany(AgendamentoModel, { foreignKey: 'usuarioId', as: 'agendamentos' });
VeiculoModel.hasMany(AgendamentoModel, { foreignKey: 'veiculoId', as: 'agendamentosVeiculo' });
ServicoModel.hasMany(AgendamentoModel, { foreignKey: 'servicoId', as: 'agendamentosServico' });
