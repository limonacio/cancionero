// Uso:  node tools/convertir.mjs tools/mi-cancion.txt
// Crea tools/mi-cancion.cuerpo.txt. (El editor del sitio, #/nueva, hace lo mismo sin terminal.)
// Se escribe a un ARCHIVO y no con ">" porque PowerShell 5 redirige en UTF-16 y rompe las tildes.
import { readFileSync, writeFileSync } from 'node:fs'
import { convertirClasico } from '../src/lib/convertir.js'

const archivo = process.argv[2]
if (!archivo) { console.error('Falta el archivo. Ejemplo: node tools/convertir.mjs tools/ejemplo.txt'); process.exit(1) }

const salida = convertirClasico(readFileSync(archivo, 'utf8'))
const destino = archivo.replace(/\.txt$/i, '') + '.cuerpo.txt'
writeFileSync(destino, salida + '\n', 'utf8')
console.log(salida + `\n\n→ Guardado en ${destino}`)
