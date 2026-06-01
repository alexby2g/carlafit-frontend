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
      <template v-slot:item="props">
        <div class="q-pa-xs col-12">
          <q-card class="mobile-card">
            <q-card-section>
              <div class="row items-start justify-between">
                <div>
                  <div class="mobile-title">
                    {{ props.row.zumbera?.nombre || 'Sin nombre' }}
                  </div>
                  <div class="text-grey-7">
                    {{ props.row.observacion || 'Sin observación' }}
                  </div>
                </div>

                <q-badge :color="props.row.estado === 'pagado' ? 'positive' : 'warning'">
                  {{ props.row.estado }}
                </q-badge>
              </div>

              <div class="row q-col-gutter-sm q-mt-md">
                <div class="col-6">
                  <div class="info-label">Monto</div>
                  <q-badge color="green" outline class="q-mt-xs">
                    Bs {{ formatoMonto(props.row.monto) }}
                  </q-badge>
                </div>

                <div class="col-6">
                  <div class="info-label">Método</div>
                  <div class="info-value">{{ props.row.metodo_pago }}</div>
                </div>

                <div class="col-12">
                  <div class="info-label">Fecha</div>
                  <div class="info-value">{{ props.row.fecha_pago }}</div>
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="q-pa-sm">
              <q-btn
                v-if="props.row.estado === 'pendiente'"
                class="btn-confirm"
                icon="check_circle"
                label="Confirmar Pago"
                dense
                unelevated
                rounded
                @click="confirmarPago(props.row)"
              />

              <q-btn
                class="btn-edit"
                icon="edit"
                label="Editar"
                dense
                unelevated
                rounded
                @click="abrirDialogEditar(props.row)"
              />

              <q-btn
                class="btn-delete"
                icon="delete"
                label="Eliminar"
                dense
                unelevated
                rounded
                @click="confirmarEliminar(props.row)"
              />
            </q-card-actions>
          </q-card>
        </div>
      </template>

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
          <q-btn
            v-if="props.row.estado === 'pendiente'"
            dense
            round
            unelevated
            color="green"
            icon="check_circle"
            @click="confirmarPago(props.row)"
          >
            <q-tooltip>Confirmar pago</q-tooltip>
          </q-btn>

          <q-btn
            dense
            round
            unelevated
            color="blue-7"
            icon="edit"
            @click="abrirDialogEditar(props.row)"
          >
            <q-tooltip>Editar</q-tooltip>
          </q-btn>

          <q-btn
            dense
            round
            unelevated
            color="red-7"
            icon="delete"
            @click="confirmarEliminar(props.row)"
          >
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
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
              Selecciona servicio y el monto se llenará solo
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
            v-model="form.servicio_id"
            :options="serviciosOptions"
            label="Servicio"
            outlined
            dense
            emit-value
            map-options
            class="q-mb-sm"
            @update:model-value="aplicarServicio"
          />

          <div v-if="servicioSeleccionado" class="resumen-card q-mb-sm">
            <div class="text-weight-bold text-green-9">
              🏃 {{ servicioSeleccionado.nombre }}
            </div>
            <div class="text-grey-8">
              {{ servicioSeleccionado.descripcion }}
            </div>
            <div class="text-weight-bold q-mt-xs">
              💰 Bs {{ formatoMonto(servicioSeleccionado.precio) }}
            </div>
          </div>

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
          <q-btn
            class="btn-save"
            :icon="form.estado === 'pagado' ? 'paid' : 'hourglass_empty'"
            :label="form.estado === 'pagado' ? 'Guardar Pago' : 'Guardar Pendiente'"
            unelevated
            rounded
            @click="guardar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Notify, Dialog } from 'quasar'
import axios from 'axios'

const API_PAGOS = 'https://carlafit-backend.onrender.com/api/pagos'
const API_ZUMBERAS = 'https://carlafit-backend.onrender.com/api/zumberas'
const API_SERVICIOS = 'https://carlafit-backend.onrender.com/api/servicios'

const dialog = ref(false)
const modoEditar = ref(false)
const filtro = ref('')

const pagos = ref([])
const zumberas = ref([])
const servicios = ref([])

const metodosPago = ['efectivo', 'qr', 'transferencia']
const estadosPago = ['pagado', 'pendiente']

