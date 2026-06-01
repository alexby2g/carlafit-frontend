<template>
  <q-page class="asistencias-page q-pa-md">
    <div class="page-header q-mb-md">
      <div>
        <div class="text-h4 text-weight-bold title-responsive">✅ Asistencias</div>
        <div class="text-grey-7">Control diario de presentes y ausentes</div>
      </div>

      <q-btn class="btn-primary" icon="add" label="Nueva Asistencia" unelevated rounded @click="abrirDialogCrear" />
    </div>

    <q-input v-model="filtro" outlined dense clearable debounce="300" placeholder="Buscar asistencia..." class="search-box q-mb-md">
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <q-table
      title="Control de Asistencias"
      :rows="asistencias"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :filter="filtro"
      :grid="$q.screen.lt.md"
    >
      <template v-slot:item="props">
        <div class="q-pa-xs col-12">
          <q-card class="attendance-card">
            <div class="attendance-top" :class="props.row.estado === 'presente' ? 'present-card' : 'absent-card'">
              <div class="attendance-icon">
                {{ props.row.estado === 'presente' ? '✅' : '❌' }}
              </div>

              <div>
                <div class="attendance-name">{{ props.row.zumbera?.nombre || 'Sin nombre' }}</div>
                <div class="attendance-group">{{ props.row.grupo?.nombre || 'Sin grupo' }}</div>
              </div>

              <q-space />

              <q-badge :color="props.row.estado === 'presente' ? 'positive' : 'negative'">
                {{ props.row.estado }}
              </q-badge>
            </div>

            <q-card-section>
              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <div class="mini-box">
                    <div class="info-label">Fecha</div>
                    <div class="info-value">{{ props.row.fecha }}</div>
                  </div>
                </div>

                <div class="col-6">
                  <div class="mini-box green-box">
                    <div class="info-label">Estado</div>
                    <div class="info-value">{{ props.row.estado }}</div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="mini-box note-box">
                    <div class="info-label">Observación</div>
                    <div class="info-value">{{ props.row.observacion || 'Sin observación' }}</div>
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

      <template v-slot:body-cell-grupo="props">
        <q-td :props="props">
          {{ props.row.grupo?.nombre || 'Sin grupo' }}
        </q-td>
      </template>

      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge :color="props.row.estado === 'presente' ? 'positive' : 'negative'">
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
              {{ modoEditar ? 'Editar Asistencia' : 'Registrar Asistencia' }}
            </div>
            <div class="text-caption text-green-1">Marca asistencia por grupo y fecha</div>
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
            v-model="form.grupo_id"
            :options="gruposOptions"
            label="Grupo"
            outlined
            dense
            emit-value
            map-options
            class="q-mb-sm"
          />

          <q-input v-model="form.fecha" label="Fecha" type="date" outlined dense class="q-mb-sm" />

          <div class="status-buttons q-mb-sm">
            <q-btn
              :class="form.estado === 'presente' ? 'status-active-present' : 'status-btn'"
              icon="check_circle"
              label="Presente"
              unelevated
              rounded
              @click="form.estado = 'presente'"
            />

            <q-btn
              :class="form.estado === 'ausente' ? 'status-active-absent' : 'status-btn'"
              icon="cancel"
              label="Ausente"
              unelevated
              rounded
              @click="form.estado = 'ausente'"
            />
          </div>

          <q-input
            v-model="form.observacion"
            label="Observación"
            type="textarea"
            outlined
            dense
            autogrow
          />

          <div class="final-summary q-mt-sm">
            <div class="final-title">Resumen</div>
            <div>👤 {{ zumberaSeleccionada?.nombre || 'Sin zumbera' }}</div>
            <div>⏰ {{ grupoSeleccionado?.nombre || 'Sin grupo' }}</div>
            <div>📅 {{ form.fecha || 'Sin fecha' }}</div>
            <div>{{ form.estado === 'presente' ? '✅' : '❌' }} {{ form.estado }}</div>
          </div>
        </q-card-section>

        <q-card-actions class="form-actions">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn class="btn-save" icon="save" label="Guardar Asistencia" unelevated rounded @click="guardar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Notify, Dialog, useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()

const API_ASISTENCIAS = 'https://carlafit-backend.onrender.com/api/asistencias'
const API_ZUMBERAS = 'https://carlafit-backend.onrender.com/api/zumberas'
const API_GRUPOS = 'https://carlafit-backend.onrender.com/api/grupos'

const dialog = ref(false)
const modoEditar = ref(false)
const filtro = ref('')

const asistencias = ref([])
const zumberas = ref([])
const grupos = ref([])

const form = ref({
  id: null,
  zumbera_id: null,
  grupo_id: null,
  fecha: '',
  estado: 'presente',
  observacion: ''
})

