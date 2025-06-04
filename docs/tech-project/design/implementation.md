A seguir, apresentamos a descrição profissional e atualizada da **arquitetura do backend ICONIC**, com foco exclusivo no backend NestJS e na utilização da fila BullMQ para o fluxo de **inscrição em eventos**.

---

## 🧱 Arquitetura Backend ICONIC

A arquitetura backend é baseada em microcamadas bem definidas, utilizando o NestJS como framework principal, com Prisma como ORM, Supabase (PostgreSQL) como banco e Redis para filas de background com BullMQ.

Abaixo, apresento a visualização no formato **Mermaid** que pode ser usada diretamente em Markdown (ex: Notion, GitHub ou Docusaurus).

---

## ✅ Destaques da Arquitetura

### Serviços utilizados:

| Componente             | Tecnologia                     |
|------------------------|---------------------------------|
| Framework backend      | NestJS                         |
| ORM                    | Prisma                         |
| Banco de dados         | Supabase (PostgreSQL)          |
| Autenticação           | Firebase Auth (OAuth2 - Google)|
| Fila de background     | BullMQ (Redis via @nestjs/bull)|
| Armazenamento de mídia | Supabase Storage               |

### Fluxo com Fila (BullMQ):
- Apenas a inscrição em evento (`event-participation`) utiliza a fila.
- O job é enfileirado para processamento posterior por `ParticipationProcessor`.
- Isso garante que, em eventos de alta demanda, a concorrência de vagas seja tratada de forma ordenada e performática.

### Segurança:
- Todas as rotas protegidas usam `JwtAuthGuard`.
- Validações de acesso granular via `RolesGuard` e `SelfOrAdminGuard`.
- Autorização baseada em roles (`admin`, `user`, `iconic`, `scanner`).
