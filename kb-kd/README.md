# kb-kd — сцена в стиле Kaktus (браузер, three.js r169)

Эталон 26.10.2026 (Махди: «всё сделал отлично»): полотно Key Bridge ночью, бригада 8 человек.
Рецепт и правила — в проекте claude.ai `07-blender/threejs/kaktus-браузер.md`. Здесь только код.

| файл | что |
|---|---|
| `index.html` | сцена: плита-диорама в чёрной пустоте, ферма, отбойники, конусы, генератор, фонари, люди. `window.shot(pos, tgt, fov, aper, chip)` рисует кадр |
| `kd/models/*` | Poly Haven CC0 (gltf 1k): отбойник, генератор, прожектор, мешки, ящик, фонари |
| `kd/tex/*` | Poly Haven CC0 2k: asphalt_02, concrete_wall_006, green_metal_rust, concrete_floor_02 |
| `kd/figs/*.glb` | готовые люди (только геометрия full30 + цвет вершин для жилета + `userData.hands`): Remy_Digging, Remy_Crouch, James_Inspect, Leonard_Idle, Brian_Phone |
| `core/three/post.js` | пост lemo (DOF, GTAO, bloom, виньетка) с защитой от NaN |
| `tools/bake.html` | Mixamo FBX → поза → запечь → 1,80 м → одежда/кожа/full30/full15 + жилет-маска в цвет вершин |
| `tools/litefig.html` | из запечённого GLB оставить только full30 (то, что идёт в сцену) |
| `tools/lookdev.html` | лист стилей фигур (9 стилей обучалки) |
| `tools/kshot.js` | кадры через playwright в облаке (без GPU — только лёгкие сцены) |
| `tools/capture.js` | запись mp4 в браузере (WebCodecs + mp4-muxer) — ещё не проверено |

Сырые Mixamo FBX в репо не кладём (лицензия) — они на Маке `meridian/assets/mixamo/`.

## Запуск на GPU Мака (Chrome Махди, ~6 мс/кадр)
jsDelivr на новых коммитах этой папки отвечает 403 (папка ~46 МБ) → брать с raw.githubusercontent, а модуль post.js — с jsDelivr старого коммита:
```js
// вкладка https://example.com в Chrome (claude-in-chrome)
window.LOADKD = async (sha) => { window.READY = false; window.ERR = null; const R = 'https://raw.githubusercontent.com/makhdimekhrali-cyber/meridian/' + sha + '/kb-kd/'; let h = await (await fetch(R + 'index.html')).text();
  h = h.replace('"./core/three/post.js"', '"https://cdn.jsdelivr.net/gh/makhdimekhrali-cyber/meridian@0b27325cc65499b86b68b78275fb34f80ebaad1d/kb-kd/core/three/post.js"');
  h = h.replace('<head>', '<head><base href="' + R + '"><script>window.RW=1920;window.RH=1080;window.onerror=(m)=>{window.ERR=(window.ERR||[]).concat(String(m))};</script>'); document.open(); document.write(h); document.close(); };
await LOADKD('<sha>'); // ждать window.READY, потом +4 с на текстуры
Object.assign(document.querySelectorAll('canvas')[1].style, { width: '100%', height: 'auto' }); // HUD по размеру
window.shot([-4,7,-3],[2,.6,6.8],40,2);
```
Кадр забирать скриншотом Chrome с `save_to_disk: true` (файл появляется в облаке в `/tmp/claude-chrome-screenshots-*/`). Скачивание через `<a download>` Chrome блокирует после первого файла.

Ракурсы-эталоны: бригада сверху `[-4,7,-3]→[2,.6,6.8] fov40`; крупно копающий `[3.4,1.55,3.3]→[1.7,.85,6.9] fov35 aper5`; вдоль дороги `[-30,1.7,3]→[5,3,5] fov38`; общий `[-46,40,30]→[2,0,3] fov26`.
