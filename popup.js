let config = { theme: 'dark', images: [], volume: 0.5 };
let isRolling = false;
let audioCtx;

function playAmplified(fileName) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const audio = new Audio(chrome.runtime.getURL(fileName));
    const source = audioCtx.createMediaElementSource(audio);
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = config.volume * 2.0;
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    audio.play().catch(e => console.error("Audio error"));
}

chrome.storage.local.get(['joyConfig'], (data) => {
    if (data.joyConfig) {
        config = data.joyConfig;
        if (!Array.isArray(config.images)) config.images = [];
    }
    updateUI();
});

function updateUI() {
    document.body.className = config.theme === 'light' ? 'light-mode' : '';
    document.getElementById('theme-select').value = config.theme;
    document.getElementById('vol-control').value = config.volume;
    renderImageMenu();
}

function saveConfig() { chrome.storage.local.set({ joyConfig: config }); }

function showAlert(text, type = 'error') {
    const b = document.getElementById('internal-alert');
    if (b) {
        b.innerText = text.toUpperCase();
        b.className = type === 'error' ? 'alert-error' : 'alert-success';
        setTimeout(() => b.classList.add('show'), 10);
        if (window.alertTimeout) clearTimeout(window.alertTimeout);
        window.alertTimeout = setTimeout(() => b.classList.remove('show'), 2500);
    }
}

async function handleFiles(files) {
    if (!files || files.length === 0) {
        showAlert("ADD ITEMS TO POOL", "error");
        return;
    }
    const promises = Array.from(files).map(file => new Promise(res => {
        const reader = new FileReader();
        reader.onload = (ev) => res(ev.target.result);
        reader.readAsDataURL(file);
    }));
    const newImgs = await Promise.all(promises);
    config.images = [...(config.images || []), ...newImgs];
    saveConfig();
    renderImageMenu();
    showAlert(`${newImgs.length} IMAGES ADDED`, "success");
}

async function handleUrl(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
            config.images.push(reader.result);
            saveConfig();
            renderImageMenu();
            showAlert("WEB IMAGE SAVED", "success");
        };
        reader.readAsDataURL(blob);
    } catch (e) { console.warn("Web drag failed"); }
}

function renderImageMenu() {
    const container = document.getElementById('image-manager');
    if (!container) return;
    container.innerHTML = '';
    (config.images || []).forEach((src, i) => {
        const div = document.createElement('div');
        div.style = "position:relative; aspect-ratio:1; border:1px solid var(--accent); border-radius:6px; overflow:hidden;";
        div.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:cover;"><button class="del-btn" data-idx="${i}" style="position:absolute;top:2px;right:2px;background:red;color:white;border:none;border-radius:50%;width:14px;height:14px;cursor:pointer;font-size:8px;">&times;</button>`;
        container.appendChild(div);
    });
    document.querySelectorAll('.del-btn').forEach(btn => {
        btn.onclick = (e) => {
            config.images.splice(e.target.dataset.idx, 1);
            saveConfig();
            renderImageMenu();
        };
    });
}

const rarityTable = [
    { name: 'grey',   color: '#b2b2b2', count: 50 },
    { name: 'blue',   color: '#0070dd', count: 25 },
    { name: 'purple', color: '#a335ee', count: 15 },
    { name: 'red',    color: '#ff4d4d', count: 9  },
    { name: 'gold',   color: '#ffd700', count: 1  }
];

