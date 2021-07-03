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
    this.delay();
    let arr = [1,2,40,55,5,3,2,4,2,3,5,23,5,23,5,6,2,4,557,9,54,93,903,4,2];
    this.findMore(arr)
    let have = this.isHave(arr,3);
    console.log(have)
    let isTrue = this.isEvery(arr,0)
    console.log(isTrue)
  },
  mounted(){},
  methods: {
    //延迟测试
    delay(){
      setTimeout(function(){
        console.log(1)
      },500)
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
      },500)
      console.log(6)
    },
    findMore(arr){
      if(!arr || arr.length<1) return 0;
      if(arr.length === 1) return 1;
      let res = {};
      let maxName,maxVal=1;
      arr.forEach(item =>{
        res[item]? res[item] += 1 : res[item]=1;
        if(res[item] > maxVal){
          maxVal = res[item];
          maxName = item;
        }
      })
      // for(let i=0;i<arr.length;i++){
      //   res[arr[i]]? res[arr[i]] += 1 : res[arr[i]]=1;
      // }
      console.log(`数组中最多的数是${maxName},出现${maxVal}次`)
      console.log(res)
    },
    isHave(arr,str){
      //some 判断数组中是否包含某项
      let have = arr.some(item =>{
        return item == str
      })
      return have
    },
    isEvery(arr,num){
      //every 判断数组中所有项是否都符合，一项不符合都不行
      let isTrue = arr.every(item=>{
        return item > num
      })
      return isTrue
    }
  }
}
</script>
<style lang='scss' scoped>
</style>
