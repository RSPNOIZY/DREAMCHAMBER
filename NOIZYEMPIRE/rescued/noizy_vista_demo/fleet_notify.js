// Fleet-wide notification for cockpit UIs
function fleetNotify(message) {
  const notify = document.createElement('div');
  notify.id = 'fleet-notify';
  notify.textContent = message;
  notify.style = 'position:fixed;top:50px;right:10px;background:#222;color:#ff0;padding:12px 20px;border-radius:8px;z-index:9999;font-size:1.2em;font-family:sans-serif;box-shadow:0 2px 8px #0008;';
  document.body.appendChild(notify);
  setTimeout(() => notify.remove(), 6000);
}

// Example usage:
fleetNotify('Fleet Sync: All systems, please respond!');
