var searchTerm = null;
var lastSearchResult = null;

summaryInclude = 60;
var fuseOptions = {
  shouldSort: true,
  includeMatches: true,
  includeScore: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  minMatchCharLength: 1,
  ignoreLocation: true,
  ignoreDiacritics: true,
  keys: [
    { name: "title", weight: 0.8 },
    { name: "contents", weight: 0.5 },
    { name: "tags", weight: 0.3 },
    { name: "categories", weight: 0.3 }
  ]
};

u('#searchTerm').on('change keyup', function () { // Set the search value on keyup for the input
  searchTerm = this.value;
})

// On load: if URL has a query param (?q= or ?search=), prefill and run search
function getQueryParam() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || params.get('query') || params.get('search') || null;
  } catch (e) {
    return null;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // Attach event listeners now that DOM is ready
  u('#searchTerm').on('change keyup', function () { // Set the search value on keyup for the input
    searchTerm = this.value;
  })

  u('#searchButton').handle('click', function (e) { //use handle to automatically prevent default
    const current = (u('#searchTerm').first() && u('#searchTerm').first().value) || searchTerm;
    if (current && current.trim()) {
      searchTerm = current.trim();
      if (u('#searchTerm').first()) { u('#searchTerm').first().value = searchTerm; }
      u('#searchButton').addClass("is-loading");
      executeSearch(searchTerm);
    } else {
      showAlert("Search cannot be empty!")
    }
  })

  // Allow pressing Enter in the input to run search without reloading the page
  u('#searchTerm').on('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      u('#searchButton').trigger('click');
    }
  });

  const q = getQueryParam();
  if (q && q.trim()) {
    const decoded = decodeURIComponent(q).trim();
    searchTerm = decoded;
    if (u('#searchTerm').first()) { u('#searchTerm').first().value = decoded; }
    u('#searchButton').addClass("is-loading");
    executeSearch(decoded);
  }
});

function executeSearch(searchQuery) {
  // Close hamburger menu if open (for mobile)
  if (u('#navBarButton').hasClass('is-active')) {
    u('#navBarButton').removeClass('is-active');
    u('#navBarMenu').removeClass('is-active');
  }

  // Get the correct base URL for index.json
  const baseUrl = '/CookBook';
  const timestamp = new Date().getTime();
  // normalize query
  const normalizedQuery = (searchQuery || '').toString().trim();
  // update browser URL without reloading so searches are shareable
  try {
    const url = new URL(window.location.href);
    if (normalizedQuery) {
      url.searchParams.set('q', normalizedQuery);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url.toString());
  } catch (e) {
    // ignore
  }
  fetch(`${baseUrl}/index.json?v=${timestamp}`)
    .then(r => {
      if (!r.ok) throw new Error(`Failed to load index.json: ${r.status}`);
      return r.json();
    })
    .then(function (data) {
      if (!Array.isArray(data)) {
        console.warn('Search index is not an array. Raw data:', data);
      }
      var pages = Array.isArray(data) ? data : [];
      var fuse = new Fuse(pages, fuseOptions);
      var result = fuse.search(searchQuery);

      // Prioritize results where the title contains the exact query word (diacritics-insensitive)
      try {
        const normalize = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[\u0300-\u036f]/g, '');
        const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const qNorm = normalize(searchQuery);
        if (qNorm) {
          // Use substring match (no word boundaries) so partial titles like 'schabowy' match 'schab'
          const exactRe = new RegExp(escapeRegExp(qNorm), 'i');
          const exact = [];
          const others = [];
          result.forEach(r => {
            const title = (r && r.item && r.item.title) ? r.item.title : '';
            const titleNorm = normalize(title);
            if (exactRe.test(titleNorm)) {
              exact.push(r);
            } else {
              others.push(r);
            }
          });
          // keep original relative ordering within groups
          result = exact.concat(others);
        }
      } catch (e) {
        // if anything goes wrong, fall back to the original ordering
        console.warn('Error prioritizing title matches', e);
      }

      lastSearchResult = result;
      if (result.length > 0) {
        u('#content').addClass("is-hidden"); //hiding our main content to display the results
        u('#searchResultsCol').empty(); // clean out any previous search results
        u('#searchButton').removeClass("is-loading") //change our button back
        u('#searchResults').removeClass("is-hidden") //show Result area
        populateResults(result);
      } else {
        showAlert("No results found!")
        u('#searchButton').removeClass("is-loading");
        if (u('#searchTerm').first()) { u('#searchTerm').first().value = ""; }
      }
    })
    .catch(err => {
      console.error('Search error:', err);
      showAlert('Problem loading search index.');
      u('#searchButton').removeClass("is-loading");
    });
}

