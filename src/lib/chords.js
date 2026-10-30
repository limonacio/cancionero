// ─────────────────────────────────────────────────────────────
//  Acordes: transposición y lectura del formato de las canciones
//
//  Formato de cada canción (estilo ChordPro):
//    - Los acordes van entre corchetes, pegados a la sílaba donde cambian:
//        [Am]Esto es una [F]canción
//    - Una línea que empieza con "# " es un título de sección (Estrofa, Estribillo...)
//    - Una línea vacía separa bloques.
// ─────────────────────────────────────────────────────────────

const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
const INDEX = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
}

// Tonalidades que se escriben con bemoles (el resto, con sostenidos)
const FLAT_MAJOR = new Set([5, 10, 3, 8, 1, 6])  // F, Bb, Eb, Ab, Db, Gb
const FLAT_MINOR = new Set([2, 7, 0, 5, 10, 3])  // Dm, Gm, Cm, Fm, Bbm, Ebm

const mod12 = (n) => ((n % 12) + 12) % 12

function shiftNote(note, steps, useFlats) {
  const i = INDEX[note]
  if (i === undefined) return note
  return (useFlats ? FLAT : SHARP)[mod12(i + steps)]
}

// "Am7/G" → sube/baja `steps` semitonos. Si no se reconoce, lo deja como está.
export function transposeChord(chord, steps, useFlats = false) {
  const m = chord.match(/^([A-G][#b]?)([^/]*)(?:\/([A-G][#b]?))?$/)
  if (!m) return chord
  const [, root, quality, bass] = m
  return shiftNote(root, steps, useFlats) + quality + (bass ? '/' + shiftNote(bass, steps, useFlats) : '')
}

// ¿La tonalidad de destino se escribe mejor con bemoles?
export function prefersFlats(key, steps) {
  const m = key.match(/^([A-G][#b]?)(m(?!aj))?/)
  if (!m || INDEX[m[1]] === undefined) return false
  const target = mod12(INDEX[m[1]] + steps)
  return (m[2] ? FLAT_MINOR : FLAT_MAJOR).has(target)
}

// Texto de una canción → lista de bloques { seccion, lineas }
// Cada línea es una lista de tramos { acorde, texto }.
export function parseSong(body) {
  const blocks = []
  let current = { seccion: null, lineas: [] }
  const push = () => { if (current.seccion || current.lineas.length) blocks.push(current) }

  for (const raw of body.trim().split('\n')) {
    const line = raw.replace(/\r$/, '')
    if (line.startsWith('# ')) {
      push()
      current = { seccion: line.slice(2).trim(), lineas: [] }
    } else if (line.trim() === '') {
      if (current.lineas.length) { push(); current = { seccion: null, lineas: [] } }
    } else {
      current.lineas.push(parseLine(line))
    }
  }
  push()
  return blocks
}

function parseLine(line) {
  const parts = line.split(/(\[[^\]]+\])/)
  const segs = []
  let chord = null
  for (const part of parts) {
    const m = part.match(/^\[([^\]]+)\]$/)
    if (m) {
      if (chord !== null) segs.push({ acorde: chord, texto: '' })
      chord = m[1]
    } else if (part !== '') {
      segs.push({ acorde: chord, texto: part })
      chord = null
    }
  }
  if (chord !== null) segs.push({ acorde: chord, texto: '' })
  return segs
}
