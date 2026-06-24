import { VeiculoModel } from '../models/VeiculoModel';
import { UsuarioModel } from '../models/UsuarioModel';
import { ConsultaPaginacao, DadosCriacaoVeiculo } from '../types';
import { getPaginationParams, paginate } from '../utils/pagination';

export class VeiculoService {
  async criar(dados: DadosCriacaoVeiculo) {
    if (!dados.marca || !dados.modelo || !dados.placa || !dados.cor)
      throw new Error('Todos os campos são obrigatórios');

    const existe = await VeiculoModel.findOne({ where: { placa: dados.placa.toUpperCase() } });
    if (existe) throw new Error('Placa já cadastrada');

    return VeiculoModel.create({ ...dados, placa: dados.placa.toUpperCase() });
  }

  async listarPorUsuario(usuarioId: string, consulta: ConsultaPaginacao) {
    const { currentPage, pageLimit, skip } = getPaginationParams(consulta.pagina, consulta.limite);
    const { rows: dadosLista, count: total } = await VeiculoModel.findAndCountAll({
      where: { usuarioId },
      offset: skip,
      limit: pageLimit,
      order: [['criadoEm', 'DESC']],
    });
    return paginate(dadosLista, total, currentPage, pageLimit);
  }

  async listarTodos(consulta: ConsultaPaginacao) {
    const { currentPage, pageLimit, skip } = getPaginationParams(consulta.pagina, consulta.limite);
    const { rows: dadosLista, count: total } = await VeiculoModel.findAndCountAll({
      offset: skip,
      limit: pageLimit,
      include: [{ model: UsuarioModel, as: 'usuario', attributes: ['nome', 'email'] }],
      order: [['criadoEm', 'DESC']],
    });
    return paginate(dadosLista, total, currentPage, pageLimit);
  }

  async atualizar(id: string, usuarioId: string, dados: Partial<DadosCriacaoVeiculo>) {
    const veiculo = await VeiculoModel.findOne({ where: { id, usuarioId } });
    if (!veiculo) throw new Error('Veículo não encontrado ou sem permissão');
    await veiculo.update(dados);
    return veiculo;
  }

  async excluir(id: string, usuarioId: string, isAdmin: boolean) {
    const condicao = isAdmin ? { id } : { id, usuarioId };
    const veiculo = await VeiculoModel.findOne({ where: condicao });
    if (!veiculo) throw new Error('Veículo não encontrado ou sem permissão');
    await veiculo.destroy();
  }
}
