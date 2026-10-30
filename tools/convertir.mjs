// ─────────────────────────────────────────────────────────────
//  tools/convertir.mjs
//
//  Pasa una canción escrita en el formato CLÁSICO de cancionero
//  (línea de acordes arriba, letra abajo) al formato del sitio
//  (acordes entre corchetes, pegados a la sílaba).
//
//  Uso (desde C:\dev\cancionero):
//    node tools/convertir.mjs tools/ejemplo.txt
//  Crea tools/ejemplo.cuerpo.txt: ese texto es el que va dentro de
//  `cuerpo: \`...\`` en src/data/songs.js.
//
//  Reglas del formato de entrada:
//    - Una línea con SOLO acordes (Am  F  C/G  Em7  Asus2) queda sobre la línea de letra siguiente.
//    - Cada acorde cae en la columna donde lo escribas: alineá con la sílaba.
//    - Una línea "# Estrofa" o "[Estribillo]" abre una sección.
//    - Una línea vacía separa bloques.
//  Se escribe a un ARCHIVO (no con ">") porque PowerShell 5 redirige en UTF-16 y rompe las tildes.
// ─────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync } from 'node:fs'

const ACORDE = /^[A-G][#b]?(?:m(?!aj)|M|maj|min|dim|aug|sus|add|\+|°|º)?[0-9]*(?:sus[0-9]*|add[0-9]+|maj[0-9]+|[b#][0-9]+)*(?:\/[A-G][#b]?)?$/

const archivo = process.argv[2]
if (!archivo) {
  console.error('Falta el archivo. Ejemplo: node tools/convertir.mjs tools/ejemplo.txt')
  process.exit(1)
}

const esLineaDeAcordes = (l) => {
  const t = l.trim().split(/\s+/).filter(Boolean)
  return t.length > 0 && t.every(x => ACORDE.test(x))
}
const seccion = (l) => {
  const m = l.match(/^#\s+(.+)$/) || l.match(/^\[(.+)\]$/)
  if (!m || ACORDE.test(m[1].trim())) return null
  return m[1].trim()
}

// Inserta cada acorde en su columna de la línea de letra (de derecha a izquierda,
// para que las posiciones anteriores no se muevan).
function unir(lineaAcordes, letra) {
  const pos = [...lineaAcordes.matchAll(/\S+/g)].map(m => ({ i: m.index, a: m[0] }))
  let out = letra
  const maxCol = pos.length ? pos[pos.length - 1].i : 0
  if (out.length < maxCol) out = out.padEnd(maxCol, ' ')
  for (const { i, a } of pos.reverse()) out = out.slice(0, i) + `[${a}]` + out.slice(i)
  return out
}

const lineas = readFileSync(archivo, 'utf8').replace(/\t/g, '    ').split(/\r?\n/)
const salida = []
for (let n = 0; n < lineas.length; n++) {
  const l = lineas[n]
  const sec = seccion(l.trim())
  if (sec) { salida.push(`# ${sec}`); continue }
  if (l.trim() === '') { salida.push(''); continue }
  if (esLineaDeAcordes(l)) {
    const sig = lineas[n + 1]
    const haySigLetra = sig !== undefined && sig.trim() !== '' && !esLineaDeAcordes(sig) && !seccion(sig.trim())
    if (haySigLetra) { salida.push(unir(l, sig)); n++ }
    else salida.push(l.trim().split(/\s+/).map(a => `[${a}]`).join('  '))  // línea solo de acordes (intro, puente)
    continue
  }
  salida.push(l.trimEnd())   // letra sin acordes
}

const destino = archivo.replace(/\.txt$/i, '') + '.cuerpo.txt'
writeFileSync(destino, salida.join('\n') + '\n', 'utf8')
console.log(salida.join('\n'))
console.log(`\n→ Guardado en ${destino}`)
