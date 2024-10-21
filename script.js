let kasa = 1000;
let podatki = 0;
const muzyka = document.getElementById("muzyka");
const visualizerCanvas = document.getElementById("visualizer");
const ctx = visualizerCanvas.getContext("2d");
let audioContext;
let analyser;
let currentVolume = 1; // Zakres od 0 do 1

function initAudioVisualizer() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(muzyka);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        ctx.fillStyle = '#1abc9c';
        ctx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
        const barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];
            ctx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
            ctx.fillRect(x, visualizerCanvas.height - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth + 1;
        }
    }
    draw();
}

function startGame() {
    muzyka.play(); // Uruchomienie muzyki
    initAudioVisualizer();
    document.getElementById("welcome").style.display = "none"; // Ukryj powitanie
    document.querySelector(".container").style.display = "block"; // Pokaż kontener gry
}

function graj(gra) {
    if (muzyka.paused) {
        muzyka.play(); // Uruchomienie muzyki, jeśli jest wstrzymana
    }

    let los = Math.random() * 100;
    let wynik = 0;

    if (los < 1) { // 1% na wejście policji
        koniecGry("Kasyno zostało przejęte przez policję!");
        return;
    } else if (los < 61) { // 60% szans na wygraną
        if (gra === 'ruletka') {
            wynik = Math.floor(Math.random() * 300) + 100;
        } else if (gra === 'blackjack') {
            wynik = Math.floor(Math.random() * 200) + 50;
        } else if (gra === 'sloty') {
            wynik = Math.floor(Math.random() * 400) + 150;
        }
    } else { // 39% szans na przegraną
        wynik = Math.floor(Math.random() * -200) - 100;
    }

    kasa += wynik;
    if (wynik > 0) {
        podatki += Math.floor(wynik * 0.2);
    }

    if (kasa < 0) {
        muzyka.pause(); // Wstrzymaj muzykę przy przegranej
        koniecGry("Przegrałeś wszystkie pieniądze!"); // Nie zmieniaj tła
    } else {
        aktualizujWidok(wynik);
    }
}

function aktualizujWidok(wynik) {
    document.getElementById("kasa").innerText = kasa;
    document.getElementById("podatki").innerText = podatki;
    const wynikDiv = document.getElementById("wynik");
    wynikDiv.innerText = `Wynik: ${wynik} PLN`;
}

function placPodatki() {
    if (podatki > 0) {
        kasa -= podatki;
        podatki = 0;
        alert("Podatki zostały zapłacone.");
        aktualizujWidok(0);
    } else {
        alert("Nie masz żadnych podatków do zapłaty.");
    }

    if (kasa < 0) {
        muzyka.pause(); // Wstrzymaj muzykę przy przegranej
        koniecGry("Przegrałeś wszystkie pieniądze!"); // Nie zmieniaj tła
    }
}

function koniecGry(message) {
    document.body.innerHTML = `
        <h1>${message}</h1>
        <button onclick="startNewGame()">Rozpocznij nową grę</button>
    `;
    document.body.style.backgroundColor = "#34495e"; // Przywróć oryginalne tło
}

function startNewGame() {
    kasa = 1000;
    podatki = 0;
    document.body.innerHTML = `
        <audio id="muzyka" loop>
            <source src="casino.mp3" type="audio/mpeg">
            Twoja przeglądarka nie obsługuje elementu audio.
        </audio>
        <div id="welcome">
            <h1>Witaj w Kuszko Casino!</h1>
            <button onclick="startGame()">Rozpocznij grę</button>
        </div>
        <div class="container" style="display: none;">
            <h1>Symulator Kasyna</h1>
            <div id="info">
                <p>Twoja kasa: <span id="kasa">${kasa}</span> PLN</p>
                <p>Podatki do zapłaty: <span id="podatki">0</span> PLN</p>
            </div>
            <div id="gry">
                <button onclick="graj('ruletka')">Ruletka</button>
                <button onclick="graj('blackjack')">Blackjack</button>
                <button onclick="graj('sloty')">Sloty</button>
            </div>
            <div id="wynik"></div>
            <button id="plac-podatki" onclick="placPodatki()">Zapłać podatki</button>
            <canvas id="visualizer"></canvas>
        </div>
        <div id="controls">
            <button onclick="changeVolume(-0.1)">-</button>
            <button onclick="changeVolume(0.1)">+</button>
            <p>Głośność: <span id="volume-level">100%</span></p>
        </div>
    `;
    startGame();
}

function changeVolume(change) {
    currentVolume = Math.min(Math.max(currentVolume + change, 0), 1);
    muzyka.volume = currentVolume;
    document.getElementById("volume-level").innerText = `${Math.round(currentVolume * 100)}%`;
}
