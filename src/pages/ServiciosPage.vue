<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4 text-weight-bold">
        🏃 Servicios
      </div>

      <q-btn
        color="purple"
        icon="add"
        label="Nuevo Servicio"
        @click="abrirDialogCrear"
      />
    </div>

    <q-input
      v-model="filtro"
      outlined
      dense
      clearable
      debounce="300"
      placeholder="Buscar por servicio, precio, tipo, descripción o estado..."
      class="q-mb-md"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <q-table
      title="Lista de Servicios"
      :rows="servicios"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :filter="filtro"
    >
      <template v-slot:body-cell-precio="props">
        <q-td :props="props">
          Bs {{ props.row.precio }}
        </q-td>
      </template>

      <template v-slot:body-cell-activo="props">
        <q-td :props="props">
          <q-badge :color="props.row.activo ? 'positive' : 'negative'">
            {{ props.row.activo ? 'Activo' : 'Inactivo' }}
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
      <q-card style="min-width:430px">
        <q-card-section>
          <div class="text-h6">
            {{ modoEditar ? 'Editar Servicio' : 'Registrar Servicio' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.nombre" label="Nombre del servicio" outlined class="q-mb-md" />

          <q-input
            v-model.number="form.precio"
            label="Precio"
            type="number"
            outlined
            class="q-mb-md"
          />

          <q-select
            v-model="form.tipo"
            :options="tipos"
            label="Tipo"
            outlined
            class="q-mb-md"
          />

          <q-input
            v-model="form.descripcion"
            label="Descripción"
            type="textarea"
            outlined
            class="q-mb-md"
          />

          <q-toggle v-model="form.activo" label="Servicio activo" color="purple" />
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

const API_URL = 'https://carlafit-backend.onrender.com/api/servicios'

const dialog = ref(false)
const modoEditar = ref(false)
const servicios = ref([])
const filtro = ref('')

const tipos = ['diario', 'mensual', 'combo']

const form = ref({
  id: null,
  nombre: '',
  precio: 0,
  tipo: 'diario',
  descripcion: '',
  activo: true
})

const columns = [
  { name: 'nombre', label: 'Servicio', field: 'nombre', align: 'left', sortable: true },
  { name: 'precio', label: 'Precio', field: row => String(row.precio), align: 'center', sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left', sortable: true },
  {
    name: 'activo',
    label: 'Estado',
    field: row => row.activo ? 'Activo' : 'Inactivo',
    align: 'center',
    sortable: true
  },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const cargarServicios = async () => {
  const res = await axios.get(API_URL)
  servicios.value = res.data.data
}

const abrirDialogCrear = () => {
  modoEditar.value = false

  form.value = {
    id: null,
    nombre: '',
    precio: 0,
    tipo: 'diario',
    descripcion: '',
    activo: true
  }

  dialog.value = true
}

const abrirDialogEditar = (servicio) => {
  modoEditar.value = true

  form.value = {
    id: servicio.id,
    nombre: servicio.nombre || '',
    precio: Number(servicio.precio) || 0,
    tipo: servicio.tipo || 'diario',
    descripcion: servicio.descripcion || '',
    activo: Boolean(servicio.activo)
  }

  dialog.value = true
}

const guardar = async () => {
  if (!form.value.nombre) {
    Notify.create({
      type: 'warning',
      message: 'El nombre del servicio es obligatorio'
    })
    return
  }

  if (form.value.precio < 0) {
    Notify.create({
      type: 'warning',
      message: 'El precio no puede ser negativo'
    })
    return
  }

  const datos = {
    nombre: form.value.nombre,
    precio: form.value.precio,
    tipo: form.value.tipo,
    descripcion: form.value.descripcion,
    activo: form.value.activo
  }

  if (modoEditar.value) {
    await axios.put(`${API_URL}/${form.value.id}`, datos)
    Notify.create({ type: 'positive', message: 'Servicio actualizado correctamente' })
  } else {
    await axios.post(API_URL, datos)
    Notify.create({ type: 'positive', message: 'Servicio registrado correctamente' })
  }

  dialog.value = false
  cargarServicios()
}

const confirmarEliminar = (servicio) => {
  Dialog.create({
    title: 'Confirmar eliminación',
    message: `¿Seguro que deseas eliminar el servicio "${servicio.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await axios.delete(`${API_URL}/${servicio.id}`)
    Notify.create({ type: 'positive', message: 'Servicio eliminado correctamente' })
    cargarServicios()
  })
}

onMounted(() => {
  cargarServicios()
})
</script>