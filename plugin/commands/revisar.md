---
description: Revisa lo que hay en tu rama contra su tarea de NexaLink (criterios, subtareas y prueba en el navegador) sin tocar nada
argument-hint: "[TAR-XXXXX | TK-XXXXX] (opcional si la rama ya lo tiene)"
disable-model-invocation: true
---

Usa la skill **nexalink-work**, sección «Review the branch», para revisar lo que hay en esta rama
contra su tarea. $ARGUMENTS

Toma el código de la tarea de los argumentos, del nombre de la rama o de los commits (`Refs:`); si
no aparece, pregunta cuál es.

1. Lanza el subagente **`nexalink-pr-reviewer`** con el código, la rama base y la URL local de la
   app si la conoces. Revisa todo lo de la rama, también lo que aún no está commiteado.
2. Dame el veredicto por criterio (✅ cumple / ❌ no cumple / ⚠️ no verificable) con su evidencia,
   las subtareas cubiertas y los pasos para probarlo con sus capturas.
3. Si algo no cumple, dímelo primero y pregunta si lo arreglamos. Tras arreglarlo se puede volver a
   revisar con este mismo comando.

No modifiques código, no hagas commit, no crees el PR ni escribas nada en NexaLink: el PR se crea
después con `/nexalink:pr`.
