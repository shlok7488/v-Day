// ===== S♥K FLIX — Main Script =====
// Fully data-driven from manifest.json

let currentModalItems = [];
let currentModalIndex = 0;

// ===== INIT: Render from global manifestData (data.js) =====
function init() {
  if (typeof manifestData === 'undefined' || !manifestData) {
    document.getElementById('dynamicContent').innerHTML = `
      <div style="text-align:center;padding:4rem;color:#808080;">
        <p style="font-size:1.5rem;">💔 Failed to load memories</p>
        <p>Make sure data.js is loaded correctly.</p>
      </div>
    `;
    return;
  }
  
  renderHero();
  renderAllRows();
  initObservers();
  initCarouselDrag();
  console.log('💕 S♥K Flix loaded — ' + manifestData.rows.length + ' sections rendered!');
}

// ===== PROFILE GATE =====
function selectProfile(name) {
  const gate = document.getElementById('profileGate');
  const loading = document.getElementById('loadingScreen');
  const navProfile = document.getElementById('navProfile');

  gate.classList.add('hidden');
  loading.classList.add('active');

  // Set nav profile avatar
  if (name === 'Shlok') {
    navProfile.innerHTML = '<img src="../photos/IMG_20250228_202313_719.jpg" alt="Shlok">';
  } else {
    navProfile.innerHTML = '<img src="../photos/IMG_20250224_152851_008.jpg" alt="Krusha">';
  }

  // Simulate loading, then show content
  setTimeout(() => {
    loading.classList.remove('active');
    loading.classList.add('done');
    document.body.style.overflow = 'auto';

    // Trigger hero animation
    setTimeout(() => {
      document.querySelectorAll('.fade-in-up').forEach(el => {
        el.style.animationPlayState = 'running';
      });
    }, 200);
  }, 1800);
}

// Lock scroll when profile gate is visible
document.body.style.overflow = 'hidden';

// ===== RENDER HERO =====
function renderHero() {
  const heroBg = document.getElementById('heroBg');
  const hero = manifestData.hero;
  heroBg.innerHTML = `<img src="${hero.image}" alt="Shlok & Krusha" loading="eager">`;
}

// ===== RENDER ALL ROWS =====
function renderAllRows() {
  const container = document.getElementById('dynamicContent');
  let html = '';

  manifestData.rows.forEach((row, rowIndex) => {
    // Insert featured banner after the 2nd row (top10)
    if (rowIndex === 2) {
      html += renderFeaturedBanner();
    }
    html += renderRow(row);
  });

  container.innerHTML = html;
}

// ===== RENDER SINGLE ROW =====
function renderRow(row) {
  if (row.cardType === 'timeline') return renderTimelineRow(row);

  let cardsHtml = '';

  row.items.forEach((item, index) => {
    if (row.cardType === 'top10') {
      cardsHtml += renderTop10Card(item, index);
    } else if (row.cardType === 'portrait') {
      cardsHtml += renderPortraitCard(item, row.id, index);
    } else {
      cardsHtml += renderLandscapeCard(item, row.id, index);
    }
  });

  const seeAllHtml = row.showSeeAll
    ? `<a href="#" class="see-all">See All <i class="fas fa-chevron-right"></i></a>`
    : '';

  return `
    <section class="content-section" id="${row.id}">
      <div class="row-header">
        <h2 class="row-title"><span class="emoji">${row.emoji}</span> ${row.title}</h2>
        ${seeAllHtml}
      </div>
      <div class="carousel-wrapper">
        <button class="carousel-btn left" onclick="scrollCarousel(this, -1)"><i class="fas fa-chevron-left"></i></button>
        <div class="carousel">
          ${cardsHtml}
        </div>
        <button class="carousel-btn right" onclick="scrollCarousel(this, 1)"><i class="fas fa-chevron-right"></i></button>
      </div>
    </section>
  `;
}

