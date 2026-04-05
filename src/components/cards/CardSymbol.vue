<script setup>
defineProps({
  cardId: { type: String, required: true },
  size: { type: Number, default: 64 },
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class="card-symbol"
  >
    <!-- 0 Fool: stepping figure on cliff edge with feather -->
    <template v-if="cardId === 'fool'">
      <line x1="8" y1="52" x2="32" y2="52" stroke-width="1" />
      <line x1="32" y1="52" x2="32" y2="64" stroke-width="1" />
      <circle cx="28" cy="30" r="4" stroke-width="1" />
      <line x1="28" y1="34" x2="28" y2="46" stroke-width="1" />
      <line x1="28" y1="46" x2="24" y2="52" stroke-width="1" />
      <line x1="28" y1="46" x2="32" y2="52" stroke-width="1" />
      <path d="M44 12 Q48 8 46 16 Q44 20 48 18" stroke-width="0.8" />
    </template>

    <!-- 1 Magician: infinity symbol / lemniscate with wand -->
    <template v-else-if="cardId === 'magician'">
      <path d="M20 20 C20 14 28 14 32 20 C36 26 44 26 44 20 C44 14 36 14 32 20 C28 26 20 26 20 20" stroke-width="1" />
      <line x1="32" y1="28" x2="32" y2="54" stroke-width="1" />
      <circle cx="32" cy="54" r="2" stroke-width="0.8" />
      <circle cx="32" cy="28" r="1.5" stroke-width="0.8" fill="currentColor" />
    </template>

    <!-- 2 Priestess: crescent moon between two pillars -->
    <template v-else-if="cardId === 'priestess'">
      <line x1="16" y1="12" x2="16" y2="52" stroke-width="1" />
      <line x1="48" y1="12" x2="48" y2="52" stroke-width="1" />
      <path d="M36 22 A8 8 0 1 0 36 38 A5 5 0 1 1 36 22" stroke-width="1" />
      <line x1="16" y1="30" x2="48" y2="30" stroke-width="0.5" stroke-dasharray="2 3" />
    </template>

    <!-- 3 Empress: Venus symbol with crown -->
    <template v-else-if="cardId === 'empress'">
      <circle cx="32" cy="28" r="10" stroke-width="1" />
      <line x1="32" y1="38" x2="32" y2="54" stroke-width="1" />
      <line x1="26" y1="46" x2="38" y2="46" stroke-width="1" />
      <path d="M24 14 L28 10 L32 14 L36 10 L40 14" stroke-width="0.8" />
    </template>

    <!-- 4 Emperor: throne / mountain with ankh -->
    <template v-else-if="cardId === 'emperor'">
      <path d="M12 52 L32 16 L52 52" stroke-width="1" />
      <line x1="20" y1="38" x2="44" y2="38" stroke-width="0.8" />
      <circle cx="32" cy="26" r="4" stroke-width="0.8" />
      <line x1="32" y1="30" x2="32" y2="38" stroke-width="0.8" />
    </template>

    <!-- 5 Hierophant: triple cross with keys -->
    <template v-else-if="cardId === 'hierophant'">
      <line x1="32" y1="8" x2="32" y2="56" stroke-width="1" />
      <line x1="24" y1="16" x2="40" y2="16" stroke-width="0.8" />
      <line x1="22" y1="26" x2="42" y2="26" stroke-width="1" />
      <line x1="20" y1="36" x2="44" y2="36" stroke-width="1" />
      <circle cx="22" cy="50" r="3" stroke-width="0.8" />
      <circle cx="42" cy="50" r="3" stroke-width="0.8" />
    </template>

    <!-- 6 Lovers: two intertwined hearts -->
    <template v-else-if="cardId === 'lovers'">
      <path d="M22 28 C22 20 32 20 32 28 C32 36 22 42 22 42 C22 42 12 36 12 28 C12 20 22 20 22 28" stroke-width="0.8" />
      <path d="M42 28 C42 20 52 20 52 28 C52 36 42 42 42 42 C42 42 32 36 32 28 C32 20 42 20 42 28" stroke-width="0.8" />
      <path d="M28 16 L32 8 L36 16" stroke-width="0.8" />
    </template>

    <!-- 7 Chariot: upward arrow with star -->
    <template v-else-if="cardId === 'chariot'">
      <path d="M32 8 L24 22 L40 22 Z" stroke-width="1" />
      <line x1="32" y1="22" x2="32" y2="44" stroke-width="1" />
      <line x1="20" y1="44" x2="44" y2="44" stroke-width="1" />
      <circle cx="22" cy="50" r="4" stroke-width="0.8" />
      <circle cx="42" cy="50" r="4" stroke-width="0.8" />
    </template>

    <!-- 8 Strength: infinity over gentle arc -->
    <template v-else-if="cardId === 'strength'">
      <path d="M20 18 C20 12 28 12 32 18 C36 24 44 24 44 18 C44 12 36 12 32 18 C28 24 20 24 20 18" stroke-width="1" />
      <path d="M16 42 C20 32 28 30 32 34 C36 38 44 36 48 42" stroke-width="1" />
      <circle cx="32" cy="46" r="2" stroke-width="0.8" />
      <path d="M28 38 Q32 42 36 38" stroke-width="0.8" />
    </template>

    <!-- 9 Hermit: lantern with staff and star -->
    <template v-else-if="cardId === 'hermit'">
      <line x1="32" y1="18" x2="32" y2="56" stroke-width="1" />
      <polygon points="26,18 32,10 38,18" stroke-width="0.8" fill="none" />
      <circle cx="32" cy="15" r="1.5" stroke-width="0.8" />
      <line x1="26" y1="18" x2="38" y2="18" stroke-width="0.8" />
      <circle cx="46" cy="12" r="1" stroke-width="0.8" fill="currentColor" />
    </template>

    <!-- 10 Wheel: circle with spokes -->
    <template v-else-if="cardId === 'wheel'">
      <circle cx="32" cy="32" r="18" stroke-width="1" />
      <circle cx="32" cy="32" r="8" stroke-width="0.8" />
      <line x1="32" y1="14" x2="32" y2="50" stroke-width="0.8" />
      <line x1="14" y1="32" x2="50" y2="32" stroke-width="0.8" />
      <line x1="19.3" y1="19.3" x2="44.7" y2="44.7" stroke-width="0.5" />
      <line x1="44.7" y1="19.3" x2="19.3" y2="44.7" stroke-width="0.5" />
    </template>

    <!-- 11 Justice: scales -->
    <template v-else-if="cardId === 'justice'">
      <line x1="32" y1="10" x2="32" y2="54" stroke-width="1" />
      <line x1="14" y1="24" x2="50" y2="24" stroke-width="1" />
      <path d="M14 24 L10 36 L18 36 Z" stroke-width="0.8" />
      <path d="M50 24 L46 36 L54 36 Z" stroke-width="0.8" />
      <line x1="26" y1="54" x2="38" y2="54" stroke-width="1" />
    </template>

    <!-- 12 Hanged: inverted triangle with suspended circle -->
    <template v-else-if="cardId === 'hanged'">
      <line x1="20" y1="12" x2="44" y2="12" stroke-width="1" />
      <line x1="32" y1="12" x2="32" y2="24" stroke-width="1" />
      <circle cx="32" cy="30" r="6" stroke-width="1" />
      <line x1="32" y1="36" x2="32" y2="46" stroke-width="0.8" />
      <line x1="32" y1="46" x2="26" y2="40" stroke-width="0.8" />
      <line x1="32" y1="46" x2="38" y2="40" stroke-width="0.8" />
    </template>

    <!-- 13 Death: butterfly / transformation -->
    <template v-else-if="cardId === 'death'">
      <path d="M32 32 C24 24 14 28 16 20 C18 12 28 16 32 24" stroke-width="1" />
      <path d="M32 32 C40 24 50 28 48 20 C46 12 36 16 32 24" stroke-width="1" />
      <path d="M32 32 C26 40 18 42 20 48 C22 52 30 48 32 40" stroke-width="0.8" />
      <path d="M32 32 C38 40 46 42 44 48 C42 52 34 48 32 40" stroke-width="0.8" />
      <line x1="32" y1="22" x2="32" y2="50" stroke-width="0.5" />
    </template>

    <!-- 14 Temperance: two cups pouring with flow -->
    <template v-else-if="cardId === 'temperance'">
      <path d="M14 18 L14 28 L24 28 L24 18" stroke-width="1" />
      <path d="M40 34 L40 44 L50 44 L50 34" stroke-width="1" />
      <path d="M24 22 C30 22 34 30 40 38" stroke-width="0.8" stroke-dasharray="2 2" />
      <path d="M26 10 L19 10 L19 14 Q22.5 20 26 14 L26 10" stroke-width="0.8" />
      <path d="M52 26 L45 26 L45 30 Q48.5 36 52 30 L52 26" stroke-width="0.8" />
    </template>

    <!-- 15 Devil: inverted pentagram with chains -->
    <template v-else-if="cardId === 'devil'">
      <circle cx="32" cy="28" r="14" stroke-width="0.8" />
      <polygon points="32,38 24.7,18.6 42.5,30.4 21.5,30.4 39.3,18.6" stroke-width="0.8" fill="none" />
      <line x1="22" y1="42" x2="22" y2="54" stroke-width="0.8" stroke-dasharray="2 2" />
      <line x1="42" y1="42" x2="42" y2="54" stroke-width="0.8" stroke-dasharray="2 2" />
    </template>

    <!-- 16 Tower: tower with lightning -->
    <template v-else-if="cardId === 'tower'">
      <path d="M24 54 L24 20 L32 12 L40 20 L40 54" stroke-width="1" />
      <line x1="24" y1="34" x2="40" y2="34" stroke-width="0.8" />
      <path d="M46 8 L38 22 L44 22 L36 36" stroke-width="1.2" />
      <circle cx="30" cy="18" r="2" stroke-width="0.8" />
    </template>

    <!-- 17 Star: eight-pointed star with water -->
    <template v-else-if="cardId === 'star'">
      <polygon points="32,6 35,22 50,16 38,26 52,32 38,36 50,48 35,40 32,56 29,40 14,48 26,36 12,32 26,26 14,16 29,22" stroke-width="0.8" fill="none" />
      <circle cx="32" cy="32" r="4" stroke-width="0.8" />
    </template>

    <!-- 18 Moon: crescent with water path -->
    <template v-else-if="cardId === 'moon'">
      <path d="M36 12 A14 14 0 1 0 36 48 A10 10 0 1 1 36 12" stroke-width="1" />
      <path d="M16 56 Q24 48 32 56 Q40 48 48 56" stroke-width="0.8" />
      <circle cx="20" cy="46" r="1" stroke-width="0.8" fill="currentColor" />
      <circle cx="44" cy="46" r="1" stroke-width="0.8" fill="currentColor" />
    </template>

    <!-- 19 Sun: radiating sun -->
    <template v-else-if="cardId === 'sun'">
      <circle cx="32" cy="32" r="10" stroke-width="1" />
      <line x1="32" y1="8" x2="32" y2="16" stroke-width="0.8" />
      <line x1="32" y1="48" x2="32" y2="56" stroke-width="0.8" />
      <line x1="8" y1="32" x2="16" y2="32" stroke-width="0.8" />
      <line x1="48" y1="32" x2="56" y2="32" stroke-width="0.8" />
      <line x1="15" y1="15" x2="20.5" y2="20.5" stroke-width="0.8" />
      <line x1="43.5" y1="43.5" x2="49" y2="49" stroke-width="0.8" />
      <line x1="49" y1="15" x2="43.5" y2="20.5" stroke-width="0.8" />
      <line x1="20.5" y1="43.5" x2="15" y2="49" stroke-width="0.8" />
    </template>

    <!-- 20 Judgement: trumpet with rising figures -->
    <template v-else-if="cardId === 'judgement'">
      <path d="M26 12 L26 20 L20 26 L44 26 L38 20 L38 12" stroke-width="1" />
      <line x1="32" y1="26" x2="32" y2="32" stroke-width="0.8" />
      <circle cx="22" cy="40" r="3" stroke-width="0.8" />
      <line x1="22" y1="43" x2="22" y2="52" stroke-width="0.8" />
      <circle cx="32" cy="38" r="3" stroke-width="0.8" />
      <line x1="32" y1="41" x2="32" y2="50" stroke-width="0.8" />
      <circle cx="42" cy="40" r="3" stroke-width="0.8" />
      <line x1="42" y1="43" x2="42" y2="52" stroke-width="0.8" />
    </template>

    <!-- 21 World: wreath circle with dancing figure -->
    <template v-else-if="cardId === 'world'">
      <ellipse cx="32" cy="32" rx="22" ry="26" stroke-width="1" />
      <circle cx="32" cy="24" r="4" stroke-width="0.8" />
      <line x1="32" y1="28" x2="32" y2="42" stroke-width="0.8" />
      <line x1="32" y1="34" x2="24" y2="30" stroke-width="0.8" />
      <line x1="32" y1="34" x2="40" y2="30" stroke-width="0.8" />
      <line x1="32" y1="42" x2="26" y2="50" stroke-width="0.8" />
      <line x1="32" y1="42" x2="38" y2="50" stroke-width="0.8" />
    </template>

    <!-- Fallback: simple circle -->
    <template v-else>
      <circle cx="32" cy="32" r="16" stroke-width="1" />
    </template>
  </svg>
</template>

<style scoped>
.card-symbol {
  display: block;
  flex-shrink: 0;
}
</style>
