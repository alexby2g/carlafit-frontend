<template>
  <q-page class="zumberas-page q-pa-md">
    <div class="hero-card q-mb-lg">
      <div class="hero-badge">Gestión de zumberas</div>
      <div class="hero-title">👩 Zumberas CarlaFit</div>
      <div class="hero-subtitle">
        Administra alumnas, importa contactos, revisa perfiles y envía WhatsApp
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
                class="btn-profile"
                icon="person"
                label="Perfil"
                dense
                unelevated
                rounded
                :loading="cargandoPerfil && zumberaSeleccionada?.id === props.row.id"
                @click="abrirPerfil(props.row)"
              />

              <q-btn
                v-if="props.row.telefono"
                class="btn-whatsapp"
                icon="chat"
                label="WhatsApp"
                dense
                unelevated
                rounded
                @click="abrirMenuWhatsApp(props.row)"
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
          <q-btn
            dense
            round
            unelevated
            color="purple"
            icon="person"
            :loading="cargandoPerfil && zumberaSeleccionada?.id === props.row.id"
            @click="abrirPerfil(props.row)"
          >
            <q-tooltip>Ver perfil</q-tooltip>
          </q-btn>

          <q-btn
            v-if="props.row.telefono"
            dense
            round
            unelevated
            color="green"
            icon="chat"
            @click="abrirMenuWhatsApp(props.row)"
          >
            <q-tooltip>WhatsApp inteligente</q-tooltip>
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

    <q-dialog v-model="dialogPerfil" maximized>
      <q-card class="perfil-card">
        <q-card-section class="perfil-header">
          <div class="perfil-top">
            <q-avatar size="84px" color="white" text-color="purple" icon="person" />

            <div class="perfil-main">
              <div class="perfil-name">
                {{ perfil.zumbera?.nombre || 'Zumbera' }}
              </div>

              <div class="perfil-sub">
                📞 {{ perfil.zumbera?.telefono || 'Sin teléfono' }}
              </div>

              <div class="perfil-sub">
                📍 {{ perfil.zumbera?.direccion || 'Sin dirección' }}
              </div>

              <q-badge :color="perfil.zumbera?.activo ? 'positive' : 'negative'" class="q-mt-sm">
                {{ perfil.zumbera?.activo ? 'Activa' : 'Inactiva' }}
              </q-badge>
            </div>

            <q-btn flat round dense icon="close" color="white" v-close-popup />
          </div>

          <div class="perfil-actions q-mt-md">
            <q-btn
              v-if="perfil.zumbera?.telefono"
              class="perfil-action whatsapp"
              icon="chat"
              label="WhatsApp"
              unelevated
              rounded
              @click="abrirMenuWhatsApp(perfil.zumbera)"
            />

            <q-btn
              v-if="perfil.zumbera?.telefono"
              class="perfil-action whatsapp-call"
              icon="phone_in_talk"
              label="Llamar por WhatsApp"
              unelevated
              rounded
              @click="llamarPorWhatsApp(perfil.zumbera)"
            />

            <q-btn
              v-if="perfil.zumbera?.telefono"
              class="perfil-action call"
              icon="call"
              label="Llamar"
              unelevated
              rounded
              @click="llamarTelefono(perfil.zumbera.telefono)"
            />

            <q-btn
              class="perfil-action edit"
              icon="edit"
              label="Editar"
              unelevated
              rounded
              @click="abrirDialogEditar(perfil.zumbera)"
            />
          </div>
        </q-card-section>

        <q-card-section>
          <div class="perfil-stats q-mb-md">
            <q-card class="perfil-stat green">
              <div class="perfil-stat-number">Bs {{ formatoMonto(perfil.resumen.total_pagado) }}</div>
              <div class="perfil-stat-label">Total pagado</div>
            </q-card>

            <q-card class="perfil-stat orange">
              <div class="perfil-stat-number">Bs {{ formatoMonto(perfil.resumen.total_pendiente) }}</div>
              <div class="perfil-stat-label">Pendiente</div>
            </q-card>

            <q-card class="perfil-stat purple">
              <div class="perfil-stat-number">{{ perfil.resumen.total_asistencias }}</div>
              <div class="perfil-stat-label">Asistencias</div>
            </q-card>

            <q-card class="perfil-stat blue">
              <div class="perfil-stat-number">{{ perfil.resumen.porcentaje_asistencia }}%</div>
              <div class="perfil-stat-label">Asistencia</div>
            </q-card>
          </div>

          <q-tabs
            v-model="tabPerfil"
            dense
            class="text-purple"
            active-color="purple"
            indicator-color="purple"
            align="justify"
          >
            <q-tab name="pagos" icon="payments" label="Pagos" />
            <q-tab name="inscripciones" icon="event_available" label="Inscripciones" />
            <q-tab name="asistencias" icon="check_circle" label="Asistencias" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tabPerfil" animated class="perfil-panels">
            <q-tab-panel name="pagos">
              <q-list bordered separator class="perfil-list">
                <q-item v-for="pago in perfil.pagos" :key="pago.id">
                  <q-item-section avatar>
                    <q-avatar :color="pago.estado === 'pagado' ? 'green' : 'orange'" text-color="white" icon="payments" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold">
                      Bs {{ formatoMonto(pago.monto) }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ pago.fecha_pago }} · {{ pago.metodo_pago || 'Sin método' }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ pago.observacion || 'Sin observación' }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-badge :color="pago.estado === 'pagado' ? 'positive' : 'warning'">
                      {{ pago.estado }}
                    </q-badge>
                  </q-item-section>
                </q-item>

                <q-item v-if="perfil.pagos.length === 0">
                  <q-item-section class="text-grey-7">
                    No tiene pagos registrados.
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>

            <q-tab-panel name="inscripciones">
              <q-list bordered separator class="perfil-list">
                <q-item v-for="inscripcion in perfil.inscripciones" :key="inscripcion.id">
                  <q-item-section avatar>
                    <q-avatar color="purple" text-color="white" icon="event_available" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold">
                      {{ inscripcion.servicio?.nombre || 'Servicio' }}
                    </q-item-label>
                    <q-item-label caption>
                      Grupo: {{ inscripcion.grupo?.nombre || 'Sin grupo' }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ inscripcion.fecha_inicio }} → {{ inscripcion.fecha_fin || 'Sin fecha fin' }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-badge :color="inscripcion.estado === 'activo' ? 'positive' : 'negative'">
                      {{ inscripcion.estado }}
                    </q-badge>
                  </q-item-section>
                </q-item>

                <q-item v-if="perfil.inscripciones.length === 0">
                  <q-item-section class="text-grey-7">
                    No tiene inscripciones registradas.
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>

            <q-tab-panel name="asistencias">
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-sm-4">
                  <q-card class="mini-attendance present">
                    <div class="mini-num">{{ perfil.resumen.presentes }}</div>
                    <div class="mini-text">Presentes</div>
                  </q-card>
                </div>

                <div class="col-12 col-sm-4">
                  <q-card class="mini-attendance absent">
                    <div class="mini-num">{{ perfil.resumen.ausentes }}</div>
                    <div class="mini-text">Ausentes</div>
                  </q-card>
                </div>

                <div class="col-12 col-sm-4">
                  <q-card class="mini-attendance total">
                    <div class="mini-num">{{ perfil.resumen.total_asistencias }}</div>
                    <div class="mini-text">Total</div>
                  </q-card>
                </div>
              </div>

              <q-list bordered separator class="perfil-list">
                <q-item v-for="asistencia in perfil.asistencias" :key="asistencia.id">
                  <q-item-section avatar>
                    <q-avatar :color="asistencia.estado === 'presente' ? 'green' : 'red'" text-color="white" icon="check_circle" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold">
                      {{ asistencia.fecha || asistencia.created_at }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ asistencia.observacion || 'Sin observación' }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-badge :color="asistencia.estado === 'presente' ? 'positive' : 'negative'">
                      {{ asistencia.estado }}
                    </q-badge>
                  </q-item-section>
                </q-item>

                <q-item v-if="perfil.asistencias.length === 0">
                  <q-item-section class="text-grey-7">
                    No tiene asistencias registradas.
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogWhatsApp">
      <q-card class="whatsapp-card">
        <q-card-section class="whatsapp-header">
          <div>
            <div class="text-h6 text-weight-bold">💬 WhatsApp inteligente</div>
            <div class="text-caption">
              {{ zumberaSeleccionada?.nombre }}
            </div>
          </div>
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-sm">
          <q-btn class="wa-option" icon="favorite" label="Mensaje de bienvenida" @click="enviarMensajeTipo('bienvenida')" />
          <q-btn class="wa-option" icon="payments" label="Recordar pago pendiente" @click="enviarMensajeTipo('pago')" />
          <q-btn class="wa-option" icon="event_available" label="Inscripción por vencer" @click="enviarMensajeTipo('inscripcion')" />
          <q-btn class="wa-option" icon="fitness_center" label="Recordar clase" @click="enviarMensajeTipo('clase')" />
          <q-btn class="wa-option custom" icon="edit_note" label="Mensaje personalizado" @click="abrirMensajePersonalizado" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogMensajePersonalizado">
      <q-card class="form-card">
        <q-card-section class="form-header">
          <div>
            <div class="text-h6 text-weight-bold">✍️ Mensaje personalizado</div>
            <div class="text-caption text-purple-1">
              Escribe el mensaje para {{ zumberaSeleccionada?.nombre }}
            </div>
          </div>
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>

        <q-card-section class="form-body">
          <q-input v-model="mensajePersonalizado" type="textarea" outlined autogrow label="Mensaje" />
        </q-card-section>

        <q-card-actions class="form-actions">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn class="btn-whatsapp" icon="send" label="Enviar WhatsApp" unelevated rounded @click="enviarPersonalizado" />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
            <div class="text-h5 text-weight-bold">📱 Importar contactos</div>
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
const dialogWhatsApp = ref(false)
const dialogMensajePersonalizado = ref(false)
const dialogPerfil = ref(false)

const modoEditar = ref(false)
const zumberas = ref([])
const contactosTelefono = ref([])
const zumberaSeleccionada = ref(null)

const filtro = ref('')
const filtroContactos = ref('')
const cargandoContactos = ref(false)
const cargandoPerfil = ref(false)
const mensajePersonalizado = ref('')
const tabPerfil = ref('pagos')

const perfil = ref({
  zumbera: null,
  pagos: [],
  inscripciones: [],
  asistencias: [],
  resumen: {
    total_pagado: 0,
    total_pendiente: 0,
    total_asistencias: 0,
    presentes: 0,
    ausentes: 0,
    porcentaje_asistencia: 0
  }
})

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

  if (limpio.startsWith('+')) limpio = limpio.substring(1)
  if (limpio.startsWith('591')) return limpio
  if (limpio.startsWith('0')) return `591${limpio.substring(1)}`

  return `591${limpio}`
}