// ===== CARD RENDERERS =====
function renderLandscapeCard(item, rowId, index) {
  const isVideo = item.type === 'video';
  const playIcon = isVideo ? '<div class="video-badge"><i class="fas fa-play"></i></div>' : '';
  const clickAction = isVideo
    ? `openVideoPlayer('${item.src}')`
    : `openMediaModal('${rowId}', ${index})`;

  const thumbSrc = isVideo ? '' : `<img src="${item.src}" alt="${item.title}" loading="lazy">`;
  const videoThumb = isVideo
    ? `<video src="${item.src}#t=1" muted preload="metadata" playsinline></video>`
    : '';

  return `
    <div class="card" onclick="${clickAction}">
      <div class="card-media">
        ${thumbSrc}${videoThumb}
        ${playIcon}
      </div>
      <div class="card-overlay">
        <span class="card-title">${item.title}</span>
        <span class="card-meta">${item.meta}</span>
        <div class="card-actions">
          <button class="mini-btn play-btn" onclick="event.stopPropagation();${clickAction}"><i class="fas fa-play"></i></button>
          <button class="mini-btn" onclick="event.stopPropagation();likeItem(this)"><i class="fas fa-heart"></i></button>
        </div>
      </div>
    </div>
  `;
}

function renderPortraitCard(item, rowId, index) {
  return `
    <div class="card portrait" onclick="openMediaModal('${rowId}', ${index})">
      <div class="card-media">
        <img src="${item.src}" alt="${item.title}" loading="lazy">
      </div>
      <div class="card-overlay">
        <span class="card-title">${item.title}</span>
        <span class="card-meta">${item.meta || ''}</span>
      </div>
    </div>
  `;
}

function renderTop10Card(item, index) {
  return `
    <div class="card top10" onclick="openMediaModal('top10Moments', ${index})">
      <span class="top10-number">${index + 1}</span>
      <div class="card-media">
        <img src="${item.src}" alt="${item.title}" loading="lazy">
      </div>
    </div>
  `;
}

// ===== TIMELINE ROW =====
function renderTimelineRow(row) {
  let cardsHtml = '';

  row.items.forEach((season, index) => {
    const isComingSoon = !season.coverSrc;
    const bgStyle = isComingSoon
      ? ''
      : '';
    const coverHtml = isComingSoon
      ? `<div class="timeline-coming-soon"><i class="fas fa-hourglass-half"></i></div>`
      : `<img src="${season.coverSrc}" alt="${season.season}" loading="lazy">`;
    const episodeCount = season.episodes ? season.episodes.length : 0;
    const clickAction = isComingSoon
      ? ''
      : `onclick="openSeasonModal(${index})"`;

    cardsHtml += `
      <div class="card timeline-card" ${clickAction}>
        <div class="card-media">
          ${coverHtml}
        </div>
        <div class="timeline-overlay ${isComingSoon ? 'coming-soon' : ''}">
          <span class="timeline-season">${season.season}</span>
          <span class="timeline-subtitle">${season.subtitle}</span>
          ${!isComingSoon ? `<span class="timeline-episodes">${episodeCount} Episodes</span>` : ''}
        </div>
      </div>
    `;
  });

  return `
    <section class="content-section" id="${row.id}">
      <div class="row-header">
        <h2 class="row-title"><span class="emoji">${row.emoji}</span> ${row.title}</h2>
      </div>
      <div class="carousel-wrapper">
        <button class="carousel-btn left" onclick="scrollCarousel(this, -1)"><i class="fas fa-chevron-left"></i></button>
        <div class="carousel">
          ${cardsHtml}
        </div>
        <button class="carousel-btn right" onclick="scrollCarousel(this, 1)"><i class="fas fa-chevron-right"></i></button>
      </div>
    </section>
  `;
}

// ===== FEATURED BANNER =====
function renderFeaturedBanner() {
  const featured = manifestData.featured;
  return `
    <div class="featured-banner">
      <div class="hero-bg">
        <img src="${featured.image}" alt="Featured Moment" loading="lazy">
      </div>
      <div class="hero-content fade-in-up">
        <div class="hero-tag"><span class="dot"></span> FEATURED EPISODE</div>
        <h1 class="hero-title" style="font-size: clamp(2rem,4vw,3.5rem);">${featured.title}</h1>
        <p class="hero-desc">${featured.description}</p>
        <div class="hero-actions">
          <button class="btn-play" onclick="openMediaModal('top10Moments', 0)"><i class="fas fa-play"></i> Watch</button>
          <button class="btn-info"><i class="fas fa-plus"></i> My List</button>
        </div>
      </div>
    </div>
  `;
}

