const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/DashboardPage.vue')
      },
      {
        path: 'zumberas',
        component: () => import('pages/ZumberasPage.vue')
      },
      {
        path: 'inscripciones',
        component: () => import('pages/InscripcionesPage.vue')
      },
      {
        path: 'pagos',
        component: () => import('pages/PagosPage.vue')
      },

      {
        path: 'calendario',
        component: () => import('pages/CalendarioPage.vue')
      },

      {
        path: 'asistencias',
        component: () => import('pages/AsistenciasPage.vue')
      },


      {
        path: 'servicios',
        component: () => import('pages/ServiciosPage.vue')
      },
      {
        path: 'grupos',
        component: () => import('pages/GruposPage.vue')
      },
      {
        path: 'centro-mensajes',
        component: () => import('pages/CentroMensajesPage.vue')
      }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes