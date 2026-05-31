<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4 text-weight-bold">
        ✅ Asistencias
      </div>

      <q-btn
        color="purple"
        icon="add"
        label="Nueva Asistencia"
        @click="abrirDialogCrear"
      />
    </div>

    <q-input
      v-model="filtro"
      outlined
      dense
      clearable
      debounce="300"
      placeholder="Buscar por zumbera, grupo, fecha, estado u observación..."
      class="q-mb-md"
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
    >
      <template v-slot:body-cell-zumbera="props">
        <q-td :props="props">
          {{ props.row.zumbera?.nombre }}
        </q-td>
      </template>

      <template v-slot:body-cell-grupo="props">
        <q-td :props="props">
          {{ props.row.grupo?.nombre }}
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
        <q-td :props="props">
          <q-btn dense flat round color="primary" icon="edit" @click="abrirDialogEditar(props.row)" />
          <q-btn dense flat round color="negative" icon="delete" @click="confirmarEliminar(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog">
      <q-card style="min-width:460px">
        <q-card-section>
          <div class="text-h6">
            {{ modoEditar ? 'Editar Asistencia' : 'Registrar Asistencia' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="form.zumbera_id"
            :options="zumberasOptions"
            label="Zumbera"
            outlined
            emit-value
            map-options
            class="q-mb-md"
          />

          <q-select
            v-model="form.grupo_id"
            :options="gruposOptions"
            label="Grupo"
            outlined
            emit-value
            map-options
            class="q-mb-md"
          />

          <q-input
            v-model="form.fecha"
            label="Fecha"
            type="date"
            outlined
            class="q-mb-md"
          />

          <q-select
            v-model="form.estado"
            :options="estados"
            label="Estado"
            outlined
            class="q-mb-md"
          />

          <q-input
            v-model="form.observacion"
            label="Observación"
            type="textarea"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="purple" label="Guardar" @click="guardar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Notify, Dialog } from 'quasar'
import axios from 'axios'

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
  {
    name: 'zumbera',
    label: 'Zumbera',
    field: row => row.zumbera?.nombre || '',
    align: 'left',
    sortable: true
  },
  {
    name: 'grupo',
    label: 'Grupo',
    field: row => row.grupo?.nombre || '',
    align: 'center',
    sortable: true
  },
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'center',
    sortable: true
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center',
    sortable: true
  },
  {
    name: 'observacion',
    label: 'Observación',
    field: 'observacion',
    align: 'left',
    sortable: true
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center'
  }
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

onMounted(() => {
  cargarDatos()
})
</script>