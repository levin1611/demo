<template>
  <v-tour :name="name" :steps="steps" :callbacks="callbacksTour" :options="optionsTour" @click.stop="log">
    <template slot-scope="tour">
      <transition name="fade">
        <v-step v-if="tour.currentStep === index" v-for="(step, index) of tour.steps" :key="index" :step="step" :previous-step="tour.previousStep" :next-step="tour.nextStep" :stop="tour.stop" :is-first="tour.isFirst" :is-last="tour.isLast" :labels="tour.labels" :highlight="tour.highlight" :style="stepStyle">
          <div slot="header" class="_f _j_b"><span style="font-weight:600;" :style="stepStyleHeader">{{tour.steps[tour.currentStep].ht}}</span><span @click="tour.stop" class="custom custom-delete1" style="font-size: 16px;color: #cbd6e2;cursor: pointer;"></span></div>
          <div slot="content" style="text-align:left;font-size: 14px;color:rgba(0,0,0,0.8);line-height: 16px;margin: 12px 0">
            <span>{{tour.steps[tour.currentStep].content}}</span>
          </div>
          <div slot="actions">
            <div class="_f _r _j_b _a_c">
              <div style="font-size: 12px">{{tour.currentStep+1}}/{{tour.steps.length}}</div>
              <div>
                <!-- <Button v-if="!tour.isLast" @click="tour.stop" class="v-step__button">{{$t('guide.skip')}}
                </Button> -->
                <Button v-if="!tour.isFirst" @click.stop="tour.previousStep" size="mini" style="height:auto;padding: 5px 10px;">{{$t('guide.lastStep')}}</Button>
                <Button v-if="!tour.isLast" @click.stop="tour.nextStep" size="mini" type="primary"  style="height:auto;padding: 5px 10px">{{$t('guide.nextStep')}}</Button>
                <Button v-if="tour.isLast" size="mini" type="primary" class="piwik_show__global_steps" style="height:auto;padding: 5px 10px"  @click="tour.stop">
                  {{$t('guide.start')}}
                </Button>
              </div>
            </div>
          </div>
        </v-step>
      </transition>
    </template>
  </v-tour>
</template>

<script type="text/javascript">
  // | 'auto'
  // | 'auto-start'
  // | 'auto-end'
  // | 'top'
  // | 'top-start'
  // | 'top-end'
  // | 'bottom'
  // | 'bottom-start'
  // | 'bottom-end'
  // | 'right'
  // | 'right-start'
  // | 'right-end'
  // | 'left'
  // | 'left-start'
  // | 'left-end'
    export default {
        name: 'baseVTour',
        props: {
            width: String,
            mode: {
                type: String,
                default: 'default'
            },
            name: {
                type: String,
                required: true,
                default: 'defaultName'
            },
            steps: {
                type: Array,
                required: true,
                default: () => ([])
            },
            callbacksTour: {
                type: Object,
                default: () => ({
                    onStart: (el) => {},
                    onStop: (el) => {},
                    onPreviousStep: (el) => {},
                    onNextStep: (el) => {}
                })
            },
            optionsTour: {
                type: Object,
                default: () => ({
                    useKeyboardNavigation: true,
                    startTimeout: 0
                })
            }
        },
        computed: {
            stepStyleHeader() {
                const o = { lineHeight: '16px' };
                return o;
            },
            stepStyle() {
                const o = { maxWidth: '320px' };
                if (this.width) o.width = this.width;
                return o;
            }
        },
        methods: {
            log(tour) {
                console.clear();
                console.log(tour);
            },
            start(val) {
                this.$emit('forbiddenDefault', true);
                this.$nextTick(function() {
                    this.$tours[this.name].start();
                });
            }
        }
    };
</script>
