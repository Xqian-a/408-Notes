// Table of Contents generator with scroll highlighting
const TOC = {
  observer: null,
  headings: [],

  init() {
    this.bindEvents();
  },

  generate() {
    const content = Utils.$('#contentArea');
    if (!content) return;

    this.headings = Array.from(content.querySelectorAll('h2, h3')).map(h => ({
      id: h.id,
      text: h.textContent,
      level: h.tagName.toLowerCase(),
      element: h
    }));

    this.render();
    this.observe();
  },

  render() {
    const tocList = Utils.$('#tocList');
    const tocSheetList = Utils.$('#tocSheetList');

    if (this.headings.length === 0) {
      const emptyHTML = '<div style="font-size:0.8rem;color:var(--color-text-muted);padding:0.5rem 0;">暂无目录</div>';
      if (tocList) tocList.innerHTML = emptyHTML;
      if (tocSheetList) tocSheetList.innerHTML = emptyHTML;
      return;
    }

    const html = this.headings.map(h => `
      <a href="javascript:void(0)" class="toc__item ${h.level === 'h3' ? 'toc__item--h3' : ''}" data-target="${h.id}">
        ${h.text}
      </a>
    `).join('');

    if (tocList) {
      tocList.innerHTML = html;
      tocList.querySelectorAll('.toc__item').forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          const target = document.getElementById(el.dataset.target);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }
    if (tocSheetList) {
      tocSheetList.innerHTML = html;
      tocSheetList.querySelectorAll('.toc__item').forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          const target = document.getElementById(el.dataset.target);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          tocSheetList.closest('.toc-sheet')?.classList.remove('open');
        });
      });
    }
  },

  observe() {
    if (this.observer) {
      this.observer.disconnect();
    }

    const options = {
      rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) + 16}px 0px -60% 0px`,
      threshold: 0
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.setActive(entry.target.id);
        }
      });
    }, options);

    this.headings.forEach(h => {
      if (h.element) this.observer.observe(h.element);
    });
  },

  setActive(id) {
    Utils.$$('.toc__item').forEach(el => {
      el.classList.toggle('active', el.dataset.target === id);
    });
  },

  bindEvents() {
    // TOC FAB button (mobile)
    const tocFab = Utils.$('#tocFab');
    const tocSheet = Utils.$('#tocSheet');

    if (tocFab && tocSheet) {
      tocFab.addEventListener('click', () => {
        tocSheet.classList.toggle('open');
      });

      // Close on click outside
      document.addEventListener('click', (e) => {
        if (tocSheet.classList.contains('open') && !tocSheet.contains(e.target) && e.target !== tocFab) {
          tocSheet.classList.remove('open');
        }
      });

      // Close on link click
      tocSheet.addEventListener('click', (e) => {
        if (e.target.classList.contains('toc__item')) {
          tocSheet.classList.remove('open');
        }
      });
    }
  },

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.headings = [];
  }
};