// ===== MODALS =====
function openMediaModal(rowId, index) {
  const row = manifestData.rows.find(r => r.id === rowId);
  if (!row) return;

  currentModalItems = row.items;
  currentModalIndex = index;
  renderModalContent();

  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function renderModalContent() {
  const item = currentModalItems[currentModalIndex];
  if (!item) return;

  const modalHero = document.getElementById('modalHero');
  const isVideo = item.type === 'video';

  if (isVideo) {
    modalHero.innerHTML = `
      <video src="${item.src}" controls autoplay muted style="width:100%;height:100%;object-fit:contain;background:#000;"></video>
    `;
  } else {
    modalHero.innerHTML = `<img src="${item.src}" alt="${item.title}" style="width:100%;height:100%;object-fit:contain;background:#000;">`;
  }

  document.getElementById('modalTitle').textContent = item.title;
  document.getElementById('modalDate').textContent = item.meta || '2024';
  document.getElementById('modalDesc').textContent = item.tags
    ? `A beautiful memory in our journey together. ${item.title} — captured and treasured forever.`
    : 'Every moment with you is worth remembering.';

  const tagsContainer = document.getElementById('modalTags');
  const tags = item.tags || ['#Love', '#Together', '#ShlokAndKrusha', '#Forever'];
  tagsContainer.innerHTML = tags.map(t => `<span>${t}</span>`).join('');

  // Nav buttons
  document.getElementById('modalPrev').style.display = currentModalIndex > 0 ? 'flex' : 'none';
  document.getElementById('modalNext').style.display = currentModalIndex < currentModalItems.length - 1 ? 'flex' : 'none';
}

function navigateModal(direction) {
  const newIndex = currentModalIndex + direction;
  if (newIndex >= 0 && newIndex < currentModalItems.length) {
    currentModalIndex = newIndex;
    renderModalContent();
  }
}

function openSeasonModal(seasonIndex) {
  const timelineRow = manifestData.rows.find(r => r.cardType === 'timeline');
  if (!timelineRow) return;

  const season = timelineRow.items[seasonIndex];
  if (!season || !season.episodes.length) return;

  // Convert episodes to modal items
  currentModalItems = season.episodes.map((ep, i) => ({
    src: ep,
    type: ep.endsWith('.mp4') ? 'video' : 'image',
    title: `${season.season} — Episode ${i + 1}`,
    meta: season.subtitle,
    tags: ['#Timeline', `#${season.season.replace(' ', '')}`, '#Memories']
  }));
  currentModalIndex = 0;
  renderModalContent();

  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function openAboutModal() {
  const modalHero = document.getElementById('modalHero');
  modalHero.innerHTML = `<img src="${manifestData.hero.image}" alt="S♥K" style="width:100%;height:100%;object-fit:cover;">`;
  document.getElementById('modalTitle').textContent = 'About S♥K Flix';
  document.getElementById('modalDate').textContent = 'Since 2024';
  document.getElementById('modalDesc').textContent = manifestData.hero.description;
  document.getElementById('modalTags').innerHTML = `
    <span>#Love</span><span>#Together</span><span>#ShlokAndKrusha</span>
    <span>#Forever</span><span>#Unscripted</span><span>#RealLove</span>
  `;
  document.getElementById('modalPrev').style.display = 'none';
  document.getElementById('modalNext').style.display = 'none';
  currentModalItems = [];

  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(event) {
  if (event.target === event.currentTarget) closeModalDirect();
}

function closeModalDirect() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = 'auto';

  // Pause any video in modal
  const vid = overlay.querySelector('video');
  if (vid) vid.pause();
}

// ===== VIDEO PLAYER =====
function openVideoPlayer(src) {
  const overlay = document.getElementById('videoPlayerOverlay');
  const video = document.getElementById('videoPlayer');
  const source = document.getElementById('videoSource');

  source.src = src;
  video.load();
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  video.play();
}

function closeVideoPlayer(event) {
  if (event.target === event.currentTarget) closeVideoPlayerDirect();
}

function closeVideoPlayerDirect() {
  const overlay = document.getElementById('videoPlayerOverlay');
  const video = document.getElementById('videoPlayer');
  video.pause();
  video.currentTime = 0;
  overlay.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// ===== PLAY MEMORY =====
function playMemory() {
  // Open the first video or the hero slideshow
  const videoRow = manifestData.rows.find(r => r.id === 'lateNight');
  if (videoRow && videoRow.items.length > 0) {
    const firstVid = videoRow.items[0];
    if (firstVid.type === 'video') {
      openVideoPlayer(firstVid.src);
    } else {
      openMediaModal('lateNight', 0);
    }
  } else {
    openMediaModal('continueWatching', 0);
  }
}

// ===== LIKE INTERACTION =====
function likeItem(btn) {
  btn.classList.toggle('liked');
  const icon = btn.querySelector('i');
  if (btn.classList.contains('liked')) {
    icon.style.color = '#e50914';
    btn.style.borderColor = '#e50914';
    // Floating heart animation
    const heart = document.createElement('span');
    heart.textContent = '♥';
    heart.className = 'floating-heart';
    btn.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
  } else {
    icon.style.color = '';
    btn.style.borderColor = '';
  }
}

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);

  // Active nav link
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 100) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});

