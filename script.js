/**
 * Product page behaviour.
 *
 * Gallery order is the DOM order of `.thumbnail` and is never rearranged.
 * `activeIndex` is the only cursor. Previous and next move that cursor by one.
 * Choosing a colour jumps the cursor to the slide whose `data-slide` matches
 * the colour's `data-image-index`. Later previous/next presses continue from
 * that slide, still in the original order.
 */

(function () {
  'use strict';

  const STOCK_LIMIT = 4;
  const MIN_QUANTITY = 1;

  const SELECTORS = {
    galleryStage: '[data-js="gallery-stage"]',
    galleryImage: '[data-js="gallery-image"]',
    galleryStatus: '[data-js="gallery-status"]',
    galleryThumbnails: '[data-js="gallery-thumbnails"]',
    galleryThumbnail: '[data-js="gallery-thumbnail"]',
    galleryPrev: '[data-js="gallery-prev"]',
    galleryNext: '[data-js="gallery-next"]',

    colorOptions: '[data-js="color-options"]',
    colorSwatch: '[data-js="color-swatch"]',
    selectedColorName: '[data-js="selected-color-name"]',

    sizeOptions: '[data-js="size-options"]',
    sizeOption: '[data-js="size-option"]',
    sizeRow: '[data-js="size-row"]',

    quantityControl: '[data-js="quantity-control"]',
    quantityDecrease: '[data-js="quantity-decrease"]',
    quantityIncrease: '[data-js="quantity-increase"]',
    quantityValue: '[data-js="quantity-value"]',

    addToCart: '[data-js="add-to-cart"]',
    addToWishlist: '[data-js="add-to-wishlist"]',
    actionFeedback: '[data-js="action-feedback"]',

    productTabs: '[data-js="product-tabs"]',
    productTab: '[data-js="product-tab"]',
    tabPanel: '[data-js="tab-panel"]',
    reviewsLink: '[data-js="reviews-link"]',

    sizeGuideTrigger: '[data-js="size-guide-trigger"]',
    sizeDialog: '[data-js="size-dialog"]',
    sizeDialogClose: '[data-js="size-dialog-close"]',
    sizeDialogTitle: '[data-js="size-dialog-title"]',
    sizeDialogDescription: '[data-js="size-dialog-description"]'
  };

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function arrowTarget(length, current, key) {
    if (key === 'ArrowRight' || key === 'ArrowDown') {
      return (current + 1) % length;
    }

    if (key === 'ArrowLeft' || key === 'ArrowUp') {
      return (current - 1 + length) % length;
    }

    if (key === 'Home') return 0;
    if (key === 'End') return length - 1;

    return null;
  }

  ready(() => {
    initGallery();
    initColours();
    initSizes();
    initQuantity();
    initPurchaseActions();
    initTabs();
    initSizeGuide();
  });

  // GALLERY

  function initGallery() {
    const stage = document.querySelector(SELECTORS.galleryStage);
    const mainImage = document.querySelector(SELECTORS.galleryImage);
    const status = document.querySelector(SELECTORS.galleryStatus);
    const thumbnailList = document.querySelector(SELECTORS.galleryThumbnails);
    const prevButton = document.querySelector(SELECTORS.galleryPrev);
    const nextButton = document.querySelector(SELECTORS.galleryNext);

    if (!stage || !mainImage || !thumbnailList) return;

    const thumbButtons = Array.from(
      thumbnailList.querySelectorAll(SELECTORS.galleryThumbnail)
    );

    const slides = thumbButtons.map((button, position) => {
      const thumb = button.querySelector('img');
      const id = Number.isNaN(Number(button.dataset.slide))
        ? position
        : Number(button.dataset.slide);

      const colourButton = document.querySelector(
        `${SELECTORS.colorSwatch}[data-image-index="${id}"]`
      );

      const colour = colourButton
        ? colourButton.dataset.color
        : `Product image ${position + 1}`;

      return {
        id,
        button,
        src: toLargeSrc(thumb ? thumb.src : mainImage.src),
        alt: `Stratos Air Pro X2 running shoe in ${colour.toLowerCase()}`,
        colour
      };
    });

    if (!slides.length) return;

    let activeIndex = slides.findIndex((slide) =>
      slide.button.classList.contains('product-gallery__thumbnail--active')
    );

    if (activeIndex < 0) activeIndex = 0;

    slides.forEach((slide) => {
      const preload = new Image();
      preload.src = slide.src;
    });

    function wrap(index) {
      return (index % slides.length + slides.length) % slides.length;
    }

    function setSlide(index) {
      activeIndex = wrap(index);

      const slide = slides[activeIndex];

      if (mainImage.src !== slide.src) {
        mainImage.src = slide.src;
      }

      mainImage.alt = slide.alt;

      slides.forEach((item, position) => {
        const selected = position === activeIndex;

        item.button.classList.toggle(
          'product-gallery__thumbnail--active',
          selected
        );

        item.button.setAttribute('aria-pressed', String(selected));
      });

      if (status) {
        status.textContent =
          `Image ${activeIndex + 1} of ${slides.length}, ${slide.colour}`;
      }

      slide.button.scrollIntoView?.({
        block: 'nearest',
        inline: 'nearest',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    }

    function setSlideById(id) {
      const position = slides.findIndex((slide) => slide.id === id);

      if (position !== -1) setSlide(position);
    }

    setSlide(activeIndex);

    thumbnailList.addEventListener('click', (event) => {
      const button = event.target.closest(SELECTORS.galleryThumbnail);

      if (!button || !thumbnailList.contains(button)) return;

      const position = slides.findIndex((slide) => slide.button === button);

      if (position !== -1) setSlide(position);
    });

    thumbnailList.addEventListener('keydown', (event) => {
      const button = event.target.closest(SELECTORS.galleryThumbnail);

      if (!button) return;

      const current = slides.findIndex((slide) => slide.button === button);

      if (current === -1) return;

      const next = arrowTarget(slides.length, current, event.key);

      if (next === null) return;

      event.preventDefault();
      setSlide(next);
      slides[next].button.focus();
    });

    prevButton?.addEventListener('click', () => setSlide(activeIndex - 1));
    nextButton?.addEventListener('click', () => setSlide(activeIndex + 1));

    stage.addEventListener('keydown', (event) => {
      if (event.target.closest(SELECTORS.galleryThumbnail)) return;

      const next = arrowTarget(slides.length, activeIndex, event.key);

      if (next === null) return;

      event.preventDefault();
      setSlide(next);
    });

    document.addEventListener('product:colour-change', (event) => {
      const imageIndex = event.detail?.imageIndex;

      if (imageIndex === undefined) return;

      setSlideById(Number(imageIndex));
    });
  }

  function toLargeSrc(src) {
    try {
      const url = new URL(src, window.location.href);

      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('w', '1400');
      url.searchParams.set('q', '85');

      return url.toString();
    } catch {
      return src;
    }
  }

  // COLOURS

  function initColours() {
    const group = document.querySelector(SELECTORS.colorOptions);
    const name = document.querySelector(SELECTORS.selectedColorName);

    if (!group) return;

    const swatches = Array.from(
      group.querySelectorAll(SELECTORS.colorSwatch)
    );

    function selectColour(button) {
      if (!swatches.includes(button)) return;

      swatches.forEach((swatch) => {
        const selected = swatch === button;

        swatch.classList.toggle(
          'product-options__swatch--selected',
          selected
        );

        swatch.setAttribute('aria-pressed', String(selected));
      });

      if (name && button.dataset.color) {
        name.textContent = button.dataset.color;
      }

      document.dispatchEvent(
        new CustomEvent('product:colour-change', {
          detail: {
            imageIndex: Number(button.dataset.imageIndex)
          }
        })
      );
    }

    group.addEventListener('click', (event) => {
      const button = event.target.closest(SELECTORS.colorSwatch);

      if (!button || !group.contains(button)) return;

      selectColour(button);
    });

    group.addEventListener('keydown', (event) => {
      const button = event.target.closest(SELECTORS.colorSwatch);

      if (!button) return;

      const current = swatches.indexOf(button);

      if (current === -1) return;

      const next = arrowTarget(swatches.length, current, event.key);

      if (next === null) return;

      event.preventDefault();

      selectColour(swatches[next]);
      swatches[next].focus();
    });
  }

  // SIZES

  function initSizes() {
    const group = document.querySelector(SELECTORS.sizeOptions);

    if (!group) return;

    const sizes = Array.from(
      group.querySelectorAll(SELECTORS.sizeOption)
    );

    function enabledSizes() {
      return sizes.filter((button) => !button.disabled);
    }

    function selectSize(button) {
      if (!button || button.disabled) return;

      sizes.forEach((size) => {
        if (size.disabled) return;

        const selected = size === button;

        size.classList.toggle(
          'product-options__size--selected',
          selected
        );

        size.setAttribute('aria-pressed', String(selected));
      });

      markCurrentSizeRow(
        button.dataset.size || button.textContent.trim()
      );
    }

    group.addEventListener('click', (event) => {
      const button = event.target.closest(SELECTORS.sizeOption);

      if (!button || !group.contains(button)) return;

      selectSize(button);
    });

    group.addEventListener('keydown', (event) => {
      const button = event.target.closest(SELECTORS.sizeOption);

      if (!button || button.disabled) return;

      const options = enabledSizes();
      const current = options.indexOf(button);

      if (current === -1) return;

      const next = arrowTarget(options.length, current, event.key);

      if (next === null) return;

      event.preventDefault();

      selectSize(options[next]);
      options[next].focus();
    });

    const selected = sizes.find((button) =>
      button.classList.contains('product-options__size--selected')
    );

    if (selected) {
      markCurrentSizeRow(
        selected.dataset.size || selected.textContent.trim()
      );
    }
  }

  function markCurrentSizeRow(size) {
    const rows = document.querySelectorAll(SELECTORS.sizeRow);

    rows.forEach((row) => {
      const heading = row.querySelector('th');
      const match = heading && heading.textContent.trim() === String(size);

      row.classList.toggle('size-guide__table-row--current', match);

      if (!heading) return;

      if (match) {
        heading.setAttribute('aria-current', 'true');
      } else {
        heading.removeAttribute('aria-current');
      }
    });
  }

  function selectedSizeLabel() {
    const selected = document.querySelector(
      `${SELECTORS.sizeOption}.product-options__size--selected`
    );

    if (!selected) return '';

    return selected.dataset.size || selected.textContent.trim();
  }

  // QUANTITY

  function initQuantity() {
    const decrease = document.querySelector(SELECTORS.quantityDecrease);
    const increase = document.querySelector(SELECTORS.quantityIncrease);
    const output = document.querySelector(SELECTORS.quantityValue);
    const control = document.querySelector(SELECTORS.quantityControl);

    if (!decrease || !increase || !output) return;

    let quantity = clampQuantity(
      Number(output.textContent) || MIN_QUANTITY
    );

    function render() {
      output.textContent = String(quantity);
      output.setAttribute('aria-label', `Quantity ${quantity}`);

      decrease.disabled = quantity <= MIN_QUANTITY;
      increase.disabled = quantity >= STOCK_LIMIT;
    }

    function change(delta) {
      quantity = clampQuantity(quantity + delta);
      render();
    }

    decrease.addEventListener('click', () => change(-1));
    increase.addEventListener('click', () => change(1));

    control?.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
        event.preventDefault();
        change(1);
      } else if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft'
      ) {
        event.preventDefault();
        change(-1);
      }
    });

    render();
  }

  function clampQuantity(value) {
    return Math.min(Math.max(value, MIN_QUANTITY), STOCK_LIMIT);
  }

  // PURCHASE ACTIONS

  function initPurchaseActions() {
    const addButton = document.querySelector(SELECTORS.addToCart);
    const wishlist = document.querySelector(SELECTORS.addToWishlist);
    const feedback = document.querySelector(SELECTORS.actionFeedback);

    let saved = false;

    function say(message) {
      if (feedback) feedback.textContent = message;
    }

    function colourName() {
      const name = document.querySelector(SELECTORS.selectedColorName);

      return name ? name.textContent.trim() : '';
    }

    function quantityValue() {
      const output = document.querySelector(SELECTORS.quantityValue);
      const value = output ? Number(output.textContent) : MIN_QUANTITY;

      return value > 0 ? value : MIN_QUANTITY;
    }

    addButton?.addEventListener('click', () => {
      const size = selectedSizeLabel();
      const colour = colourName();
      const count = quantityValue();
      const noun = count === 1 ? 'pair' : 'pairs';

      if (!size) {
        say('Please select a shoe size before adding to cart.');
        return;
      }

      say(
        `Added ${count} ${noun} of Stratos Air Pro X2 in ${colour}, size ${size}, to the cart.`
      );
    });

    if (wishlist) {
      wishlist.setAttribute('aria-pressed', 'false');

      wishlist.addEventListener('click', () => {
        saved = !saved;

        wishlist.setAttribute('aria-pressed', String(saved));

        wishlist.classList.toggle(
          'product-actions__button--saved',
          saved
        );

        renderWishlistLabel(wishlist, saved);

        say(
          saved
            ? 'Saved Stratos Air Pro X2 to your wishlist.'
            : 'Removed Stratos Air Pro X2 from your wishlist.'
        );
      });
    }
  }

  function renderWishlistLabel(button, saved) {
    const icon = document.createElement('span');

    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = saved ? '♥' : '♡';

    button.replaceChildren(
      icon,
      document.createTextNode(
        saved ? ' Saved to wishlist' : ' Add to wishlist'
      )
    );
  }

  // TABS

  function initTabs() {
    const tablist = document.querySelector(SELECTORS.productTabs);

    if (!tablist) return;

    const tabs = Array.from(
      tablist.querySelectorAll(SELECTORS.productTab)
    );

    function activate(tab, focusTab = false) {
      tabs.forEach((item) => {
        const selected = item === tab;

        item.classList.toggle(
          'product-details__tab--active',
          selected
        );

        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;

        const panelId = item.getAttribute('aria-controls');

        const panel = Array.from(
          document.querySelectorAll(SELECTORS.tabPanel)
        ).find((element) => element.dataset.panelId === panelId);

        if (panel) panel.hidden = !selected;
      });

      if (focusTab) tab.focus();
    }

    tablist.addEventListener('click', (event) => {
      const tab = event.target.closest(SELECTORS.productTab);

      if (!tab || !tablist.contains(tab)) return;

      activate(tab);
    });

    tablist.addEventListener('keydown', (event) => {
      const tab = event.target.closest(SELECTORS.productTab);

      if (!tab) return;

      const current = tabs.indexOf(tab);

      if (current === -1) return;

      const next = arrowTarget(tabs.length, current, event.key);

      if (next === null) return;

      event.preventDefault();
      activate(tabs[next], true);
    });

    const reviewsLink = document.querySelector(SELECTORS.reviewsLink);

    reviewsLink?.addEventListener('click', (event) => {
      event.preventDefault();

      const reviewsTab = tabs.find(
        (tab) => tab.getAttribute('aria-controls') === 'reviews-panel'
      );

      if (!reviewsTab) return;

      activate(reviewsTab, true);

      document.querySelector('.product-details')?.scrollIntoView({
        block: 'start',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    });
  }

  // SIZE GUIDE DIALOG

  function initSizeGuide() {
    const trigger = document.querySelector(SELECTORS.sizeGuideTrigger);
    const dialog = document.querySelector(SELECTORS.sizeDialog);
    const closeButton = document.querySelector(SELECTORS.sizeDialogClose);
    const description = document.querySelector(
      SELECTORS.sizeDialogDescription
    );

    if (!trigger || !dialog || typeof dialog.showModal !== 'function') {
      return;
    }

    const baseDescription = description
      ? description.textContent.trim()
      : '';

    function openDialog() {
      document.body.classList.add('disabled-scroll');
      const size = selectedSizeLabel();

      if (description) {
        description.textContent = size
          ? `${baseDescription} Size ${size} is currently selected.`
          : baseDescription;
      }

      if (size) markCurrentSizeRow(size);

      if (!dialog.open) dialog.showModal();

      const title = document.querySelector(SELECTORS.sizeDialogTitle);

      if (title) {
        title.tabIndex = -1;
        title.focus();
      }
    }

    function closeDialog() {
      document.body.classList.remove('disabled-scroll');
      if (dialog.open) dialog.close();
    }

    trigger.addEventListener('click', openDialog);

    closeButton?.addEventListener('click', closeDialog);

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog();
    });

    dialog.addEventListener('close', () => {
      trigger.focus();
    });
  }
})();

