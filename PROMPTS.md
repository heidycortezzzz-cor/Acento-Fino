# PROMPTS.md — Acento Fino

Registro real de los prompts que dirigí al agente de IA mientras construía el
proyecto. Cada entrada tiene el prompt **tal como lo envié** y una línea con lo
que hizo el agente, indicando si hubo que corregir algo.

> Este archivo se escribe **en el momento**, no al final de memoria. Soy el
> estudiante responsable de mantenerlo al día.

---

## Prompt 1 — Encargo completo (arranque del proyecto)

**Indicación previa:** el directorio `Acento-Fino` estaba vacío (0 archivos, sin
`node_modules` ni `.git`). El agente comprobó Node `v24.20.0` y npm `11.19.0`.

**Prompt enviado (textual):**

```text
# PROYECTO 05: ACENTO FINO — JUEGO EDUCATIVO DE ORTOGRAFÍA
Actúa como un desarrollador senior especializado en TypeScript, Vite, diseño web responsivo y pruebas automatizadas. Necesito que me ayudes a desarrollar una aplicación web funcional llamada **Acento Fino**, correspondiente al encargo número 05 de la práctica de Desarrollo de Software de A, tercer año de bachillerato.

## 1. OBJETIVO DEL PROYECTO

Crear un juego educativo en español donde el jugador debe identificar y colocar correctamente las tildes en palabras antes de que se termine el tiempo.

La característica especial del juego es que, al terminar la partida, debe mostrar en qué tipo de palabras se equivocó más el jugador y ofrecerle una explicación educativa.

El proyecto debe ser funcional, atractivo, fácil de usar y compatible con computadoras y teléfonos celulares.

## 2. TECNOLOGÍAS OBLIGATORIAS

Utiliza las siguientes tecnologías:

* Vite para ejecutar y compilar la aplicación web.
* TypeScript para toda la lógica del juego.
* HTML5 para la estructura.
* CSS3 para el diseño visual.
* Vitest para las pruebas automatizadas.

No utilices imágenes externas ni librerías visuales adicionales. No agregues funcionalidades que no sean necesarias para completar la práctica.

Antes de comenzar, revisa los archivos existentes del proyecto. Conserva la configuración que ya funciona y no sobrescribas archivos importantes sin comprobar su contenido.

## 3. FUNCIONAMIENTO DEL JUEGO

Implementa estas funcionalidades:

1. **Pantalla de inicio:** mostrar el nombre Acento Fino, una breve explicación y el botón «Comenzar».
2. **Juego por rondas:** mostrar una palabra sin tilde, o con una tilde incorrecta, y varias opciones para seleccionar la escritura correcta.
3. **Temporizador:** establecer una duración configurable de 60 segundos por partida.
4. **Puntuación:** sumar puntos por respuestas correctas y registrar las respuestas incorrectas.
5. **Retroalimentación:** indicar si la respuesta es correcta y mostrar una explicación breve.
6. **Clasificación de palabras:** distinguir palabras agudas, graves o llanas, esdrújulas y sobresdrújulas cuando corresponda.
7. **Final de la partida:** terminar cuando el tiempo llegue a cero o se cumpla otra condición de finalización claramente definida.
8. **Resultados:** mostrar puntuación, respuestas correctas, errores y porcentaje de aciertos.
9. **Análisis de errores:** identificar la categoría en la que el jugador cometió más errores y recomendar practicar esa categoría.
10. **Reiniciar:** permitir comenzar una partida nueva sin conservar incorrectamente el estado anterior.

Usa un conjunto inicial de palabras españolas con sus respuestas correctas, opciones y explicaciones. Verifica cuidadosamente la ortografía de cada palabra.

Evita repetir palabras durante una misma partida mientras existan suficientes palabras disponibles.

## 4. REGLAS DE PROGRAMACIÓN

Crea y mantén esta separación:

* `src/logica.ts`: reglas, configuración, estado, puntuación, tiempo y análisis de resultados.
* `src/main.ts`: interacción con la interfaz y representación de los datos.
* `src/estilo.css`: estilos de la aplicación.
* `test/logica.test.ts`: pruebas automatizadas.
* `PROMPTS.md`: registro real de los prompts utilizados.
* `README.md`: documentación del proyecto.

Si el proyecto ya tiene archivos equivalentes, adapta la estructura sin duplicar innecesariamente archivos.

En `src/logica.ts`:

* Exporta los tipos necesarios y un objeto `CONFIG` con todos los valores numéricos configurables agrupados al inicio y comentados con sus unidades.
* No uses `document`, `window`, `alert` ni `console.log`.
* Mantén la lógica independiente de la pantalla.
* Las funciones que cambian el estado deben indicar claramente si la acción fue válida mediante un resultado booleano.
* Valida las respuestas y evita que una misma pregunta puntúe dos veces.
* Controla correctamente el inicio, la finalización y el reinicio.
* Si utilizas aleatoriedad, emplea un generador con semilla para poder probar resultados reproducibles.
* Escribe el código y los comentarios en español.

No inventes requisitos que contradigan estas instrucciones. Si encuentras una decisión importante que no esté definida, explícala antes de ampliar el alcance.

## 5. DISEÑO VISUAL
[...]
## 6. COMPATIBILIDAD CON CELULARES
[...]
## 7. PRUEBAS AUTOMATIZADAS
[...]
## 8. DOCUMENTACIÓN
[...]
## 9. VALIDACIÓN
[...]
## 10. FORMA DE TRABAJO
[...]

Mi proyecto corresponde exclusivamente al encargo número 05: **ACENTO FINO — poner la tilde donde va, contra el reloj, y descubrir en qué tipo de palabra me equivoco más**.
```

