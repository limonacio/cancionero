import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ARCHIVO = fileURLToPath(new URL('./src/data/publicadas.json', import.meta.url))
const CAMPOS = ['id', 'titulo', 'artista', 'tono', 'cuerpo']

// SOLO en desarrollo (npm run dev): deja que el editor escriba la canción en src/data/publicadas.json.
// En la web publicada este endpoint no existe, y el editor guarda en el navegador.
function guardarCanciones() {
  return {
    name: 'guardar-canciones',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__guardar-cancion', (req, res) => {
        const responder = (codigo, obj) => {
          res.statusCode = codigo
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(obj))
        }
        if (req.method !== 'POST') return responder(405, { error: 'metodo no permitido' })
        // Solo pedidos que vengan de esta misma página (evita que otro sitio escriba en tu proyecto)
        const origen = req.headers.origin
        if (origen) {
          let mismo = false
          try { mismo = new URL(origen).host === req.headers.host } catch { /* origen inválido */ }
          if (!mismo) return responder(403, { error: 'origen no permitido' })
        }
        let cuerpo = ''
        req.on('data', (d) => { cuerpo += d; if (cuerpo.length > 1e6) req.destroy() })
        req.on('end', () => {
          try {
            const c = JSON.parse(cuerpo)
            if (CAMPOS.some(k => typeof c[k] !== 'string' || !c[k].trim())) return responder(400, { error: 'faltan datos' })
            if (!/^[a-z0-9-]+$/.test(c.id)) return responder(400, { error: 'id invalido' })
            const limpia = Object.fromEntries(CAMPOS.map(k => [k, c[k]]))
            const lista = existsSync(ARCHIVO) ? JSON.parse(readFileSync(ARCHIVO, 'utf8').replace(/^﻿/, '')) : []
            const i = lista.findIndex(x => x.id === limpia.id)
            if (i >= 0) lista[i] = limpia
            else lista.push(limpia)
            writeFileSync(ARCHIVO, JSON.stringify(lista, null, 2) + '\n', 'utf8')
            responder(200, { ok: true, reemplazada: i >= 0 })
          } catch {
            responder(400, { error: 'JSON invalido' })
          }
        })
      })
    },
  }
}

// En desarrollo, las rutas del servidor Django se piden "por acá": así el navegador ve un solo sitio
// (mismo origen) y la sesión y la cookie de seguridad funcionan sin configuración extra.
const DJANGO = 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react(), guardarCanciones()],
  server: {
    proxy: {
      '/api': DJANGO,
      '/admin': DJANGO,
      '/static': DJANGO,   // estilos del panel de administración
    },
  },
})
