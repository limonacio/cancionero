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
const CAMPOS = ['titulo', 'artista', 'tono', 'cuerpo']
const igual = (a, b) => CAMPOS.every(k => a[k] === b[k])

// Si una canción guardada tiene el mismo id que una del sitio, la tuya la reemplaza (solo en este navegador).
// Si es idéntica a la del sitio, ya está publicada: se muestra como la del sitio.
export const todas = () => {
  const locales = leerPropias()
  const porId = new Map(locales.map(c => [c.id, c]))
  const delSitio = new Map(canciones.map(c => [c.id, c]))
  const lista = canciones.map(c => {
    const l = porId.get(c.id)
    return l && !igual(l, c) ? { ...l, local: true, reemplaza: true } : c
  })
  return [...lista, ...locales.filter(c => !delSitio.has(c.id))]
}

// Baja un archivo con las canciones que solo están en este navegador, listo para tools/importar.mjs
export const exportarPropias = () => {
  const pendientes = todas().filter(c => c.local).map(({ id, titulo, artista, tono, cuerpo }) => ({ id, titulo, artista, tono, cuerpo }))
  if (!pendientes.length) return 0
  const blob = new Blob([JSON.stringify(pendientes, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'mis-canciones.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  return pendientes.length
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

// "Nueva canción" siempre arranca en blanco: se descarta el borrador anterior.
export const limpiarBorrador = () => {
  try { localStorage.removeItem(CLAVE_BORRADOR) } catch { /* sin guardado */ }
}
