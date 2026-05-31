<template>
  <q-page class="dashboard-page q-pa-md">
    <div class="hero-card q-pa-lg q-mb-md">
      <div class="row items-center justify-between q-col-gutter-md">
        <div>
          <div class="text-h4 text-weight-bold text-white">
            📊 Dashboard CarlaFit
          </div>
          <div class="text-subtitle1 text-purple-1">
            Sistema de Gestión de Clases, Pagos, Asistencia y Bienestar
          </div>
        </div>

        <q-btn
          color="white"
          text-color="purple"
          icon="refresh"
          label="Actualizar"
          unelevated
          rounded
          :loading="loading"
          @click="cargarDashboard"
        />
      </div>
    </div>

    <q-banner
      v-if="error"
      class="bg-red-1 text-red-9 q-mb-md"
      rounded
    >
      {{ error }}
    </q-banner>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card purple-card">
          <div>
            <div class="stat-label">Zumberas Totales</div>
            <div class="stat-number">{{ dashboard.total_zumberas }}</div>
            <div class="stat-caption">Registradas en el sistema</div>
          </div>
          <q-icon name="groups" class="stat-icon" />
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card green-card">
          <div>
            <div class="stat-label">Zumberas Activas</div>
            <div class="stat-number">{{ dashboard.zumberas_activas }}</div>
            <div class="stat-caption">Activas actualmente</div>
          </div>
          <q-icon name="verified" class="stat-icon" />
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card blue-card">
          <div>
            <div class="stat-label">Inscripciones</div>
            <div class="stat-number">{{ dashboard.inscripciones_activas }}</div>
            <div class="stat-caption">Inscripciones vigentes</div>
          </div>
          <q-icon name="event_available" class="stat-icon" />
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card orange-card">
          <div>
            <div class="stat-label">Pagos Pendientes</div>
            <div class="stat-number">{{ dashboard.pagos_pendientes }}</div>
            <div class="stat-caption">Por cobrar</div>
          </div>
          <q-icon name="warning" class="stat-icon" />
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-sm">
      <div class="col-12 col-sm-4">
        <q-card class="attendance-card attendance-total">
          <div>
            <div class="attendance-label">Asistencias Hoy</div>
            <div class="attendance-number">{{ dashboard.asistencias_hoy }}</div>
            <div class="attendance-caption">Registros del día</div>
          </div>
          <q-icon name="fact_check" class="attendance-icon" />
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="attendance-card attendance-present">
          <div>
            <div class="attendance-label">Presentes Hoy</div>
            <div class="attendance-number">{{ dashboard.presentes_hoy }}</div>
            <div class="attendance-caption">Zumberas presentes</div>
          </div>
          <q-icon name="check_circle" class="attendance-icon" />
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="attendance-card attendance-absent">
          <div>
            <div class="attendance-label">Ausentes Hoy</div>
            <div class="attendance-number">{{ dashboard.ausentes_hoy }}</div>
            <div class="attendance-caption">Zumberas ausentes</div>
          </div>
          <q-icon name="cancel" class="attendance-icon" />
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-sm">
      <div class="col-12 col-md-4">
        <q-card class="income-card income-green">
          <div>
            <div class="income-label">Ingresos de Hoy</div>
            <div class="income-number">Bs {{ formatoMonto(dashboard.ingresos_hoy) }}</div>
            <div class="income-caption">Total recaudado hoy</div>
          </div>
          <q-icon name="paid" class="income-icon" />
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="income-card income-purple">
          <div>
            <div class="income-label">Ingresos del Mes</div>
            <div class="income-number">Bs {{ formatoMonto(dashboard.ingresos_mes) }}</div>
            <div class="income-caption">Total recaudado este mes</div>
          </div>
          <q-icon name="payments" class="income-icon" />
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="income-card income-blue">
          <div>
            <div class="income-label">Ingresos del Año</div>
            <div class="income-number">Bs {{ formatoMonto(dashboard.ingresos_anio) }}</div>
            <div class="income-caption">Total recaudado este año</div>
          </div>
          <q-icon name="account_balance_wallet" class="income-icon" />
        </q-card>
      </div>
    </div>

    <q-card class="group-card q-mt-md">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6 text-weight-bold">
          👥 Personas por grupo
        </div>

        <q-badge color="purple" outline>
          {{ dashboard.personas_por_grupo.length }} grupos
        </q-badge>
      </div>

      <q-list separator>
        <q-item
          v-for="grupo in dashboard.personas_por_grupo"
          :key="grupo.id"
          class="group-item"
        >
          <q-item-section avatar>
            <q-avatar color="purple" text-color="white">
              {{ inicialGrupo(grupo.nombre) }}
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold">
              {{ grupo.nombre }}
            </q-item-label>
            <q-item-label caption>
              {{ grupo.hora_inicio }} - {{ grupo.hora_fin }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-badge color="purple">
              {{ grupo.total_inscritas }} inscritas
            </q-badge>
          </q-item-section>
        </q-item>

        <q-item v-if="dashboard.personas_por_grupo.length === 0">
          <q-item-section class="text-grey-7">
            No hay grupos registrados todavía.
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <div class="text-center text-grey-6 q-mt-lg">
      💜 CarlaFit — Confía en el proceso, disfruta el cambio.
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_BASE_URL = 'https://carlafit-backend.onrender.com/api'

const loading = ref(false)
const error = ref('')

const dashboard = ref({
  total_zumberas: 0,
  zumberas_activas: 0,
  inscripciones_activas: 0,
  pagos_pendientes: 0,
  ingresos_hoy: 0,
  ingresos_mes: 0,
  ingresos_anio: 0,
  asistencias_hoy: 0,
  presentes_hoy: 0,
  ausentes_hoy: 0,
  personas_por_grupo: []
})

const cargarDashboard = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await axios.get(`${API_BASE_URL}/dashboard`)
    dashboard.value = res.data.data
  } catch (err) {
    console.error(err)
    error.value = 'No se pudo conectar con el backend online de CarlaFit.'
  } finally {
    loading.value = false
  }
}

