// ===== MEDISHORT360 · Conversor %→g · app.js =====

// ——— Datos de ejemplos precargados ———
const EJEMPLOS = [
  { nombre: 'Sulfato de Magnesio',     conc: 20,   vol: 10   },
  { nombre: 'Gluconato de Calcio',     conc: 10,   vol: 10   },
  { nombre: 'Bicarbonato de Sodio',    conc: 8.4,  vol: 10   },
  { nombre: 'Cloruro de Sodio 0.9%',  conc: 0.9,  vol: 1000 },
  { nombre: 'Cloruro de Sodio 20%',   conc: 20,   vol: 10   },
  { nombre: 'Cloruro de Potasio 20%', conc: 20,   vol: 10   },
  { nombre: 'Dextrosa 5%',            conc: 5,    vol: 1000 },
  { nombre: 'Dextrosa 10%',           conc: 10,   vol: 1000 },
  { nombre: 'Dextrosa 50%',           conc: 50,   vol: 500  },
  { nombre: 'Epinefrina Racémica',    conc: 2.25, vol: 0.5  },
];

// ——— Navegación entre secciones ———
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));

  document.getElementById('sec-' + id).classList.remove('hidden');

  const pills = document.querySelectorAll('.nav-pill');
  const map = { calculadora: 0, ejemplos: 1, manual: 2 };
  if (map[id] !== undefined) pills[map[id]].classList.add('active');

  if (id === 'ejemplos') renderEjemplos();
}

