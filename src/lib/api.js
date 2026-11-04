// Cliente del servidor Django (carpeta cancionero-api). Solo se usa corriendo en tu compu (npm run dev).
// En la web publicada no hay servidor Django, y el sitio funciona con las canciones del código.
const BASE = '/api'

const leerCookie = (nombre) => {
  const par = document.cookie.split('; ').find(c => c.startsWith(`${nombre}=`))
  return par ? decodeURIComponent(par.split('=')[1]) : ''
}

// El servidor guarda el id numérico; en el sitio las canciones de la base llevan "db-" adelante.
const aCancion = (c) => ({
  id: `db-${c.id}`, titulo: c.titulo, artista: c.artista, tono: c.tono, cuerpo: c.cuerpo,
  remota: true, visibilidad: c.visibilidad, solo_acordes: c.solo_acordes, autor: c.autor,
})
export const idRemoto = (id) => (typeof id === 'string' && id.startsWith('db-') ? id.slice(3) : null)

// ¿Hay servidor? ¿Hay sesión iniciada? -> { disponible, usuario }
export async function sesion() {
  try {
    const r = await fetch(`${BASE}/yo/`, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
    if (!r.ok) return { disponible: false, usuario: null }
    const d = await r.json()
    return { disponible: true, usuario: d.autenticado ? d.usuario : null }
  } catch {
    return { disponible: false, usuario: null }   // sin servidor, o la respuesta no era JSON
  }
}

export async function listarRemotas() {
  const r = await fetch(`${BASE}/canciones/`, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
  if (!r.ok) throw new Error('No pude leer las canciones del servidor')
  return (await r.json()).map(aCancion)
}

// Crea (POST) o actualiza (PATCH) una canción. Si el servidor la rechaza, el error trae el motivo en español.
export async function guardarRemota({ id, titulo, artista, tono, cuerpo, visibilidad, solo_acordes }) {
  const num = idRemoto(id)
  const r = await fetch(num ? `${BASE}/canciones/${num}/` : `${BASE}/canciones/`, {
    method: num ? 'PATCH' : 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRFToken': leerCookie('csrftoken') },
    body: JSON.stringify({ titulo, artista, tono, cuerpo, visibilidad, solo_acordes }),
  })
  if (!r.ok) {
    let motivo = `El servidor respondió ${r.status}`
    try {
      const d = await r.json()
      motivo = d.detail || Object.entries(d).map(([campo, msg]) => `${campo}: ${[].concat(msg).join(' ')}`).join(' · ') || motivo
    } catch { /* sin detalle */ }
    throw new Error(motivo)
  }
  return aCancion(await r.json())
}

export async function borrarRemota(id) {
  const num = idRemoto(id)
  if (!num) throw new Error('No es una canción de la base')
  const r = await fetch(`${BASE}/canciones/${num}/`, {
    method: 'DELETE', credentials: 'same-origin', headers: { 'X-CSRFToken': leerCookie('csrftoken') },
  })
  if (!r.ok && r.status !== 204) throw new Error(`El servidor respondió ${r.status}`)
}
