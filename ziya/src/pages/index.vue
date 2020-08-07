<template>
  <div class="contain">
    <h1>{{ msg }}</h1>
    <router-link to="/works">Go to works</router-link>
  </div>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Welcome to Your '
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
