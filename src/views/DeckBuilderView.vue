<template>
  <div class="relative dark:bg-slate-900 p-6">
    <h1 class="text-3xl mb-4 dark:text-white font-semibold">
      Deck Builder
    </h1>

    <!-- Select Clan -->
    <div v-if="!selectedClan" class="flex flex-col gap-4 ">
      <h2 class="text-2xl font-semibold py-6 mx-4 border-b border-slate-900/10 dark:border-slate-50/[0.06] transition-colors text-center text-slate-800 dark:text-slate-300">
        Select a clan to start building a deck
      </h2>

      <div class="flex flex-row flex-wrap justify-evenly items-center py-6 gap-4 mx-6 mb-10 ">
        <template v-for="clan in clans" :key="clan.id">
          <div
            v-if="clan.id !== 0"
            class="group duration-300 ease-in-out w-fit hover:transform hover:scale-105 justify-self-center cursor-pointer flex flex-1 flex-col gap-2 items-center"
            @click="handleSelecteClan(clan)"
          >
            <img
              :src="`/clan_icons/${clan.id}.png`"
              :alt="clan.name"
              class="w-24 h-24 p-2 rounded-full group-hover:ring-2 group-hover:ring-slate-200 dark:group-hover:ring-slate-700 transition-all"
            >

            <p class="text-lg text-center text-slate-800 dark:text-slate-300">
              {{ clan.name }}
            </p>
          </div>
        </template>
      </div>
    </div>

    <div v-else class="flex flex-col space-y-4 truncate">
      <CardGallery
        :cards-container-ele="cardsContainerEle"
        :filtered-cards="filteredCards"
        :fetch-error="fetchError"
        class=""
        scroll-diection="right"
      >
        <template #heading>
          <h2
            class="flex text-2xl font-semibold py-6 mx-4 items-center
            border-b border-slate-900/10 dark:border-slate-50/[0.06] text-slate-800 dark:text-slate-300"
          >
            <span>Cards</span>

            <!-- Toggle Filter Panel -->
            <button
              v-if="selectedClan"
              class="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors ml-auto mr-2"
              @click="toggleFilterPanel"
            >
              <AdjustmentsHorizontalIcon class="h-10 w-10" />
            </button>
          </h2>
        </template>

        <template #default="{ cardsToDisplay }">
          <div
            ref="cardsContainerEle"
            class="flex gap-4
            overflow-x-scroll overflow-y-hidden mx-6 mb-10 py-4
            border-b border-slate-900/10 dark:border-slate-50/[0.06] transition-colors"
          >
            <div
              v-for="card in cardsToDisplay"
              :key="card.card_id"
              class="shrink-0 hover:shadow-lg transition-shadow duration-300 ease-in-out w-fit rounded-lg
              hover:transform hover:scale-105 justify-self-center cursor-pointer"
              @click="addCardToDeck(card)"
            >
              <CardImage :card="card" class="m-1" />
            </div>
          </div>
        </template>
      </CardGallery>

      <ContainerTemplate class="w-full">
        <template #heading>
          <h2
            class="text-2xl font-semibold py-6 mx-4
            border-b border-slate-900/10 dark:border-slate-50/[0.06]
            flex items-center gap-4 flex-wrap truncate
            text-slate-800 dark:text-slate-300"
          >
            <span>Deck</span>
            <span
              class="border-l pl-4 border-slate-900/10 dark:border-slate-50/[0.06] "
              :class="{ 'text-red-500 dark:text-red-400': totalCardCountInDeck > 40 }"
            >
              {{ totalCardCountInDeck }} / 40
            </span>

            <!-- Buttons -->
            <div class="inline-flex flex-row flex-wrap gap-4 ">
              <button
                :disabled="!isValidDeck || isPublishingDeckCode"
                class="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300
                px-4 py-2 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed text-xl flex-1 "
                @click="publishDeckCode"
              >
                <div>
                  <p class="hidden md:flex items-center justify-center relative gap-4">
                    <span>
                      Publish Code
                    </span>
                    <span v-if="isPublishingDeckCode">
                      <Spinner class="w-7 h-7" />
                    </span>
                  </p>
                  <p class="md:hidden flex items-center justify-center relative gap-4">
                    <PublishIcon v-if="!isPublishingDeckCode" class="w-8 h-8" />
                    <Spinner v-else class="w-7 h-7" />
                  </p>
                </div>
              </button>

              <button
                :disabled="!isValidDeck"
                class="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300
                px-4 py-2 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed text-xl flex-1"
                @click="openDeckUrl"
              >
                <div class="flex items-center justify-center">
                  <span class="hidden md:inline-block">Open Portal</span>
                  <ExternalLinkIcon class="w-8 h-8 md:hidden" />
                </div>
              </button>

              <button
                class="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300
                px-4 py-2 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors
                text-xl flex-1"
                @click="builtDeck = []"
              >
                <div class="flex items-center justify-center">
                  <span class="hidden md:inline-block">Clear Deck</span>
                  <TrashBinIcon class="w-8 h-8 md:hidden" />
                </div>
              </button>

              <button
                class="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300
                px-4 py-2 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors
                text-xl flex-1"
                @click="isLoadDeckModalOpen = true"
              >
                <div class="flex items-center justify-center">
                  <span class="hidden md:inline-block">Load Deck</span>
                  <ArrowDownOnSquareStackIcon class="w-8 h-8 md:hidden" />
                </div>
              </button>

              <button
                class="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300
                px-4 py-2 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors
                text-xl flex-1"
                @click="isSaveDeckModalOpen = true"
              >
                <div class="flex items-center justify-center">
                  <span class="hidden md:inline-block">Save Deck</span>
                  <SaveIcon class="w-8 h-8 md:hidden" />
                </div>
              </button>
            </div>

            <!-- Display Code -->
            <div class="ml-auto">
              <div
                v-if="deckCode"
                class="flex items-center text-lg text-slate-800 dark:text-slate-300 bg-slate-200 dark:bg-slate-700
                transition-colors border-solid border-2 border-slate-900/10 dark:border-slate-50/[0.06] rounded-lg"
              >
                <div class="flex flex-row items-center gap-2 pl-4 px-2 border-r border-slate-900/10 dark:border-slate-50/[0.06] ">
                  <p class="text-lg ">
                    Deck Code:
                  </p>
                  <p class="text-xl font-semibold tracking-widest ">
                    {{ deckCode }}
                  </p>
                </div>
                <button
                  :disabled="!isSupported || copied"
                  class="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300
                hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed text-xl flex-1 p-2"
                  @click="copy(deckCode)"
                >
                  <div
                    class="flex items-center justify-center"
                  >
                    <DocumentDuplicateIcon class="w-8 h-8" />
                  </div>
                </button>
              </div>

              <div
                v-else-if="publishDeckCodeError"
                class="text-lg text-center w-full text-red-500 dark:text-red-400"
              >
                <p>Fail to publish deck code</p>
              </div>
            </div>
          </h2>
        </template>

        <div
          class="flex gap-4
            overflow-x-scroll overflow-y-hidden mx-6 mb-10 py-4
            border-b border-slate-900/10 dark:border-slate-50/[0.06]"
        >
          <!-- Loading Deck -->
          <div v-if="isFetchingDeck" class="flex items-center justify-center w-full h-40 text-sky-600 dark:text-sky-400">
            <Spinner class="w-12 h-12" />
          </div>
          <p
            v-else-if="loadDeckError"
            class="text-lg text-center w-full text-red-500 dark:text-red-400"
          >
            {{ loadDeckError.message }}
          </p>
          <p
            v-else-if="!builtDeck.length"
            class="text-lg text-center w-full text-black/45 dark:text-slate-300/45"
          >
            No cards in the deck
          </p>

          <div
            v-for="card in builtDeck"
            v-else
            :key="card.card_id"
            class="relative"
            @click="removeFromDeck(card)"
          >
            <!-- Red layer -->
            <div v-if="!isValidCard(card)" class="absolute z-10 inset-0 bg-red-500 bg-opacity-50 rounded-lg" />

            <CardImage
              :card="card" class="m-1 p-2 relative shrink-0 w-fit rounded-lg  justify-self-center cursor-pointer
               hover:shadow-lg transition-shadow duration-300 ease-in-out
              hover:transform hover:scale-105
              "
            />
            <p class="text-center dark:text-white">
              × {{ card.count }}
            </p>
          </div>
        </div>
      </ContainerTemplate>
    </div>

    <FilterPanelModal
      v-model:isOpen="isFilterPanelModalOpen"
      v-model:selectedProperties="filter"
      :disabled-properties="disabledProperties"
      @close-modal="isFilterPanelModalOpen = false"
    />

    <LoadDeckModal
      v-model:isOpen="isLoadDeckModalOpen"
      @close-modal="isLoadDeckModalOpen = false"
      @load-deck="handleLoadDeck"
    />

    <SaveDeckModal
      v-model:isOpen="isSaveDeckModalOpen"
      :required-deck-data="{
        deckHash,
        format: filter.format,
        clan: selectedClan,
        count: totalCardCountInDeck,
      }"
      @close-modal="isSaveDeckModalOpen = false"
      @save-deck-success="showNotification"
    />

    <NotificationModal
      v-model:isOpen="isNotificationModalOpen"
      :notifaction-data="notificationData"
      @close-modal="isNotificationModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useClipboard, watchDebounced } from '@vueuse/core';

