/**
 * Acento Fino — interfaz.
 *
 * Este archivo NO decide reglas: solo llama a las funciones de logica.ts y
 * dibuja el resultado en pantalla.
 */
import './estilo.css';
import {
  CONFIG,
  NOMBRES_TIPO,
  crearEstadoInicial,
  iniciarPartida,
  responder,
  avanzarTiempo,
  reiniciar,
  preguntaActual,
  porcentajeAciertos,
  analizarErrores,
  type Estado,
  type Pregunta,
} from './logica';

type Pantalla = 'inicio' | 'juego' | 'resultados';

interface Retroalimentacion {
  correcta: boolean;
  opcion: string;
  pregunta: Pregunta;
}

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('No se encontró el elemento #app en index.html');
}

let estado: Estado = crearEstadoInicial();
let pantalla: Pantalla = 'inicio';
let retro: Retroalimentacion | null = null;
let temporizador: number | null = null;

/* ------------------------------------------------------------
 * Utilidades
 * ------------------------------------------------------------ */

function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function detenerTemporizador(): void {
  if (temporizador !== null) {
    window.clearInterval(temporizador);
    temporizador = null;
  }
}

function iniciarTemporizador(): void {
  detenerTemporizador();
  temporizador = window.setInterval(() => {
    const valido = avanzarTiempo(estado, 1);
    if (!valido) {
      detenerTemporizador();
      return;
    }
    if (estado.fase === 'terminado') {
      detenerTemporizador();
      retro = null;
      pantalla = 'resultados';
      render();
      return;
    }
    actualizarTiempo();
  }, 1000);
}

/** Actualiza solo el reloj para no rehacer la pantalla (y no perder el foco). */
function actualizarTiempo(): void {
  const reloj = document.getElementById('tiempo');
  if (reloj) reloj.textContent = `${estado.tiempoRestante}s`;
}

/* ------------------------------------------------------------
 * Vistas
 * ------------------------------------------------------------ */

function vistaInicio(): string {
  return `
    <main class="tarjeta">
      <p class="etiqueta">Ortografía · tildes</p>
      <h1 class="titulo">Acento Fino</h1>
      <p class="lead">
        Poné la tilde donde va, contra el reloj, y descubrí al final en qué
        tipo de palabra te equivocás más.
      </p>
      <ul class="reglas">
        <li>Tenés <strong>${CONFIG.DURACION_PARTIDA_SEGUNDOS} segundos</strong> por partida.</li>
        <li>Se juegan <strong>${CONFIG.NUMERO_PREGUNTAS_PARTIDA} palabras</strong> como máximo.</li>
        <li>Cada acierto vale <strong>${CONFIG.PUNTOS_POR_ACIERTO} puntos</strong>.</li>
        <li>Al final ves tus resultados y qué categoría te conviene practicar.</li>
      </ul>
      <button id="btn-comenzar" class="btn-primario" type="button">Comenzar</button>
      <p class="pie">Funciona con el dedo y con el teclado.</p>
    </main>
  `;
}

function vistaJuego(): string {
  const pregunta = retro ? retro.pregunta : preguntaActual(estado);

  if (!pregunta) {
    return `
      <main class="tarjeta">
        <p class="lead">No quedan palabras por responder.</p>
        <button id="btn-resultados" class="btn-primario" type="button">Ver resultados</button>
      </main>
    `;
  }

  const total = estado.preguntas.length;
  const numero = Math.min(retro ? estado.indiceActual : estado.indiceActual + 1, total);

  const botones = pregunta.opciones
    .map((opcion) => {
      const esCorrecta = opcion === pregunta.correcta;
      let clase = 'opcion';
      let deshabilitado = '';
      if (retro) {
        deshabilitado = 'disabled';
        if (esCorrecta) clase += ' correcta';
        else if (opcion === retro.opcion) clase += ' incorrecta';
      }
      return `<button class="${clase}" type="button" data-opcion="${escapar(opcion)}" ${deshabilitado}>${escapar(opcion)}</button>`;
    })
    .join('');

  let panelRetro = '<div class="retro" aria-live="polite"></div>';
  let accion = '';
  if (retro) {
    const clase = retro.correcta ? 'acierto' : 'error';
    const titulo = retro.correcta ? '¡Correcto!' : 'Incorrecto';
    panelRetro = `
      <div class="retro ${clase}" aria-live="polite">
        <p class="retro-titulo">${titulo}</p>
        <p class="retro-palabra">
          La forma correcta es <strong>${escapar(retro.pregunta.correcta)}</strong>
          (${NOMBRES_TIPO[retro.pregunta.palabra.tipo]}).
        </p>
        <p class="retro-exp">${escapar(retro.pregunta.palabra.explicacion)}</p>
      </div>
    `;
    accion =
      estado.fase === 'terminado'
        ? '<button id="btn-resultados" class="btn-primario" type="button">Ver resultados</button>'
        : '<button id="btn-siguiente" class="btn-primario" type="button">Siguiente palabra</button>';
  }

  return `
    <main class="tarjeta">
      <header class="hud">
        <div class="hud-item">
          <span class="hud-etq">Tiempo</span>
          <span class="hud-val" id="tiempo" role="timer" aria-live="off">${estado.tiempoRestante}s</span>
        </div>
        <div class="hud-item">
          <span class="hud-etq">Puntos</span>
          <span class="hud-val">${estado.puntuacion}</span>
        </div>
        <div class="hud-item">
          <span class="hud-etq">Palabra</span>
          <span class="hud-val">${numero}/${total}</span>
        </div>
      </header>

      <p class="consigna">¿Cuál es la forma correcta?</p>
      <p class="palabra">${escapar(pregunta.palabra.sinTilde)}</p>

      <div id="lista-opciones" class="opciones">${botones}</div>

      ${panelRetro}
      ${accion ? `<div class="acciones">${accion}</div>` : ''}
    </main>
  `;
}