// ===== CAROUSEL SCROLLING =====
function scrollCarousel(btn, direction) {
  const wrapper = btn.closest('.carousel-wrapper');
  const carousel = wrapper.querySelector('.carousel');
  const cardWidth = carousel.querySelector('.card')?.offsetWidth || 250;
  const scrollAmount = cardWidth * 3;
  carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

// ===== SEARCH =====
function toggleSearch() {
  const existing = document.querySelector('.search-overlay');
  if (existing) {
    existing.remove();
    return;
  }

  const searchOverlay = document.createElement('div');
  searchOverlay.className = 'search-overlay';
  searchOverlay.innerHTML = `
    <div class="search-container">
      <i class="fas fa-search search-icon"></i>
      <input type="text" class="search-input" placeholder="Search memories..." autofocus oninput="filterSearch(this.value)">
      <button class="search-close" onclick="toggleSearch()"><i class="fas fa-times"></i></button>
    </div>
    <div class="search-results" id="searchResults"></div>
  `;
  document.body.appendChild(searchOverlay);
  setTimeout(() => searchOverlay.classList.add('active'), 10);
  searchOverlay.querySelector('.search-input').focus();
}

function filterSearch(query) {
  const results = document.getElementById('searchResults');
  if (!query || query.length < 2) {
    results.innerHTML = '<p class="search-hint">Type to search your memories...</p>';
    return;
  }

  const q = query.toLowerCase();
  let matches = [];

  manifestData.rows.forEach(row => {
    if (row.cardType === 'timeline') return;
    row.items.forEach((item, index) => {
      const searchText = `${item.title} ${item.meta || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
      if (searchText.includes(q)) {
        matches.push({ ...item, rowId: row.id, index, rowTitle: row.title });
      }
    });
  });

  if (matches.length === 0) {
    results.innerHTML = '<p class="search-hint">No memories found 💔</p>';
    return;
  }

  results.innerHTML = matches.slice(0, 12).map(m => `
    <div class="search-result-card" onclick="toggleSearch();openMediaModal('${m.rowId}', ${m.index})">
      <div class="search-thumb">
        ${m.type === 'video'
          ? '<i class="fas fa-play-circle"></i>'
          : `<img src="${m.src}" alt="${m.title}" loading="lazy">`
        }
      </div>
      <div class="search-info">
        <span class="search-title">${m.title}</span>
        <span class="search-meta">${m.meta || ''} • ${m.rowTitle}</span>
      </div>
    </div>
  `).join('');
}

// ===== INTERSECTION OBSERVER =====
function initObservers() {
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.content-section, .featured-banner').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(section);
  });
}

// ===== TOUCH/MOUSE DRAG FOR CAROUSELS =====
function initCarouselDrag() {
  document.querySelectorAll('.carousel').forEach(carousel => {
    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener('mousedown', (e) => {
      isDown = true;
      carousel.style.cursor = 'grabbing';
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener('mouseleave', () => {
      isDown = false;
      carousel.style.cursor = 'grab';
    });

    carousel.addEventListener('mouseup', () => {
      isDown = false;
      carousel.style.cursor = 'grab';
    });

    carousel.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1.5;
      carousel.scrollLeft = scrollLeft - walk;
    });
  });
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModalDirect();
    closeVideoPlayerDirect();
    const search = document.querySelector('.search-overlay');
    if (search) search.remove();
  }
  if (e.key === 'ArrowLeft' && document.getElementById('modalOverlay').classList.contains('active')) {
    navigateModal(-1);
  }
  if (e.key === 'ArrowRight' && document.getElementById('modalOverlay').classList.contains('active')) {
    navigateModal(1);
  }
});

// ===== START =====
init();
