<template>
  <div class=''></div>
</template>

<script>
export default {
  name: '',
  data(){
    return {}
  },
  components: {},
  created(){
    setTimeout(function(){
      console.log(1)
    },1000)
    var p = new Promise(function (resove,reject) {
      setTimeout(() => {
        console.log(2)
        return resove(true);
      }, 0);
      console.log(3)
    })
    setTimeout(function(){
      console.log(4);
      p.then(function(){
        console.log(5)
      });
    })
    console.log(6)
  },
  mounted(){},
  methods: {}
}
</script>
<style lang='scss' scoped>
</style>
