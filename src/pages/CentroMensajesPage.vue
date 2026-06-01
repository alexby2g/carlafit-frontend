<template>
  <q-page class="centro-page q-pa-md">
    <div class="hero-card q-mb-lg">
      <div class="hero-badge">Centro de Mensajes</div>
      <div class="hero-title">💬 Recordatorios CarlaFit</div>
      <div class="hero-subtitle">
        Pagos pendientes, inscripciones por vencer y mensajes listos para WhatsApp Business
      </div>

      <q-btn
        class="hero-btn"
        icon="refresh"
        label="Actualizar recordatorios"
        :loading="loading"
        @click="cargarMensajes"
      />
    </div>

    <div class="stats-grid q-mb-lg">
      <q-card class="stat-card">
        <q-card-section>
          <div class="stat-label">Total</div>
          <div class="stat-number">{{ resumen.total }}</div>
          <div class="stat-text">Recordatorios</div>
        </q-card-section>
        <q-icon name="forum" class="stat-icon purple" />
      </q-card>

      <q-card class="stat-card">
        <q-card-section>
          <div class="stat-label">Pagos</div>
          <div class="stat-number">{{ resumen.pagos_pendientes }}</div>
          <div class="stat-text">Pendientes</div>
        </q-card-section>
        <q-icon name="payments" class="stat-icon orange" />
      </q-card>

      <q-card class="stat-card">
        <q-card-section>
          <div class="stat-label">Vencimientos</div>
          <div class="stat-number">{{ resumen.inscripciones_por_vencer }}</div>
          <div class="stat-text">Por vencer</div>
        </q-card-section>
        <q-icon name="event_available" class="stat-icon yellow" />
      </q-card>

      <q-card class="stat-card">
        <q-card-section>
          <div class="stat-label">Vencidas</div>
          <div class="stat-number">{{ resumen.inscripciones_vencidas }}</div>
          <div class="stat-text">Inscripciones</div>
        </q-card-section>
        <q-icon name="warning" class="stat-icon red" />
      </q-card>
    </div>

    <q-banner v-if="resumen.total === 0 && !loading" class="empty-banner q-mb-md">
      <template v-slot:avatar>
        <q-icon name="check_circle" color="green" />
      </template>
      No hay recordatorios pendientes por ahora.
    </q-banner>

    <seccion-mensajes
      titulo="💰 Pagos pendientes"
      color="orange"
      :items="pagosPendientes"
      @whatsapp="enviarWhatsApp"
    />

    <seccion-mensajes
      titulo="📅 Inscripciones por vencer"
      color="purple"
      :items="inscripcionesPorVencer"
      @whatsapp="enviarWhatsApp"
    />

    <seccion-mensajes
      titulo="⚠️ Inscripciones vencidas"
      color="red"
      :items="inscripcionesVencidas"
      @whatsapp="enviarWhatsApp"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, defineComponent } from 'vue'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'

const loading = ref(false)

const resumen = ref({
  pagos_pendientes: 0,
  inscripciones_por_vencer: 0,
  inscripciones_vencidas: 0,
  total: 0
})

const pagosPendientes = ref([])
const inscripcionesPorVencer = ref([])
const inscripcionesVencidas = ref([])

