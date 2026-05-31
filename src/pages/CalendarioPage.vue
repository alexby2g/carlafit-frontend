<template>
  <q-page class="q-pa-md calendario-page">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h4 text-weight-bold text-purple-8">
          📅 Calendario de Clases
        </div>
        <div class="text-subtitle1 text-grey-7">
          Horarios y grupos activos de CarlaFit
        </div>
      </div>

      <q-btn
        color="purple"
        icon="refresh"
        label="Actualizar"
        @click="cargarGrupos"
      />
    </div>

    <div class="row q-col-gutter-md">
      <div
        v-for="grupo in grupos"
        :key="grupo.id"
        class="col-12 col-md-4"
      >
        <q-card class="grupo-card">
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <div class="text-h6 text-weight-bold text-purple-8">
                  {{ grupo.nombre }}
                </div>

                <div class="text-grey-7 q-mt-xs">
                  {{ grupo.hora_inicio }} - {{ grupo.hora_fin }}
                </div>
              </div>

              <q-avatar color="purple" text-color="white">
                <q-icon name="fitness_center" />
              </q-avatar>
            </div>

            <q-separator class="q-my-md" />

            <div class="row items-center justify-between">
              <div>
                <div class="text-caption text-grey-7">Inscritas</div>
                <div class="text-h5 text-weight-bold">
                  {{ grupo.inscripciones_count }}
                </div>
              </div>

              <div>
                <div class="text-caption text-grey-7">Cupo máximo</div>
                <div class="text-h5 text-weight-bold">
                  {{ grupo.cupo_maximo }}
                </div>
              </div>
            </div>

            <q-linear-progress
              class="q-mt-md"
              rounded
              size="12px"
              color="purple"
              :value="calcularProgreso(grupo)"
            />

            <div class="text-caption text-grey-7 q-mt-sm">
              Recordatorio sugerido:
              <strong>{{ calcularRecordatorio(grupo.hora_inicio) }}</strong>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card class="q-mt-md calendario-info">
      <q-card-section>
        <div class="text-h6 text-weight-bold">
          🔔 Recordatorios automáticos
        </div>

        <div class="text-grey-7 q-mt-sm">
          Cada clase podrá enviar una notificación 15 minutos antes.
        </div>

        <q-list class="q-mt-md" bordered separator>
          <q-item v-for="grupo in grupos" :key="grupo.id">
            <q-item-section avatar>
              <q-icon name="notifications_active" color="purple" />
            </q-item-section>

            <q-item-section>
              <q-item-label>
                {{ grupo.nombre }}
              </q-item-label>
              <q-item-label caption>
                Clase: {{ grupo.hora_inicio }} | Notificación:
                {{ calcularRecordatorio(grupo.hora_inicio) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-badge color="purple">
                Activo
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const grupos = ref([])

const cargarGrupos = async () => {
  const res = await axios.get('https://carlafit-backend.onrender.com/api/grupos')
  grupos.value = res.data.data
}

const calcularProgreso = (grupo) => {
  if (!grupo.cupo_maximo || grupo.cupo_maximo <= 0) return 0

  return grupo.inscripciones_count / grupo.cupo_maximo
}

const calcularRecordatorio = (hora) => {
  if (!hora) return ''

  const [h, m] = hora.split(':').map(Number)
  const fecha = new Date()
  fecha.setHours(h)
  fecha.setMinutes(m - 15)

  const horas = String(fecha.getHours()).padStart(2, '0')
  const minutos = String(fecha.getMinutes()).padStart(2, '0')

  return `${horas}:${minutos}`
}

onMounted(() => {
  cargarGrupos()
})
</script>

<style scoped>
.calendario-page {
  background: #f7f5fb;
  min-height: 100vh;
}

.grupo-card {
  border-radius: 22px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.calendario-info {
  border-radius: 22px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}
</style>