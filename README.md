# AquaWash - E-commerce de Lavagem de Veículos

## Pré-requisitos
- Node.js 18+
- MongoDB rodando localmente (porta 27017)

## Rodando o projeto

### Backend
```bash
cd backend
npm run dev
# Roda na porta 3001
```

### Frontend
```bash
cd frontend
npm run dev
# Roda na porta 5173
```

## Criar admin manualmente (MongoDB)
```js
// No MongoDB shell ou Compass
db.users.updateOne({ email: "admin@email.com" }, { $set: { role: "admin" } })
```

## Rotas da API (Postman)

### Auth
- POST /api/auth/login

### Usuários
- POST /api/users/register
- GET  /api/users          (admin)
- GET  /api/users/:id      (autenticado)
- PUT  /api/users/:id      (autenticado - só o próprio)
- DELETE /api/users/:id    (admin)

### Serviços
- GET  /api/services
- GET  /api/services/admin/all  (admin)
- POST /api/services            (admin)
- PUT  /api/services/:id        (admin)
- DELETE /api/services/:id      (admin)

### Veículos
- GET  /api/vehicles/mine  (cliente)
- GET  /api/vehicles       (admin)
- POST /api/vehicles
- PUT  /api/vehicles/:id
- DELETE /api/vehicles/:id

### Agendamentos
- GET  /api/appointments/mine  (cliente)
- GET  /api/appointments       (admin)
- POST /api/appointments
- PATCH /api/appointments/:id/status
- DELETE /api/appointments/:id
