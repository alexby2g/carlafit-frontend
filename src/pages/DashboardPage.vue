<template>
  <q-page class="dashboard-page q-pa-md">
    <div class="hero-card q-pa-lg q-mb-md">
      <div class="hero-content">
        <div>
          <div class="hero-badge">Panel principal</div>
          <div class="text-h4 text-weight-bold text-white title-responsive">
            📊 Dashboard CarlaFit
          </div>
          <div class="text-subtitle1 text-purple-1">
            Control de zumberas, pagos, asistencia y recordatorios
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
          @click="cargarTodo"
        />
      </div>
    </div>

    <q-banner v-if="error" class="bg-red-1 text-red-9 q-mb-md" rounded>
      {{ error }}
    </q-banner>

    <div class="quick-grid q-mb-md">
      <q-btn class="quick-btn" icon="groups" label="Zumberas" to="/zumberas" />
      <q-btn class="quick-btn" icon="payments" label="Pagos" to="/pagos" />
      <q-btn class="quick-btn" icon="event_available" label="Inscripciones" to="/inscripciones" />
      <q-btn class="quick-btn message" icon="forum" label="Centro de Mensajes" to="/centro-mensajes">
        <q-badge v-if="centro.resumen.total > 0" color="red" floating>
          {{ centro.resumen.total }}
        </q-badge>
      </q-btn>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="premium-card purple-card">
          <div>
            <div class="card-label">Zumberas</div>
            <div class="card-number">{{ dashboard.total_zumberas }}</div>
            <div class="card-caption">Registradas</div>
          </div>
          <q-icon name="groups" class="card-icon" />
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="premium-card green-card">
          <div>
            <div class="card-label">Activas</div>
            <div class="card-number">{{ dashboard.zumberas_activas }}</div>
            <div class="card-caption">Actualmente</div>
          </div>
          <q-icon name="verified" class="card-icon" />
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="premium-card blue-card">
          <div>
            <div class="card-label">Inscripciones</div>
            <div class="card-number">{{ dashboard.inscripciones_activas }}</div>
            <div class="card-caption">Vigentes</div>
          </div>
          <q-icon name="event_available" class="card-icon" />
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="premium-card orange-card">
          <div>
            <div class="card-label">Pagos pendientes</div>
            <div class="card-number">{{ dashboard.pagos_pendientes }}</div>
            <div class="card-caption">Por cobrar</div>
          </div>
          <q-icon name="warning" class="card-icon" />
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-sm">
      <div class="col-12 col-md-4">
        <q-card class="money-card money-green">
          <div>
            <div class="money-label">Ingresos de Hoy</div>
            <div class="money-number">Bs {{ formatoMonto(dashboard.ingresos_hoy) }}</div>
            <div class="money-caption">Recaudado hoy</div>
          </div>
          <q-icon name="paid" class="money-icon" />
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="money-card money-purple">
          <div>
            <div class="money-label">Ingresos del Mes</div>
            <div class="money-number">Bs {{ formatoMonto(dashboard.ingresos_mes) }}</div>
            <div class="money-caption">Recaudado este mes</div>
          </div>
          <q-icon name="payments" class="money-icon" />
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="money-card money-blue">
          <div>
            <div class="money-label">Ingresos del Año</div>
            <div class="money-number">Bs {{ formatoMonto(dashboard.ingresos_anio) }}</div>
            <div class="money-caption">Recaudado este año</div>
          </div>
          <q-icon name="account_balance_wallet" class="money-icon" />
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-sm">
      <div class="col-12 col-md-4">
        <q-card class="attendance-box total">
          <q-icon name="fact_check" />
          <div>
            <div class="attendance-title">Asistencias Hoy</div>
            <div class="attendance-number">{{ dashboard.asistencias_hoy }}</div>
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="attendance-box present">
          <q-icon name="check_circle" />
          <div>
            <div class="attendance-title">Presentes</div>
            <div class="attendance-number">{{ dashboard.presentes_hoy }}</div>
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="attendance-box absent">
          <q-icon name="cancel" />
          <div>
            <div class="attendance-title">Ausentes</div>
            <div class="attendance-number">{{ dashboard.ausentes_hoy }}</div>
          </div>
        </q-card>
      </div>
    </div>

    <q-card class="message-summary q-mt-md">
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-h6 text-weight-bold">💬 Centro de Mensajes</div>
          <div class="text-grey-7">Recordatorios listos para WhatsApp Business</div>
        </div>

        <q-btn
          class="btn-message"
          icon="forum"
          label="Abrir"
          to="/centro-mensajes"
          unelevated
          rounded
        />
      </div>

      <div class="message-grid">
        <div class="message-mini orange">
          <div class="mini-number">{{ centro.resumen.pagos_pendientes }}</div>
          <div class="mini-label">Pagos pendientes</div>
        </div>

        <div class="message-mini purple">
          <div class="mini-number">{{ centro.resumen.inscripciones_por_vencer }}</div>
          <div class="mini-label">Por vencer</div>
        </div>

        <div class="message-mini red">
          <div class="mini-number">{{ centro.resumen.inscripciones_vencidas }}</div>
          <div class="mini-label">Vencidas</div>
        </div>
      </div>
    </q-card>

    <q-card class="groups-card q-mt-md">
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-h6 text-weight-bold">👥 Personas por grupo</div>
          <div class="text-grey-7">Resumen de inscritas por horario</div>
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
              ⏰ {{ limpiarHora(grupo.hora_inicio) }} - {{ limpiarHora(grupo.hora_fin) }}
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

    <div class="footer-text">
      💜 CarlaFit — Confía en el proceso, disfruta el cambio.
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'

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

