# Explorador del motor Honda F22A6

## Portada y publicación

La portada bilingüe está en `../index.html`. El botón **Entrar al explorador** abre el dashboard existente y conserva las direcciones de las piezas individuales.

El build de producción utiliza dependencias del proyecto con versiones fijadas; no requiere una skill global:

```sh
npm ci
npm run build
npm test
```

Desde `engine-explorer/`, estos comandos generan los dos dashboards, la portada y `dist/` para Vercel. La publicación conserva los videos y subtítulos en ambos idiomas y los diagramas OEM. Los archivos de desarrollo y los archivos históricos permanecen respaldados en GitHub.

**Español · [English](README.md)**

Reconstrucción educativa de un **F22A6 de fábrica, Honda Accord EX sedán 1993, transmisión manual de cinco marchas**. La identificación del motor está confirmada por el estampado y los documentos del propietario. El mercado original y la especificación de emisiones siguen sin confirmar.

## Abrir y elegir idioma

Abre `index.html` para el motor completo y `anatomy.html` para las piezas individuales. El selector **Español / English**, situado en la cabecera de ambas páginas, cambia controles, explicaciones, avisos, etiquetas accesibles, narración y videos. La preferencia se guarda en este navegador y se comparte entre las dos páginas. El español es el idioma inicial.

El cambio de idioma conserva la pieza seleccionada, la cámara, la vista, los ajustes y el estado de reproducción. Los diagramas y documentos originales de Honda conservan su idioma de origen.

Los archivos HTML incluyen código, estilos y recursos de representación. Mantén `anatomy-media/f22a6/` junto al catálogo y `../Honda Reference Library/F22A6_1993_5MT/` en su ubicación para acceder a los videos y referencias. Se recomienda servir el proyecto por HTTP local:

```sh
# Desde Honda Accord Motor Project:
python3 -m http.server 8765 --bind 127.0.0.1
# http://127.0.0.1:8765/engine-explorer/index.html
# http://127.0.0.1:8765/engine-explorer/anatomy.html
```

## Espacio de trabajo inmersivo

El lienzo del motor completo ocupa toda la pantalla. **Vistas** abre el menú izquierdo; **Explorar** (o **Montaje**, en esa vista) abre el panel de información derecho. Ambos empiezan cerrados. A partir de **1100 px de ancho**, los paneles no son modales: puedes girar el motor, controlar la reproducción y cambiar el idioma mientras lees la explicación. En pantallas más pequeñas, el panel es modal y mantiene el foco del teclado dentro hasta cerrarlo.

La barra inferior compacta mantiene visible reproducir/pausar. **Controles** despliega la velocidad y el avance por pasos, además de la línea de tiempo en Montaje; empieza cerrado y conserva su estado al cambiar la vista o el idioma. **Escape** cierra el panel y devuelve el foco al control que lo abrió. Elegir una vista cierra su menú y enfoca el lienzo. Se conservan los ajustes de movimiento reducido; en Montaje, reproducir avanza directamente al siguiente paso terminado cuando esta opción está activada.

### Puntos de piezas y zoom

Las vistas de inspección muestran puntos numerados compactos de forma predeterminada. Pasa el cursor, enfoca un punto con el teclado o tócalo para ver su nombre en una sola tarjeta de vista previa. **Ver detalles** abre la información de esa pieza en el panel lateral. **Nombres / Labels** activa los nombres desplegados; Pantalla también permite mostrar solo la pieza seleccionada u ocultar todas las etiquetas. Los puntos y nombres evitan los controles y otras etiquetas; si falta espacio, se omiten en lugar de superponerse.

Los botones visibles **Acercar motor / Alejar motor** usan los mismos límites de cámara que la rueda y las teclas **+ / −**. En Montaje, el zoom manual detiene el seguimiento de cámara sin cambiar el progreso; **Seguir pieza** lo reanuda.

## Controles

- **Vistas, teclas 1–8:** exterior, sin tapa de válvulas, sin tapas de distribución, corte de un cilindro, cigüeñal, admisión secundaria IAB, despiece y montaje guiado.
- **Cámara:** arrastra para girar; usa los botones de zoom, la rueda o +/− para acercar y alejar. Con el visor enfocado, las flechas giran la cámara y Mayús aumenta el paso. R restablece la vista. Pantalla incluye seis direcciones de inspección y una vista de tres cuartos.
- **Información:** las pestañas Piezas, Detalles y Movimiento separan sus contenidos. Flechas, Inicio y Fin recorren las pestañas. `/` enfoca la búsqueda; N/P seleccionan piezas contiguas; Escape cierra un panel o diálogo; si ninguno está abierto, borra la selección.
- **Reproducción:** Espacio inicia o pausa; coma y punto retroceden o avanzan el cigüeñal. Movimiento muestra las fases de los cilindros, el paso angular y los recorridos esquemáticos de admisión, escape, aceite y refrigerante.
- **Admisión IAB, tecla I:** estado independiente de apertura o cierre de cuatro mariposas secundarias. No modifica los perfiles de las válvulas. No representa un umbral de activación de fábrica.
- **Accesibilidad:** texto del 100 al 240 %, tamaño independiente de rótulos, tres temas de contraste, movimiento reducido, nombres hablados y lectura en voz alta. Las palabras y formas complementan el color. Los ajustes se guardan localmente.

