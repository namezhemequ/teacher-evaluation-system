// 科技风背景 Composable — 低密度粒子 + 透视网格，用于登录后页面的统一背景
import { onUnmounted } from 'vue';

export function useTechBackground(canvasRef, options = {}) {
  const {
    particleCount = 18,
    particleAlpha = 0.25,
    gridAlpha = 0.03,
    gridColor = '#409EFF',
    particleColors = ['rgba(64,158,255,', 'rgba(0,200,255,', 'rgba(129,180,255,'],
  } = options;

  let w, h, ctx, raf;

  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * 2000, y: Math.random() * 2000,
      r: 1 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -(Math.random() * 0.3 + 0.1),
      alpha: Math.random() * particleAlpha + 0.05,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
    });
  }

  const resize = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    w = canvas.offsetWidth; h = canvas.offsetHeight;
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    ctx = canvas.getContext('2d');
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  };

  const drawGrid = () => {
    const step = 50;
    ctx.save();
    ctx.globalAlpha = gridAlpha;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    for (let x = step; x < w; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (let y = step; y < h; y += step) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();
    ctx.restore();
  };

  const render = () => {
    ctx.clearRect(0, 0, w, h);
    drawGrid();
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -30) p.x = w + 30; if (p.x > w + 30) p.x = -30;
      if (p.y < -30) p.y = h + 30; if (p.y > h + 30) p.y = -30;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
    });
    raf = requestAnimationFrame(render);
  };

  setTimeout(() => { resize(); raf = requestAnimationFrame(render); }, 50);
  window.addEventListener('resize', resize);

  onUnmounted(() => {
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  });
}