function populateResults(result) {
  u('#searchResultsCol').empty();

  Object.entries(result).forEach(entry => {
    const [idx, val] = entry;
    const item = (val && val.item) ? val.item : {};


    const contents = item.contents || '';
    let snippet = '';
    if (fuseOptions.tokenize) {
      snippet = contents.substring(0, summaryInclude * 2);
    } else if (val && Array.isArray(val.matches)) {
      val.matches.forEach(function (match) {
        if (!match) return;
        if (match.key === 'contents' && Array.isArray(match.indices) && match.indices[0]) {
          var start = match.indices[0][0] - summaryInclude > 0 ? match.indices[0][0] - summaryInclude : 0;
          var end = match.indices[0][1] + summaryInclude < contents.length ? match.indices[0][1] + summaryInclude : contents.length;
          snippet += contents.substring(start, end);
        }
      });
      if (snippet.length < 1) { snippet = contents.substring(0, summaryInclude * 2); }
    } else {
      snippet = contents.substring(0, summaryInclude * 2);
    }

    // Robust fallbacks
    const defaultImage = '/CookBook/images/defaultImage.avif';
    const imageUrl = item.imageLink || defaultImage;
    const title = item.title || 'Bez tytułu';
    const link = item.permalink || '#';
    const calories = item.calories || 0;
    const protein = item.protein || 0;
    const fat = item.fat || 0;
    const carbohydrate = item.carbohydrate || 0;

    // Build DOM nodes directly to avoid template parsing issues
    const col = document.createElement('div');
    col.className = 'column is-2-desktop is-3-tablet is-full-mobile';

    const resultWrap = document.createElement('div');
    resultWrap.className = 'result';
    resultWrap.id = 'summary-' + idx;
    col.appendChild(resultWrap);

    const a = document.createElement('a');
    a.href = link;
    a.style.cssText = 'color: inherit; text-decoration: none; display: block; height: 100%;';
    resultWrap.appendChild(a);

    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'border-radius: 1%; height: 100%; display: flex; flex-direction: column; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;';
    card.onmouseover = function () { this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'; };
    card.onmouseout = function () { this.style.transform = 'translateY(0)'; this.style.boxShadow = 'none'; };
    a.appendChild(card);

    const cardImage = document.createElement('div');
    cardImage.className = 'card-image';
    cardImage.style.position = 'relative';
    card.appendChild(cardImage);

    const figure = document.createElement('figure');
    figure.className = 'image';
    figure.style.cssText = 'position:relative; aspect-ratio: 1 / 1; width: 100%;';
    cardImage.appendChild(figure);

    const img = document.createElement('img');
    img.style.cssText = 'border-radius: 3%; width: 100%; height: 100%; object-fit: cover;';
    img.alt = 'Zdjęcie przepisu';
    img.src = imageUrl;
    figure.appendChild(img);

    const tagOverlay = document.createElement('div');
    tagOverlay.className = 'card-tags-overlay';
    // Build tag badges
    if (Array.isArray(item.tags)) {
      item.tags.forEach(function (t) {
        if (!t) return;
        const slug = t.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        const span = document.createElement('span');
        span.className = 'recipe-tag tag-link';
        span.dataset.tag = slug;
        span.textContent = '#' + t;
        tagOverlay.appendChild(span);
      });
    }
    figure.appendChild(tagOverlay);

    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';
    cardContent.style.cssText = 'flex-grow: 1; display: flex; flex-direction: column;';
    card.appendChild(cardContent);

    const mediaContent = document.createElement('div');
    mediaContent.className = 'media-content';
    mediaContent.style.cssText = 'height: 4em; display: flex; align-items: center;';
    cardContent.appendChild(mediaContent);

    const titleP = document.createElement('p');
    titleP.className = 'title is-4 has-text-centered';
    titleP.style.cssText = 'width: 100%; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;';
    titleP.textContent = title;
    mediaContent.appendChild(titleP);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    contentDiv.style.cssText = 'flex-grow: 1; display: flex; flex-direction: column;';
    cardContent.appendChild(contentDiv);

    const snippetWrap = document.createElement('div');
    snippetWrap.style.cssText = 'height: 4.5em; margin-bottom: 0.5em;';
    const snippetP = document.createElement('p');
    snippetP.className = 'is-small';
    snippetP.style.cssText = 'display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 0;';
    snippetP.textContent = snippet || '';
    snippetWrap.appendChild(snippetP);
    contentDiv.appendChild(snippetWrap);

    const macrosWrapOuter = document.createElement('div');
    macrosWrapOuter.style.cssText = 'height: 3em; display: flex; justify-content: center; align-items: center; margin-top: .2em;';
    const macrosWrap = document.createElement('div');
    macrosWrap.style.cssText = 'display: flex; flex-wrap: wrap; gap: 1em; font-size: 0.8em; align-items: center; justify-content: center;';

    const makeMetric = (iconClass, color, value, suffix) => {
      const span = document.createElement('span');
      span.style.cssText = 'display: flex; align-items: center; gap: 0.3em;';
      const i = document.createElement('i');
      i.className = iconClass;
      i.style.color = color;
      const strong = document.createElement('strong');
      strong.textContent = String(value) + (suffix || '');
      span.appendChild(i);
      span.appendChild(strong);
      return span;
    };

    macrosWrap.appendChild(makeMetric('fas fa-fire', '#ff6b35', calories, ' kcal'));
    macrosWrap.appendChild(makeMetric('fas fa-dumbbell', '#4ecdc4', protein, 'g'));
    macrosWrap.appendChild(makeMetric('fas fa-droplet', '#45b7d1', fat, 'g'));
    macrosWrap.appendChild(makeMetric('fas fa-wheat-awn', '#f9ca24', carbohydrate, 'g'));

    macrosWrapOuter.appendChild(macrosWrap);
    contentDiv.appendChild(macrosWrapOuter);

    // Append to results column
    u('#searchResultsCol').append(col);
  });
}


function param(name) {
  return decodeURIComponent((location.search.split(name + '=')[1] || '').split('&')[0]).replace(/\+/g, ' ');
}

// (removed) legacy string-template renderer; now building DOM directly for reliability

// Navigate when clicking tag badges (both static Hugo-rendered and search results)
document.addEventListener('click', function (e) {
  var target = e.target;
  if (target.classList && target.classList.contains('tag-link')) {
    // Stop the card anchor from triggering
    e.stopPropagation();
    e.preventDefault();
    var slug = target.getAttribute('data-tag');
    if (slug) {
      // Detect base path (works for local dev under /CookBook/ subpath)
      var url = '/CookBook/tags/' + slug + '/';
      // Support ctrl/cmd/middle click to open in new tab
      if (e.metaKey || e.ctrlKey || e.button === 1) {
        window.open(url, '_blank');
      } else {
        window.location.href = url;
      }
    }
  }
});

// Re-render search results when filter changes
if (document.getElementById('showTestCheckbox')) {
  u('#showTestCheckbox').on('change', function () {
    if (lastSearchResult && !u('#searchResults').hasClass('is-hidden')) {
      populateResults(lastSearchResult);
    }
  });
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.documentElement;
  let activeVideoModal = null;

  const closeVideoModal = (modal) => {
    if (!modal) { return; }
    const videoEl = modal.querySelector('[data-video-modal-player]');
    modal.classList.remove('is-active');
    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0;
    }
    if (!document.querySelector('.modal.is-active')) {
      rootElement.classList.remove('is-clipped');
    }
    if (activeVideoModal === modal) {
      activeVideoModal = null;
    }
  };

  const openVideoModal = (modal) => {
    if (!modal) { return; }
    modal.classList.add('is-active');
    rootElement.classList.add('is-clipped');
    const videoEl = modal.querySelector('[data-video-modal-player]');
    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0;
    }
    activeVideoModal = modal;
    modal.focus({ preventScroll: true });
  };

  document.querySelectorAll('[data-video-modal-trigger]').forEach((trigger) => {
    const modalId = trigger.getAttribute('data-video-modal-trigger');
    if (!modalId) { return; }
    const modal = document.getElementById(modalId);
    if (!modal) { return; }

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openVideoModal(modal);
    });

    modal.querySelectorAll('[data-video-modal-close]').forEach((closeEl) => {
      closeEl.addEventListener('click', (event) => {
        event.preventDefault();
        closeVideoModal(modal);
      });
    });

    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeVideoModal(modal);
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeVideoModal) {
      closeVideoModal(activeVideoModal);
    }
  });

  const fodmapToggleIcon = document.getElementById('fodmap-toggle-icon');
  if (fodmapToggleIcon) {
    const body = document.body;
    const preference = localStorage.getItem('fodmap-view-enabled');

    if (preference === 'true') {
      body.classList.add('fodmap-view-enabled');
    }

    fodmapToggleIcon.addEventListener('click', (e) => {
      e.preventDefault();
      body.classList.toggle('fodmap-view-enabled');
      if (body.classList.contains('fodmap-view-enabled')) {
        localStorage.setItem('fodmap-view-enabled', 'true');
      } else {
        localStorage.setItem('fodmap-view-enabled', 'false');
      }
    });
  }
});