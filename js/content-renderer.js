// Content renderer: JSON -> HTML with Markdown parsing
const ContentRenderer = {
  subjects: [],

  async init() {
    this.subjects = await Utils.cachedFetch('data/subjects.json') || [];
    // Configure marked (v4 API)
    if (window.marked) {
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false
      });
    }
  },

  renderHome() {
    const content = Utils.$('#contentArea');
    if (!content) return;

    content.innerHTML = `
      <div class="home">
        <div class="home__hero">
          <h1 class="home__title">408考研知识库</h1>
          <p class="home__subtitle">涵盖数据结构、计算机组成原理、操作系统、计算机网络全部大纲知识点，标注近10年高频考点</p>
        </div>

        <div class="home__subjects">
          ${this.subjects.map(s => `
            <a href="#/${s.slug}" class="home__card">
              <div class="home__card-icon">${this.getSubjectIcon(s.icon)}</div>
              <h2 class="home__card-title">${s.name}</h2>
              <p class="home__card-desc">${s.description}</p>
              <span class="home__card-meta">${s.chapterCount} 章 · 约 ${s.points} 分</span>
            </a>
          `).join('')}
        </div>

        <div style="text-align:center;margin-top:2rem;">
          <a href="#/high-freq" class="home__card" style="display:inline-block;max-width:400px;">
            <div class="home__card-icon">★</div>
            <h2 class="home__card-title">高频考点汇总</h2>
            <p class="home__card-desc">近10年真题高频考点集中复习</p>
          </a>
        </div>
      </div>
    `;

    TOC.destroy();
    Utils.$('#tocList').innerHTML = '';
  },

  async renderSubject(subjectSlug) {
    const content = Utils.$('#contentArea');
    if (!content) return;

    const subject = this.subjects.find(s => s.slug === subjectSlug);
    if (!subject) {
      content.innerHTML = this.renderNotFound();
      return;
    }

    const chapters = await Utils.cachedFetch(`data/${subjectSlug}/index.json`);
    if (!chapters) {
      content.innerHTML = this.renderNotFound();
      return;
    }

    content.innerHTML = `
      <div class="breadcrumb">
        <a href="#/">首页</a>
        <span class="breadcrumb__sep">/</span>
        <span>${subject.name}</span>
      </div>

      <h1>${subject.name}</h1>
      <p style="color:var(--color-text-secondary);margin-bottom:2rem;">${subject.description} · 考试占比约 ${subject.points} 分</p>

      <div class="chapter-overview">
        <div class="chapter-overview__title">章节目录</div>
        <div class="chapter-overview__text">
          共 ${chapters.length} 章，点击章节查看详细知识点
        </div>
      </div>

      ${chapters.map((ch, i) => `
        <div style="margin-bottom:1.5rem;">
          <a href="#/${subjectSlug}/${ch.slug}" style="font-size:1.125rem;font-weight:600;text-decoration:none;color:var(--color-primary);">
            第 ${i + 1} 章 ${ch.title}
          </a>
          ${ch.highFrequencyTopics && ch.highFrequencyTopics.length > 0 ? `
            <div style="margin-top:0.5rem;display:flex;flex-wrap:wrap;gap:0.25rem;">
              ${ch.highFrequencyTopics.map(t => `<span class="freq-badge"><span class="freq-badge__tooltip">${t.years ? '考年: ' + t.years.join(', ') : '高频考点'}</span>${t.title || t}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    `;

    TOC.destroy();
    Utils.$('#tocList').innerHTML = '';
  },

  async renderChapter(subjectSlug, chapterSlug, sectionId) {
    const content = Utils.$('#contentArea');
    if (!content) return;

    const subject = this.subjects.find(s => s.slug === subjectSlug);
    const chapterData = await Utils.cachedFetch(`data/${subjectSlug}/${chapterSlug}.json`);

    if (!chapterData) {
      content.innerHTML = this.renderNotFound();
      return;
    }

    let html = `
      <div class="breadcrumb">
        <a href="#/">首页</a>
        <span class="breadcrumb__sep">/</span>
        <a href="#/${subjectSlug}">${subject ? subject.name : subjectSlug}</a>
        <span class="breadcrumb__sep">/</span>
        <span>${chapterData.title}</span>
      </div>

      <h1>${chapterData.title}</h1>
    `;

    // Chapter overview
    if (chapterData.overview) {
      html += `
        <div class="chapter-overview">
          <div class="chapter-overview__title">本章概述</div>
          <div class="chapter-overview__text">${chapterData.overview}</div>
        </div>
      `;
    }

    // Sections
    if (chapterData.sections) {
      chapterData.sections.forEach(section => {
        html += `<div class="article-section" id="section-${section.id}">`;
        html += `<h2 id="${section.id}">${section.title}</h2>`;

        // Section meta
        if (section.difficulty || (section.tags && section.tags.length > 0)) {
          html += '<div class="section-meta">';
          if (section.difficulty) {
            html += `<span class="section-meta__item">难度: ${this.renderDifficulty(section.difficulty)}</span>`;
          }
          html += '</div>';
        }

        // Main content
        if (section.content) {
          html += `<div class="article">${this.parseMarkdown(section.content)}</div>`;
        }

        // Key points
        if (section.keyPoints && section.keyPoints.length > 0) {
          section.keyPoints.forEach(kp => {
            const isHighFreq = kp.isHighFrequency;
            const boxClass = isHighFreq ? 'high-freq-box' : 'key-point';
            const labelClass = isHighFreq ? 'high-freq-box__label' : 'key-point__label';
            const textClass = isHighFreq ? 'high-freq-box__text' : 'key-point__text';

            html += `
              <div class="${boxClass}">
                <div class="${boxClass.replace('box', 'box__header')}">
                  <span class="${labelClass}">${isHighFreq ? '★ 高频考点' : '重点'}</span>
                  ${isHighFreq && kp.examYears ? `
                    <span class="freq-badge">
                      <span class="freq-badge__tooltip">考年: ${kp.examYears.join(', ')}</span>
                      ${kp.examYears.length}次
                    </span>
                  ` : ''}
                </div>
                <div class="${textClass}">${kp.text}</div>
                ${kp.tags && kp.tags.length > 0 ? `
                  <div class="key-point__tags">
                    ${kp.tags.map(t => `<span class="key-point__tag">${t}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            `;
          });
        }

        html += '</div>';
      });
    }

    content.innerHTML = html;

    // Generate TOC
    setTimeout(() => {
      TOC.generate();
      if (sectionId) {
        const target = document.getElementById(sectionId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 50);
  },

  async renderHighFreq() {
    const content = Utils.$('#contentArea');
    if (!content) return;

    content.innerHTML = '<div class="skeleton skeleton-line" style="width:60%;margin-bottom:1rem;"></div><div class="skeleton skeleton-line" style="width:80%;margin-bottom:1rem;"></div><div class="skeleton skeleton-line" style="width:70%;"></div>';

    const allPoints = [];

    try {
      for (const subject of this.subjects) {
        const chapters = await Utils.cachedFetch(`data/${subject.slug}/index.json`);
        if (!chapters) continue;

        for (const ch of chapters) {
          const chData = await Utils.cachedFetch(`data/${subject.slug}/${ch.slug}.json`);
          if (!chData || !chData.sections) continue;

          chData.sections.forEach(section => {
            if (section.keyPoints) {
              section.keyPoints.filter(kp => kp.isHighFrequency).forEach(kp => {
                allPoints.push({
                  subject: subject.name,
                  subjectSlug: subject.slug,
                  chapter: chData.title,
                  chapterSlug: ch.slug,
                  section: section.title,
                  sectionId: section.id,
                  text: kp.text,
                  examYears: kp.examYears || [],
                  tags: kp.tags || []
                });
              });
            }
          });
        }
      }
    } catch (err) {
      console.error('Failed to load high-frequency points:', err);
      content.innerHTML = '<div class="empty-state"><div class="empty-state__icon">⚠️</div><h2 class="empty-state__title">加载失败</h2><p class="empty-state__desc">请刷新页面重试</p></div>';
      return;
    }

    // Group by subject
    const grouped = {};
    allPoints.forEach(p => {
      if (!grouped[p.subject]) grouped[p.subject] = [];
      grouped[p.subject].push(p);
    });

    let html = `
      <div class="breadcrumb">
        <a href="#/">首页</a>
        <span class="breadcrumb__sep">/</span>
        <span>高频考点汇总</span>
      </div>

      <h1>高频考点汇总</h1>
      <p style="color:var(--color-text-secondary);margin-bottom:2rem;">近10年真题高频考点集中复习，共 ${allPoints.length} 个高频考点</p>
    `;

    Object.entries(grouped).forEach(([subjectName, points]) => {
      html += `<h2>${subjectName} (${points.length}个考点)</h2>`;
      html += '<div class="review-grid">';
      points.forEach(p => {
        const yearStr = p.examYears.length > 0 ? `考年: ${p.examYears.join(', ')}` : '高频考点';
        html += `
          <a href="#/${p.subjectSlug}/${p.chapterSlug}/${p.sectionId}" class="review-card" style="text-decoration:none;color:inherit;display:block;">
            <div class="review-card__subject">${p.chapter} > ${p.section}</div>
            <div class="review-card__title">${p.text}</div>
            <div class="review-card__desc">
              <span class="freq-badge" style="margin-top:var(--space-2);display:inline-flex;">
                <span class="freq-badge__tooltip">${yearStr}</span>
                ${p.examYears.length > 0 ? p.examYears.length + '次' : '高频'}
              </span>
            </div>
          </a>
        `;
      });
      html += '</div>';
    });

    content.innerHTML = html;
    TOC.destroy();
    Utils.$('#tocList').innerHTML = '';
  },

  parseMarkdown(md) {
    if (!md) return '';
    if (window.marked) {
      try {
        return marked.parse(md);
      } catch(e) {
        console.error('Markdown parse error:', e);
      }
    }
    // Fallback: basic markdown
    return md
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  },

  renderDifficulty(level) {
    const dots = [];
    for (let i = 1; i <= 3; i++) {
      dots.push(`<span class="difficulty__dot ${i <= level ? 'filled' : ''}"></span>`);
    }
    return `<span class="difficulty">${dots.join('')}</span>`;
  },

  getSubjectIcon(icon) {
    const icons = {
      tree: '🌲',
      cpu: '💻',
      monitor: '🖥️',
      network: '🌐'
    };
    return icons[icon] || '📖';
  },

  renderNotFound() {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">🔍</div>
        <h2 class="empty-state__title">页面未找到</h2>
        <p class="empty-state__desc">请检查URL是否正确，或返回首页</p>
        <a href="#/" style="display:inline-block;margin-top:1rem;padding:0.5rem 1rem;background:var(--color-accent);color:#fff;border-radius:var(--radius-md);">返回首页</a>
      </div>
    `;
  }
};
