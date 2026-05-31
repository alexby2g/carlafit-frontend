<template>
  <q-page class="servicios-page q-pa-md">
    <div class="page-header q-mb-md">
      <div>
        <div class="text-h4 text-weight-bold title-responsive">🏃 Servicios</div>
        <div class="text-grey-7">Planes, combos y precios de CarlaFit</div>
      </div>

      <q-btn class="btn-primary" icon="add" label="Nuevo Servicio" unelevated rounded @click="abrirDialogCrear" />
    </div>

    <q-input v-model="filtro" outlined dense clearable debounce="300" placeholder="Buscar servicio..." class="search-box q-mb-md">
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
      :grid="$q.screen.lt.md"
    >
      <template v-slot:item="props">
        <div class="q-pa-xs col-12">
          <q-card class="service-card">
            <div class="service-top" :class="tipoClase(props.row.tipo)">
              <div class="service-icon">{{ tipoIcono(props.row.tipo) }}</div>
              <div>
                <div class="service-name">{{ props.row.nombre }}</div>
                <div class="service-type">{{ props.row.tipo }}</div>
              </div>
              <q-space />
              <q-badge :color="props.row.activo ? 'positive' : 'negative'">
                {{ props.row.activo ? 'Activo' : 'Inactivo' }}
              </q-badge>
            </div>

            <q-card-section>
              <div class="service-description">
                {{ props.row.descripcion || 'Sin descripción' }}
              </div>

              <div class="price-box q-mt-md">
                <div class="info-label">Precio</div>
                <div class="price-text">Bs {{ formatoMonto(props.row.precio) }}</div>
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

      <template v-slot:body-cell-precio="props">
        <q-td :props="props">
          <q-badge color="green" outline>Bs {{ formatoMonto(props.row.precio) }}</q-badge>
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
              {{ modoEditar ? 'Editar Servicio' : 'Registrar Servicio' }}
            </div>
            <div class="text-caption text-purple-1">Completa los datos del plan</div>
          </div>

          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>

        <q-card-section class="form-body">
          <q-input v-model="form.nombre" label="Nombre del servicio" outlined dense class="q-mb-sm" />
          <q-input v-model.number="form.precio" label="Precio" type="number" outlined dense class="q-mb-sm" />
          <q-select v-model="form.tipo" :options="tipos" label="Tipo" outlined dense class="q-mb-sm" />
          <q-input v-model="form.descripcion" label="Descripción" type="textarea" outlined dense autogrow class="q-mb-sm" />
          <q-toggle v-model="form.activo" label="Servicio activo" color="purple" />
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
import { ref, onMounted } from 'vue'
import { Notify, Dialog, useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()
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
  { name: 'activo', label: 'Estado', field: row => row.activo ? 'Activo' : 'Inactivo', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const formatoMonto = (valor) => Number(valor || 0).toFixed(2)

const tipoIcono = (tipo) => {
  if (tipo === 'combo') return '🔥'
  if (tipo === 'mensual') return '📅'
  return '⚡'
}

const tipoClase = (tipo) => {
  if (tipo === 'combo') return 'combo'
  if (tipo === 'mensual') return 'mensual'
  return 'diario'
}

const cargarServicios = async () => {
  const res = await axios.get(API_URL)
  servicios.value = res.data.data
}

const abrirDialogCrear = () => {
  modoEditar.value = false
  form.value = { id: null, nombre: '', precio: 0, tipo: 'diario', descripcion: '', activo: true }
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
    Notify.create({ type: 'warning', message: 'El nombre del servicio es obligatorio' })
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

onMounted(cargarServicios)
</script>

<style scoped>
.servicios-page {
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

.service-card {
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.09);
}

.service-top {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  color: white;
}

.service-top.combo {
  background: linear-gradient(135deg, #6a1b9a, #ab47bc);
}

.service-top.mensual {
  background: linear-gradient(135deg, #1565c0, #42a5f5);
}

.service-top.diario {
  background: linear-gradient(135deg, #0b8f3a, #43a047);
}

.service-icon {
  font-size: 34px;
}

.service-name {
  font-size: 21px;
  font-weight: 900;
}

.service-type {
  text-transform: uppercase;
  font-size: 12px;
  opacity: 0.9;
}

.service-description {
  color: #555;
  font-size: 15px;
}

.price-box {
  background: #f1f8e9;
  border: 1px solid #c5e1a5;
  border-radius: 16px;
  padding: 12px;
}

.info-label {
  font-size: 13px;
  color: #777;
  font-weight: 700;
}

.price-text {
  color: #1b5e20;
  font-size: 25px;
  font-weight: 900;
}

.form-card {
  width: 430px;
  max-width: 94vw;
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
}

.form-actions {
  padding: 12px 16px 16px;
  justify-content: flex-end;
}

@media (max-width: 600px) {
  .servicios-page {
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