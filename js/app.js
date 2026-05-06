// Main application entry point
const App = {
  async init() {
    // Initialize all modules
    await Navigation.init();
    await ContentRenderer.init();
    await Search.init();
    TOC.init();

    // Listen for route changes
    Utils.on('routeChange', (route) => this.handleRoute(route));

    // Initialize router (triggers first route)
    Router.init();

    // Theme toggle
    this.initTheme();
  },

  async handleRoute(route) {
    // Update navigation
    Navigation.updateActiveState(route);

    switch (route.page) {
      case 'home':
        ContentRenderer.renderHome();
        Navigation.renderSidebar(null);
        break;

      case 'content':
        if (route.chapter) {
          await ContentRenderer.renderChapter(route.subject, route.chapter, route.section);
          await Navigation.renderSidebar(route.subject);
        } else if (route.subject) {
          await ContentRenderer.renderSubject(route.subject);
          await Navigation.renderSidebar(route.subject);
        } else {
          ContentRenderer.renderHome();
          Navigation.renderSidebar(null);
        }
        break;

      case 'high-freq':
        await ContentRenderer.renderHighFreq();
        Navigation.renderSidebar(null);
        break;

      default:
        ContentRenderer.renderHome();
        Navigation.renderSidebar(null);
    }

    // Scroll to top on route change (unless section specified)
    if (!route.section) {
      window.scrollTo(0, 0);
    }
  },

  initTheme() {
    const btn = Utils.$('#themeBtn');
    const lightIcon = Utils.$('.theme-icon-light');
    const darkIcon = Utils.$('.theme-icon-dark');

    // Load saved theme
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (lightIcon) lightIcon.style.display = 'none';
      if (darkIcon) darkIcon.style.display = 'block';
    }

    if (btn) {
      btn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('theme', 'light');
          if (lightIcon) lightIcon.style.display = 'block';
          if (darkIcon) darkIcon.style.display = 'none';
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('theme', 'dark');
          if (lightIcon) lightIcon.style.display = 'none';
          if (darkIcon) darkIcon.style.display = 'block';
        }
      });
    }
  }
};

// Start the app
document.addEventListener('DOMContentLoaded', () => App.init());
