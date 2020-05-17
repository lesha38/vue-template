import './polyfills';
import './styles';

import Vue from 'vue';
import router from 'router';
import store from 'store';
import { sync } from 'vuex-router-sync';
import { mapGetters } from 'vuex';
import Main from 'screens/Main';
import VueGettextPlugin from './vue-gettext-plugin';

sync(store, router);

Vue.use(VueGettextPlugin);

Vue.mixin({
  created() {
    this.console = window.console;
  },
  computed: {
    ...mapGetters({
      appState: 'getAppState',
    }),
  },
});

export default new Vue({
  el: '#root',
  store,
  router,
  render: (h) => h(Main)
});
