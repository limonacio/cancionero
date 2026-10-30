import { useState, useMemo, useEffect } from 'react'
import Letra from './Letra.jsx'
import { parseSong } from './lib/chords.js'
import { convertirClasico, aMinusculas } from './lib/convertir.js'

const CLAVE = 'cancionero-borrador'

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

  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify({ titulo, artista, tono, texto, minusculas })) } catch { /* sin guardado */ }
  }, [titulo, artista, tono, texto, minusculas])

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
  const vaciar = () => {
    if (!window.confirm('¿Borrar el borrador? No se puede deshacer.')) return
    setTitulo(''); setArtista(''); setTono(''); setTexto('')
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
          A la derecha ves cómo queda. Este borrador se guarda en tu navegador; la canción se publica recién cuando pegás la entrada en <code>songs.js</code>.
        </p>

        <div className="campos">
          <label>Título<input value={titulo} onChange={e => setTitulo(e.target.value)} /></label>
          <label>Artista<input value={artista} onChange={e => setArtista(e.target.value)} /></label>
          <label className="corto">Mi tono<input value={tono} onChange={e => setTono(e.target.value)} placeholder="Am" /></label>
        </div>

        <div className="editor">
          <label className="col">
            <span className="rotulo">Canción con acordes</span>
            <textarea
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

        <div className="acciones">
          <button type="button" className="principal" onClick={copiar} disabled={!texto.trim()}>
            {copiado === 'ok' ? '¡Copiado!' : 'Copiar entrada para songs.js'}
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
