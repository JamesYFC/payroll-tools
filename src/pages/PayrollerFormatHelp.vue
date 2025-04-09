<script setup lang="ts">
import { ref } from "vue";
const data = [
  {
    label: "Copy your pay slip values.",
    image: "/payroller-formatter/payroller-help-1.gif",
  },
  {
    label: "Paste into the payroller formatter page.",
    image: "/payroller-formatter/payroller-help-2.gif",
  },
  {
    label: "Remap names & toggle columns to your liking.",
    image: "/payroller-formatter/payroller-help-3.gif",
  },
  {
    label: "Paste back into your spreadsheet!",
    image: "/payroller-formatter/payroller-help-4.gif",
  },
  {
    label:
      "Pasting new data will keep your format settings, so you can quickly go between this page and your spreadsheet!",
    image: "/payroller-formatter/payroller-help-5.gif",
  },
];
const pageNum = ref(0);

const emit = defineEmits<{
  (e: "close"): void;
}>();

const props = defineProps<{
  show: boolean;
}>();
</script>

<template>
  <Transition name="modal">
    <div
      v-if="props.show"
      class="fixed flex flex-col justify-center items-center left-0 top-0 h-dvh w-dvw bg-[rgba(0,0,0,0.4)]"
      @click.prevent="emit('close')"
      @mousedown.prevent
    >
      <div
        class="bg-neutral-800 w-fit max-w-[680px] px-10 py-6 mx-10 rounded-xl"
        @click.stop
      >
        <h1 class="mb-2">How-to</h1>
        <Transition name="label" mode="out-in">
          <p :key="pageNum" class="w-full text-left">
            {{ pageNum + 1 }}. {{ data[pageNum].label }}
          </p>
        </Transition>
        <div class="overflow-hidden">
          <div
            class="flex transition-transform duration-1000 ease-in-out"
            :style="{ transform: `translateX(-${pageNum * 100}%)` }"
          >
            <div
              v-for="(_, index) of data"
              :key="index"
              class="w-full shrink-0 flex flex-col justify-center items-center gap-4 my-4"
            >
              <img :src="data[index].image" alt="test" />
            </div>
          </div>
        </div>

        <div class="flex justify-between w-full">
          <v-icon
            class="cursor-pointer"
            name="fa-arrow-left"
            scale="2"
            @click="pageNum != 0 && pageNum--"
            fill="var(--color-neutral-300)"
            :style="{
              visibility: pageNum === 0 ? 'hidden' : 'visible',
            }"
          />
          <div class="flex justify-between items-center gap-2">
            <div
              v-for="(_, index) in data"
              :key="index"
              class="rounded-full size-3"
              :class="{
                'bg-transparent': pageNum !== index,
                'border-neutral-500 border-1': pageNum !== index,
                'bg-neutral-500': pageNum === index,
              }"
            />
          </div>
          <v-icon
            class="cursor-pointer"
            name="fa-arrow-right"
            scale="2"
            @click="pageNum != data.length - 1 && pageNum++"
            fill="var(--color-neutral-300)"
            :style="{
              visibility: pageNum === data.length - 1 ? 'hidden' : 'visible',
            }"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  & > * {
    transition: all 0.5s;
  }
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  & > * {
    transform: translateY(-100%);
  }
  opacity: 0;
}

.label-enter-active {
  transition: opacity 200ms ease-in;
}
.label-leave-active {
  transition: opacity 800ms ease-in-out;
}
.label-enter-from,
.label-leave-to {
  opacity: 0;
}
</style>
