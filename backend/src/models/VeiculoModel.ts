import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/sequelize';
import { UsuarioModel } from './UsuarioModel';

interface AtributosVeiculo {
  id: string;
  usuarioId: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  cor: string;
  tipo: 'carro' | 'moto' | 'caminhao' | 'suv';
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export interface AtributosCriacaoVeiculo extends Optional<AtributosVeiculo, 'id'> {}

export class VeiculoModel
  extends Model<AtributosVeiculo, AtributosCriacaoVeiculo>
  implements AtributosVeiculo
{
  declare id: string;
  declare usuarioId: string;
  declare marca: string;
  declare modelo: string;
  declare ano: number;
  declare placa: string;
  declare cor: string;
  declare tipo: 'carro' | 'moto' | 'caminhao' | 'suv';
  declare readonly criadoEm: Date;
  declare readonly atualizadoEm: Date;
}

VeiculoModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    usuarioId: { type: DataTypes.UUID, allowNull: false },
    marca: { type: DataTypes.STRING, allowNull: false },
    modelo: { type: DataTypes.STRING, allowNull: false },
    ano: { type: DataTypes.INTEGER, allowNull: false },
    placa: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    cor: { type: DataTypes.STRING, allowNull: false },
    tipo: {
      type: DataTypes.ENUM('carro', 'moto', 'caminhao', 'suv'),
      defaultValue: 'carro',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'veiculo',
    timestamps: true,
    createdAt: 'criadoEm',
    updatedAt: 'atualizadoEm',
  }
);

VeiculoModel.belongsTo(UsuarioModel, { foreignKey: 'usuarioId', as: 'usuario', onDelete: 'CASCADE' });
UsuarioModel.hasMany(VeiculoModel, { foreignKey: 'usuarioId', as: 'veiculos' });
