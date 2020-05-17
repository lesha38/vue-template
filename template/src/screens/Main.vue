<template>
  <div class="main-screen">
    <div class="main-screen__main">
      <p>{{ name }}</p>
      <p>{{ description }}</p>

      <router-view/>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'MainScreen',
    data: () => ({

    }),
  };
</script>

<style lang="scss">

</style>
