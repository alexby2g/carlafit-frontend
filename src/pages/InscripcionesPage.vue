<template>
  <q-page class="inscripciones-page q-pa-md">
    <div class="page-header q-mb-md">
      <div>
        <div class="text-h4 text-weight-bold title-responsive">📅 Inscripciones</div>
        <div class="text-grey-7">Registro de zumberas, servicios y grupos</div>
      </div>

      <q-btn
        class="btn-primary"
        icon="add"
        label="Nueva Inscripción"
        unelevated
        rounded
        @click="abrirDialogCrear"
      />
    </div>

    <q-input
      v-model="filtro"
      outlined
      dense
      clearable
      debounce="300"
      placeholder="Buscar inscripción..."
      class="search-box q-mb-md"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <q-table
      title="Lista de Inscripciones"
      :rows="inscripciones"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :filter="filtro"
      :grid="$q.screen.lt.md"
    >
      <template v-slot:item="props">
        <div class="q-pa-xs col-12">
          <q-card class="inscription-card">
            <div class="inscription-top">
              <div class="inscription-icon">📅</div>
              <div>
                <div class="inscription-name">
                  {{ props.row.zumbera?.nombre || 'Sin nombre' }}
                </div>
                <div class="inscription-service">
                  {{ props.row.servicio?.nombre || 'Sin servicio' }}
                </div>
              </div>
              <q-space />
              <q-badge :color="colorEstado(props.row.estado)">
                {{ props.row.estado }}
              </q-badge>
            </div>

            <q-card-section>
              <div class="row q-col-gutter-sm">
                <div class="col-12">
                  <div class="mini-box">
                    <div class="info-label">Grupo / Horario</div>
                    <div class="info-value">
                      {{ props.row.grupo?.nombre || 'Sin grupo' }}
                    </div>
                    <div class="text-grey-7">
                      ⏰ {{ limpiarHora(props.row.grupo?.hora_inicio) }} - {{ limpiarHora(props.row.grupo?.hora_fin) }}
                    </div>
                  </div>
                </div>

                <div class="col-6">
                  <div class="mini-box green-box">
                    <div class="info-label">Inicio</div>
                    <div class="info-value">{{ props.row.fecha_inicio || 'Sin fecha' }}</div>
                  </div>
                </div>

                <div class="col-6">
                  <div class="mini-box blue-box">
                    <div class="info-label">Fin</div>
                    <div class="info-value">{{ props.row.fecha_fin || 'Sin fecha' }}</div>
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="q-pa-sm">
              <q-btn class="btn-edit" icon="edit" label="Editar" dense unelevated rounded @click="abrirDialogEditar(props.row)" />
              <q-btn class="btn-delete" icon="delete" label="Eliminar" dense unelevated rounded @click="confirmarEliminar(props.row)" />
            </q-card-actions>
          </q-card>
        </div>
      </template>

      <template v-slot:body-cell-zumbera="props">
        <q-td :props="props">
          {{ props.row.zumbera?.nombre || 'Sin nombre' }}
        </q-td>
      </template>

      <template v-slot:body-cell-servicio="props">
        <q-td :props="props">
          {{ props.row.servicio?.nombre || 'Sin servicio' }}
        </q-td>
      </template>

      <template v-slot:body-cell-grupo="props">
        <q-td :props="props">
          {{ props.row.grupo?.nombre || 'Sin grupo' }}
        </q-td>
      </template>

      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge :color="colorEstado(props.row.estado)">
            {{ props.row.estado }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props" class="q-gutter-xs">
          <q-btn dense round unelevated color="blue-7" icon="edit" @click="abrirDialogEditar(props.row)" />
          <q-btn dense round unelevated color="red-7" icon="delete" @click="confirmarEliminar(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog" persistent>
      <q-card class="form-card">
        <q-card-section class="form-header">
          <div>
            <div class="text-h6 text-weight-bold">
              {{ modoEditar ? 'Editar Inscripción' : 'Registrar Inscripción' }}
            </div>
            <div class="text-caption text-purple-1">
              Selecciona alumna, servicio y horario
            </div>
          </div>

          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>

        <q-card-section class="form-body">
          <q-select
            v-model="form.zumbera_id"
            :options="zumberasOptions"
            label="Zumbera"
            outlined
            dense
            emit-value
            map-options
            class="q-mb-sm"
          />

          <q-select
            v-model="form.servicio_id"
            :options="serviciosOptions"
            label="Servicio"
            outlined
            dense
            emit-value
            map-options
            class="q-mb-sm"
          />

          <div v-if="servicioSeleccionado" class="summary-box service-summary q-mb-sm">
            <div class="summary-title">🏃 {{ servicioSeleccionado.nombre }}</div>
            <div class="text-grey-8">{{ servicioSeleccionado.descripcion }}</div>
            <div class="summary-price">💰 Bs {{ formatoMonto(servicioSeleccionado.precio) }}</div>
          </div>

          <q-select
            v-model="form.grupo_id"
            :options="gruposOptions"
            label="Grupo / Horario"
            outlined
            dense
            emit-value
            map-options
            class="q-mb-sm"
          />

          <div v-if="grupoSeleccionado" class="summary-box group-summary q-mb-sm">
            <div class="summary-title">⏰ {{ grupoSeleccionado.nombre }}</div>
            <div class="text-grey-8">
              {{ limpiarHora(grupoSeleccionado.hora_inicio) }} - {{ limpiarHora(grupoSeleccionado.hora_fin) }}
            </div>
            <div class="text-grey-8">
              Cupo máximo: {{ grupoSeleccionado.cupo_maximo }}
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input v-model="form.fecha_inicio" label="Fecha inicio" type="date" outlined dense class="q-mb-sm" />
            </div>

            <div class="col-12 col-sm-6">
              <q-input v-model="form.fecha_fin" label="Fecha fin" type="date" outlined dense class="q-mb-sm" />
            </div>
          </div>

          <q-select v-model="form.estado" :options="estados" label="Estado" outlined dense class="q-mb-sm" />

          <div v-if="resumenActivo" class="final-summary">
            <div class="final-title">Resumen de inscripción</div>
            <div>👤 {{ zumberaSeleccionada?.nombre || 'Sin zumbera' }}</div>
            <div>🏃 {{ servicioSeleccionado?.nombre || 'Sin servicio' }}</div>
            <div>⏰ {{ grupoSeleccionado?.nombre || 'Sin grupo' }}</div>
            <div>💰 Bs {{ formatoMonto(servicioSeleccionado?.precio) }}</div>
          </div>
        </q-card-section>

        <q-card-actions class="form-actions">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn class="btn-save" icon="save" label="Guardar Inscripción" unelevated rounded @click="guardar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Notify, Dialog, useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()

const API_INSCRIPCIONES = 'https://carlafit-backend.onrender.com/api/inscripciones'
const API_ZUMBERAS = 'https://carlafit-backend.onrender.com/api/zumberas'
const API_SERVICIOS = 'https://carlafit-backend.onrender.com/api/servicios'
const API_GRUPOS = 'https://carlafit-backend.onrender.com/api/grupos'

const dialog = ref(false)
const modoEditar = ref(false)
const filtro = ref('')

const inscripciones = ref([])
const zumberas = ref([])
const servicios = ref([])
const grupos = ref([])

const estados = ['activo', 'vencido', 'cancelado']

const form = ref({
  id: null,
  zumbera_id: null,
  servicio_id: null,
  grupo_id: null,
  fecha_inicio: '',
  fecha_fin: '',
  estado: 'activo'
})

const columns = [
  { name: 'zumbera', label: 'Zumbera', field: row => row.zumbera?.nombre || '', align: 'left', sortable: true },
  { name: 'servicio', label: 'Servicio', field: row => row.servicio?.nombre || '', align: 'left', sortable: true },
  { name: 'grupo', label: 'Grupo', field: row => row.grupo?.nombre || '', align: 'center', sortable: true },
  { name: 'fecha_inicio', label: 'Inicio', field: 'fecha_inicio', align: 'center', sortable: true },
  { name: 'fecha_fin', label: 'Fin', field: 'fecha_fin', align: 'center', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const zumberasOptions = computed(() =>
  zumberas.value.map(z => ({
    label: z.nombre,
    value: z.id
  }))
)

const serviciosOptions = computed(() =>
  servicios.value.map(s => ({
    label: `${s.nombre} - Bs ${formatoMonto(s.precio)}`,
    value: s.id
  }))
)

const gruposOptions = computed(() =>
  grupos.value.map(g => ({
    label: `${g.nombre} (${limpiarHora(g.hora_inicio)} - ${limpiarHora(g.hora_fin)})`,
    value: g.id
  }))
)

const zumberaSeleccionada = computed(() =>
  zumberas.value.find(z => z.id === form.value.zumbera_id) || null
)

const servicioSeleccionado = computed(() =>
  servicios.value.find(s => s.id === form.value.servicio_id) || null
)

const grupoSeleccionado = computed(() =>
  grupos.value.find(g => g.id === form.value.grupo_id) || null
)

const resumenActivo = computed(() =>
  form.value.zumbera_id && form.value.servicio_id && form.value.grupo_id
)

const cargarDatos = async () => {
  const [resInscripciones, resZumberas, resServicios, resGrupos] = await Promise.all([
    axios.get(API_INSCRIPCIONES),
    axios.get(API_ZUMBERAS),
    axios.get(API_SERVICIOS),
    axios.get(API_GRUPOS)
  ])

  inscripciones.value = resInscripciones.data.data
  zumberas.value = resZumberas.data.data
  servicios.value = resServicios.data.data
  grupos.value = resGrupos.data.data
}

const hoy = () => new Date().toISOString().slice(0, 10)

const limpiarHora = (hora) => {
  if (!hora) return ''
  return hora.substring(0, 5)
}

const formatoMonto = (valor) => {
  return Number(valor || 0).toFixed(2)
}

const colorEstado = (estado) => {
  if (estado === 'activo') return 'positive'
  if (estado === 'vencido') return 'warning'
  return 'negative'
}

const abrirDialogCrear = () => {
  modoEditar.value = false

  form.value = {
    id: null,
    zumbera_id: null,
    servicio_id: null,
    grupo_id: null,
    fecha_inicio: hoy(),
    fecha_fin: '',
    estado: 'activo'
  }

  dialog.value = true
}

const abrirDialogEditar = (inscripcion) => {
  modoEditar.value = true

  form.value = {
    id: inscripcion.id,
    zumbera_id: inscripcion.zumbera_id,
    servicio_id: inscripcion.servicio_id,
    grupo_id: inscripcion.grupo_id,
    fecha_inicio: inscripcion.fecha_inicio || hoy(),
    fecha_fin: inscripcion.fecha_fin || '',
    estado: inscripcion.estado || 'activo'
  }

  dialog.value = true
}

const guardar = async () => {
  if (!form.value.zumbera_id) {
    Notify.create({ type: 'warning', message: 'Debe seleccionar una zumbera' })
    return
  }

  if (!form.value.servicio_id) {
    Notify.create({ type: 'warning', message: 'Debe seleccionar un servicio' })
    return
  }

  if (!form.value.grupo_id) {
    Notify.create({ type: 'warning', message: 'Debe seleccionar un grupo' })
    return
  }

  if (!form.value.fecha_inicio) {
    Notify.create({ type: 'warning', message: 'Debe ingresar la fecha de inicio' })
    return
  }

  if (form.value.fecha_fin && form.value.fecha_fin < form.value.fecha_inicio) {
    Notify.create({ type: 'warning', message: 'La fecha fin no puede ser menor que la fecha inicio' })
    return
  }

  const datos = {
    zumbera_id: form.value.zumbera_id,
    servicio_id: form.value.servicio_id,
    grupo_id: form.value.grupo_id,
    fecha_inicio: form.value.fecha_inicio,
    fecha_fin: form.value.fecha_fin || null,
    estado: form.value.estado
  }

  if (modoEditar.value) {
    await axios.put(`${API_INSCRIPCIONES}/${form.value.id}`, datos)
    Notify.create({ type: 'positive', message: 'Inscripción actualizada correctamente' })
  } else {
    await axios.post(API_INSCRIPCIONES, datos)
    Notify.create({ type: 'positive', message: 'Inscripción registrada correctamente' })
  }

  dialog.value = false
  cargarDatos()
}

const confirmarEliminar = (inscripcion) => {
  Dialog.create({
    title: 'Confirmar eliminación',
    message: `¿Seguro que deseas eliminar la inscripción de ${inscripcion.zumbera?.nombre || 'esta zumbera'}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await axios.delete(`${API_INSCRIPCIONES}/${inscripcion.id}`)
    Notify.create({ type: 'positive', message: 'Inscripción eliminada correctamente' })
    cargarDatos()
  })
}

onMounted(cargarDatos)
</script>

<style scoped>
.inscripciones-page {
  background: #f7f5fb;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.btn-primary,
.btn-save {
  background: linear-gradient(135deg, #7b1fa2, #ba2bd2);
  color: white;
  box-shadow: 0 8px 18px rgba(123, 31, 162, 0.35);
}

.btn-edit {
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  color: white;
}

.btn-delete {
  background: linear-gradient(135deg, #d32f2f, #ef5350);
  color: white;
}

.search-box {
  background: white;
  border-radius: 14px;
}

.inscription-card {
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.09);
}

.inscription-top {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  color: white;
  background: linear-gradient(135deg, #6a1b9a, #ab47bc);
}

.inscription-icon {
  font-size: 34px;
}

.inscription-name {
  font-size: 21px;
  font-weight: 900;
}

.inscription-service {
  font-size: 14px;
  opacity: 0.9;
}

.mini-box,
.summary-box,
.final-summary {
  border-radius: 16px;
  padding: 12px;
}

.mini-box {
  background: #f3e5f5;
  border: 1px solid #ce93d8;
}

.green-box,
.service-summary {
  background: #e8f5e9;
  border: 1px solid #a5d6a7;
}

.blue-box,
.group-summary {
  background: #e3f2fd;
  border: 1px solid #90caf9;
}

.info-label {
  font-size: 13px;
  color: #777;
  font-weight: 700;
}

.info-value {
  font-size: 16px;
  font-weight: 700;
  margin-top: 4px;
}

.summary-title {
  font-size: 16px;
  font-weight: 900;
}

.summary-price {
  margin-top: 4px;
  font-weight: 900;
  color: #1b5e20;
}

.final-summary {
  background: linear-gradient(135deg, #f3e5f5, #ffffff);
  border: 1px solid #ce93d8;
  font-weight: 600;
  line-height: 1.7;
}

.final-title {
  font-size: 16px;
  font-weight: 900;
  color: #6a1b9a;
  margin-bottom: 4px;
}

.form-card {
  width: 460px;
  max-width: 94vw;
  max-height: 90vh;
  border-radius: 22px;
  overflow: hidden;
}

.form-header {
  background: linear-gradient(135deg, #6a1b9a, #9c27b0);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-body {
  padding: 16px;
  max-height: 65vh;
  overflow-y: auto;
}

.form-actions {
  padding: 12px 16px 16px;
  justify-content: flex-end;
  background: white;
}

@media (max-width: 600px) {
  .inscripciones-page {
    padding: 10px;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .title-responsive {
    font-size: 32px;
  }

  .btn-primary {
    width: 100%;
  }

  .form-card {
    width: 96vw;
    max-height: 88vh;
  }

  .form-body {
    max-height: 62vh;
    overflow-y: auto;
  }

  .form-actions {
    position: sticky;
    bottom: 0;
    background: white;
  }
}
</style>