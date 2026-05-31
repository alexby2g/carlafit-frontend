<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="premium-header">
      <q-toolbar class="q-px-md">
        <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold">
          CarlaFit
        </q-toolbar-title>

        <q-chip color="white" text-color="purple" icon="phone_android">
          Web + Android
        </q-chip>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="premium-drawer"
      :width="260"
    >
      <div class="q-pa-md text-center">
        <div class="brand-logo">CarlaFit</div>
        <div class="brand-subtitle">Bienestar que transforma</div>
      </div>

      <q-separator />

      <q-list class="q-pa-sm">
        <q-item-label header class="text-grey-7">
          MENÚ PRINCIPAL
        </q-item-label>

        <q-item clickable v-ripple to="/" exact class="menu-item">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/zumberas" class="menu-item">
          <q-item-section avatar>
            <q-icon name="groups" />
          </q-item-section>
          <q-item-section>Zumberas</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/inscripciones" class="menu-item">
          <q-item-section avatar>
            <q-icon name="event_available" />
          </q-item-section>
          <q-item-section>Inscripciones</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/asistencias" class="menu-item">
          <q-item-section avatar>
            <q-icon name="check_circle" />
          </q-item-section>
          <q-item-section>Asistencias</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/pagos" class="menu-item">
          <q-item-section avatar>
            <q-icon name="payments" />
          </q-item-section>
          <q-item-section>Pagos</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/servicios" class="menu-item">
          <q-item-section avatar>
            <q-icon name="fitness_center" />
          </q-item-section>
          <q-item-section>Servicios</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/grupos" class="menu-item">
          <q-item-section avatar>
            <q-icon name="schedule" />
          </q-item-section>
          <q-item-section>Grupos</q-item-section>
        </q-item>
      </q-list>


      <q-item clickable v-ripple to="/calendario" class="menu-item">
        <q-item-section avatar>
          <q-icon name="calendar_month" />
        </q-item-section>
        <q-item-section>Calendario</q-item-section>
      </q-item>

      <div class="drawer-card">
        <q-icon name="favorite" color="purple" size="34px" />
        <div class="text-weight-bold q-mt-sm">CarlaFit</div>
        <div class="text-caption text-grey-7">
          Más que ejercicio,<br>
          un estilo de vida 💜
        </div>
      </div>
    </q-drawer>

    <q-page-container class="app-bg">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(false)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped>
.premium-header {
  background: linear-gradient(90deg, #4a148c, #8e24aa, #ab47bc);
}

.premium-drawer {
  background: #ffffff;
}

.brand-logo {
  font-size: 32px;
  font-weight: 800;
  color: #7b1fa2;
  font-style: italic;
}

.brand-subtitle {
  color: #8e24aa;
  font-size: 13px;
  margin-top: -4px;
}

.menu-item {
  border-radius: 14px;
  margin-bottom: 6px;
  color: #2f2540;
  font-weight: 500;
}

.menu-item:hover {
  background: #f3e5f5;
  color: #7b1fa2;
}

.q-router-link--active {
  background: linear-gradient(90deg, #8e24aa, #ba68c8);
  color: white !important;
  box-shadow: 0 6px 14px rgba(142, 36, 170, 0.25);
}

.drawer-card {
  margin: 18px;
  padding: 18px;
  border-radius: 20px;
  text-align: center;
  background: linear-gradient(180deg, #f3e5f5, #ffffff);
  box-shadow: 0 8px 20px rgba(142, 36, 170, 0.12);
}

.app-bg {
  background: #f7f5fb;
}
</style>