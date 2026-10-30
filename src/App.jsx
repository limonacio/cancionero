import { useState, useEffect, useMemo } from 'react'
import { canciones } from './data/songs.js'
import { parseSong, transposeChord, prefersFlats } from './lib/chords.js'
import Letra from './Letra.jsx'
import Editor from './Editor.jsx'

// Rutas con hash (#/c/mi-cancion, #/nueva): no necesitan configuración en el servidor.
const useHash = () => {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const fn = () => setHash(window.location.hash)
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])
  return hash
}

const normalizar = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function Cabecera({ volver, ancho }) {
  return (
    <header className={`cabecera${ancho ? ' ancho' : ''}`}>
      {volver
        ? <a className="volver" href="#/">&#8249; cancionero</a>
        : <span className="marca">cancionero</span>}
      <a className="portfolio" href="https://www.limonacio.com">limonacio.com</a>
    </header>
  )
}

function Lista() {
  const [q, setQ] = useState('')
  const visibles = useMemo(() => {
    const n = normalizar(q)
    return canciones.filter(c => normalizar(`${c.titulo} ${c.artista}`).includes(n))
  }, [q])

  return (
    <>
      <Cabecera />
      <main>
        <p className="intro">Canciones adaptadas a mi tonalidad, con letra y acordes listos para tocar.</p>
        <input
          className="buscador"
          type="search"
          placeholder="buscar por título o artista"
          value={q}
          onChange={e => setQ(e.target.value)}
          aria-label="Buscar canción"
        />
        {visibles.length === 0
          ? <p className="vacio">No hay canciones que coincidan con “{q}”. Probá con otra palabra.</p>
          : (
            <ul className="lista">
              {visibles.map(c => (
                <li key={c.id}>
                  <a href={`#/c/${encodeURIComponent(c.id)}`}>
                    <span className="titulo">{c.titulo}</span>
                    <span className="artista">{c.artista}</span>
                    <span className="tono">{c.tono}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
      </main>
    </>
  )
}

function Cancion({ id }) {
  const cancion = canciones.find(c => c.id === id)
  const [pasos, setPasos] = useState(0)
  useEffect(() => { setPasos(0); window.scrollTo(0, 0) }, [id])

  const bloques = useMemo(() => (cancion ? parseSong(cancion.cuerpo) : []), [cancion])

  if (!cancion) {
    return (
      <>
        <Cabecera volver ancho />
        <main className="ancho"><p className="vacio">No encontré esa canción. Volvé a la lista y elegí otra.</p></main>
      </>
    )
  }

  const flats = prefersFlats(cancion.tono, pasos)
  const tonoActual = transposeChord(cancion.tono, pasos, flats)
  const mostrar = (a) => (pasos === 0 ? a : transposeChord(a, pasos, flats))

  return (
    <>
      <Cabecera volver ancho />
      <main className="ancho">
        <h1 className="cancion-titulo">{cancion.titulo}</h1>
        <p className="cancion-artista">{cancion.artista}</p>

        <div className="tono-panel" role="group" aria-label="Tonalidad">
          <button onClick={() => setPasos(p => p - 1)} aria-label="Bajar un semitono">&minus;</button>
          <span className="tono-actual">
            tono <strong>{tonoActual}</strong>
            {pasos !== 0 && <em> · mi tono: {cancion.tono}</em>}
          </span>
          <button onClick={() => setPasos(p => p + 1)} aria-label="Subir un semitono">+</button>
          {pasos !== 0 && <button className="reset" onClick={() => setPasos(0)}>volver a mi tono</button>}
        </div>

        <Letra bloques={bloques} mostrar={mostrar} />
      </main>
    </>
  )
}

export default function App() {
  const hash = useHash()
  if (hash === '#/nueva') return <Editor />
  const m = hash.match(/^#\/c\/(.+)$/)
  return m ? <Cancion id={decodeURIComponent(m[1])} /> : <Lista />
}
