<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import { ref, useTemplateRef } from "vue";

const { copy, copied } = useClipboard({ legacy: true });

const transformText = (text: string) =>
  text
    .replace(/\n(\d)/g, "\t$1") // join names to next line
    .replace(
      /^(.*?)(?:\t[^\t]+){2}\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t]+).*$/gm,
      "$1\t$2\t$3\t$4\t$5",
    ) // remove extra columns
    .replace(
      new RegExp(Array.from(names.value.keys()).join("|"), "g"),
      (match) => names.value.get(match) || match,
    ); // remap names

const input = ref("");
const output = ref("");
const toast = useTemplateRef("toast");
const names = ref(new Map<string, string>());
const remapNamesOpen = ref(false);

const animation = [
  { opacity: 0, transform: "translate(-50%, 0px)" },
  { opacity: 1, transform: "translate(-50%, -20px)", offset: 0.025 },
  { opacity: 1, transform: "translate(-50%, -20px)", offset: 0.975 },
  { opacity: 0, transform: "translate(-50%, 0px)" },
];

const updateOutput = () => {
  output.value = transformText(input.value);
};

const handlePaste = async (event: ClipboardEvent) => {
  event.preventDefault();
  const clipboardData = event.clipboardData;
  if (!clipboardData) {
    return;
  }

  const text = clipboardData.getData("text/plain");
  input.value = text;
  console.log("Pasted text: ", text);
  updateOutput();

  const detectedNames = input.value
    .trim()
    .split("\n")
    .map((line) => line.split("\t")[0])
    .filter((name, index) => index % 2 == 0 && name.length > 0);

  // Check if names map is empty or if the detected names are different from the existing keys
  if (
    names.value.size === 0 ||
    detectedNames.some((name) => !names.value.has(name))
  ) {
    names.value.clear(); // Clear existing names map
    // Populate names map
    detectedNames.forEach((name) => {
      names.value.set(name, name);
    });
  }

  await copyOutput();
};

const handleRemapNames = () => {
  remapNamesOpen.value = !remapNamesOpen.value;
  if (!remapNamesOpen.value) {
    // If remapping is closed, re-copy the output
    copyOutput();
  }
};

async function copyOutput() {
  await copy(output.value);
  if (copied) {
    const newLocal = animation;
    toast.value?.animate(newLocal, {
      duration: 2000,
      easing: "ease-in-out",
      fill: "forwards",
    });
  } else {
    // Handle copy failure
    console.error("Failed to copy text to clipboard.");
  }
}
</script>

<template>
  <div class="full-container" @paste="handlePaste">
    <template v-if="input">
      <p class="strong">converted from:</p>
      <pre>{{ input }}</pre>
      <p class="strong">to:</p>
      <pre>{{ output }}</pre>
      <p class="toast" ref="toast">Copied to clipboard.</p>
      <button
        class="no-stretch mt-4"
        @click="handleRemapNames"
        :form="remapNamesOpen ? 'remapNameForm' : undefined"
        :type="remapNamesOpen ? 'button' : 'submit'"
      >
        {{ remapNamesOpen ? "Done" : "Remap Names" }}
      </button>
      <form
        id="remapNameForm"
        :class="'flex justify-center' + (!remapNamesOpen ? ' invis' : '')"
        @submit.prevent
      >
        <div
          class="grid grid-cols-[minmax(10px,_3fr)_minmax(1px,2em)_minmax(10px,_3fr)] gap-1"
        >
          <template v-for="[key, value] of names" :key="key">
            <label :for="key" class="left-label">{{ key }}</label>
            <v-icon name="hi-arrow-right" class="w-full" />
            <input
              type="text"
              class="border-b px-2 w-min"
              :id="key"
              :placeholder="value"
              @input="
                (e) => {
                  names.set(key, (e.target as HTMLInputElement).value);
                  updateOutput();
                }
              "
            />
          </template>
        </div>
      </form>
    </template>
    <template v-else>
      <p>Paste Payroller text to convert.</p>
    </template>
  </div>
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

.left-label {
  display: inline-flex;
  align-self: center;
  justify-self: right;
}
.invis {
  opacity: 0;
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
  gap: 10px;
}
</style>
