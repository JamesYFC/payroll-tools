<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import { onUnmounted, reactive, ref, useTemplateRef } from "vue";
import PayrollerFormatHelp from "./PayrollerFormatHelp.vue";
import { panUpDownAnim, timerTransitionAnim } from "../animations";

const { copy, copied } = useClipboard({ legacy: true });

const input = ref("");
const output = ref("");
const toast = useTemplateRef("toast");
const copyButton = useTemplateRef("copyButton");
const data = reactive({
  names: new Map<string, string>(),
  rows: [] as string[][],
  columns: [] as string[][],
  columnActive: [true, false, false, true, true, true, true, false],
});
const initialTimeMs = 1000;
const timeLeft = ref(initialTimeMs);
const timer = ref<ReturnType<typeof setInterval> | null>(null);
const showHelp = ref(false);

function startCopyTimer() {
  if (timer.value) return; // already running

  copyButton.value?.animate(timerTransitionAnim, {
    duration: initialTimeMs,
    easing: "ease-in-out",
    fill: "none",
  });

  timer.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value -= 100;
    } else {
      clearCopyTimer();
      setAndCopyOutput();
    }
  }, 100);
}

function clearCopyTimer() {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
}

const tempNames: string[] = [];

const handlePaste = async (event: ClipboardEvent) => {
  event.preventDefault();
  const clipboardData = event.clipboardData;
  if (!clipboardData) {
    return;
  }

  const text = clipboardData.getData("text/plain");
  input.value = text;
  console.log("Pasted text: ", text);

  data.columns.length = data.rows.length = tempNames.length = 0; // Clear existing data
  text
    .replace(/\n(\d)/g, "\t$1") // join names to next line
    .split("\n")
    .map((e) => e.trim())
    // fill name & column data
    .forEach((row, rowI) => {
      const cells = row.split("\t").filter((x) => x != "\t");
      tempNames.push(cells[0]);

      data.rows[rowI] = [...cells];
      cells.forEach((item, i) => {
        if (!data.columns[i]) data.columns[i] = [];
        data.columns[i][rowI] = item;
      });
    });

  if (!tempNames.every((name) => data.names.has(name))) {
    data.names.clear(); // Clear existing names map
    tempNames.forEach((name) => {
      data.names.set(name, name);
    });
  }

  await setAndCopyOutput();
};

async function setAndCopyOutput() {
  // clear copy timer, if any
  clearCopyTimer();

  // set output based on remapped names and column active states
  output.value = data.rows
    .map((row) =>
      row
        .filter((item, i) => {
          if (i === 0) {
            return true; // always include the first column (name)
          }
          // check if the column is active
          if (data.columnActive[i]) {
            return item;
          }
          return false;
        })
        .map((item, i) => {
          if (i === 0) {
            return data.names.get(item) || item; // remap name
          }
          return item;
        })
        .join("\t"),
    )
    .join("\n");

  // copy to clipboard
  await copy(output.value);
  if (copied) {
    toast.value?.animate(panUpDownAnim, {
      duration: 2000,
      easing: "ease-in-out",
      fill: "forwards",
    });
  } else {
    // handle copy failure
    console.error("Failed to copy text to clipboard.");
  }
}

function onNameChange(name: string, value: string) {
  if (data.names.has(name)) {
    data.names.set(name, value);
  } else {
    console.error(`Name ${name} not found in names map.`);
    return;
  }

  restartCopyTimer();
}

function restartCopyTimer() {
  clearCopyTimer();
  timeLeft.value = initialTimeMs;
  startCopyTimer();
}

onUnmounted(() => {
  clearCopyTimer();
});
</script>

<template>
  <div class="full-container" @paste="handlePaste">
    <template v-if="input">
      <div
        class="flex justify-center bg-linear-[transparent_calc(50%-1px),var(--color-neutral-200)_50%,transparent_calc(50%+1px)]"
      >
        <h2 class="bg-neutral-800 px-4">original</h2>
      </div>
      <pre>{{ input }}</pre>
      <div
        class="my-3 flex justify-center bg-linear-[transparent_calc(50%-1px),var(--color-neutral-200)_50%,transparent_calc(50%+1px)]"
      >
        <v-icon
          name="fa-arrow-down"
          scale="1"
          fill="var(--color-neutral-300)"
          class="w-10 bg-neutral-800 border-x-2 border-neutral-800"
        />
      </div>
      <form class="flex gap-x-[1em] mb-2" @submit.prevent="setAndCopyOutput">
        <div class="flex flex-col">
          <input
            v-for="[name] of data.names"
            :key="name"
            type="text"
            :placeholder="name"
            class="field-sizing-content"
            style="min-width: 10px"
            @input="
              onNameChange(name, ($event?.target as HTMLInputElement).value)
            "
          />
        </div>
        <div
          v-for="(col, colI) of data.columns.slice(1)"
          :key="colI"
          class="flex flex-col activeable px-1"
          @click="
            () => {
              data.columnActive[colI + 1] = !data.columnActive[colI + 1];
              restartCopyTimer();
            }
          "
        >
          <template v-for="(item, itemI) of col" :key="itemI">
            <p
              class="text-left"
              :class="{
                'output-grid-inactive': !data.columnActive[colI + 1],
              }"
              @mousedown.prevent
            >
              {{ item }}
            </p>
          </template>
        </div>
      </form>
      <button
        ref="copyButton"
        class="no-stretch copy-button"
        @click="setAndCopyOutput"
      >
        Copy
      </button>
      <p class="toast" ref="toast">Copied to clipboard.</p>
    </template>
    <template v-else>
      <p>Paste Payroller text to convert.</p>
    </template>
  </div>
  <v-icon
    name="bi-question-circle"
    scale="1.5"
    class="help-button"
    @click="showHelp = true"
    @mousedown.prevent
  />
  <PayrollerFormatHelp :show="showHelp" @close="showHelp = false" />
</template>

<style scoped>
pre {
  text-align: left;
}
svg {
  display: inline-flex;
  align-self: center;
}
form {
  transition: opacity 0.2s ease-in-out;
}

.copy-button {
  background: var(--color-neutral-900);
  border: 0;
  &:hover {
    background: var(--color-neutral-700);
    border: 0;
  }
  &:active {
    background: var(--color-neutral-900);
  }
}

.activeable {
  cursor: pointer;
}
.activeable:hover,
input:hover,
input:focus {
  background-color: var(--color-neutral-600);
}
input:focus {
  outline: 0;
  text-shadow: none;
}

.help-button {
  cursor: pointer;
  position: absolute;
  right: 0;
  top: 0;
  margin: 1em;
  &:hover {
    color: var(--color-neutral-700);
  }
  &:active {
    color: var(--color-neutral-900);
  }
}

.output-grid-inactive {
  opacity: 0.5;
}
.no-stretch {
  align-self: center;
}
.toast {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 20px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  z-index: 1000;
  opacity: 0;
}
.strong {
  font-weight: bold;
}
.full-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  align-items: stretch;
  row-gap: 16px;
}
</style>
