<template>
    <div>
        Count is: {{ count }}
    </div>
</template>
<script>
export default {
    data() {
        return {
            count: 1
        };
    },

    // `mounted` is a lifecycle hook which we will explain later
    mounted() {
    // `this` refers to the component instance.
        console.log(this.count, this.$t('menu.dashBoard')) // => 1

        // data can be mutated as well
        this.count = 2;
    }
};
</script>