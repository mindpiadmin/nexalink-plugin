# Preview file (what the employee approves before anything is uploaded)

Write it in the employee's language. It shows each entry **as the supervisor will read it** in
NexaLink, with the screenshots that are still local. Paths to images are relative to the preview
file (it lives next to the screenshots). Nothing here goes to NexaLink until the employee says yes.

```markdown
# Reporte del <día, fecha> — vista previa

> Nada se ha subido todavía. Revisa cada entrada y dime «súbelo», o qué quieres cambiar.
> <Si el día ya está enviado: «Tu reporte de hoy ya está enviado: al subir esto, tu supervisor lo verá al momento.»>

## TAR-78B92 · MCP de NexaLink para agentes
**Trabajado · 5:00 h** · Subtareas que se marcarán como completadas: Servidor MCP del reporte diario, Autorización en la web (OAuth)

Los agentes ya pueden preparar el reporte diario y el empleado los autoriza desde la web, sin copiar claves. Falta terminar el plugin de Claude Code.

**Pasos para probarlo**
1. Abrir la sección «Agentes» del menú lateral y pulsar «Conectar tu agente»
   ![Paso 1](./TAR-78B92-paso1.png)
2. En «Tus conexiones», ver el agente con la etiqueta «Autorizada en la web»
3. Pulsar «Conectar un agente» y ver el comando, sin ninguna clave que copiar

**Evidencia**
![Resultado](./TAR-78B92-resultado.png)

**Detalle técnico** (solo auditoría): — sin PR ni commits publicados todavía
**Revisión**: 3/3 pasos ok · sin datos sensibles en las capturas

---

## TK-D3DC7 · Crear el MCP de NexaLink…
**Hoy no** — «Se reporta en TAR-78B92»

---

## Otro trabajo · Reunión de planificación
**0:30 h** — Se acordaron las prioridades de la semana.

---

**Total del día:** 5:30 h · **Al subir:** se guardan 3 entradas <y se envía el reporte / se añaden a tu reporte ya enviado>.
```

Rules:
- One section per entry, in the order of the report; not-worked rows in one line with the reason.
- The exact text, time, steps, subtasks to complete, evidence and technical detail that will be
  saved. Never a summary that differs from what will be uploaded.
- Mention anything the review left open ("paso 3 sin verificar: confírmame que lo probaste").
- Update the same file after each change and say "actualicé la vista previa".
