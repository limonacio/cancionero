# cancionero

Sitio de canciones con letra y acordes en mi tonalidad. Vite + React.
Se publica en **cancionero.limonacio.com** y el portfolio lo enlaza desde Misceláneas.

## Agregar una canción
Todo está en `src/data/songs.js`. Copiá el bloque de ejemplo y escribí los acordes
entre corchetes, pegados a la sílaba donde cambian: `[Am]Esto es una [F]canción`.
`tono` es **tu** tonalidad (la de los acordes que escribís). Los botones − / + del
sitio transponen desde ahí.

## Correrlo
```
npm install
npm run dev
```

## Cargar una canción rápido (conversor)
Escribí la canción en el formato clásico de cancionero (acordes arriba, letra abajo, cada
acorde alineado con su sílaba) en un `.txt` dentro de `tools/`, y corré:
```
node tools/convertir.mjs tools/mi-cancion.txt
```
Genera `tools/mi-cancion.cuerpo.txt`: ese texto va dentro de `cuerpo: \`...\`` en `src/data/songs.js`.
Hay un ejemplo en `tools/ejemplo.txt`.
