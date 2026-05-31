<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4 text-weight-bold">
        📅 Inscripciones
      </div>

      <q-btn
        color="purple"
        icon="add"
        label="Nueva Inscripción"
        @click="abrirDialogCrear"
      />
    </div>

    <q-input
      v-model="filtro"
      outlined
      dense
      clearable
      debounce="300"
      placeholder="Buscar por zumbera, servicio, grupo, estado o fecha..."
      class="q-mb-md"
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
    >
      <template v-slot:body-cell-zumbera="props">
        <q-td :props="props">
          {{ props.row.zumbera?.nombre }}
        </q-td>
      </template>

      <template v-slot:body-cell-servicio="props">
        <q-td :props="props">
          {{ props.row.servicio?.nombre }}
        </q-td>
      </template>

      <template v-slot:body-cell-grupo="props">
        <q-td :props="props">
          {{ props.row.grupo?.nombre }}
        </q-td>
      </template>

      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.estado === 'activo' ? 'positive' : props.row.estado === 'vencido' ? 'warning' : 'negative'"
          >
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
            {{ modoEditar ? 'Editar Inscripción' : 'Registrar Inscripción' }}
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
            v-model="form.servicio_id"
            :options="serviciosOptions"
            label="Servicio"
            outlined
            emit-value
            map-options
            class="q-mb-md"
          />

          <q-select
            v-model="form.grupo_id"
            :options="gruposOptions"
            label="Grupo / Horario"
            outlined
            emit-value
            map-options
            class="q-mb-md"
          />

          <q-input v-model="form.fecha_inicio" label="Fecha inicio" type="date" outlined class="q-mb-md" />
          <q-input v-model="form.fecha_fin" label="Fecha fin" type="date" outlined class="q-mb-md" />

          <q-select
            v-model="form.estado"
            :options="estados"
            label="Estado"
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
import { ref, onMounted, computed } from 'vue'
import { Notify, Dialog } from 'quasar'
import axios from 'axios'

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
  {
    name: 'zumbera',
    label: 'Zumbera',
    field: row => row.zumbera?.nombre || '',
    align: 'left',
    sortable: true
  },
  {
    name: 'servicio',
    label: 'Servicio',
    field: row => row.servicio?.nombre || '',
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
    name: 'fecha_inicio',
    label: 'Inicio',
    field: 'fecha_inicio',
    align: 'center',
    sortable: true
  },
  {
    name: 'fecha_fin',
    label: 'Fin',
    field: 'fecha_fin',
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

const serviciosOptions = computed(() =>
  servicios.value.map(s => ({
    label: `${s.nombre} - Bs ${s.precio}`,
    value: s.id
  }))
)

const gruposOptions = computed(() =>
  grupos.value.map(g => ({
    label: `${g.nombre} (${g.hora_inicio} - ${g.hora_fin})`,
    value: g.id
  }))
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
    Notify.create({
      type: 'warning',
      message: 'La fecha fin no puede ser menor que la fecha inicio'
    })
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

onMounted(() => {
  cargarDatos()
})
</script>