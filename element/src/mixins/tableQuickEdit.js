export default {
    data() {
        return {
            visibleEdit: false,
            prevTarget: null,
            popperFlag: false,
            menuExpand: null,
            reference: {},
            popperOptions: {
                boundariesElement: 'body',
                positionFixed: true,
                adaptive: false
            }
        };
    },
    methods: {
        clearEditPopperComponent() {
            this.prevTarget = null;
            this.popperFlag = !this.popperFlag;
            this.visibleEdit = false;
        }
    }
};
