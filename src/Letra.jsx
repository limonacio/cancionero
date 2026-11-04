import { agrupar } from './lib/agrupar.js'

export default function Letra({ bloques, mostrar = (a) => a }) {
  return (
    <article className="letra">
      {agrupar(bloques).map((g, gi) => (
        <div key={gi} className={`grupo${g.columna ? ' nueva-columna' : ''}`}>
          {g.bloques.map((b, i) => (
            <section key={i} className="bloque">
              {b.seccion && <h2 className="seccion">{b.seccion}</h2>}
              {b.lineas.map((linea, j) => (
                <p key={j} className="linea">
                  {linea.some(s => s.acorde)
                    ? linea.map((s, k) => (
                        <span key={k} className="tramo">
                          <span className="acorde">{s.acorde ? mostrar(s.acorde) : ' '}</span>
                          <span className="texto">{s.texto || ' '}</span>
                        </span>))
                    : linea.map((s, k) => <span key={k} className="texto">{s.texto}</span>)}
                </p>))}
            </section>))}
        </div>))}
    </article>)
}
