const canvas = document.getElementById('star-canvas');
const ctx = canvas.getContext('2d');
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();
function drawStars() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let i=0;i<120;i++){
    const x = Math.random()*canvas.width;
    const y = Math.random()*canvas.height*0.7;
    const r = Math.random()*1.5+0.5;
    ctx.globalAlpha = Math.random()*0.5+0.5;
    ctx.beginPath();
    ctx.arc(x,y,r,0,2*Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }
}
setInterval(drawStars, 1200);
