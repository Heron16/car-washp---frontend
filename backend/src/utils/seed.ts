import bcrypt from 'bcryptjs';
import { UsuarioModel } from '../models/UsuarioModel';

export async function seedAdmin() {
  const existe = await UsuarioModel.findOne({ where: { email: 'admin@aquawash.com' } });
  if (existe) return;

  const senhaCriptografada = await bcrypt.hash('Admin@123', 12);
  await UsuarioModel.create({
    nome: 'Administrador',
    email: 'admin@aquawash.com',
    senha: senhaCriptografada,
    cpf: '11144477735',
    perfil: 'admin',
  });

  console.log('✅ Admin criado: admin@aquawash.com / Admin@123');
}
