import { useState, useMemo, useEffect, useRef } from 'react'
import Letra from './Letra.jsx'
import { parseSong } from './lib/chords.js'
import { convertirClasico, aMinusculas } from './lib/convertir.js'
import { guardarPropia, borrarPropia, limpiarBorrador, refrescarRemotas } from './lib/propias.js'
import { sesion, guardarRemota } from './lib/api.js'

const CLAVE = 'cancionero-borrador'
const ORDINALES = ['Primera', 'Segunda', 'Tercera', 'Cuarta', 'Quinta', 'Sexta', 'Séptima', 'Octava', 'Novena', 'Décima']

// El almacenamiento del navegador puede fallar (ventana privada, bloqueado): siempre con try/catch.
const leerBorrador = () => {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || {} } catch { return {} }
}
const slug = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
// Dentro de un template literal hay que escapar \ ` y ${
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')

const EJEMPLO = `# Estrofa
Am          F
Esto es una canción de ejemplo
C                G
con la letra puesta abajo

# Estribillo
(F) También podés escribir los (C) acordes
entre paréntesis, (G) pegados a la (Am) sílaba`

export default function Editor() {
  const inicial = useMemo(leerBorrador, [])
  const [titulo, setTitulo]       = useState(inicial.titulo  || '')
  const [artista, setArtista]     = useState(inicial.artista || '')
  const [tono, setTono]           = useState(inicial.tono    || '')
  const [texto, setTexto]         = useState(inicial.texto   || '')
  const [minusculas, setMinusculas] = useState(!!inicial.minusculas)
  const [copiado, setCopiado]     = useState('')
  const [editando, setEditando]   = useState(inicial.editando || '')
  const [publica, setPublica]       = useState(!!inicial.publica)       // por defecto privada
  const [soloAcordes, setSoloAcordes] = useState(!!inicial.soloAcordes)
  const [servidor, setServidor]       = useState({ disponible: false, usuario: null })
  const [errorApi, setErrorApi]       = useState('')
  const areaRef = useRef(null)
  const guardada = useRef(false)   // tras guardar, no volver a escribir el borrador

  useEffect(() => {   // ¿está prendido el servidor Django y hay sesión? (solo corriendo en tu compu)
    if (import.meta.env.DEV) sesion().then(setServidor)
  }, [])

  useEffect(() => {
    if (guardada.current) return
    try { localStorage.setItem(CLAVE, JSON.stringify({ titulo, artista, tono, texto, minusculas, editando, publica, soloAcordes })) } catch { /* sin guardado */ }
  }, [titulo, artista, tono, texto, minusculas, editando, publica, soloAcordes])

  const cuerpo = useMemo(() => {
    const c = convertirClasico(texto)
    return minusculas ? aMinusculas(c) : c
  }, [texto, minusculas])
  const bloques  = useMemo(() => parseSong(cuerpo), [cuerpo])
  const nAcordes = useMemo(() => (cuerpo.match(/\[[^\]]+\]/g) || []).length, [cuerpo])

  const entrada = `  {
    id: ${JSON.stringify(slug(titulo) || 'nueva-cancion')},
    titulo: ${JSON.stringify(titulo || 'Título')},
    artista: ${JSON.stringify(artista || 'Artista')},
    tono: ${JSON.stringify(tono || 'Am')},
    cuerpo: \`
${esc(cuerpo)}
\`,
  },
`

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(entrada)
      setCopiado('ok')
      setTimeout(() => setCopiado(''), 2500)
    } catch { setCopiado('error') }
  }
  // Inserta una línea (título o marca) donde está el cursor, con las líneas en blanco que hagan falta.
  const insertar = (linea) => {
    const el = areaRef.current
    const ini = el ? el.selectionStart : texto.length
    const fin = el ? el.selectionEnd : texto.length
    const antes = texto.slice(0, ini)
    const despues = texto.slice(fin)
    const pre = antes === '' || antes.endsWith('\n\n') ? '' : antes.endsWith('\n') ? '\n' : '\n\n'
    const post = despues.startsWith('\n') ? '' : '\n'
    const hasta = antes + pre + linea + post
    setTexto(hasta + despues)
    requestAnimationFrame(() => { if (el) { el.focus(); el.setSelectionRange(hasta.length, hasta.length) } })
  }
  const nuevaEstrofa = () => {
    const n = (texto.match(/^#\s+.*estrofa\s*$/gim) || []).length
    insertar(`# ${n < ORDINALES.length ? `${ORDINALES[n]} estrofa` : `Estrofa ${n + 1}`}`)
  }
  const guardarAca = async () => {
    const id = slug(titulo) || 'nueva-cancion'
    const cancion = { id, titulo: titulo || 'Título', artista: artista || 'Artista', tono: tono || 'Am', cuerpo }
    let ok = false
    setErrorApi('')

    // 1) Con servidor Django y sesión iniciada: se guarda en la base de datos
    if (import.meta.env.DEV && servidor.usuario) {
      try {
        const guardadaEnBase = await guardarRemota({
          id: editando.startsWith('db-') ? editando : '',   // si se editaba una de la base, se actualiza; si no, se crea
          titulo: cancion.titulo, artista: cancion.artista, tono: cancion.tono, cuerpo,
          visibilidad: publica ? 'publica' : 'privada', solo_acordes: soloAcordes,
        })
        if (editando && !editando.startsWith('db-')) borrarPropia(editando)   // pasó a la base: sacar la copia del navegador
        guardada.current = true
        limpiarBorrador()
        await refrescarRemotas()
        window.location.hash = `#/c/${encodeURIComponent(guardadaEnBase.id)}`
      } catch (e) {
        setErrorApi(e.message)   // se queda en el editor, con el motivo a la vista
      }
      return
    }

    // 2) Sin sesión: corriendo en tu compu se escribe en publicadas.json; si no, en el navegador

    // Corriendo en tu compu (npm run dev): se escribe directo en src/data/publicadas.json
    if (import.meta.env.DEV) {
      try {
        const r = await fetch('/__guardar-cancion', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cancion),
        })
        if (r.ok) { ok = true; borrarPropia(id) }   // si había una copia en el navegador, ya no hace falta
      } catch { /* sin servidor local: se guarda en el navegador */ }
    }
    if (!ok) ok = guardarPropia(cancion)

    if (ok && editando && editando !== id) borrarPropia(editando)   // si cambió el título, no dejar la vieja
    if (ok) { guardada.current = true; limpiarBorrador() }
    if (ok) window.location.hash = `#/c/${encodeURIComponent(id)}`
    else setCopiado('error')
  }
  const vaciar = () => {
    if (!window.confirm('¿Borrar el borrador? No se puede deshacer.')) return
    setTitulo(''); setArtista(''); setTono(''); setTexto(''); setEditando('')
  }

  return (
    <>
      <header className="cabecera ancho">
        <a className="volver" href="#/">&#8249; cancionero</a>
        <span className="portfolio">editor</span>
      </header>
      <main className="ancho">
        <p className="intro">
          Escribí o pegá la canción. Los acordes pueden ir <strong>arriba de la letra</strong> o <strong>entre paréntesis dentro de la letra</strong>, como (Am).
          A la derecha ves cómo queda. {import.meta.env.DEV
            ? <>Estás en modo local: <strong>Guardar en el proyecto</strong> escribe la canción en <code>src/data/publicadas.json</code>. Después solo falta el ACP para subirla a la web.</>
            : <>"Guardar y ver" la deja en tu cancionero de este navegador. Para publicarla de verdad, corré el sitio en tu compu con <code>npm run dev</code> y cargala desde ahí.</>}
        </p>

        <div className="campos">
          <label>Título<input value={titulo} onChange={e => setTitulo(e.target.value)} /></label>
          <label>Artista<input value={artista} onChange={e => setArtista(e.target.value)} /></label>
          <label className="corto">Mi tono<input value={tono} onChange={e => setTono(e.target.value)} placeholder="Am" /></label>
        </div>

        <div className="editor">
          <label className="col">
            <span className="rotulo">Canción con acordes</span>
            <span className="herramientas">
              <button type="button" className="chico" onClick={nuevaEstrofa}>+ estrofa</button>
              <button type="button" className="chico" onClick={() => insertar('# Estribillo')}>+ estribillo</button>
              <button type="button" className="chico" onClick={() => insertar('# Puente')}>+ puente</button>
              <button type="button" className="chico" onClick={() => insertar('# Intro')}>+ intro</button>
              <button type="button" className="chico" onClick={() => insertar('---')}>cortar columna</button>
            </span>
            <textarea
              ref={areaRef}
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder={EJEMPLO}
              wrap="off"
              spellCheck={false}
              aria-label="Canción con acordes"
            />
            {!texto && <button type="button" className="chico" onClick={() => setTexto(EJEMPLO)}>cargar el ejemplo</button>}
            {texto.trim() && (
              nAcordes > 0
                ? <span className="estado">{nAcordes} {nAcordes === 1 ? 'acorde reconocido' : 'acordes reconocidos'}</span>
                : <span className="aviso">No reconocí ningún acorde. Escribilos solos arriba de la letra (Am, F#m, Em7, Asus2, C/G) o entre paréntesis dentro de la letra: (Am).</span>
            )}
          </label>

          <div className="col">
            <span className="rotulo">Así se ve</span>
            <div className="vista">
              {bloques.length
                ? <Letra bloques={bloques} />
                : <p className="vacio">Acá aparece la canción a medida que escribís.</p>}
            </div>
          </div>
        </div>

        <label className="opcion">
          <input type="checkbox" checked={minusculas} onChange={e => setMinusculas(e.target.checked)} />
          pasar la letra a minúsculas (los acordes no se tocan)
        </label>

        {import.meta.env.DEV && servidor.disponible && (
          servidor.usuario ? (
            <div className="opciones-base">
              <span className="estado">Conectado al servidor como <strong>{servidor.usuario}</strong>. Se guarda en la base de datos.</span>
              <label className="opcion">
                <input type="checkbox" checked={publica} onChange={e => setPublica(e.target.checked)} />
                pública (si no la marcás, solo la ves vos)
              </label>
              <label className="opcion">
                <input type="checkbox" checked={soloAcordes} onChange={e => setSoloAcordes(e.target.checked)} />
                mostrar solo acordes a los demás (sin la letra)
              </label>
            </div>
          ) : (
            <p className="aviso">El servidor está prendido pero no iniciaste sesión. <a href="/admin/" target="_blank" rel="noreferrer">Iniciá sesión acá</a>, volvé y recargá esta página para guardar en la base de datos.</p>
          )
        )}
        {errorApi && <p className="aviso">No se pudo guardar: {errorApi}</p>}

        <div className="acciones">
          <button type="button" className="principal" onClick={guardarAca} disabled={!texto.trim() || !titulo.trim()}>
            {import.meta.env.DEV ? (servidor.usuario ? 'Guardar en la base de datos' : 'Guardar en el proyecto') : 'Guardar y ver'}
          </button>
          <button type="button" className="chico" onClick={copiar} disabled={!texto.trim()}>
            {copiado === 'ok' ? '¡Copiado!' : 'copiar para publicar (songs.js)'}
          </button>
          <button type="button" className="chico" onClick={vaciar}>borrar borrador</button>
          {copiado === 'error' && <span className="aviso">No pude copiar solo: seleccioná el código de abajo y copialo a mano.</span>}
        </div>

        <details className="codigo" open={copiado === 'error'}>
          <summary>ver el código que se copia</summary>
          <textarea readOnly value={entrada} wrap="off" aria-label="Entrada para songs.js" />
        </details>
      </main>
    </>
  )
}
