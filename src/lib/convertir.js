// ─────────────────────────────────────────────────────────────
//  Convierte una canción escrita en formato CLÁSICO de cancionero
//  (línea de acordes arriba, letra abajo) al formato del sitio
//  (acordes entre corchetes, pegados a la sílaba).
//
//  Lo usan dos lugares: el editor del sitio (#/nueva) y tools/convertir.mjs.
//
//  Reglas de la entrada:
//    - Una línea con SOLO acordes (Am  F  C/G  Em7  Asus2) queda sobre la línea de letra siguiente.
//    - Cada acorde cae en la columna donde esté escrito: alineá con la sílaba.
//    - Una línea "# Estrofa" o "[Estribillo]" abre una sección.
//    - Una línea vacía separa bloques.
// ─────────────────────────────────────────────────────────────

const ACORDE = /^[A-G][#b]?(?:m(?!aj)|M|maj|min|dim|aug|sus|add|\+|°|º)?[0-9]*(?:sus[0-9]*|add[0-9]+|maj[0-9]+|[b#][0-9]+)*(?:\/[A-G][#b]?)?$/

export const esAcorde = (t) => ACORDE.test(t)

const esLineaDeAcordes = (l) => {
  const t = l.trim().split(/\s+/).filter(Boolean)
  return t.length > 0 && t.every(esAcorde)
}

const seccion = (l) => {
  const m = l.match(/^#\s+(.+)$/) || l.match(/^\[(.+)\]$/)
  if (!m || esAcorde(m[1].trim())) return null
  return m[1].trim()
}

// Inserta cada acorde en su columna de la línea de letra, de derecha a izquierda,
// para que cada inserción no corra las posiciones de las anteriores.
function unir(lineaAcordes, letra) {
  const pos = [...lineaAcordes.matchAll(/\S+/g)].map(m => ({ i: m.index, a: m[0] }))
  let out = letra
  const maxCol = pos.length ? pos[pos.length - 1].i : 0
  if (out.length < maxCol) out = out.padEnd(maxCol, ' ')
  for (const { i, a } of pos.reverse()) out = out.slice(0, i) + `[${a}]` + out.slice(i)
  return out
}

// Al copiar desde Docs, WhatsApp, notas o la web se cuelan caracteres invisibles
// (espacios raros, espacio de ancho cero, ♯ ♭) que hacen que "Em7" deje de ser un acorde.
export function limpiar(texto) {
  return texto
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    .replace(/♯/g, '#')
    .replace(/♭/g, 'b')
}

// Cuántas líneas de la canción son de acordes (para avisarle al usuario si no se reconoció ninguna).
export function contarLineasDeAcordes(texto) {
  return limpiar(texto).split(/\r?\n/).filter(esLineaDeAcordes).length
}

export function convertirClasico(texto) {
  const lineas = limpiar(texto).replace(/\t/g, '    ').split(/\r?\n/)
  const salida = []
  for (let n = 0; n < lineas.length; n++) {
    const l = lineas[n]
    const sec = seccion(l.trim())
    if (sec) { salida.push(`# ${sec}`); continue }
    if (l.trim() === '') { salida.push(''); continue }
    if (esLineaDeAcordes(l)) {
      const sig = lineas[n + 1]
      const haySigLetra = sig !== undefined && sig.trim() !== '' && !esLineaDeAcordes(sig) && !seccion(sig.trim())
      if (haySigLetra) { salida.push(unir(l, sig)); n++ }
      else salida.push(l.trim().split(/\s+/).map(a => `[${a}]`).join('  '))   // intro, puente...
      continue
    }
    salida.push(l.trimEnd())   // letra sin acordes
  }
  return salida.join('\n')
}
