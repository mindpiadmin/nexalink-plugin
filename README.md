# Plugin NexaLink para Claude Code

Conecta Claude Code con NexaLink (https://nexalink.cubixos.com): reporte diario, tareas desde reuniones, revisión y pruebas.

## Instalar

**App de escritorio:** Directorio → Plugins → Agregar marketplace → `mindpiadmin/nexalink-plugin` → Sincronizar, e instala **nexalink**.

**Terminal:**

```
claude plugin marketplace add mindpiadmin/nexalink-plugin
claude plugin install nexalink@nexalink
```

Luego `/reload-plugins` y `/mcp` → `plugin:nexalink:nexalink` → Authenticate, y aprueba la conexión en NexaLink.

Este repo se genera desde NexaLink (`npm run publish:agent-plugin`): no lo edites a mano.
