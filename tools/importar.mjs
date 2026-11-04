// Incorpora al proyecto las canciones exportadas desde la página.
// Uso (PowerShell):  node tools/importar.mjs            → toma el mis-canciones*.json más nuevo de Descargas
//                    node tools/importar.mjs ruta.json  → usa ese archivo
// Las suma a src/data/publicadas.json; si el id ya existe, la reemplaza.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const destino = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'publicadas.json')

function archivoOrigen() {
  if (process.argv[2]) return process.argv[2]
  const descargas = join(homedir(), 'Downloads')
  const candidatos = existsSync(descargas)
    ? readdirSync(descargas).filter(f => /^mis-canciones.*\.json$/i.test(f)).map(f => join(descargas, f))
    : []
  if (!candidatos.length) return null
  return candidatos.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0]
}

const origen = archivoOrigen()
if (!origen || !existsSync(origen)) {
  console.error('No encontré mis-canciones.json en Descargas. En la página tocá "exportar mis canciones para publicar" y volvé a probar.')
  process.exit(1)
}

const leerJson = (ruta) => JSON.parse(readFileSync(ruta, 'utf8').replace(/^﻿/, ''))
const nuevas = leerJson(origen)
const actuales = existsSync(destino) ? leerJson(destino) : []
const CAMPOS = ['id', 'titulo', 'artista', 'tono', 'cuerpo']

if (!Array.isArray(nuevas)) { console.error('El archivo no tiene el formato esperado (una lista de canciones).'); process.exit(1) }

const porId = new Map(actuales.map(c => [c.id, c]))
let agregadas = 0, reemplazadas = 0
for (const c of nuevas) {
  const falta = CAMPOS.filter(k => typeof c[k] !== 'string' || !c[k].trim())
  if (falta.length) { console.warn(`Salteo "${c.titulo ?? c.id ?? '?'}": le falta ${falta.join(', ')}`); continue }
  const limpia = Object.fromEntries(CAMPOS.map(k => [k, c[k]]))
  porId.has(c.id) ? reemplazadas++ : agregadas++
  porId.set(c.id, limpia)
}

writeFileSync(destino, JSON.stringify([...porId.values()], null, 2) + '\n', 'utf8')
console.log(`Listo: ${agregadas} agregada(s), ${reemplazadas} reemplazada(s). Total publicadas: ${porId.size}.`)
console.log('Ahora hacé el ACP para subirlas a la web.')
