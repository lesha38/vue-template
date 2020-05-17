import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

import Home from 'screens/Home';

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      name: 'home',
      path: '/',
      component: Home,
    },
    {
      path: '*',
      redirect: { name: 'home' }
    },
  ],
});

// router.beforeEach((to, from, next) => {
//   next();
// });

export default router;
