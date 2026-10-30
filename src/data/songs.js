// ─────────────────────────────────────────────────────────────
//  CANCIONERO · src/data/songs.js
//
//  ÚNICO ARCHIVO que hay que tocar para agregar canciones.
//  El orden del array es el orden en que aparecen en la lista.
//
//  Cada canción:
//    id       → corto, sin espacios ni tildes (va en la URL)
//    titulo   → como se muestra
//    artista  → quién la canta
//    tono     → TU tonalidad, la de los acordes que escribís abajo (ej: "Am", "G", "Bb")
//    cuerpo   → letra con acordes entre corchetes (ver src/lib/chords.js)
// ─────────────────────────────────────────────────────────────

export const canciones = [

  // Canción de ejemplo con letra propia, para probar el formato y la transposición.
  // Cuando agregues la primera real, podés borrarla.
  {
    id: 'ejemplo',
    titulo: 'Canción de ejemplo',
    artista: 'limonacio',
    tono: 'Am',
    cuerpo: `
# Estrofa
[Am]Esto es una [F]canción de ejemplo,
[C]para ver cómo se [G]acomodan los acordes.
[Am]Cada uno cae sobre la [F]sílaba justa,
[C]y el resto sigue [G]su camino.

# Estribillo
[F]Cambiá el tono con los [C]botones,
[G]y mirá cómo [Am]suben y bajan.
[F]Lo que escribís queda [C]guardado en tu tonalidad,
[G]lo demás se calcula [Am]solo.
`,
  },

  // ── Para agregar una canción: copiá este bloque ───────────
  // {
  //   id: 'mi-cancion',
  //   titulo: 'Título',
  //   artista: 'Artista',
  //   tono: 'G',
  //   cuerpo: `
  // # Estrofa
  // [G]Letra con el acorde [C]pegado a la sílaba
  // `,
  // },

]
