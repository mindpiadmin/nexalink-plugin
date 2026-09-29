# Full examples

## 1. Task + ticket + meeting (git and what the employee said)

Rows: `TASK:…a1` "Checkout con tarjeta" (TAR-8F3A1, subtasks "Maquetar formulario", "Integrar Stripe"),
`TICKET:…b2` "Login falla en Safari" (TK-2C9D0), `TASK:…c3` "Exportar informe mensual" (TAR-77B21).

Git today: 5 commits on `feature/checkout` (PR #43 and #45), 1 commit "fix safari cookies" on `fix/safari-login` (PR #46).
Employee: "also a 30 min planning meeting; didn't touch the monthly report, waiting for accounting's data".

```json
{
  "date": "2026-09-24",
  "entries": [
    {
      "kind": "TASK", "itemId": "…a1", "worked": true,
      "content": "Ya se puede pagar con tarjeta en el checkout (formulario e integración con Stripe). Falta PayPal.",
      "minutesSpent": 300,
      "testSteps": [
        "Entrar a Tienda",
        "Añadir un producto al carrito",
        "Pagar con la tarjeta de prueba 4242 4242 4242 4242",
        { "text": "Ver el pedido como «Pagado» en Mis pedidos", "image": "/uploads/1727190000002-mis-pedidos.png" }
      ],
      "completedItemIds": ["<id of «Maquetar formulario»>", "<id of «Integrar Stripe»>"],
      "evidences": [{ "kind": "FILE", "fileUrl": "/uploads/1727190000000-pedido-pagado.png", "fileName": "pedido-pagado.png", "mimeType": "image/png" }],
      "techRefs": [
        { "kind": "PR", "url": "https://github.com/acme/shop/pull/43", "label": "PR #43 Checkout form" },
        { "kind": "PR", "url": "https://github.com/acme/shop/pull/45", "label": "PR #45 Stripe" },
        { "kind": "BRANCH", "url": "https://github.com/acme/shop/tree/feature/checkout", "label": "feature/checkout" }
      ]
    },
    {
      "kind": "TICKET", "itemId": "…b2", "worked": true,
      "content": "Los usuarios de Safari ya pueden iniciar sesión.",
      "minutesSpent": 60,
      "testSteps": ["En Safari, entrar con un usuario de prueba desde la pantalla de acceso", "Ver que se abre el panel principal"],
      "evidences": [{ "kind": "FILE", "fileUrl": "/uploads/1727190000001-safari.png", "fileName": "safari.png", "mimeType": "image/png" }],
      "techRefs": [{ "kind": "PR", "url": "https://github.com/acme/shop/pull/46", "label": "PR #46" }]
    },
    { "kind": "TASK", "itemId": "…c3", "worked": false, "notWorkedReason": "Esperando los datos de contabilidad." },
    {
      "kind": "FREE", "title": "Reunión de planificación del sprint",
      "content": "Se acordaron las prioridades de la semana: checkout y exportaciones.",
      "minutesSpent": 30,
      "evidences": [{ "kind": "LINK", "url": "https://docs.example.com/acta-planificacion" }]
    }
  ]
}
```

The employee confirmed that both subtasks of the checkout were finished today, so their ids go in
`completedItemIds`: they are completed in the task when the report is sent. The ticket has no
subtasks. The planning meeting has no task, so it's an "Otro trabajo" entry.

## 2. No assigned tasks, only what the employee tells

"Hoy estuve en la reunión de planificación, atendí a un cliente por teléfono y arreglé el login en Safari."
→ three "Otro trabajo" entries, one per activity; ask time and evidence for each. The Safari fix
has no ticket → title "Login en Safari (sin ticket)"; its evidence is a screenshot, its PR goes in `techRefs`.

## 3. Task that continues from yesterday

`get_item_history` shows yesterday: "La pantalla de alta ya está maquetada." Today's work was the API integration.
→ today's text: "El alta ya guarda los clientes nuevos. Falta validar el NIF." (does not repeat the layout).

## 4. Commits only local

The branch is not pushed. → Do not use the hashes. Offer `git push -u origin <branch>` or opening a PR.
If the employee declines, save the entry with `techRefs: []`.

## 5. Subtasks: only some finished

Row `TASK:…d4` "Panel de ventas" has 5 subtasks; 2 were already completed on earlier days
(`isCompleted: true`, don't offer them). You ask about the 3 open ones; the employee says
"terminé «Gráfico mensual», el filtro por tienda lo dejé a medias".
→ `completedItemIds: ["<id of «Gráfico mensual»>"]`; the text: "Ya se ve el gráfico de ventas del
mes. Falta el filtro por tienda." (the half-done subtask is only named in the text).

## 6. A link to the system

The employee says the new screen is live on the test environment at
`https://test.acme.com/informes/ventas`. → `evidences: [{ "kind": "LINK", "url": "https://test.acme.com/informes/ventas" }]`
(plus a screenshot if the supervisor has no access to that environment). The CI run that deployed
it → `techRefs: [{ "kind": "OTHER", "url": "https://github.com/acme/shop/actions/runs/123", "label": "Despliegue en test" }]`.
If the only link is `http://localhost:5173/…`, don't use it: take a screenshot.
