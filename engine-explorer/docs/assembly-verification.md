# Verificación de la vista Montaje

## Comprobación CPU reproducible

Ejecutar desde el proyecto, con las dependencias locales instaladas:

```sh
node tests/assembly.mjs
```

La comprobación no requiere navegador, GPU ni instalaciones globales de skills. Construye temporalmente los módulos con el `esbuild` del proyecto, usa Three.js en CPU y elimina el paquete temporal al terminar.

Comprueba:

- Identificadores físicos estables y únicos; numeración consecutiva desde 1 por tipo de ficha.
- Cada malla física del motor canónico pertenece a una sola unidad. Los efectos de combustión y chispa quedan fuera del inventario.
- Cantidades numéricas de las 102 fichas, más las cantidades explícitas de apoyos de bancada y árbol de levas, guías y retenes de escape, asientos y contratuercas complementarios.
- Diez capítulos; una instalación por unidad; cuatro inserciones de pistón, cuatro cierres de tapa de biela, cinco apoyos de bancada y una unión de culata como pasos de conjunto; textos ES/EN e identificadores de enlaces resolubles.
- Todos los pasos pueden completarse mediante selección directa y el contador coincide con las unidades realmente instaladas.
- Inicio sin unidades instaladas, final completo y transformaciones finitas, incluidas las instancias de dientes de correa.
- Avance, retroceso y saltos reproducen exactamente la misma pose sin depender del historial; el modo interior tampoco acumula estado.
- Al finalizar, cada clon conserva la geometría, el material y la pose del motor canónico; conversión de milímetros a metros aplicada una sola vez. Seleccionar una pequeña chaveta ya instalada enfoca su ubicación real con un encuadre propio.
- El montaje, la transparencia y la liberación de recursos no modifican ni destruyen el motor canónico compartido con Anatomy.

Estas comprobaciones certifican consistencia de software y correspondencia con el modelo compartido. No convierten las dimensiones ilustrativas en cotas de fabricación ni certifican una trayectoria real de montaje de taller.

## Resultado CPU — 10 de noviembre de 2026

`node tests/assembly.mjs` aprobado:

- 102 tipos de catálogo cubiertos y 21 tipos de detalle adicionales explícitos.
- 374 unidades físicas, 1649 mallas con propietario único y 388 pasos seleccionables.
- Completado directo de cada paso y 75 poses finitas con saltos hacia delante y atrás.
- Diez capítulos; cantidades correctas; pose final canónica; geometrías y materiales compartidos conservados después de liberar la vista.

`node tests/anatomy-pbr.mjs` aprobado: 102 reconstrucciones de respaldo y 102 extracciones del motor canónico; 204 modelos y 1836 poses finitas. La bomba de agua ahora reutiliza su polea real del modelo. Su relación ilustrativa compartida ya existía; la prueba comprueba esa relación explícitamente y no exige que una relación no entera cierre su rotación tras 720° de cigüeñal.

## Revisión visual y de interacción

La revisión de navegador debe cubrir además:

- Bandejas del capítulo activo y observación de piezas pequeñas, componentes internos e inserciones sin interferencias visibles.
- Giro manual que detiene el seguimiento de cámara; reanudación explícita; regreso a una vista anterior y retorno al montaje pausado en el mismo punto.
- Conservación de cámara, paso y selección al cambiar entre español e inglés.
- Reproducir, pausa, anterior/siguiente, velocidad, reinicio, capítulos, barra temporal, atajo 8, narración opcional y enlaces `?view=assembly&step=<id>`.
- Preferencia de movimiento reducido, foco visible y uso completo con teclado.
- Anchos 375, 768, 1024 y 1440 px; texto al 160–240 % y móvil en horizontal.

### Resultado de navegador — 10 de noviembre de 2026

Revisión realizada en el navegador integrado sobre la compilación local:

- Reproducción real, pausa, anterior/siguiente, velocidad y búsqueda temporal: aprobadas. El final muestra 374/374 unidades, 100 %, avance siguiente desactivado y reproducción detenida.
- Cambio español/inglés en el paso de inserción del pistón conserva progreso (1007/10000), selección y encuadre; los iconos permanecen presentes.
- Giro con teclado desactiva seguimiento; salir devuelve foco a la vista anterior; volver con **8** conserva progreso (5305/10000), cámara y estado pausado.
- Búsqueda de `keepers-valve:32` localiza la última chaveta, la hace visible y permite observarla de cerca. Las bandejas y sus contornos se revisaron en bancada y pistones. Las inserciones de conjuntos permanecen esquemáticas, sin certificación de colisiones de taller.
- Movimiento reducido: reproducir desde el final vuelve a cero en pausa; otra activación coloca inmediatamente una unidad y permanece en pausa.
- Narración opcional activada y detenida desde el control, sin errores de consola. La disponibilidad y pronunciación de voces dependen del navegador/sistema.
- Anchos revisados: 375, 768, 1024 y 1456 px; horizontal 812 × 375. Sin desbordamiento horizontal de la página al 160 % de texto. A 1456 × 800, el canvas mide 360 px de alto.
- A 375 px y texto al 240 %, el diseño se apila, conserva un canvas de 487 px y no desborda horizontalmente. Revisión visual en oscuro, claro y suave; los nuevos controles usan los colores y estados compartidos.
- Las líneas de etiquetas del explorador normal quedan ocultas en Montaje incluso después de salir y volver. El SVG requiere atributo `hidden`, no una propiedad JavaScript sin reflejo.

Capturas: `tests/assembly-review/desktop-es.jpg`, `375.jpg`, `375-text-240.jpg`, `soft.jpg` y `complete.jpg`. Resultados resumidos en `tests/assembly-ui-review.json`.

Los tamaños móviles se comprobaron mediante viewport, sin medir rendimiento en un teléfono físico. Las pruebas CPU prueban determinismo y correspondencia con el modelo; la revisión visual de trayectorias representativas no demuestra ausencia de todas las interferencias posibles ni valida tolerancias físicas.