const formatoMonto = (valor) => {
  return Number(valor || 0).toFixed(2)
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

const abrirPerfil = async (zumbera) => {
  try {
    cargandoPerfil.value = true
    zumberaSeleccionada.value = zumbera

    const res = await axios.get(`${API_URL}/${zumbera.id}/perfil`)
    perfil.value = res.data.data

    tabPerfil.value = 'pagos'
    dialogPerfil.value = true
  } catch (error) {
    console.error(error)
    Notify.create({
      type: 'negative',
      message: 'No se pudo cargar el perfil'
    })
  } finally {
    cargandoPerfil.value = false
  }
}

const llamarTelefono = (telefono) => {
  if (!telefono) return
  window.open(`tel:${limpiarTelefono(telefono)}`, '_self')
}

const llamarPorWhatsApp = (zumbera) => {
  if (!zumbera?.telefono) {
    Notify.create({
      type: 'warning',
      message: 'Esta zumbera no tiene teléfono registrado'
    })
    return
  }

  const telefono = telefonoWhatsApp(zumbera.telefono)
  const mensaje = `Hola ${zumbera.nombre || ''} 💜`

  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank')
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
      Notify.create({ type: 'positive', message: 'Zumbera actualizada correctamente' })
    } else {
      await axios.post(API_URL, datos)
      Notify.create({ type: 'positive', message: 'Zumbera registrada correctamente' })
    }

    dialog.value = false
    await cargarZumberas()

    if (dialogPerfil.value && perfil.value.zumbera?.id === form.value.id) {
      await abrirPerfil(perfil.value.zumbera)
    }
  } catch (error) {
    console.error(error)
    Notify.create({
      type: 'negative',
      message: 'No se pudo guardar la zumbera'
    })
  }
}

