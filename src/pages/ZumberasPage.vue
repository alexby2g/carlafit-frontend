<template>
  <q-page class="zumberas-page q-pa-md">

    <div class="page-header q-mb-md">
      <div>
        <div class="text-h4 text-weight-bold title-responsive">
          👩 Zumberas
        </div>
        <div class="text-grey-7">
          Registro de alumnas, contactos y comunicación
        </div>
      </div>

      <q-btn
        class="btn-primary"
        icon="add"
        label="Nueva Zumbera"
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
      placeholder="Buscar por nombre, teléfono, dirección o estado..."
      class="search-box q-mb-md"
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
      :grid="$q.screen.lt.md"
    >
      <template v-slot:item="props">
        <div class="q-pa-xs col-12">
          <q-card class="mobile-card">
            <q-card-section>
              <div class="row items-start justify-between">
                <div>
                  <div class="mobile-title">
                    {{ props.row.nombre }}
                  </div>
                  <div class="text-grey-7">
                    📞 {{ props.row.telefono || 'Sin teléfono' }}
                  </div>
                  <div class="text-grey-7">
                    📍 {{ props.row.direccion || 'Sin dirección' }}
                  </div>
                </div>

                <q-badge :color="props.row.activo ? 'positive' : 'negative'">
                  {{ props.row.activo ? 'Activa' : 'Inactiva' }}
                </q-badge>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="q-pa-sm">
              <q-btn
                v-if="props.row.telefono"
                class="btn-whatsapp"
                icon="chat"
                label="WhatsApp"
                dense
                unelevated
                rounded
                @click="enviarWhatsApp(props.row)"
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

      <template v-slot:body-cell-activo="props">
        <q-td :props="props">
          <q-badge :color="props.row.activo ? 'positive' : 'negative'">
            {{ props.row.activo ? 'Activa' : 'Inactiva' }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props" class="q-gutter-xs">
          <q-btn
            v-if="props.row.telefono"
            dense
            round
            unelevated
            color="green"
            icon="chat"
            @click="enviarWhatsApp(props.row)"
          >
            <q-tooltip>Enviar WhatsApp</q-tooltip>
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

    <q-dialog v-model="dialog">
      <q-card class="form-card">
        <q-card-section class="form-header">
          <div>
            <div class="text-h6 text-weight-bold">
              {{ modoEditar ? 'Editar Zumbera' : 'Registrar Zumbera' }}
            </div>
            <div class="text-caption text-purple-1">
              Puedes importar nombre y teléfono desde tus contactos
            </div>
          </div>

          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>

        <q-card-section class="form-body">
          <q-btn
            class="btn-contact q-mb-md"
            icon="contacts"
            label="Importar contacto del teléfono"
            unelevated
            rounded
            @click="importarContacto"
          />

          <q-input
            v-model="form.nombre"
            label="Nombre"
            outlined
            dense
            class="q-mb-md"
          />

          <q-input
            v-model="form.telefono"
            label="Teléfono"
            outlined
            dense
            class="q-mb-md"
            mask="###########"
          />

          <q-input
            v-model="form.direccion"
            label="Dirección"
            outlined
            dense
            class="q-mb-md"
          />

          <q-toggle
            v-model="form.activo"
            label="Zumbera activa"
            color="purple"
          />
        </q-card-section>

        <q-card-actions class="form-actions">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn
            class="btn-save"
            icon="save"
            label="Guardar"
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
import { ref, onMounted } from 'vue'
import { Notify, Dialog, useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()

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
  try {
    const res = await axios.get(API_URL)
    zumberas.value = res.data.data || []
  } catch (error) {
    console.error(error)
    Notify.create({
      type: 'negative',
      message: 'Error al cargar zumberas'
    })
  }
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

const limpiarTelefono = (telefono) => {
  return String(telefono || '')
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .replace(/\+/g, '')
}

const importarContacto = async () => {
  try {
    const { Contacts } = await import('@capacitor-community/contacts')

    const permiso = await Contacts.requestPermissions()

    if (permiso.contacts !== 'granted') {
      Notify.create({
        type: 'warning',
        message: 'Permiso de contactos denegado'
      })
      return
    }

    const resultado = await Contacts.pickContact({
      projection: {
        name: true,
        phones: true
      }
    })

    const contacto = resultado.contact

    if (!contacto) {
      Notify.create({
        type: 'warning',
        message: 'No se seleccionó ningún contacto'
      })
      return
    }

    const nombre =
      contacto.name?.display ||
      contacto.name?.given ||
      contacto.displayName ||
      ''

    const telefono =
      contacto.phones?.[0]?.number ||
      contacto.phoneNumbers?.[0]?.number ||
      ''

    form.value.nombre = nombre || form.value.nombre
    form.value.telefono = limpiarTelefono(telefono)

    Notify.create({
      type: 'positive',
      message: 'Contacto importado correctamente'
    })
  } catch (error) {
    console.error(error)

    Notify.create({
      type: 'warning',
      message: 'La importación de contactos funciona en Android. En navegador puede no estar disponible.'
    })
  }
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

  try {
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
    await cargarZumberas()
  } catch (error) {
    console.error(error)
    Notify.create({
      type: 'negative',
      message: 'No se pudo guardar la zumbera'
    })
  }
}

const enviarWhatsApp = (zumbera) => {
  if (!zumbera.telefono) {
    Notify.create({
      type: 'warning',
      message: 'Esta zumbera no tiene teléfono registrado'
    })
    return
  }

  const telefono = limpiarTelefono(zumbera.telefono)

  const mensaje = `Hola ${zumbera.nombre}, te saludamos de CarlaFit 💜. Queríamos recordarte que estamos felices de acompañarte en tu entrenamiento.`

  const url = `https://wa.me/591${telefono}?text=${encodeURIComponent(mensaje)}`

  window.open(url, '_blank')
}

const confirmarEliminar = (zumbera) => {
  Dialog.create({
    title: 'Confirmar eliminación',
    message: `¿Seguro que deseas eliminar a ${zumbera.nombre}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await axios.delete(`${API_URL}/${zumbera.id}`)

      Notify.create({
        type: 'positive',
        message: 'Zumbera eliminada correctamente'
      })

      await cargarZumberas()
    } catch (error) {
      console.error(error)
      Notify.create({
        type: 'negative',
        message: 'No se pudo eliminar la zumbera'
      })
    }
  })
}

onMounted(() => {
  cargarZumberas()
})
</script>

<style scoped>
.zumberas-page {
  background: #f7f5fb;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.title-responsive {
  color: #2f2540;
}

.search-box {
  background: white;
  border-radius: 14px;
}

.btn-primary,
.btn-save {
  background: linear-gradient(135deg, #6a1b9a, #ab47bc);
  color: white;
  box-shadow: 0 8px 18px rgba(106, 27, 154, 0.35);
}

.btn-contact {
  width: 100%;
  background: linear-gradient(135deg, #512da8, #7e57c2);
  color: white;
}

.btn-whatsapp {
  background: linear-gradient(135deg, #128c7e, #25d366);
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

.mobile-card {
  border-radius: 18px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
}

.mobile-title {
  font-size: 20px;
  font-weight: 800;
  color: #6a1b9a;
}

.form-card {
  width: 450px;
  max-width: 94vw;
  border-radius: 22px;
  overflow: hidden;
}

.form-header {
  background: linear-gradient(135deg, #6a1b9a, #ab47bc);
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
  .zumberas-page {
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