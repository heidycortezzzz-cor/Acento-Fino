/**
 * Acento Fino — lógica del juego.
 *
 * Este archivo contiene ÚNICAMENTE las reglas, el estado, la puntuación, el
 * control del tiempo y el análisis de resultados. Es independiente de la
 * pantalla: no usa document, window, alert ni console.log.
 */

/* ============================================================
 * CONFIGURACIÓN · todos los valores numéricos configurables
 * ============================================================ */
export const CONFIG = {
  /** Duración total de cada partida, en segundos. */
  DURACION_PARTIDA_SEGUNDOS: 60,
  /** Puntos que se suman por cada respuesta correcta. */
  PUNTOS_POR_ACIERTO: 10,
  /** Número máximo de preguntas por partida. */
  NUMERO_PREGUNTAS_PARTIDA: 10,
  /** Opciones mostradas por pregunta (1 correcta + distractores). */
  NUMERO_OPCIONES_POR_PREGUNTA: 3,
  /** Semilla por defecto del generador aleatorio con semilla. */
  SEMILLA_POR_DEFECTO: 20251009,
} as const;

/* ============================================================
 * TIPOS
 * ============================================================ */

/** En qué momento está la partida. */
export type Fase = 'inicio' | 'jugando' | 'terminado';

/** Categoría de la palabra según dónde lleva la fuerza de voz. */
export type TipoPalabra = 'aguda' | 'grave' | 'esdrujula' | 'sobresdrujula';

/** Una palabra del banco, con su forma correcta, sus distractores y su regla. */
export interface Palabra {
  id: string;
  /** Forma mostrada al jugador: sin tilde. */
  sinTilde: string;
  /** Forma correcta, con la tilde donde corresponde. */
  correcta: string;
  /** Distractores con la tilde mal colocada o ausente. */
  incorrectas: string[];
  tipo: TipoPalabra;
  explicacion: string;
}

/** Una pregunta ya armada: la palabra, sus opciones barajadas y su estado. */
export interface Pregunta {
  palabra: Palabra;
  opciones: string[];
  correcta: string;
  respondida: boolean;
}

/** Registro de una respuesta ya emitida, para el análisis final. */
export interface RespuestaRegistrada {
  idPalabra: string;
  palabra: string;
  tipo: TipoPalabra;
  opcionElegida: string;
  correcta: boolean;
}

/** Estado completo de una partida. */
export interface Estado {
  fase: Fase;
  puntuacion: number;
  aciertos: number;
  errores: number;
  /** Segundos que quedan de la partida. */
  tiempoRestante: number;
  preguntas: Pregunta[];
  indiceActual: number;
  historial: RespuestaRegistrada[];
}

/** Resumen de aciertos y errores de una categoría. */
export interface AnalisisPorTipo {
  tipo: TipoPalabra;
  aciertos: number;
  errores: number;
}

/** Resultado del análisis de errores al terminar la partida. */
export interface Analisis {
  porTipo: AnalisisPorTipo[];
  tipoConMasErrores: TipoPalabra | null;
  recomendacion: string;
}

/* ============================================================
 * ETIQUETAS Y EXPLICACIONES EDUCATIVAS
 * ============================================================ */

/** Nombre legible de cada categoría, para mostrar en pantalla. */
export const NOMBRES_TIPO: Record<TipoPalabra, string> = {
  aguda: 'Aguda',
  grave: 'Grave (llana)',
  esdrujula: 'Esdrújula',
  sobresdrujula: 'Sobresdrújula',
};

const EXPLICACIONES: Record<TipoPalabra, string> = {
  aguda:
    'Es una palabra AGUDA: la fuerza de voz cae en la última sílaba. ' +
    'Se tilda cuando termina en vocal, en «n» o en «s».',
  grave:
    'Es una palabra GRAVE o LLANA: la fuerza de voz cae en la penúltima sílaba. ' +
    'Se tilda cuando NO termina en vocal, en «n» ni en «s».',
  esdrujula:
    'Es una palabra ESDRÚJULA: la fuerza de voz cae en la antepenúltima sílaba. ' +
    'Todas las esdrújulas llevan tilde.',
  sobresdrujula:
    'Es una palabra SOBRESDRÚJULA: la fuerza de voz cae antes de la antepenúltima sílaba. ' +
    'Todas las sobresdrújulas llevan tilde.',
};

const RECOMENDACIONES: Record<TipoPalabra, string> = {
  aguda:
    'Te conviene practicar las palabras AGUDAS: fuerza en la última sílaba; ' +
    'llevan tilde si terminan en vocal, «n» o «s».',
  grave:
    'Te conviene practicar las palabras GRAVES o LLANAS: fuerza en la penúltima sílaba; ' +
    'llevan tilde si NO terminan en vocal, «n» ni «s».',
  esdrujula:
    'Te conviene practicar las palabras ESDRÚJULAS: fuerza en la antepenúltima sílaba; ' +
    'siempre llevan tilde.',
  sobresdrujula:
    'Te conviene practicar las palabras SOBRESDRÚJULAS: fuerza antes de la antepenúltima sílaba; ' +
    'siempre llevan tilde.',
};

