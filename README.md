# AquaWash — Sistema de Agendamento de Lavagem de Veículos

Stack: React + Express + MySQL + Docker + Nginx (HTTPS)

---

## Estrutura do Projeto

```
car-wash/
├── backend/          # API Express + Sequelize + TypeScript
├── frontend/         # React + Vite + Tailwind CSS
├── e2e/              # Testes end-to-end com Playwright
├── nginx/
│   ├── nginx.conf    # Proxy reverso + HTTPS + headers de segurança
│   └── certs/        # Certificados mkcert (não commitados)
├── scripts/
│   ├── gerar-certificado.sh   # Linux/Mac
│   └── gerar-certificado.ps1  # Windows
├── docker-compose.yml
├── .env.example
└── commitlint.config.js
```

---

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [mkcert](https://github.com/FiloSottile/mkcert) — para certificado HTTPS local
- [Node.js 20+](https://nodejs.org/) — para Husky e testes E2E
- [Git](https://git-scm.com/)

---

## Configuração inicial

### 1. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas senhas. **Nunca commite o `.env` real.**

### 2. Certificado HTTPS local (mkcert)

**Windows (PowerShell como Administrador):**
```powershell
winget install FiloSottile.mkcert
.\scripts\gerar-certificado.ps1
```

**Linux/Mac:**
```bash
# Instale mkcert: https://github.com/FiloSottile/mkcert#installation
chmod +x scripts/gerar-certificado.sh
./scripts/gerar-certificado.sh
```

### 3. Adicionar host local

**Windows** — edite `C:\Windows\System32\drivers\etc\hosts` como Administrador:
```
127.0.0.1  meuapp.local
```

**Linux/Mac** — edite `/etc/hosts`:
```
127.0.0.1  meuapp.local
```

### 4. Instalar dependências (Husky + commitlint)

```bash
npm install
```

---

## Rodando com Docker

```bash
docker compose up --build
```

Acesse: **https://meuapp.local**

O Nginx redireciona automaticamente HTTP → HTTPS.

### Comandos úteis

```bash
# Subir em background
docker compose up -d --build

# Ver logs
docker compose logs -f

# Parar tudo
docker compose down

# Parar e remover volumes (apaga dados do MySQL)
docker compose down -v
```

---

## Rodando localmente (sem Docker)

```bash
# MySQL deve estar rodando na porta 3306
mysql -u root -p < database.sql

# Backend
cd backend && npm install && npm run dev

# Frontend (outro terminal)
cd frontend && npm install && npm run dev
```

Acesse: http://localhost:5173

---

## Testes

### Testes unitários e de integração (backend)

```bash
cd backend && npm test
# Com cobertura:
npm run test:coverage
```

### Testes E2E (Playwright)

Requer a aplicação rodando em `https://meuapp.local`.

```bash
cd e2e
cp .env.example .env
npm install
npx playwright install chromium
npm test
```

---

## Credenciais padrão (admin)

| Campo | Valor |
|-------|-------|
| Email | `admin@aquawash.com` |
| Senha | `Admin@123` |

---

## Arquitetura Docker

```
Host (porta 80/443)
       │
    [Nginx]  ← único serviço exposto
    /     \
[frontend] [backend]  ← rede interna
               │
           [MySQL]    ← rede interna
```

- **MySQL**: dados persistidos em volume Docker (`mysql_data`)
- **Backend**: conecta ao MySQL via rede interna, nunca exposto ao host
- **Frontend**: build estático servido pelo Nginx interno
- **Nginx**: único ponto de entrada, gerencia TLS e proxy

---

## Segurança (Nginx)

Cabeçalhos HTTP configurados:

| Cabeçalho | Proteção |
|-----------|----------|
| `X-Frame-Options: SAMEORIGIN` | Clickjacking |
| `X-Content-Type-Options: nosniff` | MIME sniffing |
| `Strict-Transport-Security` | Força HTTPS (HSTS) |
| `Content-Security-Policy` | XSS e injeção de scripts |
| `Referrer-Policy` | Vazamento de URL |
| `Permissions-Policy` | Acesso a câmera/microfone/GPS |

---

## Git Flow

Organização de branches:

```
main        ← produção (protegida)
dev         ← integração de features
feature/*   ← desenvolvimento de funcionalidades
hotfix/*    ← correções urgentes em produção
```

### Fluxo de trabalho

```bash
# Nova feature
git checkout dev
git checkout -b feature/minha-feature

# Após desenvolver
git add .
git commit -m "feat(escopo): descrição da mudança"
git push -u origin feature/minha-feature

# Abrir PR: feature/* → dev
# Após aprovação e testes: dev → main
```

### Padrão de commits (Conventional Commits)

```
feat(auth): adiciona login com Google
fix(vehicles): corrige validação de placa duplicada
docs: atualiza README com instruções Docker
test(e2e): adiciona testes de CRUD de serviços
chore: atualiza dependências do backend
```

O Husky valida automaticamente a mensagem no `commit-msg` e executa os testes E2E no `pre-push`.

---

## Rotas da API

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login |

### Usuários
| Método | Rota | Acesso |
|--------|------|--------|
| POST | `/api/users/cadastrar` | Público |
| GET | `/api/users` | Admin |
| GET | `/api/users/:id` | Autenticado |
| PUT | `/api/users/:id` | Próprio usuário |
| DELETE | `/api/users/:id` | Admin |

### Serviços
| Método | Rota | Acesso |
|--------|------|--------|
| GET | `/api/services` | Público |
| GET | `/api/services/admin/todos` | Admin |
| POST | `/api/services` | Admin |
| PUT | `/api/services/:id` | Admin |
| DELETE | `/api/services/:id` | Admin |

### Veículos
| Método | Rota | Acesso |
|--------|------|--------|
| GET | `/api/vehicles/meus` | Cliente |
| GET | `/api/vehicles` | Admin |
| POST | `/api/vehicles` | Autenticado |
| PUT | `/api/vehicles/:id` | Autenticado |
| DELETE | `/api/vehicles/:id` | Autenticado |

### Agendamentos
| Método | Rota | Acesso |
|--------|------|--------|
| GET | `/api/appointments/meus` | Cliente |
| GET | `/api/appointments` | Admin |
| POST | `/api/appointments` | Autenticado |
| PATCH | `/api/appointments/:id/status` | Autenticado |
| DELETE | `/api/appointments/:id` | Autenticado |
