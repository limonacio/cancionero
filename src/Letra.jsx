export default function Letra({ bloques, mostrar = (a) => a }) {
  return (
    <article className="letra">
      {bloques.map((b, i) => (
        <section key={i} className={`bloque${/^(segunda|tercera) parte$/i.test(b.seccion || '') ? ' nueva-columna' : ''}`}>
          {b.seccion && <h2 className="seccion">{b.seccion}</h2>}
          {b.lineas.map((linea, j) => (
            <p key={j} className="linea">
              {/* Si la línea no lleva acordes, no se reserva la fila de arriba: así la letra sola no ocupa doble */}
              {linea.some(s => s.acorde)
                ? linea.map((s, k) => (
                    <span key={k} className="tramo">
                      <span className="acorde">{s.acorde ? mostrar(s.acorde) : ' '}</span>
                      <span className="texto">{s.texto || ' '}</span>
                    </span>
                  ))
                : linea.map((s, k) => <span key={k} className="texto">{s.texto}</span>)}
            </p>
          ))}
        </section>
      ))}
    </article>
  )
}
