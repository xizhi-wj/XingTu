<template>
  <button :disabled="props.disabled" :class="'btn ' + props.type">
    <slot></slot>
    <span class="ml5">{{ props.text }}</span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'primary'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.btn {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