import { AdjustmentsHorizontalIcon, ArrowDownOnSquareStackIcon, DocumentDuplicateIcon } from '@heroicons/vue/24/solid';
import ExternalLinkIcon from '@/components/Icons/ExternalLinkIcon.vue';
import TrashBinIcon from '@/components/Icons/TrashBinIcon.vue';
import PublishIcon from '@/components/Icons/PublishIcon.vue';
import SaveIcon from '@/components/Icons/SaveIcon.vue';
import Spinner from '@/components/Icons/Spinner.vue';

import FilterPanelModal from '@/components/FilterPanel/FilterPanelModal.vue';
import SaveDeckModal from '@/components/DeckBuilder/SaveDeckModal.vue';
import LoadDeckModal from '@/components/DeckBuilder/LoadDeckModal.vue';
import NotificationModal from '@/components/NotificationModal.vue';

import { useUserStore } from '@/stores/user';
import { useFetchCards } from '@/composables/useFetchCards';
import { useCardProperties } from '@/composables/useCardProperties';
import { useCheckCardProperties } from '@/composables/useCheckCardProperties';
import { useGenerateDeckHash } from '@/composables/useGenerateDeckHash';
import { usePublishDeckCode } from '@/composables/usePublishDeckCode';

import ContainerTemplate from '@/components/Template/ContainerTemplate.vue';
import CardGallery from '@/components/CardGallery/CardGallery.vue';
import CardImage from '@/components/CardGallery/CardImage.vue';

