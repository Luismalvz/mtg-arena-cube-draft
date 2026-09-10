# MTG Arena Cube Draft — Central Market Exchange

Aplicación web multijugador para Magic: The Gathering Cube Draft con mecánica interactiva de intercambio atómico con el Pool Central ("La Arena").

## Características
- **Mecánica Central Arena:** Intercambio atómico y en tiempo real de cartas entre tu sobre y el pool público.
- **Modo Solo con Bots y Multijugador:** Juega solo con 1-7 bots de IA o invita a tus amigos mediante código de sala.
- **Exportación a Tabletop Simulator (TTS):** 1 clic para copiar la lista de cartas en formato estándar compatible con importadores de MTG en TTS.
- **Animaciones fluidas:** Desarrollado con React, Tailwind CSS, Framer Motion y Web Audio API.

---

## Cómo desplegar gratis en Render.com

1. **Sube este proyecto a tu GitHub:**
   ```bash
   git add .
   git commit -m "feat: MTG Arena Cube Draft app"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

2. **Entra a [Render.com](https://render.com) e inicia sesión con tu GitHub.**

3. **Crea un nuevo Web Service:**
   - Haz clic en **"New +"** -> **"Web Service"**.
   - Selecciona tu repositorio de GitHub.
   - Configuración:
     - **Name:** `mtg-arena-cube-draft` (o el nombre que prefieras)
     - **Runtime:** `Node`
     - **Build Command:** `npm run build`
     - **Start Command:** `npm start`
     - **Plan:** `Free`

4. **Haz clic en "Deploy Web Service".**
   - Render instalará las dependencias, compilará el frontend y levantará el servidor Socket.io.
   - Te dará una URL pública tipo `https://mtg-arena-cube-draft.onrender.com` que podrás compartir con tus amigos en cualquier parte del mundo.

---

## Ejecución en Local (Desarrollo)

```bash
# Iniciar servidor y cliente simultáneamente:
npm run dev

# Abrir en el navegador:
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
```
