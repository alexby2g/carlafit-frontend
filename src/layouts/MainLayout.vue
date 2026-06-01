<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="premium-header">
      <q-toolbar class="q-px-md">
        <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold">
          CarlaFit
        </q-toolbar-title>

        <q-btn flat round dense icon="notifications" class="q-mr-sm" @click="cargarNotificaciones">
          <q-badge v-if="noLeidas > 0" color="red" floating>
            {{ noLeidas }}
          </q-badge>

          <q-menu anchor="bottom right" self="top right" class="notification-menu">
            <q-card style="width: 340px; max-width: 90vw;">
              <q-card-section class="row items-center justify-between">
                <div class="text-subtitle1 text-weight-bold">Notificaciones</div>
                <q-btn flat dense round icon="refresh" @click="cargarNotificaciones" />
              </q-card-section>

              <q-separator />

              <q-card-section v-if="notificaciones.length === 0" class="text-center text-grey-7">
                No hay notificaciones
              </q-card-section>

              <q-list v-else separator>
                <q-item v-for="notificacion in notificaciones" :key="notificacion.id" class="notification-item">
                  <q-item-section avatar>
                    <q-icon
                      :name="iconoNotificacion(notificacion.tipo)"
                      :color="colorNotificacion(notificacion.tipo)"
                    />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold">
                      {{ notificacion.titulo }}
                    </q-item-label>

                    <q-item-label caption>
                      {{ notificacion.mensaje }}
                    </q-item-label>

                    <q-item-label caption class="text-grey-6">
                      {{ formatearFecha(notificacion.fecha || notificacion.created_at) }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-btn
                      v-if="!notificacion.leida"
                      flat
                      dense
                      round
                      icon="done"
                      color="green"
                      @click="marcarComoLeida(notificacion.id)"
                    >
                      <q-tooltip>Marcar como leída</q-tooltip>
                    </q-btn>

                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      color="red"
                      @click="eliminarNotificacion(notificacion.id)"
                    >
                      <q-tooltip>Eliminar</q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </q-menu>
        </q-btn>

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

        <q-item clickable v-ripple to="/centro-mensajes" class="menu-item menu-message">
          <q-item-section avatar>
            <q-icon name="forum" />
          </q-item-section>

          <q-item-section>Centro de Mensajes</q-item-section>

          <q-item-section side v-if="totalRecordatorios > 0">
            <q-badge color="red" rounded>
              {{ totalRecordatorios }}
            </q-badge>
          </q-item-section>
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

        <q-item clickable v-ripple to="/calendario" class="menu-item">
          <q-item-section avatar>
            <q-icon name="calendar_month" />
          </q-item-section>
          <q-item-section>Calendario</q-item-section>
        </q-item>
      </q-list>

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
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()

const leftDrawerOpen = ref(false)
const notificaciones = ref([])
const totalRecordatorios = ref(0)

const noLeidas = computed(() => {
  return notificaciones.value.filter(item => !item.leida).length
})

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

async function cargarNotificaciones () {
  try {
    const response = await api.get('/notificaciones')
    notificaciones.value = response.data.data || []
  } catch (error) {
    console.error(error)
  }
}

async function cargarCentroMensajes () {
  try {
    const response = await api.get('/centro-mensajes')
    totalRecordatorios.value = response.data.data?.resumen?.total || 0
  } catch (error) {
    console.error(error)
  }
}

async function marcarComoLeida (id) {
  try {
    await api.put(`/notificaciones/${id}/leer`)
    await cargarNotificaciones()
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo marcar como leída'
    })
  }
}

async function eliminarNotificacion (id) {
  try {
    await api.delete(`/notificaciones/${id}`)
    await cargarNotificaciones()

    $q.notify({
      type: 'positive',
      message: 'Notificación eliminada'
    })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo eliminar la notificación'
    })
  }
}

function iconoNotificacion (tipo) {
  if (tipo === 'pago' || tipo === 'pago_pendiente' || tipo === 'recordatorio_pago') return 'payments'
  if (tipo === 'inscripcion' || tipo === 'inscripcion_vencimiento' || tipo === 'recordatorio_inscripcion') return 'event_available'
  if (tipo === 'inscripcion_vencida' || tipo === 'recordatorio_vencida') return 'warning'
  if (tipo === 'pago_eliminado' || tipo === 'inscripcion_eliminada') return 'delete'
  return 'notifications'
}

function colorNotificacion (tipo) {
  if (tipo === 'pago') return 'green'
  if (tipo === 'pago_pendiente' || tipo === 'recordatorio_pago') return 'orange'
  if (tipo === 'inscripcion') return 'purple'
  if (tipo === 'inscripcion_vencimiento' || tipo === 'recordatorio_inscripcion') return 'orange'
  if (tipo === 'inscripcion_vencida' || tipo === 'recordatorio_vencida') return 'red'
  if (tipo === 'pago_eliminado' || tipo === 'inscripcion_eliminada') return 'red'
  return 'primary'
}

function formatearFecha (fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleString('es-BO')
}

onMounted(() => {
  cargarNotificaciones()
  cargarCentroMensajes()
})
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

.menu-message {
  background: #fff3fb;
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

.notification-menu {
  border-radius: 16px;
}

.notification-item {
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>