import type { DeckInfo } from '@/components/DeckBuilder/LoadDeckModal.vue';
import type { Card, CardFilterProperty, CardInDeck, CardProperty } from '@/types/card';
import type { NotificationData } from '@/components/NotificationModal.vue';

import { clansData } from '@/config/card_properties';
import { portalUrl } from '@/config/api';

const selectedClan = ref<CardProperty | null>(null);

const filter = ref<CardFilterProperty>({
  cardName: '',
  clans: [],
  charTypes: [],
  tribeNames: [],
  cardSets: [],
  costs: [],
  atks: [],
  lifes: [],
  rarities: [],
  format: {} as CardProperty,
  restrictedCounts: [],
  resurgentProperty: {} as CardProperty,
});

const userStore = useUserStore();
const { language } = storeToRefs(userStore);
const { isToken } = useCheckCardProperties();
const { copy, copied, isSupported } = useClipboard({ legacy: true });
const clans = clansData[language.value];

const filteredCards = ref<Card[] | null>(null);
const fetchError = ref<Error | null>(null);

const isFilterPanelModalOpen = ref(false);
const isLoadDeckModalOpen = ref(false);
const isSaveDeckModalOpen = ref(false);
const isNotificationModalOpen = ref(false);

const cardsContainerEle = ref<HTMLElement | null>(null);
const builtDeck = ref<CardInDeck[]>([]);
const { deckHash } = useGenerateDeckHash(builtDeck, selectedClan);
const { deckCode, publishDeckCode, isPublishingDeckCode, publishDeckCodeError } = usePublishDeckCode(deckHash);
const loadDeckError = ref<Error | null>(null);
const isFetchingDeck = ref(false);

const notificationData = ref<NotificationData>({
  title: '',
  message: '',
  type: 'default',
});

