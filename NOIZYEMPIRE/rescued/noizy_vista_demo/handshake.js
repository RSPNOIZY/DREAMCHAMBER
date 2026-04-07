// Simple handshake check for cockpit frontend
fetch('/handshake')
  .then(res => res.json())
  .then(data => {
    const status = document.createElement('div');
    status.id = 'handshake-status';
    status.textContent = `Handshake: ${data.status} (${data.message})`;
    status.style = 'position:fixed;top:10px;right:10px;background:#222;color:#0f0;padding:8px;border-radius:6px;z-index:9999;font-family:sans-serif;';
    document.body.appendChild(status);
  })
  .catch(() => {
    const status = document.createElement('div');
    status.id = 'handshake-status';
    status.textContent = 'Handshake: failed';
    status.style = 'position:fixed;top:10px;right:10px;background:#222;color:#f00;padding:8px;border-radius:6px;z-index:9999;font-family:sans-serif;';
    document.body.appendChild(status);
  });
