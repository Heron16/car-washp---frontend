import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Veiculo, Servico, ResultadoPaginado, ErroApi } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/validators';

function validarHorario(dataStr: string): string | null {
  const data = new Date(dataStr);
  const dia = data.getDay();
  const hora = data.getHours();
  const min = data.getMinutes();
  const totalMin = hora * 60 + min;

  if (dia === 0) return 'Não atendemos aos domingos';

  if (dia === 6) {
    if (totalMin < 480 || totalMin >= 720) return 'Sábado: atendemos das 08:00 às 12:00';
    return null;
  }

  const dentroManha = totalMin >= 480 && totalMin < 720;
  const dentroTarde = totalMin >= 810 && totalMin < 1080;
  if (!dentroManha && !dentroTarde)
    return 'Atendemos de segunda a sexta das 08:00 às 12:00 e das 13:30 às 18:00';

  return null;
}

export function NewAppointmentPage() {
  const navigate = useNavigate();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [veiculoId, setVeiculoId] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [agendadoPara, setAgendadoPara] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erroHorario, setErroHorario] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<ResultadoPaginado<Veiculo>>('/vehicles/meus?limite=50'),
      api.get<ResultadoPaginado<Servico>>('/services?limite=50'),
    ]).then(([v, s]) => { setVeiculos(v.data.dados); setServicos(s.data.dados); }).catch(() => {});
  }, []);

  const servicoSelecionado = servicos.find((s) => s.id === servicoId);

  const handleDataChange = (valor: string) => {
    setAgendadoPara(valor);
    setErroHorario(validarHorario(valor) || '');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!veiculoId || !servicoId || !agendadoPara) { toast.error('Preencha todos os campos obrigatórios'); return; }
    const erroHora = validarHorario(agendadoPara);
    if (erroHora) { toast.error(erroHora); return; }
    setLoading(true);
    try {
      await api.post('/appointments', { veiculoId, servicoId, agendadoPara, observacoes });
      toast.success('Agendamento realizado!');
      navigate('/dashboard/agendamentos');
    } catch (err: ErroApi) {
      toast.error(err?.response?.data?.mensagem || 'Erro ao agendar');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Novo Agendamento</h1>
      <p className="text-sm text-gray-500 mb-6">
        Horários: Seg–Sex 08:00–12:00 e 13:30–18:00 | Sáb 08:00–12:00
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Veículo *</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm" value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)}>
                  <option value="">Selecione um veículo</option>
                  {veiculos.map((v) => <option key={v.id} value={v.id}>{v.marca} {v.modelo} - {v.placa}</option>)}
                </select>
                {veiculos.length === 0 && <p className="text-xs text-orange-500">Cadastre um veículo primeiro</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Serviço *</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm" value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
                  <option value="">Selecione um serviço</option>
                  {servicos.map((s) => <option key={s.id} value={s.id}>{s.nome} - {formatCurrency(s.preco)}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Data e Hora *</label>
                <input
                  type="datetime-local"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm ${erroHorario ? 'border-red-400' : 'border-gray-300'}`}
                  value={agendadoPara}
                  onChange={(e) => handleDataChange(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
                {erroHorario && <p className="text-xs text-red-500">{erroHorario}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Observações</label>
                <textarea className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm resize-none" rows={3} placeholder="Alguma observação especial?" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => navigate('/dashboard/agendamentos')}>Cancelar</Button>
                <Button type="submit" className="flex-1" loading={loading} disabled={!!erroHorario}>Confirmar Agendamento</Button>
              </div>
            </form>
          </Card>
        </div>

        {servicoSelecionado && (
          <Card className="p-6 h-fit">
            <h3 className="font-semibold text-gray-900 mb-4">Resumo</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Serviço</span><span className="font-medium">{servicoSelecionado.nome}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Duração</span><span>{servicoSelecionado.duracao} min</span></div>
              <div className="border-t pt-3 flex justify-between"><span className="font-semibold">Total</span><span className="font-bold text-blue-600 text-lg">{formatCurrency(servicoSelecionado.preco)}</span></div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
