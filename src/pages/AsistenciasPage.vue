<template>
  <q-page class="asistencias-page q-pa-md">
    <div class="page-header q-mb-md">
      <div>
        <div class="text-h4 text-weight-bold title-responsive">
          ✅ Asistencias
        </div>
        <div class="text-grey-7">
          Control diario de presentes y ausentes
        </div>
      </div>

      <q-btn
        class="btn-primary"
        icon="add"
        label="Nueva Asistencia"
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
      placeholder="Buscar asistencia..."
      class="search-box q-mb-md"
    >
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
            <div class="text-caption text-green-1">
              Marca asistencia por grupo y fecha
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
            v-model="form.grupo_id"
            :options="gruposOptions"
            label="Grupo"
            outlined
            dense
            emit-value
            map-options
            class="q-mb-sm"
          />

          <q-input
            v-model="form.fecha"
            label="Fecha"
            type="date"
            outlined
            dense
            class="q-mb-sm"
          />

          <q-select
            v-model="form.estado"
            :options="estados"
            label="Estado"
            outlined
            dense
            class="q-mb-sm"
          />

          <q-input
            v-model="form.observacion"
            label="Observación"
            type="textarea"
            outlined
            dense
            autogrow
          />
        </q-card-section>

        <q-card-actions class="form-actions">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn class="btn-save" icon="save" label="Guardar" unelevated rounded @click="guardar" />
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

const estados = ['presente', 'ausente']

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
    label: `${g.nombre} (${g.hora_inicio} - ${g.hora_fin})`,
    value: g.id
  }))
)

const hoy = () => new Date().toISOString().slice(0, 10)

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

.search-box {
  background: white;
  border-radius: 14px;
}

.form-card {
  width: 460px;
  max-width: 94vw;
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
}

.form-actions {
  padding: 12px 16px 16px;
  justify-content: flex-end;
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