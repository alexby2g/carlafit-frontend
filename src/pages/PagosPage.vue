<template>
  <q-page class="pagos-page q-pa-md">
    <div class="page-header q-mb-md">
      <div>
        <div class="text-h4 text-weight-bold title-responsive">
          💰 Pagos
        </div>
        <div class="text-grey-7">
          Historial de pagos y control de ingresos
        </div>
      </div>

      <q-btn
        class="btn-primary"
        icon="add"
        label="Nuevo Pago"
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
      placeholder="Buscar pago..."
      class="search-box q-mb-md"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <q-table
      title="Historial de Pagos"
      :rows="pagos"
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

      <template v-slot:body-cell-monto="props">
        <q-td :props="props">
          <q-badge color="green" outline>
            Bs {{ formatoMonto(props.row.monto) }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-badge :color="props.row.estado === 'pagado' ? 'positive' : 'warning'">
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
              {{ modoEditar ? 'Editar Pago' : 'Registrar Pago' }}
            </div>
            <div class="text-caption text-green-1">
              Registra ingresos y pagos pendientes
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

          <q-input
            v-model.number="form.monto"
            label="Monto"
            type="number"
            outlined
            dense
            class="q-mb-sm"
          />

          <q-input
            v-model="form.fecha_pago"
            label="Fecha de pago"
            type="date"
            outlined
            dense
            class="q-mb-sm"
          />

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-select
                v-model="form.metodo_pago"
                :options="metodosPago"
                label="Método"
                outlined
                dense
                class="q-mb-sm"
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-select
                v-model="form.estado"
                :options="estadosPago"
                label="Estado"
                outlined
                dense
                class="q-mb-sm"
              />
            </div>
          </div>

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
import { ref, onMounted, computed } from 'vue'
import { Notify, Dialog, useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()

const API_PAGOS = 'https://carlafit-backend.onrender.com/api/pagos'
const API_ZUMBERAS = 'https://carlafit-backend.onrender.com/api/zumberas'

const dialog = ref(false)
const modoEditar = ref(false)
const filtro = ref('')

const pagos = ref([])
const zumberas = ref([])

const metodosPago = ['efectivo', 'qr', 'transferencia']
const estadosPago = ['pagado', 'pendiente']

const form = ref({
  id: null,
  zumbera_id: null,
  monto: 0,
  fecha_pago: '',
  metodo_pago: 'efectivo',
  estado: 'pagado',
  observacion: ''
})

const columns = [
  { name: 'zumbera', label: 'Zumbera', field: row => row.zumbera?.nombre || '', align: 'left', sortable: true },
  { name: 'monto', label: 'Monto', field: row => String(row.monto), align: 'center', sortable: true },
  { name: 'fecha_pago', label: 'Fecha', field: 'fecha_pago', align: 'center', sortable: true },
  { name: 'metodo_pago', label: 'Método', field: 'metodo_pago', align: 'center', sortable: true },
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

const hoy = () => new Date().toISOString().slice(0, 10)

const formatoMonto = (valor) => {
  return Number(valor || 0).toFixed(2)
}

const cargarDatos = async () => {
  const [resPagos, resZumberas] = await Promise.all([
    axios.get(API_PAGOS),
    axios.get(API_ZUMBERAS)
  ])

  pagos.value = resPagos.data.data
  zumberas.value = resZumberas.data.data
}

const abrirDialogCrear = () => {
  modoEditar.value = false

  form.value = {
    id: null,
    zumbera_id: null,
    monto: 320,
    fecha_pago: hoy(),
    metodo_pago: 'efectivo',
    estado: 'pagado',
    observacion: 'Combo mensual Zumba + Té'
  }

  dialog.value = true
}

const abrirDialogEditar = (pago) => {
  modoEditar.value = true

  form.value = {
    id: pago.id,
    zumbera_id: pago.zumbera_id,
    monto: Number(pago.monto) || 0,
    fecha_pago: pago.fecha_pago || hoy(),
    metodo_pago: pago.metodo_pago || 'efectivo',
    estado: pago.estado || 'pagado',
    observacion: pago.observacion || ''
  }

  dialog.value = true
}

const guardar = async () => {
  if (!form.value.zumbera_id) {
    Notify.create({ type: 'warning', message: 'Debe seleccionar una zumbera' })
    return
  }

  if (form.value.monto < 0) {
    Notify.create({ type: 'warning', message: 'El monto no puede ser negativo' })
    return
  }

  if (!form.value.fecha_pago) {
    Notify.create({ type: 'warning', message: 'Debe ingresar la fecha del pago' })
    return
  }

  const datos = {
    zumbera_id: form.value.zumbera_id,
    monto: form.value.monto,
    fecha_pago: form.value.fecha_pago,
    metodo_pago: form.value.metodo_pago,
    estado: form.value.estado,
    observacion: form.value.observacion
  }

  if (modoEditar.value) {
    await axios.put(`${API_PAGOS}/${form.value.id}`, datos)
    Notify.create({ type: 'positive', message: 'Pago actualizado correctamente' })
  } else {
    await axios.post(API_PAGOS, datos)
    Notify.create({ type: 'positive', message: 'Pago registrado correctamente' })
  }

  dialog.value = false
  cargarDatos()
}

const confirmarEliminar = (pago) => {
  Dialog.create({
    title: 'Confirmar eliminación',
    message: `¿Seguro que deseas eliminar el pago de ${pago.zumbera?.nombre || 'esta zumbera'} por Bs ${pago.monto}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await axios.delete(`${API_PAGOS}/${pago.id}`)
    Notify.create({ type: 'positive', message: 'Pago eliminado correctamente' })
    cargarDatos()
  })
}

onMounted(cargarDatos)
</script>

<style scoped>
.pagos-page {
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
  background: linear-gradient(135deg, #0b8f3a, #43a047);
  color: white;
  box-shadow: 0 8px 18px rgba(11, 143, 58, 0.35);
}

.search-box {
  background: white;
  border-radius: 14px;
}

.form-card {
  width: 450px;
  max-width: 94vw;
  border-radius: 22px;
  overflow: hidden;
}

.form-header {
  background: linear-gradient(135deg, #0b8f3a, #43a047);
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
  .pagos-page {
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