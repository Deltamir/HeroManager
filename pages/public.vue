<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="8" class="text-center">
        <h1 class="text-h4 font-weight-bold mb-4">Welcome to HeroManager</h1>
        <p class="text-body-1 text-medium-emphasis mb-6">
          Track your hero card collection, log every battle, and master every
          scenario.
        </p>
        <v-btn color="primary" size="large" rounded="lg" to="/login">
          Sign In to Get Started
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({ auth: false });
</script>