const limpiarTelefono = (telefono) => {
  return String(telefono || '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
}

const telefonoWhatsApp = (telefono) => {
  let limpio = limpiarTelefono(telefono)

  if (limpio.startsWith('+')) {
    limpio = limpio.substring(1)
  }

  if (limpio.startsWith('591')) return limpio
  if (limpio.startsWith('0')) return `591${limpio.substring(1)}`

  return `591${limpio}`
}

const enviarWhatsApp = (item) => {
  if (!item.telefono) {
    Notify.create({
      type: 'warning',
      message: 'Esta zumbera no tiene teléfono registrado'
    })
    return
  }

  const telefono = telefonoWhatsApp(item.telefono)
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(item.mensaje)}`

  window.open(url, '_blank')
}

const cargarMensajes = async () => {
  try {
    loading.value = true

    const response = await api.get('/centro-mensajes')
    const data = response.data.data || {}

    resumen.value = data.resumen || {
      pagos_pendientes: 0,
      inscripciones_por_vencer: 0,
      inscripciones_vencidas: 0,
      total: 0
    }

    pagosPendientes.value = data.pagos_pendientes || []
    inscripcionesPorVencer.value = data.inscripciones_por_vencer || []
    inscripcionesVencidas.value = data.inscripciones_vencidas || []
  } catch (error) {
    console.error(error)
    Notify.create({
      type: 'negative',
      message: 'No se pudo cargar el centro de mensajes'
    })
  } finally {
    loading.value = false
  }
}

const SeccionMensajes = defineComponent({
  name: 'SeccionMensajes',
  props: {
    titulo: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: 'purple'
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  emits: ['whatsapp'],
  template: `
    <div class="q-mb-lg">
      <div class="section-title q-mb-sm">
        {{ titulo }}
      </div>

      <q-card v-if="items.length === 0" class="empty-section">
        <q-card-section class="text-grey-7">
          Sin registros en esta sección.
        </q-card-section>
      </q-card>

      <div v-else class="cards-grid">
        <q-card
          v-for="item in items"
          :key="item.tipo + '-' + item.id"
          class="message-card"
        >
          <q-card-section>
            <div class="row items-start justify-between q-mb-sm">
              <div>
                <div class="message-title">
                  {{ item.nombre }}
                </div>
                <div class="message-subtitle">
                  {{ item.titulo }}
                </div>
              </div>

              <q-badge :color="color">
                {{ item.tipo }}
              </q-badge>
            </div>

            <div class="message-info">
              <div v-if="item.monto">
                💰 Bs {{ Number(item.monto).toFixed(2) }}
              </div>

              <div v-if="item.fecha">
                📅 {{ item.fecha }}
              </div>

              <div v-if="item.dias_restantes !== undefined">
                ⏳ Faltan {{ item.dias_restantes }} día(s)
              </div>

              <div v-if="item.servicio">
                🏃 {{ item.servicio }}
              </div>

              <div v-if="item.grupo">
                👥 {{ item.grupo }}
              </div>

              <div>
                📞 {{ item.telefono || 'Sin teléfono' }}
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <div class="message-preview">
              {{ item.mensaje }}
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              class="btn-whatsapp"
              icon="chat"
              label="Enviar WhatsApp"
              unelevated
              rounded
              :disable="!item.telefono"
              @click="$emit('whatsapp', item)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  `
})

onMounted(() => {
  cargarMensajes()
})
</script>

<style scoped>
.centro-page {
  background: linear-gradient(180deg, #fff1fb, #f7f5fb);
  min-height: 100vh;
}

.hero-card {
  padding: 28px;
  border-radius: 32px;
  background: linear-gradient(135deg, #7b1fa2, #9c27b0, #ce5bd8);
  color: white;
  box-shadow: 0 16px 35px rgba(123, 31, 162, 0.25);
}

.hero-badge {
  display: inline-block;
  padding: 10px 22px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 18px;
}

.hero-title {
  font-size: 38px;
  font-weight: 900;
}

.hero-subtitle {
  font-size: 18px;
  font-weight: 500;
  opacity: 0.95;
  margin-top: 8px;
  margin-bottom: 24px;
}

.hero-btn {
  height: 54px;
  border-radius: 20px;
  background: white;
  color: #8e24aa;
  font-weight: 900;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  border-radius: 24px;
  min-height: 120px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 12px 26px rgba(123, 31, 162, 0.12);
}

.stat-label {
  color: #777;
  font-weight: 800;
  font-size: 15px;
}

.stat-number {
  font-size: 34px;
  font-weight: 900;
  color: #222;
}

.stat-text {
  color: #888;
  font-size: 14px;
}

.stat-icon {
  position: absolute;
  right: 18px;
  top: 32px;
  font-size: 48px;
  color: white;
  padding: 14px;
  border-radius: 50%;
}

.stat-icon.purple {
  background: #8e24aa;
}

.stat-icon.orange {
  background: #fb8c00;
}

.stat-icon.yellow {
  background: #fbc02d;
}

.stat-icon.red {
  background: #d32f2f;
}

.empty-banner {
  border-radius: 18px;
  background: #e8f5e9;
}

.section-title {
  font-size: 22px;
  font-weight: 900;
  color: #4a148c;
}

.empty-section {
  border-radius: 18px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.message-card {
  border-radius: 22px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.message-title {
  font-size: 20px;
  font-weight: 900;
  color: #6a1b9a;
}

.message-subtitle {
  color: #777;
  font-weight: 700;
}

.message-info {
  color: #555;
  font-weight: 600;
  line-height: 1.7;
}

.message-preview {
  color: #444;
  font-size: 14px;
  background: #fff7fd;
  padding: 12px;
  border-radius: 16px;
}

.btn-whatsapp {
  background: linear-gradient(135deg, #128c7e, #25d366);
  color: white;
  font-weight: 800;
}

@media (max-width: 800px) {
  .centro-page {
    padding: 10px;
  }

  .hero-card {
    padding: 22px;
    border-radius: 28px;
  }

  .hero-title {
    font-size: 32px;
  }

  .stats-grid,
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>