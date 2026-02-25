// blockchain-bg.js
// Bu script, arka planda blockchain temalı node ve bağlantı animasyonu oluşturur. //İnternetten aldım.

const canvas = document.getElementById('blockchainBgCanvas');
const ctx = canvas.getContext('2d');

// Renk paleti (mor, mavi, turkuaz tonları)
const COLORS = ['#a259ff', '#43c6ff', '#5efce8', '#7873f5', '#23234d'];

// Node ve bağlantı ayarları
const NODE_COUNT = 18;
const NODES = [];
const LINKS = [];
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

canvas.width = WIDTH;
canvas.height = HEIGHT;

// Node yapısı
function createNode() {
  return {
    x: Math.random() * WIDTH,
    y: Math.random() * HEIGHT,
    r: 7 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx: (Math.random() - 0.5) * 0.7,
    vy: (Math.random() - 0.5) * 0.7
  };
}

// Rastgele bağlantılar oluştur
function createLinks() {
  LINKS.length = 0;
  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      const dist = Math.hypot(NODES[i].x - NODES[j].x, NODES[i].y - NODES[j].y);
      if (dist < 220) {
        LINKS.push([i, j]);
      }
    }
  }
}

// Node'ları başlat
for (let i = 0; i < NODE_COUNT; i++) {
  NODES.push(createNode());
}
createLinks();

// Animasyon döngüsü
function animate() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Bağlantıları çiz
  for (const [i, j] of LINKS) {
    const n1 = NODES[i];
    const n2 = NODES[j];
    ctx.save();
    ctx.globalAlpha = 0.18;
    const grad = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
    grad.addColorStop(0, n1.color);
    grad.addColorStop(1, n2.color);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(n1.x, n1.y);
    ctx.lineTo(n2.x, n2.y);
    ctx.stroke();
    ctx.restore();
  }

  // Node'ları çiz
  for (const node of NODES) {
    ctx.save();
    ctx.shadowColor = node.color;
    ctx.shadowBlur = 16;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.restore();
  }

  // Node'ları hareket ettir
  for (const node of NODES) {
    node.x += node.vx;
    node.y += node.vy;
    // Kenarlardan sekme
    if (node.x < 0 || node.x > WIDTH) node.vx *= -1;
    if (node.y < 0 || node.y > HEIGHT) node.vy *= -1;
  }

  // Bağlantıları güncelle
  createLinks();

  requestAnimationFrame(animate);
}

animate();

// Yeniden boyutlandırma
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}); 