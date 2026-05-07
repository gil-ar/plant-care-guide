/* ── Plant data with Unsplash image IDs ─────── */
const PLANTS = [
  { name: 'Aloe Vera',          img: '1526397751294-331021109fbd' },
  { name: 'African Violet',     img: '1559563362-c667ba5f5480' },
  { name: 'Bird of Paradise',   img: '1463320726281-696a3cc57e3a' },
  { name: 'Boston Fern',        img: '1416879595882-3373a0480b5b' },
  { name: 'Cactus',             img: '1501004318641-b39e6451bec6' },
  { name: 'Calathea',           img: '1585320806297-9794b3e4eeae' },
  { name: 'Chinese Evergreen',  img: '1416879595882-3373a0480b5b' },
  { name: 'Dracaena',           img: '1459156212016-c812468e2115' },
  { name: 'Fiddle Leaf Fig',    img: '1545241047-6083a3684587' },
  { name: 'Jade Plant',         img: '1548523687-a484d01eceb8' },
  { name: 'Monstera Deliciosa', img: '1614594975525-e45190c55d0b' },
  { name: 'Orchid',             img: '1566408669374-5a6d5dca1ef5' },
  { name: 'Peace Lily',         img: '1463320726281-696a3cc57e3a' },
  { name: 'Philodendron',       img: '1585320806297-9794b3e4eeae' },
  { name: 'Pothos',             img: '1459156212016-c812468e2115' },
  { name: 'Rubber Plant',       img: '1416879595882-3373a0480b5b' },
  { name: 'Snake Plant',        img: '1620803366004-119b57f54cd6' },
  { name: 'Spider Plant',       img: '1416879595882-3373a0480b5b' },
  { name: 'Succulent',          img: '1548523687-a484d01eceb8' },
  { name: 'ZZ Plant',           img: '1463320726281-696a3cc57e3a' },
];

const MOCK_IDS = ['Monstera Deliciosa','Pothos','Snake Plant','Peace Lily','Fiddle Leaf Fig'];