const abrirMenuWhatsApp = (zumbera) => {
  zumberaSeleccionada.value = zumbera
  dialogWhatsApp.value = true
}

const crearMensaje = (tipo, zumbera) => {
  const nombre = zumbera?.nombre || 'querida zumbera'

  const mensajes = {
    bienvenida: `Hola ${nombre} 💜, bienvenida a CarlaFit. Estamos felices de acompañarte en tu proceso de bienestar, energía y entrenamiento. ¡Gracias por formar parte de nuestra familia CarlaFit!`,
    pago: `Hola ${nombre} 💜, te recordamos con cariño que tienes un pago pendiente en CarlaFit. Puedes regularizarlo para continuar disfrutando de tus clases sin interrupciones. ¡Gracias por tu confianza!`,
    inscripcion: `Hola ${nombre} 💜, te recordamos que tu inscripción está próxima a vencer. Puedes renovarla para seguir disfrutando de nuestras clases y beneficios en CarlaFit.`,
    clase: `Hola ${nombre} 💜, te recordamos tu clase de hoy en CarlaFit. ¡Te esperamos con toda la energía y actitud para entrenar juntas!`
  }

  return mensajes[tipo] || mensajes.bienvenida
}

const abrirWhatsAppConMensaje = (zumbera, mensaje) => {
  if (!zumbera?.telefono) {
    Notify.create({
      type: 'warning',
      message: 'Esta zumbera no tiene teléfono registrado'
    })
    return
  }

  const telefono = telefonoWhatsApp(zumbera.telefono)
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank')
}