async function startRoll() {
    if (isRolling) return;
    if (!config.images || config.images.length === 0) { showAlert("ADD IMAGES FIRST!", "error"); return; }

    isRolling = true;
    const viewport  = document.getElementById('viewport');
    const slider    = document.getElementById('slider');
    const revealBox = document.getElementById('reveal-container');
    const rerollBtn = document.getElementById('reroll-btn');
    const caseGif   = document.getElementById('case-gif');
    const caseGlow  = document.querySelector('.case-glow');

    // Reset State
    caseGif.classList.add('hidden');
    caseGlow.classList.add('hidden');
    revealBox.classList.remove('active');
    rerollBtn.classList.remove('show-btn');
    viewport.classList.remove('expanding');
    viewport.classList.add('hidden');

    // Setup Slider
    slider.style.transition = 'none';
    slider.style.left = '0px';
    slider.innerHTML = '';

    let pool = [];
    rarityTable.forEach(r => { for (let i = 0; i < r.count; i++) pool.push(r); });
    for (let i = 0; i < 100; i++) {
        const div = document.createElement('div');
        const rarity = pool[Math.floor(Math.random() * pool.length)];
        const img = config.images[Math.floor(Math.random() * config.images.length)];
        div.className = `item rarity-${rarity.name}`;
        div.setAttribute('data-rarity-color', rarity.color);
        div.innerHTML = `<img src="${img}" style="width:100%; height:100%; object-fit:cover;">`;
        slider.appendChild(div);
    }

    // Trigger Animation
    viewport.classList.remove('hidden');
    setTimeout(() => viewport.classList.add('expanding'), 10);

    const itemWidth = 84;
    const winningIndex = Math.floor(Math.random() * (90 - 75 + 1)) + 75;
    const finalLeft = (winningIndex * itemWidth) + (itemWidth / 2) - 125;

    setTimeout(() => {
        slider.style.transition = 'left 8s cubic-bezier(0.1, 0, 0, 1)';
        slider.style.left = `-${finalLeft}px`;
    }, 500);

    setTimeout(() => {
        const frame = document.getElementById('magnifier').getBoundingClientRect();
        const centerX = frame.left + (frame.width / 2);
        const centerY = frame.top + (frame.height / 2);
        const el = document.elementFromPoint(centerX, centerY);
        const winningElement = el ? el.closest('.item') : null;

        if (winningElement) {
            const winningImgSrc = winningElement.querySelector('img').src;
            const winningColor = winningElement.getAttribute('data-rarity-color');
            revealBox.style.borderColor = winningColor;
            revealBox.style.boxShadow = `0 0 80px rgba(0,0,0,1), 0 0 40px ${winningColor}b3`;
            revealBox.innerHTML = `<img src="${winningImgSrc}">`;
            revealBox.classList.add('active');
            rerollBtn.classList.add('show-btn');
            playAmplified('yippee.mp3');
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: [winningColor, '#FFF'] });
        }

        isRolling = false;
    }, 9200);
}

document.getElementById('case-gif').onclick = () => {
    if (isRolling) return;
    const caseGif = document.getElementById('case-gif');
    caseGif.classList.add('shaking');
    setTimeout(() => {
        caseGif.classList.remove('shaking');
        startRoll();
    }, 1000);
};

// Reroll logic: Reset state then roll again
document.getElementById('reroll-btn').onclick = () => {
    if (isRolling) return;
    startRoll();
};

document.getElementById('nav-toggle').onclick = () => {
    const isSett = document.getElementById('settings-page').style.display === 'flex';
    document.getElementById('settings-page').style.display = isSett ? 'none' : 'flex';
    document.getElementById('game-page').style.display = isSett ? 'flex' : 'none';
    document.getElementById('nav-toggle').innerHTML = isSett ? '<i class="fas fa-cog"></i>' : '<i class="fas fa-house"></i>';
    if (!isRolling && document.getElementById('slider').innerHTML !== '') {
        document.getElementById('reroll-btn').classList.add('show-btn');
    }
};

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('image-upload');
dropZone.onclick = () => fileInput.click();
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); dropZone.style.background = "rgba(255,215,0,0.1)"; });
dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); dropZone.style.background = "transparent"; });
dropZone.addEventListener('drop', (e) => {
    e.preventDefault(); e.stopPropagation(); dropZone.style.background = "transparent";
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
    else {
        const html = e.dataTransfer.getData('text/html');
        const match = html && html.match(/src="?([^"\s]+)"?\s*/);
        const url = match ? match[1] : e.dataTransfer.getData('text/plain');
        if (url && url.startsWith('http')) handleUrl(url);
    }
});
fileInput.onchange = (e) => handleFiles(e.target.files);

document.getElementById('theme-select').onchange = (e) => { config.theme = e.target.value; updateUI(); saveConfig(); };
document.getElementById('vol-control').oninput = (e) => { config.volume = parseFloat(e.target.value); saveConfig(); };
document.getElementById('popout-btn').onclick = () => {
    chrome.windows.create({ url: chrome.runtime.getURL("popup.html"), type: "popup", width: 370, height: 470 });
    window.close();
};