import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import appState from './modules/appState';

const store = new Vuex.Store({
  modules: {
    appState
  },
  strict: DEVELOPMENT,
});

export default store;