const centro = ref({
  resumen: {
    pagos_pendientes: 0,
    inscripciones_por_vencer: 0,
    inscripciones_vencidas: 0,
    total: 0
  }
})

const cargarDashboard = async () => {
  const res = await api.get('/dashboard')
  dashboard.value = res.data.data || dashboard.value
}

const cargarCentroMensajes = async () => {
  const res = await api.get('/centro-mensajes')
  centro.value = res.data.data || centro.value
}

const cargarTodo = async () => {
  loading.value = true
  error.value = ''

  try {
    await Promise.all([
      cargarDashboard(),
      cargarCentroMensajes()
    ])
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

const limpiarHora = (hora) => {
  if (!hora) return ''
  return hora.substring(0, 5)
}

onMounted(cargarTodo)
</script>

<style scoped>
.dashboard-page {
  background: linear-gradient(180deg, #fff1fb, #f7f5fb);
  min-height: 100vh;
}

.hero-card {
  border-radius: 30px;
  background: linear-gradient(135deg, #4a148c, #8e24aa, #ce5bd8);
  box-shadow: 0 14px 32px rgba(106, 27, 154, 0.28);
  position: relative;
  overflow: hidden;
}

.hero-card::after {
  content: "";
  position: absolute;
  width: 230px;
  height: 230px;
  right: -70px;
  top: -70px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
}

.hero-badge {
  display: inline-block;
  padding: 8px 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: white;
  font-weight: 800;
  margin-bottom: 10px;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: relative;
  z-index: 2;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.quick-btn {
  height: 52px;
  border-radius: 18px;
  background: white;
  color: #7b1fa2;
  font-weight: 800;
  box-shadow: 0 8px 18px rgba(123, 31, 162, 0.12);
}

.quick-btn.message {
  background: linear-gradient(135deg, #7b1fa2, #ab47bc);
  color: white;
}

.premium-card,
.money-card {
  min-height: 145px;
  border-radius: 24px;
  padding: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.08);
  background: white;
}

.card-label,
.money-label {
  font-size: 14px;
  font-weight: 700;
}

.card-number {
  font-size: 36px;
  font-weight: 900;
  margin-top: 5px;
}

.money-number {
  font-size: 28px;
  font-weight: 900;
  margin-top: 6px;
}

.card-caption,
.money-caption {
  color: #777;
  font-size: 12px;
  margin-top: 4px;
}

.card-icon,
.money-icon {
  font-size: 56px;
  opacity: 0.82;
}

.purple-card {
  border-bottom: 5px solid #8e24aa;
  color: #7b1fa2;
}

.green-card {
  border-bottom: 5px solid #2e7d32;
  color: #2e7d32;
}

.blue-card {
  border-bottom: 5px solid #1565c0;
  color: #1565c0;
}

.orange-card {
  border-bottom: 5px solid #fb8c00;
  color: #ef6c00;
}

.money-green {
  background: linear-gradient(135deg, #e8f5e9, #ffffff);
  color: #0b8f3a;
}

.money-purple {
  background: linear-gradient(135deg, #f3e5f5, #ffffff);
  color: #8e24aa;
}

.money-blue {
  background: linear-gradient(135deg, #e3f2fd, #ffffff);
  color: #1565c0;
}

.attendance-box {
  min-height: 110px;
  border-radius: 22px;
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.attendance-box .q-icon {
  font-size: 46px;
}

.attendance-title {
  font-weight: 700;
  font-size: 15px;
}

.attendance-number {
  font-size: 32px;
  font-weight: 900;
}

.total {
  background: linear-gradient(135deg, #ede7f6, #ffffff);
  color: #5e35b1;
}

.present {
  background: linear-gradient(135deg, #e8f5e9, #ffffff);
  color: #2e7d32;
}

.absent {
  background: linear-gradient(135deg, #ffebee, #ffffff);
  color: #c62828;
}

.groups-card,
.message-summary {
  border-radius: 24px;
  padding: 22px;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.08);
}

.message-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.message-mini {
  border-radius: 20px;
  padding: 18px;
  color: white;
}

.message-mini.orange {
  background: linear-gradient(135deg, #fb8c00, #ffb74d);
}

.message-mini.purple {
  background: linear-gradient(135deg, #8e24aa, #ce5bd8);
}

.message-mini.red {
  background: linear-gradient(135deg, #d32f2f, #ef5350);
}

.mini-number {
  font-size: 32px;
  font-weight: 900;
}

.mini-label {
  font-weight: 700;
}

.btn-message {
  background: linear-gradient(135deg, #7b1fa2, #ab47bc);
  color: white;
}

.group-item {
  border-radius: 16px;
  margin-bottom: 4px;
}

.footer-text {
  text-align: center;
  color: #777;
  margin-top: 26px;
  padding-bottom: 10px;
}

@media (max-width: 700px) {
  .dashboard-page {
    padding: 10px;
  }

  .hero-card {
    padding: 20px;
  }

  .hero-content {
    align-items: stretch;
    flex-direction: column;
  }

  .title-responsive {
    font-size: 30px;
  }

  .quick-grid,
  .message-grid {
    grid-template-columns: 1fr;
  }

  .premium-card,
  .money-card {
    min-height: 125px;
    padding: 18px;
  }

  .card-number {
    font-size: 32px;
  }

  .money-number {
    font-size: 24px;
  }

  .card-icon,
  .money-icon {
    font-size: 46px;
  }
}
</style>