> Nota de honestidad: el prompt original tenía las secciones 1 a 10 completas.
> Aquí dejé íntegras las secciones 1 a 4 (las más decisivas para la lógica) y
> marqué con `[...]` las secciones de diseño, móvil, pruebas, documentación,
> validación y forma de trabajo, que ya quedan reflejadas en el resto del
> proyecto. En el chat original viajaron completas.

**Qué hizo el agente:**

- Confirmó que el directorio estaba vacío y creó el proyecto Vite + TypeScript +
  Vitest desde cero (andamiaje, `tsconfig.json`, `vite.config.ts`, `index.html`).
- Creó la estructura pedida: `src/logica.ts`, `src/main.ts`, `src/estilo.css`,
  `test/logica.test.ts`.
- Puso toda la lógica independiente de la pantalla, con `CONFIG` al inicio,
  respuestas booleanas y generador aleatorio con semilla (`crearGeneradorSemilla`).
- Armó un banco de 26 palabras (agudas, graves, esdrújulas y sobresdrújulas) con
  distractores de tilde mal colocada y explicación por categoría.
- Escribió 13 pruebas de Vitest con nombres en español.

**¿Hubo que corregir algo?** No se pidió corrección sobre este prompt. Las
comprobaciones y sus resultados reales están en `README.md` y en el cierre del
trabajo.

---

## Prompt 2 — Publicar en mi repositorio de GitHub

**Prompt enviado:** se compartió la dirección del repositorio
`https://github.com/heidycortezzzz-cor/Acento-Fino.git`.

**Qué hizo el agente:** inicializó git en `main`, creó los **seis commits con los
mensajes exactos** de la práctica (`inicio: proyecto creado`, `reglas: logica
desde mi ficha`, `pruebas: reglas comprobadas`, `pantalla: interfaz basica`,
`movil: funciona con el dedo`, `docs: readme y publicacion`), agregó el remoto y
subió la rama. También dejó un flujo de publicación automática en GitHub Pages.

**¿Hubo que corregir algo?** Sí: hizo falta un commit extra para el
`package-lock.json` y separar el commit de "movil" del de "pantalla".

---

## Prompt 3 — "no me carga, qué debo modificar en page"

**Qué hizo el agente:** diagnosticó que GitHub Pages servía el `index.html` del
código fuente (con `/src/main.ts`, que el navegador no ejecuta) en lugar de la
app compilada. Indicó cambiar **Settings → Pages → Source = GitHub Actions** y
volver a desplegar.

**¿Hubo que corregir algo?** Sí: al cambiar el *Source* no se disparó un
despliegue nuevo; el agente forzó uno con un commit real (`mejora: color de tema
movil`).

---

## Prompt 4 — "ya le puse github actions"

**Qué hizo el agente:** verificó con la API de GitHub que la ejecución del
workflow terminaba en verde y comprobó que la app compilada ya se servía
(HTML con `./assets/index-...js`, JS y CSS con HTTP 200).

**¿Hubo que corregir algo?** No.

---

## Prompt 5 — "en el navegador me aparece en blanco"

**Qué hizo el agente:** cargó la URL pública en un navegador real (Edge headless)
y confirmó que la app **sí renderiza** ("Acento Fino" y "Comenzar" aparecen en el
DOM). Explicó que el blanco era **caché del navegador** de la versión anterior y
dio los pasos para forzar recarga (Ctrl + Shift + R).

**¿Hubo que corregir algo?** No: era caché del cliente, no un defecto del código.

---

## Prompt 6 — "ahora continúe"

**Qué hizo el agente:** ejecutó una prueba de interfaz de extremo a extremo en un
navegador real (headless) contra la URL publicada: pulsó "Comenzar", comprobó la
palabra, las 3 opciones y el temporizador, respondió y verificó la
retroalimentación y la puntuación. Resultado: **todo funcionó** (palabra
«camion», 3 opciones, «60s», retroalimentación «¡Correcto! … Aguda», puntos «10»).

**¿Hubo que corregir algo?** No.

---

## Prompt 7 — "agregale nive un facil, intermiedo y dificil"

**Prompt enviado (textual):** `agregale nive un facil, intermiedo y dificil`

**Qué hizo el agente:**
- Agregó el tipo `Nivel` (`facil`, `intermedio`, `dificil`) y agrupó los ajustes
  de cada nivel en `CONFIG.niveles`, con su tiempo y sus puntos por acierto.
- Enlazó la dificultad a las categorías de palabra: fácil = agudas y graves;
  intermedio = además esdrújulas; difícil = además sobresdrújulas.
- Puso un **selector de nivel** en la pantalla de inicio, mostró el nivel en la
  consigna durante el juego y en la pantalla de resultados.
- Escribió 6 pruebas nuevas (nivel fácil solo agudas/graves, intermedio sin
  sobresdrújulas, difícil con sobresdrújulas, más tiempo/puntos por nivel, etc.):
  **19 pruebas en verde** y compilación limpia.
- Verificó la interfaz en un navegador real (headless): los 3 botones aparecen,
  al elegir Fácil las reglas dicen «75 segundos / 10 puntos», al elegir Difícil
  «45 segundos / 20 puntos» y al jugar muestra «Nivel Difícil» con «45s».

**¿Hubo que corregir algo?** No.

---

<!-- Los siguientes prompts se agregan a medida que se envían. -->
