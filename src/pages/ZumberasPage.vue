<template>
  <q-page class="q-pa-md">

    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4 text-weight-bold">
        👩 Zumberas
      </div>

      <q-btn
        color="purple"
        icon="add"
        label="Nueva Zumbera"
        @click="abrirDialogCrear"
      />
    </div>

    <q-input
      v-model="filtro"
      outlined
      dense
      clearable
      debounce="300"
      placeholder="Buscar por nombre, teléfono, dirección o estado..."
      class="q-mb-md"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <q-table
      title="Lista de Zumberas"
      :rows="zumberas"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :filter="filtro"
    >
      <template v-slot:body-cell-activo="props">
        <q-td :props="props">
          <q-badge :color="props.row.activo ? 'positive' : 'negative'">
            {{ props.row.activo ? 'Activa' : 'Inactiva' }}
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
      <q-card style="min-width:400px">
        <q-card-section>
          <div class="text-h6">
            {{ modoEditar ? 'Editar Zumbera' : 'Registrar Zumbera' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.nombre" label="Nombre" outlined class="q-mb-md" />
          <q-input v-model="form.telefono" label="Teléfono" outlined class="q-mb-md" />
          <q-input v-model="form.direccion" label="Dirección" outlined class="q-mb-md" />

          <q-toggle
            v-model="form.activo"
            label="Zumbera activa"
            color="purple"
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
import { ref, onMounted } from 'vue'
import { Notify, Dialog } from 'quasar'
import axios from 'axios'

const API_URL = 'https://carlafit-backend.onrender.com/api/zumberas'

const dialog = ref(false)
const modoEditar = ref(false)
const zumberas = ref([])
const filtro = ref('')

const form = ref({
  id: null,
  nombre: '',
  telefono: '',
  direccion: '',
  activo: true
})

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left', sortable: true },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left', sortable: true },
  {
    name: 'activo',
    label: 'Estado',
    field: row => row.activo ? 'Activa' : 'Inactiva',
    align: 'center',
    sortable: true
  },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const cargarZumberas = async () => {
  const res = await axios.get(API_URL)
  zumberas.value = res.data.data
}

const abrirDialogCrear = () => {
  modoEditar.value = false

  form.value = {
    id: null,
    nombre: '',
    telefono: '',
    direccion: '',
    activo: true
  }

  dialog.value = true
}

const abrirDialogEditar = (zumbera) => {
  modoEditar.value = true

  form.value = {
    id: zumbera.id,
    nombre: zumbera.nombre || '',
    telefono: zumbera.telefono || '',
    direccion: zumbera.direccion || '',
    activo: Boolean(zumbera.activo)
  }

  dialog.value = true
}

const guardar = async () => {
  if (!form.value.nombre) {
    Notify.create({
      type: 'warning',
      message: 'El nombre es obligatorio'
    })
    return
  }

  const datos = {
    nombre: form.value.nombre,
    telefono: form.value.telefono,
    direccion: form.value.direccion,
    activo: form.value.activo
  }

  if (modoEditar.value) {
    await axios.put(`${API_URL}/${form.value.id}`, datos)

    Notify.create({
      type: 'positive',
      message: 'Zumbera actualizada correctamente'
    })
  } else {
    await axios.post(API_URL, datos)

    Notify.create({
      type: 'positive',
      message: 'Zumbera registrada correctamente'
    })
  }

  dialog.value = false
  cargarZumberas()
}

const confirmarEliminar = (zumbera) => {
  Dialog.create({
    title: 'Confirmar eliminación',
    message: `¿Seguro que deseas eliminar a ${zumbera.nombre}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await axios.delete(`${API_URL}/${zumbera.id}`)

    Notify.create({
      type: 'positive',
      message: 'Zumbera eliminada correctamente'
    })

    cargarZumberas()
  })
}

onMounted(() => {
  cargarZumberas()
})
</script>