const columns = [
  { name: 'zumbera', label: 'Zumbera', field: row => row.zumbera?.nombre || '', align: 'left', sortable: true },
  { name: 'grupo', label: 'Grupo', field: row => row.grupo?.nombre || '', align: 'center', sortable: true },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'center', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  { name: 'observacion', label: 'Observación', field: 'observacion', align: 'left', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const zumberasOptions = computed(() =>
  zumberas.value.map(z => ({
    label: z.nombre,
    value: z.id
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

const grupoSeleccionado = computed(() =>
  grupos.value.find(g => g.id === form.value.grupo_id) || null
)

const hoy = () => new Date().toISOString().slice(0, 10)

const limpiarHora = (hora) => {
  if (!hora) return ''
  return hora.substring(0, 5)
}

const cargarDatos = async () => {
  const [resAsistencias, resZumberas, resGrupos] = await Promise.all([
    axios.get(API_ASISTENCIAS),
    axios.get(API_ZUMBERAS),
    axios.get(API_GRUPOS)
  ])

  asistencias.value = resAsistencias.data.data
  zumberas.value = resZumberas.data.data
  grupos.value = resGrupos.data.data
}

const abrirDialogCrear = () => {
  modoEditar.value = false
  form.value = {
    id: null,
    zumbera_id: null,
    grupo_id: null,
    fecha: hoy(),
    estado: 'presente',
    observacion: ''
  }
  dialog.value = true
}

const abrirDialogEditar = (asistencia) => {
  modoEditar.value = true
  form.value = {
    id: asistencia.id,
    zumbera_id: asistencia.zumbera_id,
    grupo_id: asistencia.grupo_id,
    fecha: asistencia.fecha || hoy(),
    estado: asistencia.estado || 'presente',
    observacion: asistencia.observacion || ''
  }
  dialog.value = true
}

const guardar = async () => {
  if (!form.value.zumbera_id) {
    Notify.create({ type: 'warning', message: 'Debe seleccionar una zumbera' })
    return
  }

  if (!form.value.grupo_id) {
    Notify.create({ type: 'warning', message: 'Debe seleccionar un grupo' })
    return
  }

  if (!form.value.fecha) {
    Notify.create({ type: 'warning', message: 'Debe ingresar la fecha' })
    return
  }

  const datos = {
    zumbera_id: form.value.zumbera_id,
    grupo_id: form.value.grupo_id,
    fecha: form.value.fecha,
    estado: form.value.estado,
    observacion: form.value.observacion
  }

  if (modoEditar.value) {
    await axios.put(`${API_ASISTENCIAS}/${form.value.id}`, datos)
    Notify.create({ type: 'positive', message: 'Asistencia actualizada correctamente' })
  } else {
    await axios.post(API_ASISTENCIAS, datos)
    Notify.create({ type: 'positive', message: 'Asistencia registrada correctamente' })
  }

  dialog.value = false
  cargarDatos()
}

const confirmarEliminar = (asistencia) => {
  Dialog.create({
    title: 'Confirmar eliminación',
    message: `¿Seguro que deseas eliminar la asistencia de ${asistencia.zumbera?.nombre || 'esta zumbera'}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await axios.delete(`${API_ASISTENCIAS}/${asistencia.id}`)
    Notify.create({ type: 'positive', message: 'Asistencia eliminada correctamente' })
    cargarDatos()
  })
}

onMounted(cargarDatos)
</script>

<style scoped>
.asistencias-page {
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

.attendance-card {
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.09);
}

.attendance-top {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  color: white;
}

.present-card {
  background: linear-gradient(135deg, #2e7d32, #43a047);
}

.absent-card {
  background: linear-gradient(135deg, #c62828, #ef5350);
}

.attendance-icon {
  font-size: 34px;
}

.attendance-name {
  font-size: 21px;
  font-weight: 900;
}

.attendance-group {
  font-size: 14px;
  opacity: 0.9;
}

.mini-box,
.final-summary {
  border-radius: 16px;
  padding: 12px;
}

.mini-box {
  background: #f3e5f5;
  border: 1px solid #ce93d8;
}

.green-box {
  background: #e8f5e9;
  border: 1px solid #a5d6a7;
}

.note-box {
  background: #ffffff;
  border: 1px solid #ddd;
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

.status-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.status-btn {
  background: #eeeeee;
  color: #555;
}

.status-active-present {
  background: linear-gradient(135deg, #2e7d32, #43a047);
  color: white;
}

.status-active-absent {
  background: linear-gradient(135deg, #c62828, #ef5350);
  color: white;
}

.final-summary {
  background: linear-gradient(135deg, #e8f5e9, #ffffff);
  border: 1px solid #a5d6a7;
  font-weight: 600;
  line-height: 1.7;
}

.final-title {
  font-size: 16px;
  font-weight: 900;
  color: #2e7d32;
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
  background: linear-gradient(135deg, #2e7d32, #43a047);
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
  .asistencias-page {
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