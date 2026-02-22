// Share function for recipes (desktop + mobile)
async function shareRecipe() {
  try {
    const titleEl = document.querySelector('h1.title');
    const title = titleEl ? titleEl.textContent.trim() : document.title;
    
    // Create short, aesthetic URL by removing query params/hashes and decoding Polish characters
    const url = decodeURI(window.location.origin + window.location.pathname);
    
    // Use recipe title with a nice emoji instead of fixed text
    const text = `🍽️ ${title}`;

    // Prefer Web Share API when available (mostly mobile, some desktops)
    if (navigator.share) {
      await navigator.share({ title, text, url });
      toast('Udostępniono');
      return;
    }

    // Fallback: copy to clipboard with rich text hyperlink to look professional
    await copyToClipboard(title, url);
    toast('Skopiowano link do przepisu');
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Share failed', err);
      toast('Nie udało się udostępnić');
    }
  }
}

async function copyToClipboard(title, url) {
  const plainText = `${title}\n${url}`;
  const htmlText = `<a href="${url}">${title}</a>`;

  if (navigator.clipboard && window.ClipboardItem) {
    try {
      const typePlain = new Blob([plainText], { type: 'text/plain' });
      const typeHtml = new Blob([htmlText], { type: 'text/html' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': typePlain,
          'text/html': typeHtml
        })
      ]);
      return;
    } catch (e) {
      // Fallback if rich clipboard fails (e.g. Firefox without dom.events.asyncClipboard.clipboardItem)
      if (navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(plainText);
      }
    }
  }
  
  // Legacy fallback
  const input = document.createElement('textarea');
  input.value = plainText;
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
