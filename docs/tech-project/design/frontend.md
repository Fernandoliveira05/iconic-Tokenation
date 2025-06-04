# ICONIC Frontend MVP – Documentação Detalhada

## 🔎 Visão Geral
Plataforma mobile-first baseada em React (Vite) + TailwindCSS + shadcn/ui, voltada para engajamento social e exclusividade em eventos culturais premium. A proposta visa alto engajamento por meio de:
- Paleta visual luxuosa (preto + roxo + dourado)
- Layout de navegação intuitivo com menu fixo inferior
- Funcionalidades sociais: ver comunidade, fotos, check-ins em tempo real

---

## 🌺 Paleta de Cores
- **Fundo**: `#121212` (preto elegante)
- **Texto**: `#FFFFFF` (primário), `#BFBFBF` (secundário)
- **Ação/CTA**: `#A557F2` (roxo vibrante)
- **Hover**: `#C17FF5`
- **VIP/Ícone Especial**: `#CBA135` (dourado opcional)

---

## 🔺 Navegação Inferior (Tabs)
1. **Home** (`/`) - Eventos recomendados
2. **Comunidade** (`/community`) - Todos perfis públicos
3. **Presença Live** (`/event/:id/live`) - Check-ins em tempo real
4. **Explorar** (placeholder futuro)
5. **Perfil** (`/profile`) - Dados pessoais & editar perfil

---

## 🛍️ Telas e Estratégias

### 1. Login (`/login`)
- **Componente:** `<GoogleLoginButton />`
- **Ação:** `POST /auth/login/firebase`
- **UX:** Login Google com fundo preto + CTA roxo vibrante centralizado
- **Engajamento:** Redirecionamento automático após login + mensagem aspiracional

### 2. Home (`/`)
- **Componente:** `<EventCard />`
- **Endpoint:** `GET /events/recommended`
- **Design:** Cards verticais com imagem, data, selo "Exclusivo" se for VIP
- **Estratégia UX:** Destaques de eventos urgentes com botão CTA roxo
- **Interação:** Botão "Participar" chama `POST /event-participations`

### 3. Comunidade (`/community`)
- **Componentes:** `<AvatarCard />`, `<PhotoGrid />`
- **Endpoint:** `GET /users/public` + `GET /users/public/{id}`
- **Design:** Grid com avatares e nomes, cliques abrem perfil e galeria de fotos
- **Estratégia UX:** Aproximação social, aumenta senso de comunidade
- **Ação:** Foto em destaque com borda roxa se "iconic"

### 4. Check-ins em Tempo Real (`/event/:id/live`)
- **Componentes:** `<LiveCheckins />`
- **Endpoint:** `GET /event-checkins/event/:id/checked-in-users`
- **Design:** Lista ou grid dos avatares checkados
- **Interação:** Cada avatar clicável abre `<UserPhotosModal />`
- **Motivação:** Prova social e exclusividade, efeito "quem já chegou"

### 5. Perfil (`/profile`)
- **Componentes:** `<EditableProfileForm />`, `<PhotoGridUploader />`
- **Endpoints:**
  - `GET /users/me`
  - `PATCH /users/{id}`
  - `PATCH /users/profile-picture`
  - CRUD `/user-photos`
- **Função:** Ver e editar perfil completo
- **UX:** Modal para editar + upload de até 6 fotos
- **Destaque:** Se show_public_profile = true, aparece em /community

### 6. Evento Detalhado (`/event/:id`)
- **Endpoint:** `GET /events/{id}`
- **Componentes:** `<EventBanner />`, `<EventActions />`, `<EventMeta />`
- **Interação:**
  - Participar: `POST /event-participations`
  - Cancelar: `PATCH /event-participations/{id}`
  - Ver confirmados: link para `/event/:id/participants`

### 7. Participantes Confirmados (`/event/:id/participants`)
- **Endpoint:** `GET /event-participations/event/{eventId}/confirmed-users`
- **Componente:** `<UserGallery />`
- **Interação:** Cada perfil abre `/user/:id`

### 8. Perfil Público de Outro Usuário (`/user/:id`)
- **Endpoint:** `GET /users/public/{id}`
- **Componentes:** `<UserHeader />`, `<UserPhotosGrid />`
- **Função:** Ver fotos e bio de outros membros

---

## 🤖 Componentes Base
- `<Button />`: Ação primária roxo
- `<AvatarCard />`: Avatar circular + nickname
- `<EventCard />`: Imagem + data + selo VIP
- `<PhotoGrid />`: Galeria 2~3 colunas
- `<UserHeader />`: Infos resumidas do usuário
- `<LiveCheckins />`: Stream de check-ins em tempo real

---

## 🚀 Layout Strategy & Engajamento
- **Menu inferior**: prático, alta interação com polegar
- **Cards grandes**: + cliques em eventos
- **Fotos reais**: conexão emocional com comunidade
- **Check-in Live**: gatilho de FOMO
- **Paleta escura**: valor percebido de luxo

---

## 🪜 Princípios Aplicados
- **Customer Obsession**: tela de comunidade e visual social forte
- **Frugality**: Tailwind + shadcn/ui + Lucide
- **Two-Way Door**: componentes desacoplados + contexts leves
- **Dive Deep**: mapeamento completo de endpoints e fluxos

---