const disabledProperties = computed(() => {
  const disabledProperties: CardFilterProperty = {};
  // Disable other clans when a clan is selected, except for neutral
  if (selectedClan.value)
    disabledProperties.clans = clans.filter(clan => clan.id !== selectedClan.value?.id && clan.id !== 0);
  return disabledProperties;
});
const totalCardCountInDeck = computed(() => builtDeck.value.reduce((acc, c) => acc + c.count, 0));

function isValidCard(card: CardInDeck) {
  let formatTypeCondition = false;
  let clanCondition = false;
  const selectedFormatId = filter.value.format?.id;

  if (selectedFormatId === 0) // unlimited
    formatTypeCondition = true;
  else if (selectedFormatId === 1) // rotation
    formatTypeCondition = card.format_type === selectedFormatId;

  // If a clan is selected, check if the card is in the selected clan or neutral
  if (selectedClan.value)
    clanCondition = card.clan === selectedClan.value.id || card.clan === 0;

  return formatTypeCondition && clanCondition;
}

const isValidDeck = computed(() => {
  return totalCardCountInDeck.value === 40 && builtDeck.value.every(isValidCard);
});

function toggleFilterPanel() {
  isFilterPanelModalOpen.value = !isFilterPanelModalOpen.value;
}

function addCardToDeck(pickedCard: Card) {
  const cardInDeck = builtDeck.value.find(c => c.card_id === pickedCard.card_id);
  // Sum all count if they have the same base_card_id
  const totalCardCountByCard = builtDeck.value.filter(c => c.base_card_id === pickedCard.base_card_id).reduce((acc, c) => acc + c.count, 0);

  if (cardInDeck) {
    if (totalCardCountByCard < cardInDeck.restricted_count)
      cardInDeck.count += 1;
  }
  else {
    if (totalCardCountByCard < pickedCard.restricted_count)
      builtDeck.value.push({ ...pickedCard, count: 1 });
  }
}

function removeFromDeck(card: Card) {
  const cardInDeck = builtDeck.value.find(c => c.card_id === card.card_id);
  if (cardInDeck) {
    if (cardInDeck.count > 1)
      cardInDeck.count -= 1;
    else
      builtDeck.value = builtDeck.value.filter(c => c.card_id !== card.card_id);
  }
}

function handleSelecteClan(clan: CardProperty) {
  selectedClan.value = clan;
  filter.value.clans = [clan];
  filter.value.format = useCardProperties(language.value).formats[1]; // default to rotation
}

const deckUrl = computed(() => `${portalUrl}/deck/${deckHash.value}`);

function openDeckUrl() {
  window.open(deckUrl.value, '_blank');
}

function handleLoadDeck(deckInfo: DeckInfo) {
  isFetchingDeck.value = deckInfo.isLoadingDeck;
  builtDeck.value = deckInfo.deckHashData?.deck ?? [];
  const { parseDeckCodeError, parseDeckHashError } = deckInfo.error;
  loadDeckError.value = parseDeckCodeError ?? parseDeckHashError ?? null;
  const clan = clans.find(clan => clan.id === deckInfo.deckHashData?.clanId);
  if (!clan)
    return;

  // If the selected clan is different from the loaded deck's clan, change the selected clan
  if (selectedClan.value?.id !== clan.id)
    handleSelecteClan(clan);
}

function showNotification({ title, message, type }: NotificationData) {
  notificationData.value = { title, message, type };
  isNotificationModalOpen.value = true;
}

watch(() => totalCardCountInDeck.value, () => {
  builtDeck.value.sort((a, b) => a.cost - b.cost);
  loadDeckError.value = null;
  deckCode.value = null;
});

watchDebounced([filter, language], async () => {
  // If no clan is selected, do nothing
  if (!selectedClan.value)
    return;
  // Reset the state
  filteredCards.value = null;
  fetchError.value = null;
  // Fetch cards
  // If no clans are selected, automatically select the selected clan & neutral
  if (!filter.value.clans?.length)
    filter.value.clans = [selectedClan.value, clans[0]];
  const { cards, error } = await useFetchCards(filter);
  // Filter out tokens
  filteredCards.value = cards.value?.filter(card => !isToken(card)) ?? null;
  fetchError.value = error.value;
}, {
  debounce: 500,
  immediate: true,
  deep: true,
  maxWait: 2000,
});
</script>
