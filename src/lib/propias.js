// Canciones guardadas en ESTE navegador (localStorage). Aparecen en la lista al instante.
// Para que las vea todo el mundo, hay que sumarlas a src/data/songs.js (o tener un backend).
import { canciones } from '../data/songs.js'

const CLAVE = 'cancionero-propias'

export const leerPropias = () => {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || [] } catch { return [] }
}
const guardar = (lista) => {
  try { localStorage.setItem(CLAVE, JSON.stringify(lista)); return true } catch { return false }
}
export const guardarPropia = (c) => guardar([...leerPropias().filter(x => x.id !== c.id), { ...c, local: true }])
export const borrarPropia = (id) => guardar(leerPropias().filter(x => x.id !== id))
// Las del sitio ganan si el id se repite.
export const todas = () => {
  const ids = new Set(canciones.map(c => c.id))
  return [...canciones, ...leerPropias().filter(c => !ids.has(c.id))]
}

const CLAVE_BORRADOR = 'cancionero-borrador'

// Deja la canción cargada en el editor para corregirla (el editor lee este borrador al abrirse).
export const prepararEdicion = (c) => {
  try {
    localStorage.setItem(CLAVE_BORRADOR, JSON.stringify({
      titulo: c.titulo, artista: c.artista, tono: c.tono, texto: c.cuerpo, minusculas: false, editando: c.id,
    }))
    return true
  } catch { return false }
}

// Dentro de un template literal hay que escapar \ ` y ${
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')

// El texto listo para pegar dentro del array de src/data/songs.js
export const entradaParaSongs = (c) => `  {
    id: ${JSON.stringify(c.id)},
    titulo: ${JSON.stringify(c.titulo)},
    artista: ${JSON.stringify(c.artista)},
    tono: ${JSON.stringify(c.tono)},
    cuerpo: \`
${esc(c.cuerpo)}
\`,
  },
`
