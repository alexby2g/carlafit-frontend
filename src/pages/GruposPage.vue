<template>
  <q-page class="grupos-page q-pa-md">
    <div class="page-header q-mb-md">
      <div>
        <div class="text-h4 text-weight-bold title-responsive">
          ⏰ Grupos
        </div>
        <div class="text-grey-7">
          Horarios, cupos y grupos activos
        </div>
      </div>

      <q-btn
        class="btn-primary"
        icon="add"
        label="Nuevo Grupo"
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
      placeholder="Buscar grupo..."
      class="search-box q-mb-md"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <q-table
      title="Lista de Grupos"
      :rows="grupos"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :filter="filtro"
      :grid="$q.screen.lt.md"
    >
      <template v-slot:body-cell-horario="props">
        <q-td :props="props">
          {{ props.row.hora_inicio }} - {{ props.row.hora_fin }}
        </q-td>
      </template>

      <template v-slot:body-cell-inscripciones_count="props">
        <q-td :props="props">
          <q-badge color="purple">
            {{ props.row.inscripciones_count }} inscritas
          </q-badge>
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
              {{ modoEditar ? 'Editar Grupo' : 'Registrar Grupo' }}
            </div>
            <div class="text-caption text-purple-1">
              Configura horario y cupo máximo
            </div>
          </div>

          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>

        <q-card-section class="form-body">
          <q-input
            v-model="form.nombre"
            label="Nombre del grupo"
            outlined
            dense
            class="q-mb-sm"
          />

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.hora_inicio"
                label="Hora inicio"
                type="time"
                outlined
                dense
                class="q-mb-sm"
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.hora_fin"
                label="Hora fin"
                type="time"
                outlined
                dense
                class="q-mb-sm"
              />
            </div>
          </div>

          <q-input
            v-model.number="form.cupo_maximo"
            label="Cupo máximo"
            type="number"
            outlined
            dense
            class="q-mb-sm"
          />

          <q-toggle
            v-model="form.activo"
            label="Grupo activo"
            color="purple"
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
import { ref, onMounted } from 'vue'
import { Notify, Dialog, useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()
const API_URL = 'https://carlafit-backend.onrender.com/api/grupos'

const dialog = ref(false)
const modoEditar = ref(false)
const grupos = ref([])
const filtro = ref('')

const form = ref({
  id: null,
  nombre: '',
  hora_inicio: '',
  hora_fin: '',
  cupo_maximo: 30,
  activo: true
})

const columns = [
  { name: 'nombre', label: 'Grupo', field: 'nombre', align: 'left', sortable: true },
  {
    name: 'horario',
    label: 'Horario',
    field: row => `${row.hora_inicio} ${row.hora_fin}`,
    align: 'center',
    sortable: true
  },
  {
    name: 'cupo_maximo',
    label: 'Cupo Máximo',
    field: row => String(row.cupo_maximo),
    align: 'center',
    sortable: true
  },
  {
    name: 'inscripciones_count',
    label: 'Inscritas',
    field: row => String(row.inscripciones_count || 0),
    align: 'center',
    sortable: true
  },
  {
    name: 'activo',
    label: 'Estado',
    field: row => row.activo ? 'Activo' : 'Inactivo',
    align: 'center',
    sortable: true
  },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const cargarGrupos = async () => {
  const res = await axios.get(API_URL)
  grupos.value = res.data.data
}

const limpiarHora = (hora) => {
  if (!hora) return ''
  return hora.substring(0, 5)
}

const abrirDialogCrear = () => {
  modoEditar.value = false

  form.value = {
    id: null,
    nombre: '',
    hora_inicio: '09:00',
    hora_fin: '10:00',
    cupo_maximo: 30,
    activo: true
  }

  dialog.value = true
}

const abrirDialogEditar = (grupo) => {
  modoEditar.value = true

  form.value = {
    id: grupo.id,
    nombre: grupo.nombre || '',
    hora_inicio: limpiarHora(grupo.hora_inicio),
    hora_fin: limpiarHora(grupo.hora_fin),
    cupo_maximo: Number(grupo.cupo_maximo) || 30,
    activo: Boolean(grupo.activo)
  }

  dialog.value = true
}

const guardar = async () => {
  if (!form.value.nombre) {
    Notify.create({ type: 'warning', message: 'El nombre del grupo es obligatorio' })
    return
  }

  if (!form.value.hora_inicio || !form.value.hora_fin) {
    Notify.create({ type: 'warning', message: 'Debe ingresar la hora de inicio y fin' })
    return
  }

  if (form.value.cupo_maximo < 1) {
    Notify.create({ type: 'warning', message: 'El cupo máximo debe ser mayor a 0' })
    return
  }

  const datos = {
    nombre: form.value.nombre,
    hora_inicio: form.value.hora_inicio,
    hora_fin: form.value.hora_fin,
    cupo_maximo: form.value.cupo_maximo,
    activo: form.value.activo
  }

  if (modoEditar.value) {
    await axios.put(`${API_URL}/${form.value.id}`, datos)
    Notify.create({ type: 'positive', message: 'Grupo actualizado correctamente' })
  } else {
    await axios.post(API_URL, datos)
    Notify.create({ type: 'positive', message: 'Grupo registrado correctamente' })
  }

  dialog.value = false
  cargarGrupos()
}

const confirmarEliminar = (grupo) => {
  Dialog.create({
    title: 'Confirmar eliminación',
    message: `¿Seguro que deseas eliminar el grupo "${grupo.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await axios.delete(`${API_URL}/${grupo.id}`)
    Notify.create({ type: 'positive', message: 'Grupo eliminado correctamente' })
    cargarGrupos()
  })
}

onMounted(cargarGrupos)
</script>

<style scoped>
.grupos-page {
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
  .grupos-page {
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