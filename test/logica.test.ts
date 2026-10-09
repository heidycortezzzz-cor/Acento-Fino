import { describe, it, expect } from 'vitest';
import {
  CONFIG,
  crearEstadoInicial,
  iniciarPartida,
  responder,
  avanzarTiempo,
  reiniciar,
  preguntaActual,
  porcentajeAciertos,
  analizarErrores,
  crearGeneradorSemilla,
} from '../src/logica';

describe('Acento Fino · reglas del juego', () => {
  it('el estado inicial se crea en la fase de inicio, con el tiempo completo y sin puntos', () => {
    const estado = crearEstadoInicial(1);

    expect(estado.fase).toBe('inicio');
    expect(estado.puntuacion).toBe(0);
    expect(estado.aciertos).toBe(0);
    expect(estado.errores).toBe(0);
    expect(estado.tiempoRestante).toBe(CONFIG.DURACION_PARTIDA_SEGUNDOS);
    expect(estado.preguntas).toHaveLength(CONFIG.NUMERO_PREGUNTAS_PARTIDA);
    expect(estado.indiceActual).toBe(0);
    expect(estado.historial).toHaveLength(0);
  });

  it('la misma semilla produce siempre la misma secuencia de preguntas', () => {
    const primera = crearEstadoInicial(42);
    const segunda = crearEstadoInicial(42);

    expect(primera.preguntas.map((p) => p.palabra.id)).toEqual(
      segunda.preguntas.map((p) => p.palabra.id),
    );
  });

  it('una respuesta correcta suma los puntos configurados y registra un acierto', () => {
    const estado = crearEstadoInicial(7);
    iniciarPartida(estado);
    const pregunta = preguntaActual(estado)!;

    const valido = responder(estado, pregunta.correcta);

    expect(valido).toBe(true);
    expect(estado.puntuacion).toBe(CONFIG.PUNTOS_POR_ACIERTO);
    expect(estado.aciertos).toBe(1);
    expect(estado.errores).toBe(0);
    expect(porcentajeAciertos(estado)).toBe(100);
  });

  it('una respuesta incorrecta registra un error y no suma puntos', () => {
    const estado = crearEstadoInicial(7);
    iniciarPartida(estado);
    const pregunta = preguntaActual(estado)!;
    const incorrecta = pregunta.opciones.find((o) => o !== pregunta.correcta)!;

    const valido = responder(estado, incorrecta);

    expect(valido).toBe(true);
    expect(estado.puntuacion).toBe(0);
    expect(estado.aciertos).toBe(0);
    expect(estado.errores).toBe(1);
    expect(porcentajeAciertos(estado)).toBe(0);
  });

  it('no se puede puntuar dos veces la misma pregunta', () => {
    const estado = crearEstadoInicial(7);
    iniciarPartida(estado);
    const pregunta = preguntaActual(estado)!;

    expect(responder(estado, pregunta.correcta)).toBe(true);
    expect(responder(estado, pregunta.correcta)).toBe(false);

    expect(estado.aciertos).toBe(1);
    expect(estado.puntuacion).toBe(CONFIG.PUNTOS_POR_ACIERTO);
  });

  it('no se puede responder antes de comenzar la partida', () => {
    const estado = crearEstadoInicial(7);
    const pregunta = estado.preguntas[0];

    const valido = responder(estado, pregunta.correcta);

    expect(valido).toBe(false);
    expect(estado.aciertos).toBe(0);
    expect(estado.puntuacion).toBe(0);
  });

  it('una opción que no está entre las mostradas no se acepta', () => {
    const estado = crearEstadoInicial(7);
    iniciarPartida(estado);

    const valido = responder(estado, 'opcion-inventada');

    expect(valido).toBe(false);
    expect(estado.aciertos).toBe(0);
    expect(estado.errores).toBe(0);
  });

  it('el temporizador termina la partida cuando el tiempo llega a cero', () => {
    const estado = crearEstadoInicial(5);
    iniciarPartida(estado);

    for (let s = 0; s < CONFIG.DURACION_PARTIDA_SEGUNDOS + 5; s++) {
      avanzarTiempo(estado, 1);
    }

    expect(estado.tiempoRestante).toBe(0);
    expect(estado.fase).toBe('terminado');
  });

  it('se puede recorrer una partida completa hasta el final respondiendo todo bien', () => {
    const estado = crearEstadoInicial(99);
    iniciarPartida(estado);

    let pasos = 0;
    while (estado.fase === 'jugando' && pasos < 100) {
      const pregunta = preguntaActual(estado);
      if (!pregunta) break;
      responder(estado, pregunta.correcta);
      pasos += 1;
    }

    expect(pasos).toBe(CONFIG.NUMERO_PREGUNTAS_PARTIDA);
    expect(estado.fase).toBe('terminado');
    expect(estado.aciertos).toBe(CONFIG.NUMERO_PREGUNTAS_PARTIDA);
    expect(estado.errores).toBe(0);
    expect(estado.puntuacion).toBe(
      CONFIG.NUMERO_PREGUNTAS_PARTIDA * CONFIG.PUNTOS_POR_ACIERTO,
    );
    expect(porcentajeAciertos(estado)).toBe(100);
  });

  it('el reinicio deja el estado como una partida nueva, sin arrastrar la anterior', () => {
    const estado = crearEstadoInicial(3);
    iniciarPartida(estado);
    responder(estado, preguntaActual(estado)!.correcta);

    const valido = reiniciar(estado, 3);

    expect(valido).toBe(true);
    expect(estado.fase).toBe('inicio');
    expect(estado.puntuacion).toBe(0);
    expect(estado.aciertos).toBe(0);
    expect(estado.errores).toBe(0);
    expect(estado.historial).toHaveLength(0);
    expect(estado.tiempoRestante).toBe(CONFIG.DURACION_PARTIDA_SEGUNDOS);
    expect(estado.indiceActual).toBe(0);
  });

  it('el análisis de errores señala la categoría más fallada y recomienda practicarla', () => {
    const estado = crearEstadoInicial(11);
    iniciarPartida(estado);
    const pregunta = preguntaActual(estado)!;
    const incorrecta = pregunta.opciones.find((o) => o !== pregunta.correcta)!;

    responder(estado, incorrecta);
    const analisis = analizarErrores(estado);

    expect(analisis.tipoConMasErrores).toBe(pregunta.palabra.tipo);
    const fila = analisis.porTipo.find((item) => item.tipo === pregunta.palabra.tipo)!;
    expect(fila.errores).toBe(1);
    expect(analisis.recomendacion.length).toBeGreaterThan(0);
  });

  it('si no hubo errores, el análisis no señala ninguna categoría problemática', () => {
    const estado = crearEstadoInicial(8);
    iniciarPartida(estado);
    // Responde bien todas las preguntas hasta terminar.
    while (estado.fase === 'jugando') {
      const pregunta = preguntaActual(estado)!;
      responder(estado, pregunta.correcta);
    }

    const analisis = analizarErrores(estado);

    expect(analisis.tipoConMasErrores).toBeNull();
    expect(analisis.porTipo.every((item) => item.errores === 0)).toBe(true);
  });
});

describe('Acento Fino · generador con semilla', () => {
  it('el generador con semilla devuelve la misma secuencia para la misma semilla', () => {
    const a = crearGeneradorSemilla(2026);
    const b = crearGeneradorSemilla(2026);

    const secuenciaA = [a(), a(), a()];
    const secuenciaB = [b(), b(), b()];

    expect(secuenciaA).toEqual(secuenciaB);
  });
});
