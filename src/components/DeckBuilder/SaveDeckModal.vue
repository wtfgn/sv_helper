<template>
  <div>
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
                  Save Deck
                </DialogTitle>

                <div class="mt-4 grid grid-cols-2 gap-4">
                  <div class="col-span-full">
                    <h3 class="text-lg mb-2 font-semibold after:content-['*'] after:font-bold after:text-red-500">
                      Deck Name
                    </h3>
                    <FilterPanelInput
                      ref="deckNameInput"
                      v-model="deckName"
                      placeholder="Your deck name"
                      class="w-full p-2 rounded text-base"
                      type="text"
                      :required="true"
                    />

                    <div
                      v-if="errorMessage"
                      class="text-red-500 text-sm mt-1"
                    >
                      {{ errorMessage }}
                    </div>
                  </div>
                </div>

                <div class="mt-8">
                  <button
                    class="w-full px-4 py-2 text-xl col-span-full
                     rounded  transition-colors  font-semibold"
                    :class="isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-slate-200  text-slate-800 hover:bg-slate-300'"
                    @click.prevent="saveNewDeck"
                  >
                    Save Deck
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <ConfirmSaveDeckModal
      v-model:isOpen="isConfirmSaveDeckModalOpen"
      @close-modal="isConfirmSaveDeckModalOpen = false"
      @confirm-save-deck="saveExistingDeck"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';
import { ref } from 'vue';
import type { PropType } from 'vue';

import { storeToRefs } from 'pinia';
import { useFocus, useStorage } from '@vueuse/core';
import FilterPanelInput from '../FilterPanel/FilterPanelInput.vue';
import ConfirmSaveDeckModal from '@/components/DeckBuilder/ConfirmSaveDeckModal.vue';
import { useUserStore } from '@/stores/user';
import type { DeckInStorage } from '@/types/deck';
import type { CardProperty } from '@/types/card';

export interface RequiredDeckDataForSave {
  deckHash: string
  format?: CardProperty
  clan: CardProperty | null
  count: number
}

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  requiredDeckData: {
    type: Object as PropType<RequiredDeckDataForSave>,
    required: true,
  },
});

const emit = defineEmits(['closeModal', 'saveDeckError', 'saveDeckSuccess']);

const userStore = useUserStore();
const { isDark } = storeToRefs(userStore);
const isConfirmSaveDeckModalOpen = ref(false);

const deckNameInput = ref<HTMLInputElement | null>(null);
const deckName = ref('');
const { focused: deckNameInputFocus } = useFocus(deckNameInput);

// Local storage for saved decks
const deckStorage = useStorage<DeckInStorage[]>('savedDecks', []);

const errorMessage = ref('');

// If the deck name is empty, the input will be focused and an error will be thrown
function validateDeckName() {
  if (!deckName.value) {
    deckNameInputFocus.value = true;
    errorMessage.value = 'Deck name is missing';
    throw new Error(errorMessage.value);
  }
}

function validateDeckUniqueness() {
  if (deckStorage.value.some(deck => deck.name === deckName.value)) {
    isConfirmSaveDeckModalOpen.value = true;
    errorMessage.value = 'Deck name already exists';
    throw new Error(errorMessage.value);
  }
}

function validateDeckData() {
  const { deckHash, format, clan, count } = props.requiredDeckData;
  errorMessage.value = '';

  if (!deckHash)
    errorMessage.value = 'Deck hash is missing';
  if (!format)
    errorMessage.value = 'Deck format is missing';
  if (!clan)
    errorMessage.value = 'Deck clan is missing';
  if (!count || count < 1)
    errorMessage.value = 'The deck must contain at least one card';
  if (errorMessage.value)
    throw new Error(errorMessage.value);
}

function addDeckToStorage() {
  deckStorage.value.push({
    name: deckName.value,
    deckHash: props.requiredDeckData.deckHash,
    format: props.requiredDeckData.format,
    clan: props.requiredDeckData.clan,
    count: props.requiredDeckData.count,
  });
}

function updateDeckInStorage() {
  const deckIndex = deckStorage.value.findIndex(deck => deck.name === deckName.value);
  if (deckIndex === -1)
    throw new Error('Deck not found');
  deckStorage.value[deckIndex] = {
    name: deckName.value,
    deckHash: props.requiredDeckData.deckHash,
    format: props.requiredDeckData.format!,
    clan: props.requiredDeckData.clan!,
    count: props.requiredDeckData.count,
  };
}

// New deck will be saved if the deck name is unique
function saveNewDeck() {
  try {
    validateDeckName();
    validateDeckData();
    validateDeckUniqueness();

    addDeckToStorage();

    emit('closeModal');
    emit('saveDeckSuccess', { title: 'Deck Saved', message: 'The deck has been successfully saved', type: 'success' });
  }
  catch (error) {
    emit('saveDeckError', error);
  }
}

// If the deck name is duplicated, the user will be prompted to confirm the save
function saveExistingDeck() {
  try {
    validateDeckName();
    validateDeckData();

    updateDeckInStorage();
    isConfirmSaveDeckModalOpen.value = false;

    emit('closeModal');
    emit('saveDeckSuccess', { title: 'Deck Overwritten', message: 'The deck has been successfully overwritten', type: 'success' });
  }
  catch (error) {
    emit('saveDeckError', error);
  }
}
</script>
