// Share function for recipes (desktop + mobile)
async function shareRecipe() {
  try {
    const titleEl = document.querySelector('h1.title');
    const title = titleEl ? titleEl.textContent.trim() : document.title;
    const text = 'Sprawdź ten przepis:';
    const url = window.location.href;

    // Prefer Web Share API when available (mostly mobile, some desktops)
    if (navigator.share) {
      await navigator.share({ title, text, url });
      toast('Udostępniono');
      return;
    }

    // Fallback: copy to clipboard and inform user
    await copyToClipboard(url);
    toast('Link skopiowany do schowka');
  } catch (err) {
    console.error('Share failed', err);
    toast('Nie udało się udostępnić');
  }
}

async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Legacy fallback
  const input = document.createElement('input');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
}

// Lightweight toast using existing #alert container if present
function toast(message) {
  const alertEl = document.getElementById('alert');
  if (!alertEl) return;
  alertEl.textContent = message;
  alertEl.classList.remove('hidden', 'alert-error');
  alertEl.classList.add('alert-success');
  alertEl.style.opacity = '0.95';
  // Auto-hide
  setTimeout(() => {
    alertEl.classList.add('hidden');
    alertEl.classList.remove('alert-success');
  }, 1800);
}