const inicialGrupo = (nombre) => {
  return nombre ? nombre.charAt(0).toUpperCase() : 'G'
}

const formatoMonto = (valor) => {
  return Number(valor || 0).toFixed(2)
}

onMounted(() => {
  cargarDashboard()
})
</script>

<style scoped>
.dashboard-page {
  background: #f7f5fb;
  min-height: 100vh;
}

.hero-card {
  border-radius: 24px;
  background: linear-gradient(135deg, #6a1b9a, #9c27b0, #ba68c8);
  box-shadow: 0 12px 28px rgba(106, 27, 154, 0.25);
}

.stat-card,
.income-card,
.attendance-card {
  min-height: 145px;
  border-radius: 22px;
  padding: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.stat-card {
  border-bottom: 5px solid;
}

.stat-label,
.income-label,
.attendance-label {
  font-size: 14px;
  font-weight: 600;
}

.stat-number,
.attendance-number {
  font-size: 34px;
  font-weight: 800;
  margin-top: 6px;
}

.income-number {
  font-size: 28px;
  font-weight: 800;
  margin-top: 8px;
}

.stat-caption,
.income-caption,
.attendance-caption {
  font-size: 12px;
  color: #777;
  margin-top: 6px;
}

.stat-icon,
.income-icon,
.attendance-icon {
  font-size: 54px;
  opacity: 0.85;
}

.purple-card {
  background: #ffffff;
  border-color: #8e24aa;
  color: #7b1fa2;
}

.green-card {
  background: #ffffff;
  border-color: #2e7d32;
  color: #2e7d32;
}

.blue-card {
  background: #ffffff;
  border-color: #1565c0;
  color: #1565c0;
}

.orange-card {
  background: #ffffff;
  border-color: #fb8c00;
  color: #ef6c00;
}

.attendance-total {
  background: linear-gradient(135deg, #ede7f6, #ffffff);
  color: #5e35b1;
}

.attendance-present {
  background: linear-gradient(135deg, #e8f5e9, #ffffff);
  color: #2e7d32;
}

.attendance-absent {
  background: linear-gradient(135deg, #ffebee, #ffffff);
  color: #c62828;
}

.income-green {
  background: linear-gradient(135deg, #e8f5e9, #ffffff);
  color: #0b8f3a;
}

.income-purple {
  background: linear-gradient(135deg, #f3e5f5, #ffffff);
  color: #8e24aa;
}

.income-blue {
  background: linear-gradient(135deg, #e3f2fd, #ffffff);
  color: #1565c0;
}

.group-card {
  border-radius: 22px;
  padding: 22px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.group-item {
  border-radius: 14px;
  margin-bottom: 4px;
}
</style>