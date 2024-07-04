<template></template>
<script>
    export default {
        name: 'OnekeyRedirect',
        beforeCreate: function() {
            this.$router.go(-1);
        }
    };
</script>
