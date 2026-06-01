<template>
  <q-page class="zumberas-page q-pa-md">
    <div class="hero-card q-mb-lg">
      <div class="hero-badge">Gestión de zumberas</div>

      <div class="hero-title">👩 Zumberas CarlaFit</div>

      <div class="hero-subtitle">
        Administra alumnas, importa contactos y envía mensajes por WhatsApp
      </div>

      <div class="hero-actions">
        <q-btn class="hero-btn" icon="contacts" label="Importar contactos" @click="abrirDialogCrearConContacto" />
        <q-btn class="hero-btn" icon="add" label="Nueva zumbera" @click="abrirDialogCrear" />
        <q-btn class="hero-btn" icon="refresh" label="Actualizar" @click="cargarZumberas" />
      </div>
    </div>

    <div class="stats-grid q-mb-lg">
      <q-card class="stat-card">
        <q-card-section>
          <div class="stat-label">Zumberas</div>
          <div class="stat-number">{{ totalZumberas }}</div>
          <div class="stat-text">Registradas</div>
        </q-card-section>
        <q-icon name="groups" class="stat-icon purple" />
      </q-card>

      <q-card class="stat-card">
        <q-card-section>
          <div class="stat-label">Activas</div>
          <div class="stat-number">{{ totalActivas }}</div>
          <div class="stat-text">Actualmente activas</div>
        </q-card-section>
        <q-icon name="verified" class="stat-icon green" />
      </q-card>

      <q-card class="stat-card">
        <q-card-section>
          <div class="stat-label">Con teléfono</div>
          <div class="stat-number">{{ totalConTelefono }}</div>
          <div class="stat-text">Pueden usar WhatsApp</div>
        </q-card-section>
        <q-icon name="phone" class="stat-icon whatsapp" />
      </q-card>
    </div>

    <q-input
      v-model="filtro"
      outlined
      dense
      clearable
      debounce="300"
      placeholder="Buscar por nombre, teléfono o dirección..."
      class="search-box q-mb-md"
    >
      <template v-slot:prepend>
        <q-icon name="search" color="purple" />
      </template>
    </q-input>

    <q-table
      title="Lista de Zumberas"
      :rows="zumberasFiltradas"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :grid="$q.screen.lt.md"
    >
      <template v-slot:item="props">
        <div class="q-pa-xs col-12">
          <q-card class="mobile-card">
            <q-card-section>
              <div class="row items-start justify-between">
                <div>
                  <div class="mobile-title">{{ props.row.nombre }}</div>
                  <div class="text-grey-7">📞 {{ props.row.telefono || 'Sin teléfono' }}</div>
                  <div class="text-grey-7">📍 {{ props.row.direccion || 'Sin dirección' }}</div>
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

              <q-btn class="btn-edit" icon="edit" label="Editar" dense unelevated rounded @click="abrirDialogEditar(props.row)" />
              <q-btn class="btn-delete" icon="delete" label="Eliminar" dense unelevated rounded @click="confirmarEliminar(props.row)" />
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
          <q-btn v-if="props.row.telefono" dense round unelevated color="green" icon="chat" @click="enviarWhatsApp(props.row)">
            <q-tooltip>Enviar WhatsApp</q-tooltip>
          </q-btn>

          <q-btn dense round unelevated color="blue-7" icon="edit" @click="abrirDialogEditar(props.row)">
            <q-tooltip>Editar</q-tooltip>
          </q-btn>

          <q-btn dense round unelevated color="red-7" icon="delete" @click="confirmarEliminar(props.row)">
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
            label="Ver contactos del teléfono"
            unelevated
            rounded
            :loading="cargandoContactos"
            @click="cargarContactosTelefono"
          />

          <q-input v-model="form.nombre" label="Nombre" outlined dense class="q-mb-md" />
          <q-input v-model="form.telefono" label="Teléfono" outlined dense class="q-mb-md" />
          <q-input v-model="form.direccion" label="Dirección" outlined dense class="q-mb-md" />

          <q-toggle v-model="form.activo" label="Zumbera activa" color="purple" />
        </q-card-section>

        <q-card-actions class="form-actions">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn class="btn-save" icon="save" label="Guardar" unelevated rounded @click="guardar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogContactos" maximized>
      <q-card class="contactos-card">
        <q-card-section class="contactos-header">
          <div>
            <div class="text-h5 text-weight-bold">
              📱 Importar contactos
            </div>
            <div class="text-subtitle2">
              Selecciona un contacto del teléfono para guardarlo como zumbera
            </div>
          </div>

          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="filtroContactos"
            outlined
            rounded
            clearable
            debounce="300"
            placeholder="Buscar por nombre o teléfono"
            class="contact-search q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="purple" />
            </template>
          </q-input>

          <div class="chips-row q-mb-md">
            <q-chip color="purple" text-color="white" icon="contacts">
              {{ contactosTelefono.length }} contacto(s)
            </q-chip>

            <q-chip color="green" text-color="white" icon="person_add">
              {{ contactosFiltrados.length }} visible(s)
            </q-chip>
          </div>

          <q-list bordered separator class="contactos-list">
            <q-item
              v-for="contacto in contactosFiltrados"
              :key="contacto.id"
              clickable
              v-ripple
              @click="seleccionarContacto(contacto)"
            >
              <q-item-section avatar>
                <q-avatar color="purple" text-color="white" icon="person" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ contacto.nombre }}
                </q-item-label>
                <q-item-label caption>
                  {{ contacto.telefono }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-icon name="add_circle" color="green" size="30px" />
              </q-item-section>
            </q-item>

            <q-item v-if="contactosFiltrados.length === 0">
              <q-item-section class="text-center text-grey-7 q-pa-lg">
                No se encontraron contactos
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions class="contactos-actions">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn class="btn-reload" icon="refresh" label="Volver a cargar" unelevated rounded @click="cargarContactosTelefono" />
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

const API_URL = 'https://carlafit-backend.onrender.com/api/zumberas'

const dialog = ref(false)
const dialogContactos = ref(false)
const modoEditar = ref(false)
const zumberas = ref([])
const contactosTelefono = ref([])
const filtro = ref('')
const filtroContactos = ref('')
const cargandoContactos = ref(false)

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

const zumberasFiltradas = computed(() => {
  const texto = filtro.value.toLowerCase().trim()
  if (!texto) return zumberas.value

  return zumberas.value.filter(z => {
    return (
      String(z.nombre || '').toLowerCase().includes(texto) ||
      String(z.telefono || '').toLowerCase().includes(texto) ||
      String(z.direccion || '').toLowerCase().includes(texto) ||
      String(z.activo ? 'activa' : 'inactiva').includes(texto)
    )
  })
})

const contactosFiltrados = computed(() => {
  const texto = filtroContactos.value.toLowerCase().trim()
  if (!texto) return contactosTelefono.value

  return contactosTelefono.value.filter(c => {
    return (
      String(c.nombre || '').toLowerCase().includes(texto) ||
      String(c.telefono || '').toLowerCase().includes(texto)
    )
  })
})

const totalZumberas = computed(() => zumberas.value.length)
const totalActivas = computed(() => zumberas.value.filter(z => z.activo).length)
const totalConTelefono = computed(() => zumberas.value.filter(z => z.telefono).length)

const limpiarTelefono = (telefono) => {
  return String(telefono || '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
}

const telefonoWhatsApp = (telefono) => {
  let limpio = limpiarTelefono(telefono)

  if (limpio.startsWith('+')) {
    limpio = limpio.substring(1)
  }

  if (limpio.startsWith('591')) {
    return limpio
  }

  if (limpio.startsWith('0')) {
    return `591${limpio.substring(1)}`
  }

  return `591${limpio}`
}

const obtenerNombreContacto = (contacto) => {
  return (
    contacto.name?.display ||
    contacto.name?.given ||
    contacto.displayName ||
    contacto.name?.family ||
    'Sin nombre'
  )
}

const obtenerTelefonoContacto = (contacto) => {
  return (
    contacto.phones?.[0]?.number ||
    contacto.phoneNumbers?.[0]?.number ||
    contacto.phones?.[0]?.value ||
    ''
  )
}

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

const abrirDialogCrearConContacto = async () => {
  abrirDialogCrear()
  await cargarContactosTelefono()
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

const cargarContactosTelefono = async () => {
  try {
    cargandoContactos.value = true

    const { Contacts } = await import('@capacitor-community/contacts')

    const permiso = await Contacts.requestPermissions()

    if (permiso.contacts !== 'granted') {
      Notify.create({
        type: 'warning',
        message: 'Permiso de contactos denegado'
      })
      return
    }

    const resultado = await Contacts.getContacts({
      projection: {
        name: true,
        phones: true
      }
    })

    contactosTelefono.value = (resultado.contacts || [])
      .map((contacto, index) => {
        const nombre = obtenerNombreContacto(contacto)
        const telefono = limpiarTelefono(obtenerTelefonoContacto(contacto))

        return {
          id: `${nombre}-${telefono}-${index}`,
          nombre,
          telefono
        }
      })
      .filter(c => c.telefono)

    filtroContactos.value = ''
    dialogContactos.value = true
  } catch (error) {
    console.error(error)
    Notify.create({
      type: 'negative',
      message: 'No se pudieron cargar los contactos'
    })
  } finally {
    cargandoContactos.value = false
  }
}

const seleccionarContacto = (contacto) => {
  form.value.nombre = contacto.nombre
  form.value.telefono = contacto.telefono

  dialogContactos.value = false

  Notify.create({
    type: 'positive',
    message: 'Contacto importado correctamente'
  })
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

  const telefono = telefonoWhatsApp(zumbera.telefono)
  const mensaje = `Hola ${zumbera.nombre}, te saludamos de CarlaFit 💜. Queríamos recordarte que estamos felices de acompañarte en tu entrenamiento.`
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`

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
  background: linear-gradient(180deg, #fff1fb, #f7f5fb);
  min-height: 100vh;
}

.hero-card {
  padding: 28px;
  border-radius: 32px;
  background: linear-gradient(135deg, #7b1fa2, #9c27b0, #ce5bd8);
  color: white;
  box-shadow: 0 16px 35px rgba(123, 31, 162, 0.25);
  position: relative;
  overflow: hidden;
}

.hero-card::after {
  content: "";
  position: absolute;
  width: 260px;
  height: 260px;
  right: -70px;
  top: -60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
}

.hero-badge {
  display: inline-block;
  padding: 10px 22px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 18px;
}

.hero-title {
  font-size: 38px;
  font-weight: 900;
  position: relative;
  z-index: 2;
}

.hero-subtitle {
  font-size: 18px;
  font-weight: 500;
  opacity: 0.95;
  margin-top: 8px;
  margin-bottom: 26px;
  position: relative;
  z-index: 2;
}

.hero-actions {
  display: grid;
  gap: 14px;
  position: relative;
  z-index: 2;
}

.hero-btn {
  height: 56px;
  border-radius: 22px;
  background: white;
  color: #8e24aa;
  font-weight: 900;
  font-size: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.stat-card {
  border-radius: 26px;
  min-height: 130px;
  box-shadow: 0 12px 26px rgba(123, 31, 162, 0.12);
  position: relative;
  overflow: hidden;
}

.stat-label {
  color: #777;
  font-weight: 800;
  font-size: 16px;
}

.stat-number {
  font-size: 34px;
  font-weight: 900;
  color: #222;
}

.stat-text {
  color: #888;
  font-size: 14px;
}

.stat-icon {
  position: absolute;
  right: 22px;
  top: 34px;
  font-size: 52px;
  color: white;
  padding: 16px;
  border-radius: 50%;
}

.stat-icon.purple {
  background: #8e24aa;
}

.stat-icon.green {
  background: #43a047;
}

.stat-icon.whatsapp {
  background: #25d366;
}

.search-box,
.contact-search {
  background: white;
  border-radius: 18px;
}

.btn-save,
.btn-primary {
  background: linear-gradient(135deg, #6a1b9a, #ab47bc);
  color: white;
}

.btn-contact {
  width: 100%;
  height: 54px;
  background: linear-gradient(135deg, #512da8, #7e57c2);
  color: white;
  font-weight: 800;
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

.btn-reload {
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  color: white;
}

.mobile-card {
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.mobile-title {
  font-size: 20px;
  font-weight: 900;
  color: #6a1b9a;
}

.form-card {
  width: 470px;
  max-width: 94vw;
  border-radius: 28px;
  overflow: hidden;
}

.form-header,
.contactos-header {
  background: linear-gradient(135deg, #7b1fa2, #ab47bc);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px;
}

.form-body {
  padding: 22px;
}

.form-actions {
  padding: 14px 22px 22px;
  justify-content: flex-end;
}

.contactos-card {
  background: #fff7fd;
}

.contactos-list {
  border-radius: 20px;
  overflow: hidden;
  background: white;
}

.chips-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.contactos-actions {
  padding: 18px;
  justify-content: space-between;
  position: sticky;
  bottom: 0;
  background: #fff7fd;
}

@media (max-width: 700px) {
  .zumberas-page {
    padding: 10px;
  }

  .hero-card {
    padding: 22px;
    border-radius: 28px;
  }

  .hero-title {
    font-size: 34px;
  }

  .hero-subtitle {
    font-size: 17px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
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

  .contactos-actions {
    flex-direction: column;
  }

  .contactos-actions .q-btn {
    width: 100%;
  }
}
</style>