<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="$emit('closeModal')">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0  backdrop-blur-sm"
          :class="isDark ? 'bg-slate-900/80' : 'bg-black/20'"
        />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center "
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full rounded-2xl p-6 max-w-xl transform overflow-hidden text-left text-base font-semibold shadow-xl align-middle transition-all
              "
              :class="isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-900'"
            >
              <button
                type="button" class="absolute top-5 right-5 w-8 h-8 flex items-center justify-center"
                :class="isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-600'"
                @click="$emit('closeModal')"
              >
                <svg viewBox="0 0 10 10" class="w-2.5 h-2.5 overflow-visible" aria-hidden="true"><path d="M0 0L10 10M10 0L0 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
              </button>

              <DialogTitle
                class="text-2xl mb-6 pb-2 dark:text-white font-semibold
                border-b border-slate-900/10 dark:border-slate-50/[0.06] transition-colors"
              >
                An existing deck with the same name already exists.
              </DialogTitle>

              <div class="mt-4 grid grid-cols-2 gap-4">
                <div class="col-span-full">
                  <h3 class="text-lg mb-2 font-semibold">
                    Are you sure you want to overwrite it?
                  </h3>
                </div>
              </div>

              <div class="mt-8">
                <div class="flex gap-6 items-center justify-center">
                  <button
                    class="flex-1 px-4 py-2 text-xl col-span-full
                     rounded  transition-colors  font-semibold"
                    :class="isDark ? 'bg-sky-800 text-sky-100 hover:bg-sky-700'
                      : 'bg-sky-400  text-slate-800 hover:bg-sky-500'"
                    @click="$emit('confirmSaveDeck')"
                  >
                    Yes
                  </button>

                  <button
                    class="flex-1 px-4 py-2 text-xl col-span-full
                     rounded  transition-colors  font-semibold"
                    :class="isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-slate-200  text-slate-800 hover:bg-slate-300'"
                    @click="$emit('closeModal')"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user';

defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['closeModal', 'confirmSaveDeck']);

const userStore = useUserStore();
const { isDark } = storeToRefs(userStore);
</script>
