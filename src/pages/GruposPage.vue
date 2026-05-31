<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4 text-weight-bold">
        ⏰ Grupos
      </div>

      <q-btn
        color="purple"
        icon="add"
        label="Nuevo Grupo"
        @click="abrirDialogCrear"
      />
    </div>

    <q-input
      v-model="filtro"
      outlined
      dense
      clearable
      debounce="300"
      placeholder="Buscar grupo, horario, cupo, inscritas o estado..."
      class="q-mb-md"
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
        <q-td :props="props">
          <q-btn
            dense
            flat
            round
            color="primary"
            icon="edit"
            @click="abrirDialogEditar(props.row)"
          />

          <q-btn
            dense
            flat
            round
            color="negative"
            icon="delete"
            @click="confirmarEliminar(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog">
      <q-card style="min-width:430px">
        <q-card-section>
          <div class="text-h6">
            {{ modoEditar ? 'Editar Grupo' : 'Registrar Grupo' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="form.nombre"
            label="Nombre del grupo"
            outlined
            class="q-mb-md"
          />

          <q-input
            v-model="form.hora_inicio"
            label="Hora inicio"
            type="time"
            outlined
            class="q-mb-md"
          />

          <q-input
            v-model="form.hora_fin"
            label="Hora fin"
            type="time"
            outlined
            class="q-mb-md"
          />

          <q-input
            v-model.number="form.cupo_maximo"
            label="Cupo máximo"
            type="number"
            outlined
            class="q-mb-md"
          />

          <q-toggle
            v-model="form.activo"
            label="Grupo activo"
            color="purple"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />

          <q-btn
            color="purple"
            label="Guardar"
            @click="guardar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Notify, Dialog } from 'quasar'
import axios from 'axios'

const API_URL = 'https://carlafit-backend.onrender.com/api'

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
  {
    name: 'nombre',
    label: 'Grupo',
    field: 'nombre',
    align: 'left',
    sortable: true
  },
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
    field: row => String(row.inscripciones_count),
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
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center'
  }
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
    Notify.create({
      type: 'warning',
      message: 'El nombre del grupo es obligatorio'
    })
    return
  }

  if (!form.value.hora_inicio || !form.value.hora_fin) {
    Notify.create({
      type: 'warning',
      message: 'Debe ingresar la hora de inicio y fin'
    })
    return
  }

  if (form.value.cupo_maximo < 1) {
    Notify.create({
      type: 'warning',
      message: 'El cupo máximo debe ser mayor a 0'
    })
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

    Notify.create({
      type: 'positive',
      message: 'Grupo actualizado correctamente'
    })
  } else {
    await axios.post(API_URL, datos)

    Notify.create({
      type: 'positive',
      message: 'Grupo registrado correctamente'
    })
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

    Notify.create({
      type: 'positive',
      message: 'Grupo eliminado correctamente'
    })

    cargarGrupos()
  })
}

onMounted(() => {
  cargarGrupos()
})
</script>