// ——— Cargar medicamento rápido ———
function cargarMed(nombre, conc, vol) {
  document.getElementById('inputNombre').value = nombre;
  document.getElementById('inputConc').value = conc;
  document.getElementById('inputVol').value = vol;
  calcular();
  // scroll to result
  setTimeout(() => {
    document.getElementById('resultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// ——— Función principal de cálculo ———
function calcular() {
  const nombre = document.getElementById('inputNombre').value.trim() || 'Medicamento';
  const conc   = parseFloat(document.getElementById('inputConc').value);
  const vol    = parseFloat(document.getElementById('inputVol').value);

  if (isNaN(conc) || isNaN(vol) || conc <= 0 || vol <= 0) {
    alert('⚠️ Por favor ingresa una concentración y un volumen válidos.');
    return;
  }
  if (conc > 100) {
    alert('⚠️ La concentración no puede ser mayor al 100%.');
    return;
  }

  const resultado = computar(conc, vol);

  // Actualizar UI
  document.getElementById('resNombre').textContent = nombre;
  document.getElementById('resConc').textContent   = formatNum(conc) + '%';
  document.getElementById('resVol').textContent    = formatNum(vol) + ' mL';

  // Paso a paso
  document.getElementById('pasoAPaso').innerHTML = buildPasoAPaso(nombre, conc, vol, resultado);

  // Resultado final
  document.getElementById('resBig').textContent    = formatNum(resultado.gTotal) + ' g en ' + formatNum(vol) + ' mL';
  document.getElementById('resMgMl').textContent   = formatNum(resultado.mgMl) + ' mg/mL';
  document.getElementById('resMgTotal').textContent = formatNum(resultado.mgTotal) + ' mg';
  document.getElementById('resGTotal').textContent  = formatNum(resultado.gTotal) + ' g';

  // Barra proporcional (% respecto a 100 mL máximo referencial)
  const pct = Math.min((resultado.mgMl / 1000) * 100, 100);
  document.getElementById('barraFill').style.width = pct + '%';
  document.getElementById('barraLabel').textContent = formatNum(resultado.mgMl) + ' mg/mL';

  // Mostrar card
  const resCard = document.getElementById('resultado');
  resCard.classList.remove('hidden');
}

// ——— Cálculo ———
function computar(conc, vol) {
  const mgMl   = (conc * 1000) / 100;   // mg/mL
  const mgTotal = mgMl * vol;             // mg totales
  const gTotal  = mgTotal / 1000;         // g totales
  return { mgMl, mgTotal, gTotal };
}

// ——— Paso a paso ———
function buildPasoAPaso(nombre, conc, vol, r) {
  const lines = [
    `<span class="paso-line">1. <span class="paso-highlight">${formatNum(conc)}%</span> significa que hay <span class="paso-highlight">${formatNum(conc)} g</span> por cada <span class="paso-highlight">100 mL</span></span>`,
    `<span class="paso-line">2. <span class="paso-highlight">${formatNum(conc)} g ÷ 100 mL = ${formatNum(r.mgMl / 1000)} g/mL = <span class="paso-highlight">${formatNum(r.mgMl)} mg/mL</span></span>`,
    `<span class="paso-line">3. <span class="paso-highlight">${formatNum(r.mgMl)} mg/mL × ${formatNum(vol)} mL = <span class="paso-highlight">${formatNum(r.mgTotal)} mg</span></span>`,
    `<span class="paso-line paso-result">✅ Resultado: <strong>${formatNum(r.gTotal)} g</strong> en <strong>${formatNum(vol)} mL</strong></span>`,
  ];
  return lines.join('');
}

// ——— Render de ejemplos ———
function renderEjemplos() {
  const container = document.getElementById('ejemplosGrid');
  if (container.innerHTML !== '') return; // ya renderizado

  container.innerHTML = EJEMPLOS.map((ej, i) => {
    const r = computar(ej.conc, ej.vol);
    return `
      <div class="ejemplo-item" id="ej-${i}" onclick="toggleEjemplo(${i})">
        <div class="ejemplo-header">
          <span class="ej-name">${ej.nombre}</span>
          <div class="ej-badges">
            <span class="ej-badge gold">${formatNum(ej.conc)}%</span>
            <span class="ej-badge">${formatNum(ej.vol)} mL</span>
          </div>
        </div>
        <div class="ejemplo-body">
          <div class="ej-paso">
            1. ${formatNum(ej.conc)}% = ${formatNum(ej.conc)} g / 100 mL<br/>
            2. ${formatNum(ej.conc)} g ÷ 100 mL = <span class="cyan">${formatNum(r.mgMl)} mg/mL</span><br/>
            3. ${formatNum(r.mgMl)} mg/mL × ${formatNum(ej.vol)} mL = <span class="cyan">${formatNum(r.mgTotal)} mg</span><br/>
            ✅ Contiene <strong>${formatNum(r.gTotal)} g</strong> en ${formatNum(ej.vol)} mL
          </div>
          <div class="ej-resultados">
            <div class="ej-res-item">
              <span class="ej-res-label">mg/mL</span>
              <span class="ej-res-val">${formatNum(r.mgMl)}</span>
            </div>
            <div class="ej-res-item">
              <span class="ej-res-label">mg totales</span>
              <span class="ej-res-val">${formatNum(r.mgTotal)}</span>
            </div>
            <div class="ej-res-item">
              <span class="ej-res-label">g totales</span>
              <span class="ej-res-val">${formatNum(r.gTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleEjemplo(i) {
  const el = document.getElementById('ej-' + i);
  el.classList.toggle('open');
}

// ——— Helpers ———
function formatNum(n) {
  if (n === undefined || n === null || isNaN(n)) return '—';
  // Show up to 4 significant decimals, strip trailing zeros
  const str = parseFloat(n.toPrecision(6)).toString();
  return str;
}

// ——— PWA Install ———
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installBanner').classList.remove('hidden');
});

document.getElementById('installBtn').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    document.getElementById('installBanner').classList.add('hidden');
  }
  deferredPrompt = null;
});

window.addEventListener('appinstalled', () => {
  document.getElementById('installBanner').classList.add('hidden');
});

// ——— Service Worker ———
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW registrado:', reg.scope))
      .catch(err => console.log('SW error:', err));
  });
}
