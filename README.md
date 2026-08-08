# 🍔 Chun-Burger — USF IV Lobby Manager

> Organizá partidas de **Ultra Street Fighter IV** desde Discord: guardá tu perfil de Steam, compartí tu lobby activo y resolvé desafíos FT sin salir del servidor.

[![NestJS](https://img.shields.io/badge/API-NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Discord.js](https://img.shields.io/badge/Bot-discord.js-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js-5FA04E?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

## ¿Qué hace?

Chun-Burger conecta a la comunidad de USF IV con Steam y Discord para reducir el tiempo entre el “¿jugamos?” y el “¡fight!”. El proyecto se compone de dos servicios:

| Componente | Tecnología | Responsabilidad |
| --- | --- | --- |
| API | NestJS + TypeScript | Persiste usuarios y duelos, resuelve perfiles de Steam y encuentra lobbies activos. |
| Bot | Node.js + discord.js | Ofrece comandos de Discord, publica lobbies y gestiona desafíos. |

```text
Discord ──► Bot ──► API NestJS ──► Supabase
                 │
                 └──────────────► Steam Web API
```

## Funcionalidades

- Vinculación de perfiles de Steam mediante URL numérica o vanity URL.
- Búsqueda de lobby activo de **Ultra Street Fighter IV**.
- Publicación del enlace de unión directamente en Discord.
- Desafíos `First To X` con botones para registrar al ganador.
- Historial de duelos guardado en Supabase.

## Requisitos

- Node.js 20 o superior recomendado.
- Una aplicación de Discord y su token de bot.
- Una clave de [Steam Web API](https://steamcommunity.com/dev/apikey).
- Un proyecto de Supabase con las tablas `users` y `duel_history`.

## Instalación

Cloná el repositorio e instalá las dependencias de cada servicio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd usf4-lobby-manager

# API
npm install

# Bot
cd discord-bot
npm install
```

## Configuración

Creá un archivo `.env` en la raíz para la API:

```env
# Puerto de NestJS (por defecto: 3000)
PORT=3000

# Steam Web API
STEAM_API_KEY=tu_clave_de_steam

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_clave_de_supabase
```

Luego creá `discord-bot/.env` para el bot:

```env
DISCORD_BOT_TOKEN=tu_token_de_discord

# URL pública o local de la API NestJS
API_URL=http://localhost:3000

# Puerto del pequeño servidor HTTP del bot.
# Usá uno diferente al de la API si corrés ambos localmente.
PORT=3001
```

> No subas archivos `.env`: contienen credenciales y ya están excluidos por `.gitignore`.

## Ejecutar el proyecto

Iniciá primero la API, desde la raíz del repositorio:

```bash
npm run start:dev
```

La API queda disponible en `http://localhost:3000` de forma predeterminada.

En otra terminal, iniciá el bot:

```bash
cd discord-bot
node index.js
```

Al conectarse, el bot registra automáticamente sus slash commands en Discord.

## Comandos de Discord

| Comando | Descripción |
| --- | --- |
| `/setsteam <steam_profile>` | Guarda el enlace o ID de tu perfil de Steam. |
| `/lobby` | Busca y comparte tu lobby activo de USF IV. |
| `/duel <jugador> <ft>` | Reta a alguien a una serie First To X. |
| `/help` | Muestra la ayuda dentro de Discord. |
| `/about` | Presenta a Chun-Burger. |

Cuando termina un duelo, cualquiera de los dos botones de ganador registra el resultado en la API y deshabilita la selección para evitar duplicados.

## Endpoints de la API

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/` | Estado básico de la API. |
| `POST` | `/users` | Crea o actualiza la relación entre usuario de Discord y perfil de Steam. |
| `GET` | `/steam/lobby/:discordId` | Devuelve el lobby activo asociado al usuario. |
| `POST` | `/users/duels` | Guarda el resultado de un desafío. |

Ejemplo para registrar un perfil:

```bash
curl -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{
    "discordId": "123456789",
    "discordUser": "chunli",
    "steamProfile": "https://steamcommunity.com/id/mi-perfil"
  }'
```

## Base de datos

La API espera, como mínimo, estas columnas:

- `users`: `discord_id`, `discord_user`, `steam_profile`, `steam_ID`.
- `duel_history`: `challenger_discord_id`, `opponent_discord_id`, `winner_discord_id`, `ft`, `game`.

Conviene definir una restricción única para `users.discord_id`, así `upsert` puede actualizar correctamente el perfil de cada jugador.

## Scripts de la API

| Comando | Acción |
| --- | --- |
| `npm run start:dev` | Inicia NestJS en modo desarrollo con recarga. |
| `npm run build` | Compila la API en `dist/`. |
| `npm run start:prod` | Ejecuta la versión compilada. |
| `npm run test` | Corre los tests unitarios. |
| `npm run test:e2e` | Corre los tests end-to-end. |
| `npm run lint` | Revisa y corrige el estilo con ESLint. |

## Estructura

```text
.
├── src/
│   ├── database/           # Módulo global y cliente de Supabase
│   ├── steam/              # Steam Web API y consulta de lobbies
│   │   └── steam-api/      # Integración reutilizable con Steam Web API
│   └── users/              # DTOs, repositorio, perfiles y registro de duelos
├── discord-bot/
│   ├── handlers/           # Interacciones de Discord
│   └── architecture.puml   # UML del bot
└── test/                   # Pruebas e2e de la API
```

---

Hecho con ❤️ para que haya menos tiempo buscando salas y más **Hadoukens, Kikoshos y GG**. 🥊