## Catálogo y videos

Hay **102 tipos de piezas en 12 sistemas**, vinculados a **63 grupos seleccionables del motor completo**. **78 tipos extraen directamente sus mallas y materiales originales**; **24 usan reconstrucciones PBR complementarias** para mostrar detalles funcionales ausentes del conjunto. Cada ficha indica el origen y las aproximaciones. Un tipo no equivale a una sola unidad instalada: la ficha del pistón representa cuatro pistones, por ejemplo. Las alternativas OEM y las clases de cojinetes no se cuentan como piezas instaladas simultáneamente.

Cada ficha tiene nombre, cantidad, ubicación, función, conexiones, explicación del movimiento, tres pasos de funcionamiento y referencias OEM en español e inglés. Las piezas fijas permanecen fijas; sus videos mueven la cámara para inspeccionarlas. Los actuadores y las bombas muestran elementos móviles y estacionarios cuando están modelados. Se incluyen volante, disco y plato de presión de la transmisión manual; no se representan los mecanismos internos de la caja ni una simulación completa del desembrague.

Cada idioma tiene **102 videos de 12 segundos**, con póster JPEG y subtítulos WebVTT. El texto explicativo también está integrado en la imagen del video. La colección en español está en `anatomy-media/f22a6/`; la de inglés, en `anatomy-media/f22a6/en/`. El selector carga la versión correspondiente.

Los MP4 **no incluyen audio grabado**. El botón Escuchar usa la síntesis de voz del navegador en el idioma elegido. Las voces disponibles y su pronunciación dependen del sistema. Los manifiestos registran la identidad del motor y la revisión de las fuentes; los enlaces incorporan su huella para evitar videos obsoletos. Los enlaces antiguos a piezas eliminadas muestran una explicación.

## Referencias y límites

El paquete activo contiene **52 diagramas OEM**: 26 conjuntos para cada catálogo KA y KL del EX sedán 1993 5MT, páginas guardadas y datos estructurados, **60 fotografías de repuestos**, una fotografía exterior de alcance limitado, el manual del propietario y folleto Honda de 1993, un extracto de servicio, fuentes y sus huellas, comparación KA/KL y auditoría de reutilización o reconstrucción.

El punto de entrada es `../Honda Reference Library/F22A6_1993_5MT/04_Reports/reference_report.html`. Cada dato distingue documentación, reconstrucción visual y aproximación. Un despiece establece relaciones de montaje; no es un plano de fabricación a escala. Las referencias KA/KL no identifican por sí solas el mercado del automóvil del propietario.

El manual del propietario Honda de 1993, página impresa 159, documenta **85 mm de diámetro, 95 mm de carrera, 2156 cm³ y relación de compresión 8,8:1**. El recorrido del pistón sigue esa carrera. Las superficies de la cámara no se han calibrado para reproducir el volumen de la relación de compresión publicada.

El inventario OEM documenta un árbol de levas, ocho balancines de admisión de tipos A/B, ocho de escape, dos tramos cortos y tres largos de apoyo de admisión, un eje de escape, dieciséis ajustadores, cuatro tuercas ciegas de tapa, los componentes IAB y los accesorios del motor para transmisión manual. El exterior reconstruido incluye tapa negra 16 VALVE, cuerpo IAB de ocho conductos con cuatro mariposas, colector de admisión, escape y pantalla térmica, bobina externa y volante/embrague manual.

Persisten estas limitaciones:

- Falta un conjunto de fotografías desde seis direcciones de un F22A6 con estampado comprobado. La foto de concesionario corresponde a un EX automático de 1993 y solo respalda rasgos comunes de tapa y admisión.
- No están medidos los perfiles exactos de leva, la disposición de sus pistas de contacto ni sus anchuras. Se usa una disposición didáctica fija, igual elevación de ambas válvulas de admisión y sin conmutación hidráulica.
- Biela de 142 mm, separación de cilindros de 96 mm, elevaciones y ángulos de válvulas, diámetros de bulones y muñequillas, envolventes de fundición y muchos tornillos son dimensiones ilustrativas, no cotas verificadas de mecanizado.
- El modelo aplica orden de encendido 1-3-4-2 y ejes de equilibrado contrarrotantes al doble de velocidad del cigüeñal. Falta la página primaria del manual de taller A6 que los confirme en el registro de evidencia. Árbol de levas y distribuidor giran a la mitad de la velocidad del cigüeñal.
- El equilibrador posterior tiene entrada por correa y pareja de engranajes inversores. Sus posiciones, perfiles, dientes, fases y engrane son aproximados.
- Rutas de vacío, calibración de emisiones y umbrales de ECU siguen sin confirmar. La apertura IAB es un estado educativo independiente.
- Los recorridos de aceite y refrigerante son esquemáticos. No se calculan presiones, temperaturas, cargas, deformaciones, tolerancias ni todas las holguras.
- Una holgura positiva en poses muestreadas del modelo no demuestra la holgura ni la seguridad de distribución del motor real.

## Organización de las fuentes

```text
src/engine-spec.js          identidad, dimensiones, relaciones y evidencia
src/kin.js                  mecánica determinista según ángulo del cigüeñal
src/parts.js                registro del motor completo y referencias OEM
src/engine.js               modelo completo y actualización de poses
src/detail-internals.js     detalles internos
src/detail-exterior.js      admisión, IAB, escape, encendido y embrague
src/detail-castings.js      tapas, culata y bloque
src/detail-timing.js        correas y poleas
src/exterior-layout.js      coordenadas compartidas
src/studio.js               iluminación y materiales comunes
src/flows.js                recorridos esquemáticos de fluidos
src/views.js                vistas educativas y direcciones de cámara
src/app.js, app/style.css   panel del motor completo
app/immersive.css          lienzo a pantalla completa, paneles y controles flotantes
src/ui/immersive.js         paneles adaptables, foco y reflejo de la reproducción
src/ui/framing.js           proyección para retrato/paneles sin cambiar la cámara
src/ui/annotations.js       colocación determinista de puntos/rótulos sin tapar controles
src/ui/engine-annotations.js puntos persistentes, vista previa y selección de piezas
src/i18n/{es,en}.js         textos y narración del motor
src/i18n/locale.js          preferencia de idioma compartida
src/anatomy/catalog.js      fichas en español y evidencia
src/anatomy/catalog-en.js   traducción completa al inglés
src/anatomy/catalog-i18n.js acceso al catálogo en cada idioma
src/anatomy/engine-parts.js extracción de mallas y materiales originales
src/anatomy/figures.mjs     reconstrucciones complementarias Anatomy
src/anatomy/motion.mjs      movimiento complementario determinista
src/anatomy/pbr-runtime.js  representación compartida de piezas y videos
src/anatomy/ui.js           catálogo, accesibilidad y medios por idioma
anatomy-media/f22a6/        videos, pósteres, subtítulos y manifiesto en español
anatomy-media/f22a6/en/     colección equivalente en inglés
```

## Compilar y verificar

Desde `engine-explorer/`, con las dependencias existentes de la skill teardown:

```sh
./scripts/build.sh
node scripts/build-anatomy.mjs
node tests/timing.mjs
node tests/geometry.mjs
node tests/anatomy.mjs
node tests/anatomy-pbr.mjs
node tests/i18n.mjs
```

Las comprobaciones cubren relaciones mecánicas, recorrido de pistones, poses deterministas, accionamiento IAB independiente, geometría finita, holgura muestreada, referencias OEM y coincidencia de mallas/materiales. La revisión de navegador está en `tests/ui-review.json` y la bilingüe en `tests/i18n-ui-review.json`. Las pruebas verifican la implementación, no las dimensiones reales pendientes de documentar.

Para regenerar los videos con el mismo renderizador PBR del catálogo:

```sh
node scripts/export-anatomy-pbr.mjs --port 8766 --theme light --language es
# Abre la dirección local y pulsa «Iniciar toda la colección».
node scripts/select-anatomy-posters.mjs --language es
node scripts/anatomy-video-verify.mjs --language es --revision REVISION_DEL_EXPORTADOR
node scripts/build-anatomy.mjs
# Repite los tres primeros comandos con --language en para la colección inglesa.
```

El exportador recibe sus propios fotogramas en la interfaz local y usa ffmpeg/ffprobe. Verifica cada MP4 antes de registrarlo y permite reanudar la misma revisión. No cambies geometría o explicaciones durante un lote.

## Versión anterior conservada

Antes de corregir la identidad del motor se archivaron 385 archivos de fuentes, referencias y medios, comprobados con SHA-256, en `../Archives/F22B1_before_F22A6_2026-11-07_11-58-58/project-and-references.tar.gz`, junto con `manifest.json`. Los videos anteriores están en `legacy-media/` del archivo. Las fotografías VTEC y documentación 1994–96 quedan fuera de las referencias activas del F22A6.
