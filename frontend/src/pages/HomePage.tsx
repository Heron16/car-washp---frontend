import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Servico, ResultadoPaginado } from '../types';
import { formatCurrency } from '../utils/validators';

function CardServico({ servico }: { servico: Servico }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
        <span className="text-2xl">🧹</span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{servico.nome}</h3>
      <p className="text-gray-500 text-sm mb-4">{servico.descricao}</p>
      <div className="flex items-center justify-between">
        <span className="text-blue-600 font-bold text-lg">{formatCurrency(servico.preco)}</span>
        <span className="text-xs text-gray-400">{servico.duracao} min</span>
      </div>
    </div>
  );
}

export function HomePage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.get<ResultadoPaginado<Servico>>('/services?limite=6')
      .then((r) => setServicos(r.data.dados))
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm mb-6">
            <span>✨</span> Lavagem profissional para seu veículo
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Seu veículo merece<br />
            <span className="text-cyan-300">o melhor cuidado</span>
          </h1>
          <p className="text-blue-200 text-lg mb-10 max-w-2xl mx-auto">
            Agende sua lavagem online, escolha o serviço ideal e deixe seu carro brilhando. Rápido, fácil e sem filas.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/cadastro" className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition shadow-lg">
              Começar agora
            </Link>
            <Link to="/login" className="border border-white/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition">
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 border-b">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          {[['500+', 'Clientes satisfeitos'], ['1.200+', 'Lavagens realizadas'], ['4.9★', 'Avaliação média']].map(([num, label]) => (
            <div key={label}>
              <p className="text-3xl font-bold text-blue-600">{num}</p>
              <p className="text-gray-500 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Nossos Serviços</h2>
            <p className="text-gray-500">Escolha o pacote ideal para o seu veículo</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicos.map((s) => <CardServico key={s.id} servico={s} />)}
          </div>
          {carregando && <p className="text-center text-gray-400 py-12">Carregando serviços...</p>}
          {!carregando && servicos.length === 0 && <p className="text-center text-gray-400 py-12">Nenhum serviço disponível no momento.</p>}
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 py-16 px-4 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Pronto para agendar?</h2>
        <p className="text-blue-100 mb-8">Crie sua conta e agende em menos de 2 minutos</p>
        <Link to="/cadastro" className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition shadow-lg inline-block">
          Criar conta grátis
        </Link>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>© 2025 AquaWash. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