/* ============================================================
 * BANCO DE PALABRAS
 * ============================================================ */

/** Constructor compacto para no repetir la explicación de cada categoría. */
function palabra(
  id: string,
  sinTilde: string,
  correcta: string,
  incorrectas: string[],
  tipo: TipoPalabra,
): Palabra {
  return { id, sinTilde, correcta, incorrectas, tipo, explicacion: EXPLICACIONES[tipo] };
}

/** Banco inicial de palabras españolas, con su categoría y sus distractores. */
export const PALABRAS: Palabra[] = [
  // --- AGUDAS: fuerza en la última sílaba; se tildan si terminan en vocal, n o s ---
  palabra('p01', 'camion', 'camión', ['cámion', 'camíon'], 'aguda'),
  palabra('p02', 'cafe', 'café', ['cáfe', 'cafe'], 'aguda'),
  palabra('p03', 'sofa', 'sofá', ['sófa', 'sofa'], 'aguda'),
  palabra('p04', 'jardin', 'jardín', ['járdin', 'jardin'], 'aguda'),
  palabra('p05', 'corazon', 'corazón', ['corázon', 'corazon'], 'aguda'),
  palabra('p06', 'bebe', 'bebé', ['bébe', 'bebe'], 'aguda'),
  palabra('p07', 'papa', 'papá', ['pápa', 'papa'], 'aguda'),

  // --- GRAVES (llanas): fuerza en la penúltima sílaba; se tildan si NO terminan en vocal, n ni s ---
  palabra('p08', 'arbol', 'árbol', ['arból', 'arbol'], 'grave'),
  palabra('p09', 'lapiz', 'lápiz', ['lapíz', 'lapiz'], 'grave'),
  palabra('p10', 'carcel', 'cárcel', ['carcél', 'carcel'], 'grave'),
  palabra('p11', 'cesped', 'césped', ['cespéd', 'cesped'], 'grave'),
  palabra('p12', 'azucar', 'azúcar', ['azucár', 'azucar'], 'grave'),
  palabra('p13', 'dificil', 'difícil', ['dificíl', 'dificil'], 'grave'),

  // --- ESDRÚJULAS: fuerza en la antepenúltima sílaba; siempre llevan tilde ---
  palabra('p14', 'musica', 'música', ['musicá', 'musica'], 'esdrujula'),
  palabra('p15', 'medico', 'médico', ['medicó', 'medico'], 'esdrujula'),
  palabra('p16', 'pajaro', 'pájaro', ['pajaró', 'pajaro'], 'esdrujula'),
  palabra('p17', 'platano', 'plátano', ['platanó', 'platano'], 'esdrujula'),
  palabra('p18', 'telefono', 'teléfono', ['telefonó', 'telefono'], 'esdrujula'),
  palabra('p19', 'sabado', 'sábado', ['sabadó', 'sabado'], 'esdrujula'),
  palabra('p20', 'lagrima', 'lágrima', ['lagrimá', 'lagrima'], 'esdrujula'),

  // --- SOBRESDRÚJULAS: fuerza antes de la antepenúltima sílaba; siempre llevan tilde ---
  palabra('p21', 'digamelo', 'dígamelo', ['digamélo', 'digamelo'], 'sobresdrujula'),
  palabra('p22', 'compraselo', 'cómpraselo', ['compráselo', 'compraselo'], 'sobresdrujula'),
  palabra('p23', 'cuentamelo', 'cuéntamelo', ['cuentamélo', 'cuentamelo'], 'sobresdrujula'),
  palabra('p24', 'facilmente', 'fácilmente', ['facílmente', 'facilmente'], 'sobresdrujula'),
  palabra('p25', 'permitaselo', 'permítaselo', ['permitáselo', 'permitaselo'], 'sobresdrujula'),
  palabra('p26', 'devuelvemelo', 'devuélvemelo', ['devuelvémelo', 'devuelvemelo'], 'sobresdrujula'),
];

/** Orden canónico de las categorías, usado en el análisis. */
export const TIPOS_PALABRA: TipoPalabra[] = ['aguda', 'grave', 'esdrujula', 'sobresdrujula'];

/* ============================================================
 * ALEATORIEDAD CON SEMILLA
 * ============================================================ */

/**
 * Generador pseudoaleatorio determinista (mulberry32).
 * La misma semilla produce siempre la misma secuencia.
 */
export function crearGeneradorSemilla(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Devuelve una copia de la lista con el orden barajado usando el generador. */
function barajar<T>(elementos: T[], rng: () => number): T[] {
  const copia = elementos.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temporal = copia[i];
    copia[i] = copia[j];
    copia[j] = temporal;
  }
  return copia;
}

/* ============================================================
 * CREACIÓN Y CONTROL DEL ESTADO
 * ============================================================ */

/**
 * Crea una partida nueva (sin arrancar). Elige las palabras y baraja las
 * opciones de cada pregunta con la semilla indicada, de forma reproducible.
 */
