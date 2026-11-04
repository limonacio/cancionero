// Agrupa los bloques de una canción en "grupos" que no se parten entre columnas:
//  - un bloque con título propio (Primera estrofa, Puente…) abre un grupo nuevo,
//  - un Estribillo/Coro se pega al grupo anterior (queda debajo de su estrofa),
//  - un bloque sin título sigue en el grupo anterior SOLO si ese grupo empezó con título,
//  - una marca manual (---) o "Segunda/Tercera parte" siempre abre grupo y fuerza columna nueva.
const PEGA_AL_ANTERIOR = /^(estribillo|coro)\b/i
const FUERZA_COLUMNA = /^(segunda|tercera) parte$/i

export function agrupar(bloques) {
  const grupos = []
  for (const b of bloques) {
    const ultimo = grupos[grupos.length - 1]
    const forzado = !!b.columna || FUERZA_COLUMNA.test(b.seccion || '')
    const seAdjunta = ultimo && !forzado && (
      b.seccion ? PEGA_AL_ANTERIOR.test(b.seccion) : ultimo.conTitulo
    )
    if (seAdjunta) ultimo.bloques.push(b)
    else grupos.push({ bloques: [b], conTitulo: !!b.seccion, columna: forzado })
  }
  return grupos
}