const form = ref({
  id: null,
  zumbera_id: null,
  servicio_id: null,
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

const serviciosOptions = computed(() =>
  servicios.value.map(s => ({
    label: `${s.nombre} - Bs ${formatoMonto(s.precio)}`,
    value: s.id
  }))
)

const servicioSeleccionado = computed(() =>
  servicios.value.find(s => s.id === form.value.servicio_id) || null
)

const hoy = () => new Date().toISOString().slice(0, 10)

const formatoMonto = (valor) => {
  return Number(valor || 0).toFixed(2)
}

const cargarDatos = async () => {
  try {
    const [resPagos, resZumberas, resServicios] = await Promise.all([
      axios.get(API_PAGOS),
      axios.get(API_ZUMBERAS),
      axios.get(API_SERVICIOS)
    ])

    pagos.value = resPagos.data.data || []
    zumberas.value = resZumberas.data.data || []
    servicios.value = resServicios.data.data || []
  } catch (error) {
    console.error(error)
    Notify.create({
      type: 'negative',
      message: 'Error al cargar datos'
    })
  }
}

const aplicarServicio = () => {
  const servicio = servicioSeleccionado.value

  if (!servicio) return

  form.value.monto = Number(servicio.precio) || 0
  form.value.observacion = servicio.descripcion
    ? `${servicio.nombre} - ${servicio.descripcion}`
    : servicio.nombre
}

const abrirDialogCrear = () => {
  modoEditar.value = false

  form.value = {
    id: null,
    zumbera_id: null,
    servicio_id: null,
    monto: 0,
    fecha_pago: hoy(),
    metodo_pago: 'efectivo',
    estado: 'pagado',
    observacion: ''
  }

  dialog.value = true
}

const abrirDialogEditar = (pago) => {
  modoEditar.value = true

  form.value = {
    id: pago.id,
    zumbera_id: pago.zumbera_id,
    servicio_id: null,
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

  try {
    if (modoEditar.value) {
      await axios.put(`${API_PAGOS}/${form.value.id}`, datos)
      Notify.create({ type: 'positive', message: 'Pago actualizado correctamente' })
    } else {
      await axios.post(API_PAGOS, datos)
      Notify.create({ type: 'positive', message: 'Pago registrado correctamente' })
    }

    dialog.value = false
    await cargarDatos()
  } catch (error) {
    console.error(error)
    Notify.create({
      type: 'negative',
      message: 'No se pudo guardar el pago'
    })
  }
}

const confirmarPago = (pago) => {
  Dialog.create({
    title: 'Confirmar pago',
    message: `¿Deseas marcar como pagado el pago de ${pago.zumbera?.nombre || 'esta zumbera'} por Bs ${formatoMonto(pago.monto)}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await axios.put(`${API_PAGOS}/${pago.id}`, {
        zumbera_id: pago.zumbera_id,
        monto: pago.monto,
        fecha_pago: pago.fecha_pago,
        metodo_pago: pago.metodo_pago || 'efectivo',
        estado: 'pagado',
        observacion: pago.observacion
      })

      Notify.create({
        type: 'positive',
        message: 'Pago confirmado correctamente'
      })

      await cargarDatos()
    } catch (error) {
      console.error(error)
      Notify.create({
        type: 'negative',
        message: 'No se pudo confirmar el pago'
      })
    }
  })
}

const confirmarEliminar = (pago) => {
  Dialog.create({
    title: 'Confirmar eliminación',
    message: `¿Seguro que deseas eliminar el pago de ${pago.zumbera?.nombre || 'esta zumbera'} por Bs ${formatoMonto(pago.monto)}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await axios.delete(`${API_PAGOS}/${pago.id}`)
      Notify.create({ type: 'positive', message: 'Pago eliminado correctamente' })
      await cargarDatos()
    } catch (error) {
      console.error(error)
      Notify.create({
        type: 'negative',
        message: 'No se pudo eliminar el pago'
      })
    }
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

.btn-confirm {
  background: linear-gradient(135deg, #1b5e20, #43a047);
  color: white;
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

.mobile-card {
  border-radius: 18px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
}

.mobile-title {
  font-size: 20px;
  font-weight: 800;
  color: #1b5e20;
}

.info-label {
  font-size: 13px;
  color: #777;
  font-weight: 700;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  margin-top: 4px;
}

.resumen-card {
  border-radius: 16px;
  background: #e8f5e9;
  padding: 12px;
  border: 1px solid #a5d6a7;
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