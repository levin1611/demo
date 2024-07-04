<template>
  <div>
    <vueCropper :ref="imgRef" :img="img" :mode="option.mode" :style="{width,height}" @imgLoad="success" :enlarge="option.enlarge" :canScale="option.canScale" :outputSize="option.outputSize" :fixedBox="option.fixedBox" :autoCrop="option.autoCrop" :canMoveBox="option.canMoveBox" :autoCropWidth="option.autoCropWidth" :autoCropHeight="option.autoCropHeight" :centerBox="option.centerBox" @realTime="realTime" @imgMoving="imgMoving"></vueCropper>
    <Slider v-model="process" @change="changeSize" :min="0" :max="maxProcess" class="custom-slider"></Slider>
  </div>
</template>

<script>
    import { Rnum } from '@/utils/dynamicDatas';
    // import { debounce } from 'lodash';
    export default {
        name: 'cardNameCropper',
        props: ['img', 'width', 'height', 'options'],
        data() {
            return {
                imgRef: `cropper${Rnum()}`,
                crop: '',
                process: 5,
                compare: 5,
                maxProcess: 10,
                step: 1, // 放大比
                option: {
                    canScale: false,
                    outputSize: 1,
                    fixedBox: true,
                    autoCrop: true,
                    canMoveBox: false,
                    autoCropWidth: '152',
                    autoCropHeight: '152',
                    centerBox: true,
                    enlarge: 1,
                    mode: 'cover'
                }
            };
        },
        watch: {
            crop(val) {
                this.$emit('updateImgData', { cropBlob: this.crop });
            },
            img() {
                this.$emit('updateView');
            }
        },
        methods: {
            // log() {
            //     setTimeout(() => {
            //         console.log(this.$refs[this.imgRef].getImgAxis());
            //         console.log(this.$refs[this.imgRef].getCropAxis());
            //     }, 100);
            // },
            success(status) {
                if (status !== 'success') throw new Error('初始化异常');
                // this.log();
                // const xy = this.$refs[this.imgRef].getImgAxis();
                // 计算步骤条最小最大不至于过于缩小或过于放大导致标识数异常 目前计算逻辑有些bug需要进行修改
            },
            changeSize(scal) {
                if ((this.process - this.compare) === 0) {
                    return false;
                }
                const num = (scal - this.compare) / this.step;
                this.compare = scal;
                this.$refs[this.imgRef].changeScale(num);
            },
            imgMoving(data) {},
            realTime(data) {
                this.$emit('updateImgData', { previews: data });
                this.getCropBlob();
            },
            getCropBlob() {
                this.$refs[this.imgRef].getCropBlob((data) => {
                    this.crop = data;
                });
            }
        },
        created() {
            if (this.options) this.option = { ...this.option, ...this.options };
        }
    };
</script>