export function crearEstadoInicial(semilla: number = CONFIG.SEMILLA_POR_DEFECTO): Estado {
  const rng = crearGeneradorSemilla(semilla);
  const seleccion = barajar(PALABRAS, rng).slice(0, CONFIG.NUMERO_PREGUNTAS_PARTIDA);

  const preguntas: Pregunta[] = seleccion.map((p) => {
    const opciones = barajar([p.correcta, ...p.incorrectas], rng).slice(
      0,
      CONFIG.NUMERO_OPCIONES_POR_PREGUNTA,
    );
    return { palabra: p, opciones, correcta: p.correcta, respondida: false };
  });

  return {
    fase: 'inicio',
    puntuacion: 0,
    aciertos: 0,
    errores: 0,
    tiempoRestante: CONFIG.DURACION_PARTIDA_SEGUNDOS,
    preguntas,
    indiceActual: 0,
    historial: [],
  };
}

/** Devuelve la pregunta que se está jugando, o null si no corresponde. */
export function preguntaActual(estado: Estado): Pregunta | null {
  if (estado.fase !== 'jugando') return null;
  return estado.preguntas[estado.indiceActual] ?? null;
}

/** Arranca la partida. Solo es válido desde la fase «inicio». */
export function iniciarPartida(estado: Estado): boolean {
  if (estado.fase !== 'inicio') return false;
  estado.fase = 'jugando';
  return true;
}

/**
 * Registra la respuesta del jugador a la pregunta actual.
 * Devuelve false si la acción no era válida (partida no jugando, pregunta ya
 * respondida u opción inexistente). Nunca puntúa dos veces la misma pregunta.
 */
export function responder(estado: Estado, opcion: string): boolean {
  if (estado.fase !== 'jugando') return false;

  const pregunta = preguntaActual(estado);
  if (!pregunta) return false;
  if (pregunta.respondida) return false;
  if (!pregunta.opciones.includes(opcion)) return false;

  pregunta.respondida = true;
  const esCorrecta = opcion === pregunta.correcta;

  if (esCorrecta) {
    estado.puntuacion += CONFIG.PUNTOS_POR_ACIERTO;
    estado.aciertos += 1;
  } else {
    estado.errores += 1;
  }

  estado.historial.push({
    idPalabra: pregunta.palabra.id,
    palabra: pregunta.palabra.correcta,
    tipo: pregunta.palabra.tipo,
    opcionElegida: opcion,
    correcta: esCorrecta,
  });

  estado.indiceActual += 1;
  if (estado.indiceActual >= estado.preguntas.length) {
    finalizarPartida(estado);
  }
  return true;
}

/**
 * Descuenta segundos del temporizador. Si llega a cero, termina la partida.
 * Devuelve false si la partida no está en curso.
 */
export function avanzarTiempo(estado: Estado, segundos: number = 1): boolean {
  if (estado.fase !== 'jugando') return false;
  estado.tiempoRestante = Math.max(0, estado.tiempoRestante - segundos);
  if (estado.tiempoRestante === 0) {
    finalizarPartida(estado);
  }
  return true;
}

/** Termina la partida. Devuelve false si ya estaba terminada o no había empezado. */
export function finalizarPartida(estado: Estado): boolean {
  if (estado.fase !== 'jugando') return false;
  estado.fase = 'terminado';
  return true;
}

/** Deja el estado como una partida nueva, sin arrastrar nada de la anterior. */
export function reiniciar(estado: Estado, semilla: number = CONFIG.SEMILLA_POR_DEFECTO): boolean {
  Object.assign(estado, crearEstadoInicial(semilla));
  return true;
}

/* ============================================================
 * RESULTADOS
 * ============================================================ */

/** Porcentaje de aciertos sobre el total respondido (0 si no hubo respuestas). */
export function porcentajeAciertos(estado: Estado): number {
  const total = estado.aciertos + estado.errores;
  if (total === 0) return 0;
  return Math.round((estado.aciertos / total) * 100);
}

/** Cuenta aciertos y errores por categoría e identifica la más fallada. */
export function analizarErrores(estado: Estado): Analisis {
  const porTipo: AnalisisPorTipo[] = TIPOS_PALABRA.map((tipo) => ({
    tipo,
    aciertos: 0,
    errores: 0,
  }));

  for (const respuesta of estado.historial) {
    const posicion = porTipo.findIndex((item) => item.tipo === respuesta.tipo);
    if (posicion < 0) continue;
    if (respuesta.correcta) {
      porTipo[posicion].aciertos += 1;
    } else {
      porTipo[posicion].errores += 1;
    }
  }

  let tipoConMasErrores: TipoPalabra | null = null;
  let maximoErrores = 0;
  for (const item of porTipo) {
    if (item.errores > maximoErrores) {
      maximoErrores = item.errores;
      tipoConMasErrores = item.tipo;
    }
  }

  const recomendacion = tipoConMasErrores
    ? RECOMENDACIONES[tipoConMasErrores]
    : '¡No cometiste errores! Seguí practicando para no perder el ritmo.';

  return { porTipo, tipoConMasErrores, recomendacion };
}
