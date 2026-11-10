/**
 * Directorio de Enlaces Útiles, Portales de Pago y Soporte Oficial
 * para servicios públicos, telecomunicaciones, streaming, créditos y suscripciones en Colombia.
 */

export interface ServiceHelpLink {
  title: string;
  url: string;
  type: 'payment' | 'official' | 'docs' | 'video' | 'support';
  description?: string;
}

export interface ServiceDirectoryItem {
  id: string;
  matchPatterns: string[]; // términos para coincidir con el título o entidad de la obligación
  providerName: string;
  category: string;
  officialSite: string;
  paymentPortal?: string;
  helpLinks: ServiceHelpLink[];
}

export const SERVICES_DIRECTORY: ServiceDirectoryItem[] = [
  // --- BANCOS Y CRÉDITOS ---
  {
    id: 'lulo-bank',
    matchPatterns: ['lulo', 'lulo bank'],
    providerName: 'Lulo Bank',
    category: 'Crédito & Bancos',
    officialSite: 'https://www.lulobank.com',
    paymentPortal: 'https://www.lulobank.com/pse',
    helpLinks: [
      {
        title: 'Portal de Pago PSE Lulo',
        url: 'https://www.lulobank.com/pse',
        type: 'payment',
        description: 'Paga tu cuota de crédito con cualquier banco por PSE'
      },
      {
        title: 'Tutorial: Pagar tu crédito con la Lulo cuenta',
        url: 'https://www.youtube.com/watch?v=zEuBfT7VADI',
        type: 'video',
        description: 'Video oficial de Lulo Bank en YouTube'
      },
      {
        title: 'Tutorial: Pagar tu crédito con PSE',
        url: 'https://www.youtube.com/watch?v=K8sZdPOKM3A&t=1s',
        type: 'video',
        description: 'Video oficial de Lulo Bank en YouTube'
      },
      {
        title: 'Tutorial: Activar débito automático',
        url: 'https://www.youtube.com/watch?v=4bOPHHzqQhI',
        type: 'video',
        description: 'Programa el pago automático de tu cuota cada mes'
      },
      {
        title: 'Política y Gestión de Cobranza',
        url: 'https://www.lulobank.com/legals/doc-gestion-cobro-cartera',
        type: 'docs',
        description: 'Información legal sobre tarifas, seguro y plazos de reporte'
      },
      {
        title: 'Defensor del Consumidor Financiero',
        url: 'https://ustarizabogados.com/',
        type: 'support',
        description: 'defensorialulobank@ustarizabogados.com - Tel: (601) 6108161'
      }
    ]
  },
  {
    id: 'nequi',
    matchPatterns: ['nequi', 'propulsor', 'salvavidas'],
    providerName: 'Nequi (Bancolombia)',
    category: 'Crédito & Bancos',
    officialSite: 'https://www.nequi.com.co',
    paymentPortal: 'https://recarga.nequi.com.co/billetera-recargaweb/',
    helpLinks: [
      {
        title: 'Recarga y Pago PSE Nequi',
        url: 'https://recarga.nequi.com.co/billetera-recargaweb/',
        type: 'payment',
        description: 'Paga o recarga tu cuenta Nequi desde cualquier banco'
      },
      {
        title: 'Centro de Ayuda: Crédito Propulsor',
        url: 'https://ayuda.nequi.com.co/hc/es/sections/360007886472-Cr%C3%A9dito-Propulsor',
        type: 'docs',
        description: 'Preguntas frecuentes, cómo abonar a capital y cuotas'
      },
      {
        title: 'Portal Oficial Nequi',
        url: 'https://www.nequi.com.co',
        type: 'official',
        description: 'Página web oficial'
      }
    ]
  },
  {
    id: 'bancolombia',
    matchPatterns: ['bancolombia'],
    providerName: 'Bancolombia',
    category: 'Crédito & Bancos',
    officialSite: 'https://www.bancolombia.com',
    paymentPortal: 'https://www.bancolombia.com/personas/pagos',
    helpLinks: [
      {
        title: 'Portal de Pagos Bancolombia',
        url: 'https://www.bancolombia.com/personas/pagos',
        type: 'payment',
        description: 'Paga créditos, tarjetas de crédito y facturas'
      },
      {
        title: 'Sucursal Virtual Personas',
        url: 'https://sucursalpersonas.transaccionesbancolombia.com/',
        type: 'official',
        description: 'Gestión de extractos, abonos a capital y pagos'
      }
    ]
  },
  {
    id: 'davivienda',
    matchPatterns: ['davivienda', 'daviplata'],
    providerName: 'Banco Davivienda',
    category: 'Crédito & Bancos',
    officialSite: 'https://www.davivienda.com',
    paymentPortal: 'https://www.zonapagos.com/t_davivienda/',
    helpLinks: [
      {
        title: 'Portal de Pagos en Línea',
        url: 'https://www.zonapagos.com/t_davivienda/',
        type: 'payment',
        description: 'Paga tarjetas y créditos por PSE'
      },
      {
        title: 'Portal Oficial Davivienda',
        url: 'https://www.davivienda.com',
        type: 'official'
      }
    ]
  },
  {
    id: 'nu-colombia',
    matchPatterns: ['nu', 'nubank'],
    providerName: 'Nu Colombia',
    category: 'Crédito & Bancos',
    officialSite: 'https://nu.com.co',
    paymentPortal: 'https://nu.com.co/cuenta/',
    helpLinks: [
      {
        title: 'Cómo pagar tu tarjeta Nu por PSE',
        url: 'https://blog.nu.com.co/como-pagar-tarjeta-de-credito-nu-colombia/',
        type: 'docs',
        description: 'Guía oficial para pagar tu estado de cuenta'
      },
      {
        title: 'Portal Oficial Nu Colombia',
        url: 'https://nu.com.co',
        type: 'official'
      }
    ]
  },

  // --- SERVICIOS PÚBLICOS ---
  {
    id: 'enel',
    matchPatterns: ['enel', 'codensa', 'luz', 'energia'],
    providerName: 'Enel Colombia',
    category: 'Servicios Públicos',
    officialSite: 'https://www.enel.com.co',
    paymentPortal: 'https://www.enel.com.co/es/personas/boton-de-pago.html',
    helpLinks: [
      {
        title: 'Botón de Pago en Línea Enel',
        url: 'https://www.enel.com.co/es/personas/boton-de-pago.html',
        type: 'payment',
        description: 'Paga tu factura con número de cliente por PSE'
      },
      {
        title: 'Descarga tu Factura / Duplicado',
        url: 'https://www.enel.com.co/es/personas/consulta-factura.html',
        type: 'docs',
        description: 'Consulta consumos en kWh e histórico de facturación'
      },
      {
        title: 'Portal Oficial Enel Colombia',
        url: 'https://www.enel.com.co',
        type: 'official'
      }
    ]
  },
  {
    id: 'epm',
    matchPatterns: ['epm', 'empresas publicas de medellin'],
    providerName: 'EPM',
    category: 'Servicios Públicos',
    officialSite: 'https://www.epm.com.co',
    paymentPortal: 'https://pagos.epm.com.co/',
    helpLinks: [
      {
        title: 'Portal de Pagos PSE Factura Web EPM',
        url: 'https://pagos.epm.com.co/',
        type: 'payment',
        description: 'Paga energía, gas y agua'
      },
      {
        title: 'Portal Oficial EPM',
        url: 'https://www.epm.com.co',
        type: 'official'
      }
    ]
  },
  {
    id: 'eaab',
    matchPatterns: ['eaab', 'acueducto', 'agua'],
    providerName: 'Acueducto de Bogotá (EAAB)',
    category: 'Servicios Públicos',
    officialSite: 'https://www.acueducto.com.co',
    paymentPortal: 'https://www.acueducto.com.co/wps/portal/eaab/inicio/atencion-usuario/pago-virtual',
    helpLinks: [
      {
        title: 'Pago Virtual Factura Acueducto',
        url: 'https://www.acueducto.com.co/wps/portal/eaab/inicio/atencion-usuario/pago-virtual',
        type: 'payment',
        description: 'Pago seguro por PSE sin filas'
      },
      {
        title: 'Portal Oficial EAAB',
        url: 'https://www.acueducto.com.co',
        type: 'official'
      }
    ]
  },
  {
    id: 'vanti',
    matchPatterns: ['vanti', 'gas natural', 'gas'],
    providerName: 'Gas Natural Vanti',
    category: 'Servicios Públicos',
    officialSite: 'https://www.grupovanti.com',
    paymentPortal: 'https://www.grupovanti.com/hogar/paga-tu-factura/',
    helpLinks: [
      {
        title: 'Paga tu Factura Vanti en Línea',
        url: 'https://www.grupovanti.com/hogar/paga-tu-factura/',
        type: 'payment',
        description: 'Ingresa tu número de cuenta y paga por PSE'
      },
      {
        title: 'Portal Oficial Grupo Vanti',
        url: 'https://www.grupovanti.com',
        type: 'official'
      }
    ]
  },

  // --- TELECOMUNICACIONES & INTERNET ---
  {
    id: 'claro',
    matchPatterns: ['claro', 'telmex'],
    providerName: 'Claro Colombia',
    category: 'Telecomunicaciones',
    officialSite: 'https://www.claro.com.co',
    paymentPortal: 'https://portalpagos.claro.com.co/',
    helpLinks: [
      {
        title: 'Portal de Pagos Express Claro',
        url: 'https://portalpagos.claro.com.co/',
        type: 'payment',
        description: 'Paga tu plan celular, internet hogar o TV por PSE'
      },
      {
        title: 'Mi Claro Autogestión',
        url: 'https://miclaro.com.co/',
        type: 'official',
        description: 'Detalle de plan, consumo de datos y facturas'
      }
    ]
  },
  {
    id: 'movistar',
    matchPatterns: ['movistar', 'telefonica'],
    providerName: 'Movistar Colombia',
    category: 'Telecomunicaciones',
    officialSite: 'https://www.movistar.co',
    paymentPortal: 'https://www.movistar.co/pago-factura',
    helpLinks: [
      {
        title: 'Pago de Factura Movistar',
        url: 'https://www.movistar.co/pago-factura',
        type: 'payment',
        description: 'Pago rápido de línea móvil y fibra óptica'
      },
      {
        title: 'Mi Movistar',
        url: 'https://www.movistar.co/atencion-al-cliente',
        type: 'official'
      }
    ]
  },
  {
    id: 'tigo',
    matchPatterns: ['tigo'],
    providerName: 'Tigo Colombia',
    category: 'Telecomunicaciones',
    officialSite: 'https://www.tigo.com.co',
    paymentPortal: 'https://transacciones.tigo.com.co/servicios/pago-facturas',
    helpLinks: [
      {
        title: 'Pago de Facturas en Línea Tigo',
        url: 'https://transacciones.tigo.com.co/servicios/pago-facturas',
        type: 'payment',
        description: 'Paga con número de línea o contrato'
      },
      {
        title: 'Portal Oficial Tigo',
        url: 'https://www.tigo.com.co',
        type: 'official'
      }
    ]
  },
  {
    id: 'etb',
    matchPatterns: ['etb'],
    providerName: 'ETB',
    category: 'Telecomunicaciones',
    officialSite: 'https://etb.com',
    paymentPortal: 'https://etb.com/pagos/',
    helpLinks: [
      {
        title: 'Portal de Pagos ETB',
        url: 'https://etb.com/pagos/',
        type: 'payment',
        description: 'Paga tu factura de fibra óptica o móvil'
      },
      {
        title: 'Portal Oficial ETB',
        url: 'https://etb.com',
        type: 'official'
      }
    ]
  },
  {
    id: 'wom',
    matchPatterns: ['wom'],
    providerName: 'WOM Colombia',
    category: 'Telecomunicaciones',
    officialSite: 'https://www.wom.co',
    paymentPortal: 'https://pagos.wom.co/',
    helpLinks: [
      {
        title: 'Portal de Pagos WOM',
        url: 'https://pagos.wom.co/',
        type: 'payment',
        description: 'Paga tu factura pospago con tu número celular'
      },
      {
        title: 'Portal Oficial WOM',
        url: 'https://www.wom.co',
        type: 'official'
      }
    ]
  },

  // --- STREAMING Y ENTRETENIMIENTO ---
  {
    id: 'spotify',
    matchPatterns: ['spotify'],
    providerName: 'Spotify',
    category: 'Entretenimiento',
    officialSite: 'https://www.spotify.com/co/',
    paymentPortal: 'https://www.spotify.com/co/account/subscription/',
    helpLinks: [
      {
        title: 'Gestionar Suscripción y Métodos de Pago',
        url: 'https://www.spotify.com/co/account/subscription/',
        type: 'payment',
        description: 'Revisa tu plan Premium, cambia de tarjeta o método de cobro'
      },
      {
        title: 'Centro de Ayuda de Spotify',
        url: 'https://support.spotify.com/co/',
        type: 'support',
        description: 'Preguntas sobre facturación, cobros dobles y planes familiares'
      }
    ]
  },
  {
    id: 'netflix',
    matchPatterns: ['netflix'],
    providerName: 'Netflix',
    category: 'Entretenimiento',
    officialSite: 'https://www.netflix.com/co/',
    paymentPortal: 'https://www.netflix.com/YourAccount',
    helpLinks: [
      {
        title: 'Administrar Cuenta y Facturación',
        url: 'https://www.netflix.com/YourAccount',
        type: 'payment',
        description: 'Actualiza método de pago y consulta fecha de facturación'
      },
      {
        title: 'Centro de Ayuda Netflix',
        url: 'https://help.netflix.com/es',
        type: 'support'
      }
    ]
  },
  {
    id: 'disney-plus',
    matchPatterns: ['disney', 'star+'],
    providerName: 'Disney+ / Star+',
    category: 'Entretenimiento',
    officialSite: 'https://www.disneyplus.com/es-co',
    paymentPortal: 'https://www.disneyplus.com/account',
    helpLinks: [
      {
        title: 'Gestionar Suscripción Disney+',
        url: 'https://www.disneyplus.com/account',
        type: 'payment',
        description: 'Cambia método de pago o plan mensual/anual'
      },
      {
        title: 'Centro de Ayuda Disney+',
        url: 'https://help.disneyplus.com/csp',
        type: 'support'
      }
    ]
  },
  {
    id: 'amazon-prime',
    matchPatterns: ['amazon', 'prime video', 'prime'],
    providerName: 'Amazon Prime Video',
    category: 'Entretenimiento',
    officialSite: 'https://www.primevideo.com',
    paymentPortal: 'https://www.amazon.com/gp/primecentral',
    helpLinks: [
      {
        title: 'Administrar Membresía Prime',
        url: 'https://www.amazon.com/gp/primecentral',
        type: 'payment',
        description: 'Consulta fecha de renovación y tarjetas asociadas'
      }
    ]
  },
  {
    id: 'youtube-premium',
    matchPatterns: ['youtube', 'youtube premium'],
    providerName: 'YouTube Premium',
    category: 'Entretenimiento',
    officialSite: 'https://www.youtube.com/premium',
    paymentPortal: 'https://www.youtube.com/paid_memberships',
    helpLinks: [
      {
        title: 'Administrar Suscripción de YouTube',
        url: 'https://www.youtube.com/paid_memberships',
        type: 'payment',
        description: 'Historial de compras, planes familiares y pagos'
      }
    ]
  }
];

/**
 * Busca enlaces útiles para cualquier obligación basada en su título o categoría
 */
export function findServiceDirectoryItem(title: string, lenderName?: string | null): ServiceDirectoryItem | null {
  const normalized = `${title} ${lenderName || ''}`.toLowerCase();
  
  for (const item of SERVICES_DIRECTORY) {
    if (item.matchPatterns.some(pattern => normalized.includes(pattern))) {
      return item;
    }
  }

  return null;
}
