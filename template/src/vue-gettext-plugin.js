import Vue from 'vue';
import Jed from 'jed';

const localization = new Vue({
  methods: {
    gettext(value) {
      if (!this.jed) {
        return value;
      }

      if (!this.cache.gettext[value]) {
        this.cache.gettext[value] = this.jed.gettext(value);
      }

      return this.cache.gettext[value];
    },
    pgettext(context, value) {
      if (!this.jed) {
        return value;
      }

      if (!this.cache.pgettext[value]) {
        this.cache.pgettext[value] = {};
      }

      if (!this.cache.pgettext[value][context]) {
        this.cache.pgettext[value][context] = this.jed.pgettext(context, value);
      }

      return this.cache.pgettext[value][context];
    },
    npgettext(context, singular_key, plural_key, value) {
      if (!this.jed) {
        return plural_key;
      }

      if (!this.cache.npgettext[singular_key]) {
        this.cache.npgettext[singular_key] = {};
      }

      if (!this.cache.npgettext[singular_key][context]) {
        this.cache.npgettext[singular_key][context] = {};
      }

      if (!this.cache.npgettext[singular_key][context][value]) {
        this.cache.npgettext[singular_key][context][value] = this.jed.npgettext(context, singular_key, plural_key, value);
      }

      return this.cache.npgettext[singular_key][context][value];
    },
    clearCache() {
      this.cache = {
        gettext: {},
        pgettext: {},
        npgettext: {},
      };
    },
    importLocale(rawLang) {
      const importMap = {
        en: () => import(
          /* webpackChunkName: "locale/locale.en" */
          'locale/json/en_US.json'
          ),
        ru: () => import(
          /* webpackChunkName: "locale/locale.ru" */
          'locale/json/ru_RU.json'
          ),
      };

      if (!importMap[rawLang]) {
        return importMap.en();
      }
      return importMap[rawLang]();
    },
    addLang(lang) {
      return this.importLocale(lang)
        .then((json) => {
          const jed = new Jed(json);
          this.jeds[lang] = jed;
        });
    },
    setLocale(lang) {
      if (lang === this.lang) {
        return;
      }
      if (this.jeds[lang]) {
        this.lang = lang;
        this.clearCache();
        return;
      }

      this.addLang(lang)
        .then(() => {
          this.lang = lang;
          this.clearCache();
        });
    }
  },
  computed: {
    jed() {
      return this.jeds[this.lang];
    }
  },
  data: () => ({
    lang: null,
    jeds: {},
    cache: {
      gettext: {},
      pgettext: {},
      npgettext: {},
    },
  }),
});

const VueGettextPlugin = {};

VueGettextPlugin.install = (VueApp) => {
  VueApp.prototype.$gettext = (value) => {
    return localization.gettext(value);
  };

  VueApp.prototype.$pgettext = (context, value) => {
    return localization.pgettext(context, value);
  };

  VueApp.prototype.$npgettext = (context, singular_key, plural_key, value) => {
    return localization.npgettext(context, singular_key, plural_key, value);
  };

  VueApp.prototype.$setLocale = (lang) => {
    return localization.setLocale(lang);
  };
};

export default VueGettextPlugin;