const enviarMensajeTipo = (tipo) => {
  const zumbera = zumberaSeleccionada.value
  const mensaje = crearMensaje(tipo, zumbera)

  dialogWhatsApp.value = false
  abrirWhatsAppConMensaje(zumbera, mensaje)
}

const abrirMensajePersonalizado = () => {
  const nombre = zumberaSeleccionada.value?.nombre || ''
  mensajePersonalizado.value = `Hola ${nombre} 💜, `
  dialogWhatsApp.value = false
  dialogMensajePersonalizado.value = true
}

const enviarPersonalizado = () => {
  if (!mensajePersonalizado.value.trim()) {
    Notify.create({
      type: 'warning',
      message: 'Escribe un mensaje antes de enviar'
    })
    return
  }

  dialogMensajePersonalizado.value = false
  abrirWhatsAppConMensaje(zumberaSeleccionada.value, mensajePersonalizado.value)
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

.stats-grid,
.perfil-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.perfil-stats {
  grid-template-columns: repeat(4, 1fr);
}

.stat-card,
.perfil-stat {
  border-radius: 26px;
  min-height: 130px;
  box-shadow: 0 12px 26px rgba(123, 31, 162, 0.12);
  position: relative;
  overflow: hidden;
}

.perfil-stat {
  padding: 18px;
  min-height: 100px;
  color: white;
}

.perfil-stat.green {
  background: linear-gradient(135deg, #0b8f3a, #43a047);
}

.perfil-stat.orange {
  background: linear-gradient(135deg, #fb8c00, #ffb74d);
}

.perfil-stat.purple {
  background: linear-gradient(135deg, #7b1fa2, #ab47bc);
}

.perfil-stat.blue {
  background: linear-gradient(135deg, #1565c0, #42a5f5);
}

.perfil-stat-number {
  font-size: 24px;
  font-weight: 900;
}

.perfil-stat-label {
  font-weight: 700;
  opacity: 0.95;
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
.btn-primary,
.btn-profile {
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

.wa-option {
  width: 100%;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #128c7e, #25d366);
  color: white;
  font-weight: 800;
}

.wa-option.custom {
  background: linear-gradient(135deg, #6a1b9a, #ab47bc);
}

.whatsapp-card,
.form-card {
  width: 470px;
  max-width: 94vw;
  border-radius: 28px;
  overflow: hidden;
}

.whatsapp-card {
  width: 420px;
  border-radius: 24px;
}

.whatsapp-header {
  background: linear-gradient(135deg, #128c7e, #25d366);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px;
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

.contactos-list,
.perfil-list {
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

.perfil-card {
  background: #fff7fd;
}

.perfil-header {
  background: linear-gradient(135deg, #7b1fa2, #ab47bc);
  color: white;
  padding: 24px;
}

.perfil-top {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.perfil-main {
  flex: 1;
}

.perfil-name {
  font-size: 28px;
  font-weight: 900;
}

.perfil-sub {
  opacity: 0.95;
  margin-top: 4px;
}

.perfil-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.perfil-action {
  color: white;
  font-weight: 800;
}

.perfil-action.whatsapp {
  background: linear-gradient(135deg, #128c7e, #25d366);
}

.perfil-action.whatsapp-call {
  background: linear-gradient(135deg, #075e54, #25d366);
}

.perfil-action.call {
  background: linear-gradient(135deg, #1565c0, #42a5f5);
}

.perfil-action.edit {
  background: linear-gradient(135deg, #fb8c00, #ffb74d);
}

.perfil-panels {
  background: transparent;
}

.mini-attendance {
  border-radius: 20px;
  padding: 18px;
  color: white;
}

.mini-attendance.present {
  background: linear-gradient(135deg, #2e7d32, #66bb6a);
}

.mini-attendance.absent {
  background: linear-gradient(135deg, #c62828, #ef5350);
}

.mini-attendance.total {
  background: linear-gradient(135deg, #6a1b9a, #ab47bc);
}

.mini-num {
  font-size: 30px;
  font-weight: 900;
}

.mini-text {
  font-weight: 700;
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

  .stats-grid,
  .perfil-stats {
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

  .perfil-top {
    flex-direction: column;
  }

  .perfil-action {
    width: 100%;
  }
}
</style>