function plantImgUrl(id, w = 300, h = 200) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=75`;
}

/* ── State ──────────────────────────────────── */
const state = {
  plant: null, symptoms: [],
  location: null, duration: null,
  frequency: null, drainage: null,
  prevScreen: null,
};

const PROGRESS = {
  'screen-1': 1, 'screen-camera': 2, 'screen-search': 2,
  'screen-2': 3, 'screen-3': 4, 'screen-4': 5, 'screen-5': 7,
};
let currentId = 'none'; // sentinel — no real screen has this id

/* ── Open / close ───────────────────────────── */
document.getElementById('get-started-btn').addEventListener('click', () => {
  document.getElementById('quiz-overlay').classList.add('open');
  document.getElementById('quiz-overlay').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  goTo('screen-1');
});

function closeQuiz() {
  document.getElementById('quiz-overlay').classList.remove('open');
  document.getElementById('quiz-overlay').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
document.getElementById('quiz-close').addEventListener('click', closeQuiz);

/* ── Screen navigation ──────────────────────── */
function goTo(nextId) {
  const prev = document.getElementById(currentId);
  const next = document.getElementById(nextId);
  state.prevScreen = currentId;

  if (prev) {
    prev.classList.add('exit');
    prev.classList.remove('active');
    setTimeout(() => prev.classList.remove('exit'), 380);
  }

  next.classList.add('active');
  currentId = nextId;

  const step = PROGRESS[nextId] || 1;
  document.getElementById('quiz-progress').style.width = `${(step / 7) * 100}%`;
}

/* ── Screen 1 ───────────────────────────────── */
document.getElementById('photo-card').addEventListener('click', () => {
  startCamera();
  goTo('screen-camera');
});

document.getElementById('list-card').addEventListener('click', () => {
  buildPlantGrid();
  goTo('screen-search');
});

/* ── Screen Camera ──────────────────────────── */
const cameraResult  = document.getElementById('camera-result');
const mockPlantName = document.getElementById('mock-plant-name');
const nextCamera    = document.getElementById('next-camera');
const scanLineWrap  = document.getElementById('scan-line-wrap');

function startCamera() {
  cameraResult.classList.remove('visible');
  nextCamera.disabled = true;
  scanLineWrap.style.display = 'block';

  const detected = MOCK_IDS[Math.floor(Math.random() * MOCK_IDS.length)];
  mockPlantName.textContent = detected;

  setTimeout(() => {
    scanLineWrap.style.display = 'none';
    cameraResult.classList.add('visible');
    state.plant = detected;
    nextCamera.disabled = false;
  }, 2200);
}

document.getElementById('camera-confirm').addEventListener('click', () => { nextCamera.disabled = false; });
document.getElementById('back-camera').addEventListener('click', () => goTo('screen-1'));
nextCamera.addEventListener('click', () => goTo('screen-2'));

/* ── Screen Search ──────────────────────────── */
const plantSearch     = document.getElementById('plant-search');
const plantDropdown   = document.getElementById('plant-dropdown');
const selectedDisplay = document.getElementById('selected-plant-display');
const selectedName    = document.getElementById('selected-plant-name');
const nextSearch      = document.getElementById('next-search');
let focusedIndex      = -1;

function buildPlantGrid() {
  const wrap = document.getElementById('all-plants-list');
  wrap.innerHTML = PLANTS.map(p => `
    <button class="plant-img-card" data-name="${p.name}" type="button">
      <div class="plant-img-card-img">
        <img
          src="${plantImgUrl(p.img, 300, 200)}"
          alt="${p.name}"
          onerror="this.style.display='none'"
        />
      </div>
      <div class="plant-img-card-name">${p.name}</div>
    </button>
  `).join('');

  wrap.querySelectorAll('.plant-img-card').forEach(card => {
    card.addEventListener('click', () => selectPlant(card.dataset.name));
  });
}

/* Dropdown with thumbnail images */
plantSearch.addEventListener('input', () => {
  const q = plantSearch.value.trim().toLowerCase();
  focusedIndex = -1;
  if (!q) { plantDropdown.classList.remove('open'); return; }

  const matches = PLANTS.filter(p => p.name.toLowerCase().includes(q));
  if (!matches.length) { plantDropdown.classList.remove('open'); return; }

  plantDropdown.innerHTML = matches.map(p => `
    <li data-name="${p.name}">
      <img src="${plantImgUrl(p.img, 72, 72)}" alt="${p.name}" onerror="this.style.display='none'" />
      ${p.name}
    </li>
  `).join('');
  plantDropdown.classList.add('open');

  plantDropdown.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => selectPlant(li.dataset.name));
  });
});

plantSearch.addEventListener('keydown', e => {
  const items = plantDropdown.querySelectorAll('li');
  if (!items.length) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); focusedIndex = Math.min(focusedIndex + 1, items.length - 1); highlightDropdown(items); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); focusedIndex = Math.max(focusedIndex - 1, 0); highlightDropdown(items); }
  else if (e.key === 'Enter' && focusedIndex >= 0) { e.preventDefault(); selectPlant(items[focusedIndex].dataset.name); }
  else if (e.key === 'Escape') plantDropdown.classList.remove('open');
});

function highlightDropdown(items) {
  items.forEach((li, i) => li.classList.toggle('focused', i === focusedIndex));
  if (focusedIndex >= 0) items[focusedIndex].scrollIntoView({ block: 'nearest' });
}

function selectPlant(name) {
  state.plant = name;
  plantSearch.value = '';
  plantDropdown.classList.remove('open');

  /* Hide search + grid, show confirmation badge */
  document.querySelector('.autocomplete-wrap').style.display = 'none';
  document.getElementById('all-plants-list').style.display = 'none';
  selectedName.textContent = name;
  selectedDisplay.style.display = 'flex';
  nextSearch.disabled = false;
}

document.getElementById('clear-plant').addEventListener('click', () => {
  state.plant = null;
  selectedDisplay.style.display = 'none';
  document.querySelector('.autocomplete-wrap').style.display = 'block';
  document.getElementById('all-plants-list').style.display = 'grid';
  /* Remove selected highlight from any grid card */
  document.querySelectorAll('.plant-img-card').forEach(c => c.classList.remove('selected'));
  nextSearch.disabled = true;
  plantSearch.focus();
});

document.addEventListener('click', e => {
  if (!plantSearch.contains(e.target) && !plantDropdown.contains(e.target)) {
    plantDropdown.classList.remove('open');
  }
});

document.getElementById('back-search').addEventListener('click', () => {
  /* Restore search visibility for next time */
  document.querySelector('.autocomplete-wrap').style.display = 'block';
  goTo('screen-1');
});
nextSearch.addEventListener('click', () => goTo('screen-2'));

/* ── Screen 2: Symptoms ─────────────────────── */
document.querySelectorAll('.symptom-card').forEach(card => {
  card.addEventListener('click', () => {
    const wasSelected = card.classList.contains('selected');
    card.classList.toggle('selected', !wasSelected);

    const val = card.dataset.value;
    if (!wasSelected) {
      state.symptoms = [...new Set([...state.symptoms, val])];
    } else {
      state.symptoms = state.symptoms.filter(s => s !== val);
    }
    document.getElementById('next-2').disabled = state.symptoms.length === 0;
  });
});

document.getElementById('back-2').addEventListener('click', () => {
  goTo(state.prevScreen === 'screen-camera' ? 'screen-camera' : 'screen-search');
});
document.getElementById('next-2').addEventListener('click', () => goTo('screen-3'));

/* ── Screen 3: Location ─────────────────────── */
setupSingle('location-group', 'location', checkS3);
setupSingle('duration-group',  'duration',  checkS3);
document.getElementById('back-3').addEventListener('click', () => goTo('screen-2'));
document.getElementById('next-3').addEventListener('click', () => goTo('screen-4'));

function checkS3() {
  document.getElementById('next-3').disabled = !state.location || !state.duration;
}

/* ── Screen 4: Watering ─────────────────────── */
document.querySelectorAll('.watering-row').forEach(row => {
  row.addEventListener('click', () => {
    document.querySelectorAll('.watering-row').forEach(r => r.classList.remove('selected'));
    row.classList.add('selected');
    state.frequency = row.dataset.value;
    checkS4();
  });
});

setupSingle('drainage-group', 'drainage', checkS4);
document.getElementById('back-4').addEventListener('click', () => goTo('screen-3'));
document.getElementById('next-4').addEventListener('click', () => {
  buildResults();
  goTo('screen-5');
});

function checkS4() {
  document.getElementById('next-4').disabled = !state.frequency || !state.drainage;
}

/* ── Screen 5: Results ──────────────────────── */
function buildResults() {
  const plant = state.plant || 'your plant';
  document.getElementById('results-plant-name').textContent = plant;

  const diagnoses = diagnose(state);
  const list = document.getElementById('diagnosis-list');
  list.innerHTML = '';

  document.getElementById('diagnosis-intro').textContent = diagnoses.length
    ? `We found ${diagnoses.length} likely issue${diagnoses.length > 1 ? 's' : ''} for your ${plant}:`
    : `Your ${plant} looks healthy! Here are some tips to keep it that way.`;

  diagnoses.forEach((d, i) => {
    const card = document.createElement('div');
    card.className = 'diagnosis-card';
    card.style.animationDelay = `${i * 0.1}s`;
    card.innerHTML = `
      <div class="diagnosis-header">
        <span class="diagnosis-icon">${d.icon}</span>
        <span class="diagnosis-title">${d.issue}</span>
        <span class="severity-badge severity-${d.severity}">${d.severity}</span>
      </div>
      <div class="diagnosis-row">
        <span class="diagnosis-row-label">Why it's happening</span>
        <span class="diagnosis-row-value">${d.cause}</span>
      </div>
      <div class="diagnosis-row">
        <span class="diagnosis-row-label">What to do</span>
        <span class="diagnosis-row-value">${d.fix}</span>
      </div>
      <div class="diagnosis-row">
        <span class="diagnosis-row-label">Timeline</span>
        <span class="timeline-tag">&#128336; ${d.timeline}</span>
      </div>
    `;
    list.appendChild(card);
  });

  spawnConfetti();
}

function diagnose(s) {
  const results = [];
  const sym = s.symptoms;
  const overWatered  = s.frequency === 'daily' || s.frequency === 'every-few-days';
  const underWatered = s.frequency === 'when-i-remember' || s.frequency === 'not-sure';
  const darkSpot     = s.location === 'dark-corner' || s.location === 'office-desk';

  if (overWatered && sym.some(v => ['mushy-stem','yellow-leaves','dark-spots'].includes(v))) {
    results.push({ issue:'Overwatering', severity:'high', icon:'💧',
      cause:'Too frequent watering saturates the soil, blocking oxygen from roots and causing rot.',
      fix:'Let the top 2 inches of soil dry completely before the next watering. If the stem is mushy, repot into fresh dry soil immediately.',
      timeline:'2–4 weeks to recover' });
  }
  if (underWatered && sym.some(v => ['drooping','brown-tips','leaf-drop'].includes(v))) {
    results.push({ issue:'Underwatering', severity:'medium', icon:'🏜️',
      cause:'The plant isn\'t receiving enough water, causing cells to lose pressure.',
      fix:'Water thoroughly until water runs from the drainage holes. Check soil moisture every 2–3 days.',
      timeline:'Perks up in 24–48 hours' });
  }
  if (darkSpot && sym.some(v => ['pale-color','not-growing','leaf-drop','yellow-leaves'].includes(v))) {
    results.push({ issue:'Insufficient Light', severity:'medium', icon:'☀️',
      cause:'Without enough light, plants can\'t photosynthesize — growth stalls and leaves lose color.',
      fix:'Move to within 3 feet of a window or add a grow light. Most houseplants prefer bright indirect light.',
      timeline:'New growth in 3–6 weeks' });
  }
  if (s.duration === 'just-moved' && sym.some(v => ['drooping','leaf-drop','yellow-leaves'].includes(v))) {
    results.push({ issue:'Move / Transplant Shock', severity:'low', icon:'🏡',
      cause:'Plants stress when moved — changes in light, humidity and temperature trigger a shock response.',
      fix:'Keep the plant in its new spot consistently. Avoid overwatering. It will adapt within a few weeks.',
      timeline:'2–6 weeks to settle' });
  }
  if (s.drainage === 'no') {
    results.push({ issue:'No Drainage', severity:'high', icon:'🏺',
      cause:'Water collects at the bottom, causing root rot even with careful watering.',
      fix:'Repot into a pot with drainage holes, or add a thick layer of gravel at the bottom.',
      timeline:'Act soon — root rot spreads fast' });
  }
  if (sym.includes('pests')) {
    results.push({ issue:'Pest Infestation', severity:'high', icon:'🐛',
      cause:'Common culprits: spider mites (fine webbing), mealybugs (white fluff), fungus gnats (tiny flies in soil).',
      fix:'Isolate immediately. Wipe leaves with neem oil or insecticidal soap solution. Repeat weekly for 3 weeks.',
      timeline:'3 weeks of consistent treatment' });
  }
  if (sym.includes('dark-spots') && !results.find(r => r.issue === 'Overwatering')) {
    results.push({ issue:'Fungal Leaf Spots', severity:'medium', icon:'🔴',
      cause:'High humidity and poor airflow create perfect conditions for fungal growth on leaves.',
      fix:'Remove affected leaves. Avoid wetting foliage when watering. Improve airflow and apply fungicide if needed.',
      timeline:'Stops spreading in 1–2 weeks' });
  }
  if (results.length === 0) {
    results.push({ issue:'Looking Good! 🌿', severity:'low', icon:'✨',
      cause:'No obvious issues detected. Your plant may just need time to settle.',
      fix:'Maintain consistent watering and good light. Monitor over the next 2–3 weeks.',
      timeline:'Check in weekly' });
  }
  return results;
}

document.getElementById('start-over').addEventListener('click', () => {
  resetState();
  goTo('screen-1');
});

/* ── Helpers ────────────────────────────────── */
function setupSingle(groupId, key, onChange) {
  document.getElementById(groupId).querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.getElementById(groupId).querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      state[key] = chip.dataset.value;
      if (onChange) onChange();
    });
  });
}

function resetState() {
  Object.assign(state, { plant:null, symptoms:[], location:null, duration:null, frequency:null, drainage:null });
  document.querySelectorAll('.symptom-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.watering-row').forEach(r => r.classList.remove('selected'));
  document.querySelectorAll('.btn-next').forEach(b => b.disabled = true);

  selectedDisplay.style.display = 'none';
  document.querySelector('.autocomplete-wrap').style.display = 'block';
  document.getElementById('all-plants-list').style.display = 'grid';
  plantSearch.value = '';
  cameraResult.classList.remove('visible');
}

function spawnConfetti() {
  const wrap = document.getElementById('confetti-wrap');
  wrap.innerHTML = '';
  const colors = ['#7D9E72','#A8C49D','#D6E8CE','#fbbf24','#86efac','#f9a8d4'];
  for (let i = 0; i < 48; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `left:${Math.random()*100}%;background:${colors[i%colors.length]};animation-delay:${Math.random()*0.9}s;animation-duration:${1.6+Math.random()*1.2}s;width:${6+Math.random()*7}px;height:${10+Math.random()*10}px;border-radius:${Math.random()>.5?'50%':'3px'}`;
    wrap.appendChild(el);
  }
}
