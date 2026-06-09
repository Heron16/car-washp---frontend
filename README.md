# AquaWash 🚗💧

Sistema de agendamento de lavagem de veículos — React + Express + MySQL + Docker.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Instalação |
|---|---|---|
| Docker Desktop | 24+ | https://www.docker.com/products/docker-desktop |
| mkcert | qualquer | `winget install FiloSottile.mkcert` |
| Node.js | 20+ | https://nodejs.org (apenas para dev local) |
| Git | qualquer | https://git-scm.com |

---

## Configuração inicial (apenas na primeira vez)

### 1. Clonar e instalar dependências raiz

```bash
git clone <url-do-repositorio>
cd car-wash
npm install
```

### 2. Criar o arquivo `.env` na raiz

Copie o exemplo e preencha as variáveis:

```bash
copy .env.example .env
```

O `.env` padrão já funciona para desenvolvimento local:

```env
MYSQL_ROOT_PASSWORD=rootpassword123
MYSQL_DATABASE=carwash
MYSQL_USER=carwash_user
MYSQL_PASSWORD=carwash_pass123

PORT=3001
DATABASE_URL=mysql://carwash_user:carwash_pass123@mysql:3306/carwash
JWT_SECRET=carwash_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d

VITE_API_URL=https://lavacar-ph.local/api
```

> ⚠️ O arquivo `.env` **nunca deve ser commitado**. Ele já está no `.gitignore`.

### 3. Gerar o certificado SSL local (mkcert)

Execute o PowerShell **como Administrador**:

```powershell
.\scripts\gerar-certificado.ps1
```

Isso gera `nginx/certs/lavacar-ph.local.pem` e `nginx/certs/lavacar-ph.local-key.pem`.

### 4. Adicionar o host local

Edite `C:\Windows\System32\drivers\etc\hosts` **como Administrador** e adicione:

```
127.0.0.1  lavacar-ph.local
```

---

## Subir a aplicação via Docker

```bash
docker compose up --build
```

Aguarde todos os serviços ficarem saudáveis (~1 minuto na primeira vez).

Acesse: **https://lavacar-ph.local**

> O Nginx redireciona automaticamente HTTP → HTTPS.

### Credenciais padrão (seed)

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | admin@aquawash.com | Admin@123 |

---

## Arquitetura Docker

```
Host (porta 80/443)
       │
    [Nginx]  ← único serviço exposto ao host
    /     \
[frontend] [backend:3001]
               │
           [MySQL:3306]
```

Todos os serviços estão na rede interna `internal`. Apenas o Nginx é acessível de fora.

### Serviços

| Serviço | Imagem | Porta interna | Exposto ao host |
|---|---|---|---|
| mysql | mysql:8.0 | 3306 | ❌ |
| backend | Dockerfile local | 3001 | ❌ |
| frontend | Dockerfile local | 80 | ❌ |
| nginx | nginx:1.25-alpine | 80, 443 | ✅ |

### Persistência de dados

O volume `mysql_data` mantém os dados do banco mesmo após `docker compose down`.
Para apagar os dados: `docker compose down -v`

---

## Desenvolvimento local (sem Docker)

### Backend

```bash
cd backend
npm install
npm run dev
```

> Requer MySQL rodando localmente. Ajuste `DATABASE_URL` no `backend/.env` para `localhost`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:5173 (proxy `/api` → `http://localhost:3001`)

---

## Testes

### Testes unitários e de integração (Jest)

```bash
# Rodar todos os testes do backend
npm run test:backend

# Com cobertura
cd backend && npm run test:coverage
```

### Testes E2E (Playwright)

> Requer a aplicação rodando em https://lavacar-ph.local

```bash
# Instalar browsers do Playwright (apenas na primeira vez)
cd e2e && npx playwright install chromium

# Rodar os testes
npm run test:e2e

# Rodar com interface visual
cd e2e && npm run test:headed

# Ver relatório HTML
cd e2e && npm run test:report
```

#### Cobertura dos testes E2E

| Arquivo | Cenários |
|---|---|
| `01-auth.spec.ts` | Login (sucesso + 3 falhas), Cadastro (sucesso + 3 falhas) |
| `02-services.spec.ts` | CRUD Serviços: criar, listar, editar, excluir + 2 falhas |
| `03-vehicles.spec.ts` | CRUD Veículos: criar, listar, editar, excluir + 2 falhas |

---

## Git Hooks (Husky)

Os hooks são instalados automaticamente com `npm install` na raiz.

| Hook | Quando dispara | O que faz |
|---|---|---|
| `commit-msg` | A cada commit | Valida mensagem com commitlint |
| `pre-push` | Antes do push | Executa testes E2E |

### Formato de commit (Conventional Commits)

```
<tipo>(<escopo opcional>): <descrição>
```

**Tipos permitidos:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `revert`

**Exemplos válidos:**
```
feat(auth): adiciona login com Google
fix(vehicles): corrige validação de placa duplicada
docs: atualiza README com instruções Docker
test(e2e): adiciona testes de agendamento
```

---

## GitFlow — Organização de branches

```
main          ← produção (apenas merges via PR)
  └── dev     ← integração (base para features)
        └── feature/<nome>   ← desenvolvimento de funcionalidades
        └── fix/<nome>       ← correções de bugs
        └── hotfix/<nome>    ← correções urgentes em produção
```

**Fluxo de trabalho:**

```bash
# Criar feature a partir de dev
git checkout dev
git pull origin dev
git checkout -b feature/minha-funcionalidade

# Desenvolver, commitar e abrir PR para dev
git push -u origin feature/minha-funcionalidade

# Após aprovação, merge em dev
# Quando dev estiver estável, merge em main via PR
```

---

## Segurança

### Cabeçalhos HTTP (Nginx)

| Cabeçalho | Proteção |
|---|---|
| `X-Frame-Options: SAMEORIGIN` | Clickjacking |
| `X-Content-Type-Options: nosniff` | MIME sniffing |
| `Strict-Transport-Security` | Força HTTPS por 1 ano |
| `Referrer-Policy` | Vazamento de URL |
| `Permissions-Policy` | Acesso a câmera/microfone/geolocalização |
| `Content-Security-Policy` | XSS e scripts maliciosos |

### Variáveis sensíveis

- Senhas, chaves JWT e credenciais de banco ficam **apenas no `.env`**
- O `docker-compose.yml` usa `${VARIAVEL}` — nunca hardcoded
- `.env` está no `.gitignore` e **nunca vai para o repositório**

---

## Comandos úteis

```bash
# Subir tudo
docker compose up --build

# Subir em background
docker compose up -d --build

# Ver logs
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f backend

# Parar tudo
docker compose down

# Parar e apagar volumes (reseta o banco)
docker compose down -v

# Rebuild de um serviço específico
docker compose up --build backend
```
