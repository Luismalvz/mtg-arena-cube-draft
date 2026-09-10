# Collector Booster Opening

Animación interactiva en React para abrir un sobre y revelar el booster de Ravnica Remastered.

## Ejecutar

```bash
npm install
npm run dev
```

Para generar la versión de producción:

```bash
npm run build
```

## Integrar en otro proyecto

- `src/App.jsx` contiene la interacción y el estado de apertura.
- `src/styles.css` contiene toda la composición visual y la animación 3D.
- `public/collector-booster.png` es la imagen adjunta usada dentro del sobre.

Si tu proyecto ya usa Vite, puedes copiar esos tres elementos y cambiar la ruta de `boosterImage` si guardas la imagen en otra carpeta.