function vistaResultados(): string {
  const analisis = analizarErrores(estado);
  const filas = analisis.porTipo
    .map(
      (item) => `
        <tr ${item.tipo === analisis.tipoConMasErrores ? 'class="destacada"' : ''}>
          <th scope="row">${NOMBRES_TIPO[item.tipo]}</th>
          <td>${item.aciertos}</td>
          <td>${item.errores}</td>
        </tr>
      `,
    )
    .join('');

  const destacado = analisis.tipoConMasErrores
    ? `<p class="reco-tipo">Categoría a practicar: <strong>${NOMBRES_TIPO[analisis.tipoConMasErrores]}</strong></p>`
    : '<p class="reco-tipo">No tuviste una categoría problemática.</p>';

  return `
    <main class="tarjeta">
      <p class="etiqueta">Resultados</p>
      <h1 class="titulo titulo-sm">Partida terminada</h1>

      <div class="marcador">
        <div class="marcador-item">
          <span class="marcador-val">${estado.puntuacion}</span>
          <span class="marcador-etq">Puntos</span>
        </div>
        <div class="marcador-item">
          <span class="marcador-val ok">${estado.aciertos}</span>
          <span class="marcador-etq">Aciertos</span>
        </div>
        <div class="marcador-item">
          <span class="marcador-val mal">${estado.errores}</span>
          <span class="marcador-etq">Errores</span>
        </div>
        <div class="marcador-item">
          <span class="marcador-val">${porcentajeAciertos(estado)}%</span>
          <span class="marcador-etq">Aciertos</span>
        </div>
      </div>

      <h2 class="subtitulo">Errores por tipo de palabra</h2>
      <div class="tabla-envoltura">
        <table class="tabla">
          <thead>
            <tr><th scope="col">Tipo</th><th scope="col">Aciertos</th><th scope="col">Errores</th></tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </div>

      <div class="recomendacion">
        ${destacado}
        <p>${escapar(analisis.recomendacion)}</p>
      </div>

      <button id="btn-reiniciar" class="btn-primario" type="button">Jugar de nuevo</button>
    </main>
  `;
}

/* ------------------------------------------------------------
 * Render y eventos
 * ------------------------------------------------------------ */

function render(): void {
  if (pantalla === 'inicio') app!.innerHTML = vistaInicio();
  else if (pantalla === 'juego') app!.innerHTML = vistaJuego();
  else app!.innerHTML = vistaResultados();
  conectarEventos();
}

function conectarEventos(): void {
  document.getElementById('btn-comenzar')?.addEventListener('click', comenzar);
  document.getElementById('btn-siguiente')?.addEventListener('click', siguiente);
  document.getElementById('btn-resultados')?.addEventListener('click', verResultados);
  document.getElementById('btn-reiniciar')?.addEventListener('click', jugarDeNuevo);

  document
    .querySelectorAll<HTMLButtonElement>('#lista-opciones .opcion')
    .forEach((boton) => {
      boton.addEventListener('click', () => elegir(boton.dataset.opcion ?? ''));
    });
}

function enfocarPrimeraOpcion(): void {
  document.querySelector<HTMLButtonElement>('#lista-opciones .opcion')?.focus();
}

function comenzar(): void {
  if (!iniciarPartida(estado)) return;
  pantalla = 'juego';
  retro = null;
  iniciarTemporizador();
  render();
  enfocarPrimeraOpcion();
}

function elegir(opcion: string): void {
  if (!opcion) return;
  const pregunta = preguntaActual(estado);
  if (!pregunta || pregunta.respondida) return;
  if (!responder(estado, opcion)) return;

  retro = { correcta: opcion === pregunta.correcta, opcion, pregunta };
  if (estado.fase === 'terminado') detenerTemporizador();
  render();
}

function siguiente(): void {
  retro = null;
  render();
  enfocarPrimeraOpcion();
}

function verResultados(): void {
  detenerTemporizador();
  retro = null;
  pantalla = 'resultados';
  render();
}

function jugarDeNuevo(): void {
  detenerTemporizador();
  const nuevaSemilla = Date.now() % 2147483647;
  reiniciar(estado, nuevaSemilla);
  pantalla = 'inicio';
  retro = null;
  render();
}

render();
