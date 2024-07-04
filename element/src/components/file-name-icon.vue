<template>
  <svg class="svg-icon" aria-hidden="true" :style="styles">
    <use :xlink:href="xlinkHref"></use>
  </svg>
</template>

<script>
    import iconMap from './file-name-icon-hash';
    export default {
        name: 'fileNameIcon314',
        props: {
            styles: {
                type: Object,
                default: () => ({
                    fontSize: '24px'
                })
            },
            iconName: String,
            isFolder: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            xlinkHref() {
                if (this.isFolder) return '#custom-fp-paper-file';
                const iconName = this.iconName;
                if (!iconName || !iconMap[iconName]) return '#custom-rect';
                return `#${iconMap[iconName]}`;
            }
        }
    };
</script>
