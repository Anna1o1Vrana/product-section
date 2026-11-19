/**
 * Alternative product gallery
 *
 * Replace the empty `src` values below with your image URLs.
 * Every image is a slide. Images that belong to the same colour share `colorId`.
 * Use a different `view` value for alternative angles of the same colour.
 */
(() => {
  'use strict';

  const galleryImages = [
    {
      id: 'midnight-blue-front',
      colorId: 'midnight-blue',
      color: 'Midnight blue',
      view: 'front',
      src: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa/global/403692/21/sv01/fnd/UKR/w/1000/h/1000/fmt/png',
      alt: 'Stratos Air Pro X2 in Midnight blue — front view'
    },
    {
      id: 'midnight-blue-side',
      colorId: 'midnight-blue',
      color: 'Midnight blue',
      view: 'side',
      src: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa/global/403692/21/sv02/fnd/UKR/w/1000/h/1000/fmt/png',
      alt: 'Stratos Air Pro X2 in Midnight blue — side view'
    },
    {
      id: 'deep-olive-front',
      colorId: 'deep-olive',
      color: 'Deep olive',
      view: 'front',
      src: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa/global/403692/20/sv01/fnd/UKR/w/1000/h/1000/fmt/png',
      alt: 'Stratos Air Pro X2 in Deep olive — front view'
    },
    {
      id: 'deep-olive-side',
      colorId: 'deep-olive',
      color: 'Deep olive',
      view: 'side',
      src: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa/global/403692/20/sv02/fnd/UKR/w/1000/h/1000/fmt/png',
      alt: 'Stratos Air Pro X2 in Deep olive — side view'
    },
    {
      id: 'graphite-front',
      colorId: 'graphite',
      color: 'Graphite',
      view: 'front',
      src: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa/global/403692/02/sv01/fnd/UKR/w/1000/h/1000/fmt/png',
      alt: 'Stratos Air Pro X2 in Graphite — front view'
    },
    {
      id: 'graphite-side',
      colorId: 'graphite',
      color: 'Graphite',
      view: 'side',
      src: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa/global/403692/02/sv02/fnd/UKR/w/1000/h/1000/fmt/png',
      alt: 'Stratos Air Pro X2 in Graphite — side view'
    },
    {
      id: 'burnt-orange-front',
      colorId: 'burnt-orange',
      color: 'Burnt orange',
      view: 'front',
      src: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa/global/403692/06/sv01/fnd/UKR/w/1000/h/1000/fmt/png',
      alt: 'Stratos Air Pro X2 in Burnt orange — front view'
    },
    {
      id: 'burnt-orange-side',
      colorId: 'burnt-orange',
      color: 'Burnt orange',
      view: 'side',
      src: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa/global/403692/06/sv02/fnd/UKR/w/1000/h/1000/fmt/png',
      alt: 'Stratos Air Pro X2 in Burnt orange — side view'
    },
    {
      id: 'pale-blue-front',
      colorId: 'pale-blue',
      color: 'Pale blue',
      view: 'front',
      src: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa/global/403692/04/sv01/fnd/UKR/w/1000/h/1000/fmt/png',
      alt: 'Stratos Air Pro X2 in Pale blue — front view'
    },
    {
      id: 'pale-blue-side',
      colorId: 'pale-blue',
      color: 'Pale blue',
      view: 'side',
      src: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa/global/403692/04/sv02/fnd/UKR/w/1000/h/1000/fmt/png',
      alt: 'Stratos Air Pro X2 in Pale blue — side view'
    }
  ];

  const SELECTORS = {
    root: '[data-js="alternative-gallery"]',
    viewport: '[data-js="gallery-viewport"]',
    track: '[data-js="gallery-track"]',
    previous: '[data-js="gallery-prev"]',
    next: '[data-js="gallery-next"]',
    counter: '[data-js="gallery-counter"]',
    thumbnail: '[data-js="gallery-current-thumbnail"]',
    thumbnailsToggle: '[data-js="gallery-thumbnails-toggle"]',
    thumbnails: '[data-js="gallery-thumbnails"]',
    altView: '[data-js="gallery-alt-view"]',
    zoomToggle: '[data-js="gallery-zoom-toggle"]',
    zoomPreview: '[data-js="gallery-zoom-preview"]',
    fullscreenOpen: '[data-js="gallery-fullscreen-open"]',
    fullscreenClose: '[data-js="gallery-fullscreen-close"]',
    lightbox: '[data-js="gallery-lightbox"]',
    lightboxImage: '[data-js="gallery-lightbox-image"]',
    lightboxPrevious: '[data-js="gallery-lightbox-prev"]',
    lightboxNext: '[data-js="gallery-lightbox-next"]',
    lightboxCounter: '[data-js="gallery-lightbox-counter"]',
    announcement: '[data-js="gallery-announcement"]'
  };

  const root = document.querySelector(SELECTORS.root);
  if (!root) return;

  const elements = Object.fromEntries(
    Object.entries(SELECTORS).map(([key, selector]) => [
      key,
      key === 'root' ? root : document.querySelector(selector) || root.querySelector(selector)
    ])
  );

  const validImages = galleryImages.filter((image) => image.src.trim());
  if (!validImages.length) {
    elements.track.innerHTML = `
      <div class="v2-product-gallery__empty" role="status">
        Add image URLs to the <code>galleryImages</code> array in alternative-gallery.js.
      </div>
    `;
    [
      elements.previous,
      elements.next,
      elements.thumbnailsToggle,
      elements.altView,
      elements.zoomToggle,
      elements.fullscreenOpen
    ].forEach((button) => {
      if (button) button.disabled = true;
    });
    return;
  }

  let activeIndex = 0;
  let isZoomEnabled = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let isDragging = false;

  const normalize = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const getActiveImage = () => validImages[activeIndex];

  const getImageMarkup = (image, index) => `
    <figure class="v2-product-gallery__slide" data-slide-index="${index}" aria-hidden="${index !== activeIndex}">
      <img
        class="v2-product-gallery__image"
        src="${escapeAttribute(image.src)}"
        alt="${escapeAttribute(image.alt)}"
        draggable="false"
        loading="${index === 0 ? 'eager' : 'lazy'}"
      />
    </figure>
  `;

  function escapeAttribute(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderSlides() {
    elements.track.innerHTML = validImages.map(getImageMarkup).join('');
    renderThumbnails();
    updateGallery();
  }

  function renderThumbnails() {
    elements.thumbnails.innerHTML = validImages
      .map(
        (image, index) => `
          <button
            class="v2-product-gallery__thumbnail${index === activeIndex ? ' is-active' : ''}"
            type="button"
            data-thumbnail-index="${index}"
            aria-label="View image ${index + 1}: ${escapeAttribute(image.color)} ${escapeAttribute(image.view)}"
            aria-current="${index === activeIndex ? 'true' : 'false'}"
          >
            <img src="${escapeAttribute(image.src)}" alt="" loading="lazy" />
          </button>
        `
      )
      .join('');
  }

  function updateGallery() {
    const activeImage = getActiveImage();
    const slides = [...elements.track.querySelectorAll('.v2-product-gallery__slide')];

    elements.track.style.transform = `translateX(-${activeIndex * 100}%)`;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.setAttribute('aria-hidden', String(!isActive));
      slide.classList.toggle('is-active', isActive);
    });

    elements.counter.textContent = `${activeIndex + 1} / ${validImages.length}`;
    elements.thumbnail.src = activeImage.src;
    elements.thumbnail.alt = `Current image: ${activeImage.color}, ${activeImage.view} view`;

    elements.previous.disabled = validImages.length < 2;
    elements.next.disabled = validImages.length < 2;

    const sameColorViews = validImages.filter(
      (image) => image.colorId === activeImage.colorId
    );
    elements.altView.disabled = sameColorViews.length < 2;

    elements.zoomPreview.style.backgroundImage = `url("${activeImage.src}")`;
    elements.zoomPreview.classList.remove('is-visible');

    renderThumbnailsActiveState();
    updateLightbox();

    elements.announcement.textContent =
      `Image ${activeIndex + 1} of ${validImages.length}. ${activeImage.color}, ${activeImage.view} view.`;
  }

  function renderThumbnailsActiveState() {
    elements.thumbnails.querySelectorAll('[data-thumbnail-index]').forEach((button) => {
      const isActive = Number(button.dataset.thumbnailIndex) === activeIndex;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-current', String(isActive));
    });
  }

  function goTo(index) {
    if (!validImages.length) return;
    activeIndex = (index + validImages.length) % validImages.length;
    updateGallery();
  }

  function goToColor(colorName) {
    const colorId = normalize(colorName);
    const matchingIndex = validImages.findIndex(
      (image) =>
        normalize(image.colorId) === colorId ||
        normalize(image.color) === colorId
    );

    if (matchingIndex !== -1) {
      goTo(matchingIndex);
    }
  }

  function showAlternativeView() {
    const activeImage = getActiveImage();
    const sameColorIndexes = validImages
      .map((image, index) => ({ image, index }))
      .filter(({ image }) => image.colorId === activeImage.colorId)
      .map(({ index }) => index);

    if (sameColorIndexes.length < 2) return;

    const currentPosition = sameColorIndexes.indexOf(activeIndex);
    const nextPosition = (currentPosition + 1) % sameColorIndexes.length;
    goTo(sameColorIndexes[nextPosition]);
  }

  function toggleThumbnails() {
    const isExpanded = elements.thumbnailsToggle.getAttribute('aria-expanded') === 'true';
    elements.thumbnailsToggle.setAttribute('aria-expanded', String(!isExpanded));
    elements.thumbnailsToggle.setAttribute(
      'aria-label',
      isExpanded ? 'Show image thumbnails' : 'Hide image thumbnails'
    );
    elements.thumbnails.hidden = isExpanded;
  }

  function setZoomEnabled(enabled) {
    isZoomEnabled = enabled;
    elements.zoomToggle.setAttribute('aria-pressed', String(enabled));
    elements.zoomToggle.setAttribute(
      'aria-label',
      enabled ? 'Disable image magnifier' : 'Enable image magnifier'
    );
    root.classList.toggle('is-zoom-enabled', enabled);
    elements.zoomPreview.classList.remove('is-visible');
  }

  function updateZoom(event) {
    if (!isZoomEnabled || event.pointerType === 'touch') return;

    const image = elements.track.querySelector('.v2-product-gallery__slide.is-active img');
    if (!image) return;

    const bounds = elements.viewport.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));

    elements.zoomPreview.style.backgroundImage = `url("${getActiveImage().src}")`;
    elements.zoomPreview.style.backgroundPosition = `${x * 100}% ${y * 100}%`;
    elements.zoomPreview.style.left = `${Math.max(0, Math.min(bounds.width - 170, event.clientX - bounds.left - 85))}px`;
    elements.zoomPreview.style.top = `${Math.max(0, Math.min(bounds.height - 170, event.clientY - bounds.top - 85))}px`;
    elements.zoomPreview.classList.add('is-visible');
  }

  function openLightbox() {
    updateLightbox();
    if (typeof elements.lightbox.showModal === 'function') {
      elements.lightbox.showModal();
    } else {
      elements.lightbox.setAttribute('open', '');
    }
  }

  function closeLightbox() {
    if (typeof elements.lightbox.close === 'function') {
      elements.lightbox.close();
    } else {
      elements.lightbox.removeAttribute('open');
    }
  }

  function updateLightbox() {
    elements.lightboxImage.src = getActiveImage().src;
    elements.lightboxImage.alt = getActiveImage().alt;
    elements.lightboxCounter.textContent = `${activeIndex + 1} / ${validImages.length}`;
  }

  function handlePointerDown(event) {
    if (event.pointerType === 'mouse') return;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    isDragging = true;
  }

  function handlePointerUp(event) {
    if (!isDragging) return;
    isDragging = false;

    const deltaX = event.clientX - pointerStartX;
    const deltaY = event.clientY - pointerStartY;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      goTo(activeIndex + (deltaX < 0 ? 1 : -1));
    }
  }

  function handleWheel(event) {
    // Horizontal trackpad gestures are used for slide navigation.
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 15) {
      event.preventDefault();
      goTo(activeIndex + (event.deltaX > 0 ? 1 : -1));
    }
  }

  elements.previous.addEventListener('click', () => goTo(activeIndex - 1));
  elements.next.addEventListener('click', () => goTo(activeIndex + 1));
  elements.altView.addEventListener('click', showAlternativeView);
  elements.thumbnailsToggle.addEventListener('click', toggleThumbnails);
  elements.zoomToggle.addEventListener('click', () => setZoomEnabled(!isZoomEnabled));
  elements.fullscreenOpen.addEventListener('click', openLightbox);
  elements.fullscreenClose.addEventListener('click', closeLightbox);
  elements.lightboxPrevious.addEventListener('click', () => goTo(activeIndex - 1));
  elements.lightboxNext.addEventListener('click', () => goTo(activeIndex + 1));

  elements.thumbnails.addEventListener('click', (event) => {
    const button = event.target.closest('[data-thumbnail-index]');
    if (button) goTo(Number(button.dataset.thumbnailIndex));
  });

  elements.viewport.addEventListener('pointermove', updateZoom);
  elements.viewport.addEventListener('pointerleave', () => {
    elements.zoomPreview.classList.remove('is-visible');
  });
  elements.viewport.addEventListener('pointerdown', handlePointerDown);
  elements.viewport.addEventListener('pointerup', handlePointerUp);
  elements.viewport.addEventListener('pointercancel', () => {
    isDragging = false;
  });
  elements.viewport.addEventListener('wheel', handleWheel, { passive: false });

  root.addEventListener('keydown', (event) => {
    if (event.target.closest('button')) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(activeIndex + 1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(activeIndex - 1);
    }
  });

  // Clicking the dialog backdrop closes fullscreen; clicks inside the content do not.
  elements.lightbox.addEventListener('click', (event) => {
    const lightboxContent = event.target.closest('.v2-product-gallery__lightbox-content');
    const clickedImageOrControl = event.target.closest('img, button, .v2-product-gallery__lightbox-counter');

    if (event.target === elements.lightbox || (lightboxContent && !clickedImageOrControl)) {
      closeLightbox();
    }
  });

  // Connect to the existing product colour swatches in the supplied PDP markup.
  document.addEventListener('click', (event) => {
    const swatch = event.target.closest('[data-js="color-swatch"]');
    if (!swatch) return;
    const colorName = swatch.dataset.color;
    if (colorName) goToColor(colorName);
  });

  // Optional external integration for code that changes the selected colour.
  document.addEventListener('product:color-change', (event) => {
    const colorName = event.detail?.color;
    if (colorName) goToColor(colorName);
  });

  renderSlides();

  console.log('Have a wonderful day 💫');
})();