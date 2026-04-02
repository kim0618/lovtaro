<script setup>
import ErrorBoundary from './components/common/ErrorBoundary.vue'
</script>

<template>
  <ErrorBoundary>
    <RouterView />
  </ErrorBoundary>
</template>
