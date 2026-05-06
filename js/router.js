// Hash-based SPA router
const Router = {
  currentRoute: null,

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },

  parse(hash) {
    const clean = hash.replace(/^#\/?/, '');
    if (!clean) return { page: 'home' };

    const parts = clean.split('/');
    const subject = parts[0] || null;
    const chapter = parts[1] || null;
    const section = parts[2] || null;

    if (subject === 'high-freq') {
      return { page: 'high-freq' };
    }

    return { page: 'content', subject, chapter, section };
  },

  async handleRoute() {
    const route = this.parse(location.hash);
    this.currentRoute = route;

    Utils.emit('routeChange', route);
  },

  navigate(path) {
    location.hash = path;
  },

  getSubjectSlug() {
    return this.currentRoute?.subject || null;
  },

  getChapterSlug() {
    return this.currentRoute?.chapter || null;
  }
};
