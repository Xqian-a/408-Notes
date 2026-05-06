// Search engine using FlexSearch with CJK support
const Search = {
  index: null,
  documents: [],
  isIndexed: false,
  subjects: [],

  async init() {
    this.subjects = await Utils.cachedFetch('data/subjects.json') || [];
    this.bindEvents();

    // Initialize FlexSearch
    if (window.FlexSearch) {
      this.index = new FlexSearch.Document({
        document: {
          id: 'id',
          index: ['title', 'content', 'keyPoints', 'tags'],
          store: ['title', 'subjectSlug', 'subjectName', 'chapterSlug', 'chapterTitle', 'sectionId', 'snippet']
        },
        tokenize: 'forward',
        resolution: 9,
        cache: true
      });
    }
  },

  async buildIndex() {
    if (this.isIndexed || !this.index) return;

    let docId = 0;

    for (const subject of this.subjects) {
      const chapters = await Utils.cachedFetch(`data/${subject.slug}/index.json`);
      if (!chapters) continue;

      for (const ch of chapters) {
        const chData = await Utils.cachedFetch(`data/${subject.slug}/${ch.slug}.json`);
        if (!chData || !chData.sections) continue;

        chData.sections.forEach(section => {
          const keyPointsText = section.keyPoints ? section.keyPoints.map(kp => kp.text).join(' ') : '';
          const tagsText = section.tags ? section.tags.join(' ') : '';
          const plainContent = Utils.stripMarkdown(section.content || '');

          this.index.add({
            id: docId++,
            title: section.title,
            content: plainContent,
            keyPoints: keyPointsText,
            tags: tagsText,
            subjectSlug: subject.slug,
            subjectName: subject.name,
            chapterSlug: ch.slug,
            chapterTitle: ch.title,
            sectionId: section.id,
            snippet: plainContent.substring(0, 200)
          });
        });
      }
    }

    this.isIndexed = true;
  },

  async search(query) {
    if (!query || query.length < 1) return [];

    // Build index on first search
    if (!this.isIndexed) {
      await this.buildIndex();
    }

    if (!this.index) return [];

    const results = this.index.search(query, {
      limit: 20,
      enrich: true
    });

    // Flatten and deduplicate
    const seen = new Set();
    const items = [];

    results.forEach(fieldResult => {
      fieldResult.result.forEach(item => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          items.push(item.doc);
        }
      });
    });

    return items;
  },

  bindEvents() {
    const input = Utils.$('#searchInput');
    const resultsPanel = Utils.$('#searchResults');
    const resultsList = Utils.$('#searchResultsList');
    const countEl = Utils.$('#searchCount');
    const closeBtn = Utils.$('#searchClose');

    if (!input) return;

    const doSearch = Utils.debounce(async (query) => {
      if (!query || query.length < 1) {
        resultsPanel.classList.remove('visible');
        return;
      }

      const results = await this.search(query);

      if (results.length === 0) {
        resultsList.innerHTML = '<div class="search-results__empty">未找到相关知识点</div>';
        countEl.textContent = '0 个结果';
      } else {
        countEl.textContent = `${results.length} 个结果`;
        resultsList.innerHTML = results.map(r => `
          <a href="#/${r.subjectSlug}/${r.chapterSlug}/${r.sectionId}" class="search-results__item">
            <div class="search-results__item-breadcrumb">${r.subjectName} > ${r.chapterTitle}</div>
            <div class="search-results__item-title">${Utils.highlightText(r.title, query)}</div>
            <div class="search-results__item-snippet">${Utils.highlightText(Utils.getSnippet(r.snippet, query), query)}</div>
          </a>
        `).join('');
      }

      resultsPanel.classList.add('visible');
    }, 200);

    input.addEventListener('input', (e) => doSearch(e.target.value.trim()));

    // Close results
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        resultsPanel.classList.remove('visible');
        input.value = '';
      });
    }

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!resultsPanel.contains(e.target) && e.target !== input) {
        resultsPanel.classList.remove('visible');
      }
    });

    // Keyboard shortcut: Ctrl+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        input.focus();
      }
      if (e.key === 'Escape') {
        resultsPanel.classList.remove('visible');
        input.blur();
      }
    });

    // Close on navigation
    Utils.on('routeChange', () => {
      resultsPanel.classList.remove('visible');
    });
  }
};
