// Sidebar navigation tree
const Navigation = {
  subjects: [],
  currentIndex: {}, // subject slug -> index.json data

  async init() {
    this.subjects = await Utils.cachedFetch('data/subjects.json') || [];
    this.renderHeaderNav();
    this.bindEvents();
  },

  renderHeaderNav() {
    const nav = Utils.$('#headerNav');
    if (!nav) return;

    nav.innerHTML = `
      <a href="#/" class="header__nav-item" data-subject="">首页</a>
      ${this.subjects.map(s => `
        <a href="#/${s.slug}" class="header__nav-item" data-subject="${s.slug}">${s.name}</a>
      `).join('')}
      <a href="#/high-freq" class="header__nav-item" data-subject="high-freq">高频考点</a>
    `;
  },

  async loadSubjectIndex(subjectSlug) {
    if (this.currentIndex[subjectSlug]) return this.currentIndex[subjectSlug];
    const data = await Utils.cachedFetch(`data/${subjectSlug}/index.json`);
    if (data) this.currentIndex[subjectSlug] = data;
    return data;
  },

  async renderSidebar(subjectSlug) {
    const navTree = Utils.$('#navTree');
    if (!navTree) return;

    if (!subjectSlug) {
      // Show all subjects overview
      navTree.innerHTML = this.subjects.map(s => `
        <div class="sidebar__section">
          <a href="#/${s.slug}" class="sidebar__item sidebar__item--chapter">${s.name}</a>
        </div>
      `).join('');
      return;
    }

    const chapters = await this.loadSubjectIndex(subjectSlug);
    if (!chapters) return;

    const subject = this.subjects.find(s => s.slug === subjectSlug);

    navTree.innerHTML = `
      <div class="sidebar__section">
        <div class="sidebar__section-title">${subject ? subject.name : subjectSlug}</div>
        ${chapters.map(ch => {
          const hasHighFreq = ch.highFrequencyTopics && ch.highFrequencyTopics.length > 0;
          return `
            <details class="nav-chapter-details" data-chapter="${ch.slug}">
              <summary class="nav-chapter">
                <span>${ch.title}</span>
                ${hasHighFreq ? '<span class="freq-dot" title="含高频考点"></span>' : ''}
              </summary>
              ${ch.sections ? ch.sections.map(sec => `
                <a href="#/${subjectSlug}/${ch.slug}/${sec.id}" class="sidebar__item" data-section="${sec.id}">
                  ${sec.title}
                </a>
              `).join('') : ''}
            </details>
          `;
        }).join('')}
      </div>
    `;
  },

  updateActiveState(route) {
    // Update header nav
    Utils.$$('.header__nav-item').forEach(el => {
      const sub = el.dataset.subject;
      el.classList.toggle('active', sub === route.subject || (route.page === 'high-freq' && sub === 'high-freq') || (route.page === 'home' && sub === ''));
    });

    // Update sidebar
    Utils.$$('.sidebar__item').forEach(el => {
      el.classList.toggle('active', el.dataset.section === route.section);
    });

    // Open the active chapter details
    if (route.chapter) {
      Utils.$$('.nav-chapter-details').forEach(el => {
        if (el.dataset.chapter === route.chapter) {
          el.open = true;
        }
      });
    }
  },

  bindEvents() {
    // Menu button
    const menuBtn = Utils.$('#menuBtn');
    const sidebar = Utils.$('#sidebar');
    const overlay = Utils.$('#overlay');

    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('visible');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
      });
    }

    // Close sidebar on navigation (mobile)
    Utils.on('routeChange', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
    });
  }
};
