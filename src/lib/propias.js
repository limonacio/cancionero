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
