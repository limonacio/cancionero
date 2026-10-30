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



  {
    id: "el-abismo",
    titulo: "El Abismo",
    artista: "Illya Kuryaki and The Valderramas",
    tono: "Em",
    cuerpo: `
​Em7
​Me estoy
​B7
​llevando el río
​Asus2
​debo saciar
​G
​la sed de mi adivino.

​Em7
​Estoy
​B7
​corriendo mucho
​Asus2
​un pez me grita
​G
​y yo nunca lo escucho.


​Y desaparecer
​es lo que me aconsejan
​huir de tí
​salirme de tu senda.

​Pero tomé tu piel
​quedé imantado a eso
​como los bosques
​imantan el silencio.

​E             G#m
​Quien nos guía hacia el abismo
​C                C7
​sabe que quiero, sabe que busco el abismo
​E              G#m               C        C7
​quien nos guía hacia el abismo

Em7
​El mar
​B7
​lo siento lejos
Asus2
​debo nadar
G
​hasta tus sueños.

Em7
​El sol
​B7
​me está quemando
​Asus2
​y me estoy yendo
​G
​hacia tu recuerdo. 

​Desde
​la fantasía
​vos me dirás
​lo fugaz que es la vida.

​Y si quieren juzgarte
​saca afuera tu alma
​deja que el sol
​inserte algo de calma.

​Quebrar lo inquebrantable
​y ver un mundo aparte
​es lo que hace
​que al fin yo pueda amarte.

​E             G#m
​Quien nos guía hacia el abismo
​C                C7
​sabe que quiero, sabe que busco el abismo
​E              G#m               C        C7   Em7
​quien nos guía hacia el abismo

`,
  },

]
