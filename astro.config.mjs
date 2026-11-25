// Documentación de Luvin. Inglés en / y español en /es/, igual que el sitio (luvin-web).
// Todo es estático: `npm run build` deja el sitio en dist/, con el buscador incluido.
import { existsSync, readdirSync } from 'node:fs'
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// La barra lateral: una sección por carpeta de src/content/docs/ (es también una pestaña del menú de
// arriba), dividida en subtemas. El nombre de cada página sale de su `title`, en su idioma.
// Solo se incluyen las páginas que existen, y una página de la carpeta que no esté en ningún subtema
// se agrega al final de su sección: así una página nueva nunca queda fuera del menú.
const DOCS = new URL('./src/content/docs/', import.meta.url)
const exists = (slug) => ['.md', '.mdx'].some((ext) => existsSync(new URL(slug + ext, DOCS)))
const inDir = (dir) =>
  existsSync(new URL(dir + '/', DOCS))
    ? readdirSync(new URL(dir + '/', DOCS)).filter((f) => /\.mdx?$/.test(f)).map((f) => `${dir}/${f.replace(/\.mdx?$/, '')}`).sort()
    : []
function section(label, es, dir, groups) {
  // Un subtema es [nombre, nombre en español, [páginas o subtemas]]: los subtemas se pueden anidar.
  const listed = new Set()
  const build = (g) => {
    if (!Array.isArray(g)) {
      listed.add(`${dir}/${g}`)
      return exists(`${dir}/${g}`) ? `${dir}/${g}` : undefined
    }
    const items = g[2].map(build).filter(Boolean)
    return items.length ? { label: g[0], translations: { es: g[1] }, items, collapsed: false } : undefined
  }
  const items = groups.map(build).filter(Boolean)
  const rest = inDir(dir).filter((x) => !listed.has(x))
  return { label, translations: { es }, items: [...items, ...rest] }
}
const sidebar = [
  section('Get started', 'Empieza aquí', 'get-started', ['welcome', 'use-cases', 'quick-start', 'install', 'interface', 'sidebar', 'preferences', ['Network settings', 'Ajustes de red', ['network', 'network-requests', 'network-proxy', 'network-certificates']], ['Guided tour', 'Tour guiado', ['guided-tour', 'guided-tour-sections', 'guided-tour-workspace']], 'import', 'troubleshooting']),
  section('Examples', 'Ejemplos', 'recipes', [
    'overview',
    ['Business processes', 'Procesos de negocio', ['place-order', 'session-refresh']],
    ['Log in and tokens', 'Login y tokens', ['login-token', 'depends-on', 'cross-document']],
    ['Work with data', 'Trabajar con datos', ['list-pick', 'pagination-query', 'generated-data']],
    ['Checks and errors', 'Comprobaciones y errores', ['expected-error', 'criteria', 'error-branches', 'retry-step']],
  ]),
  section('Tutorials', 'Tutoriales', 'tutorials', ['first-workflow', 'from-postman', 'oauth-payment', 'negative-cases', 'debug-failure', 'team-git']),
  section('Design workflows', 'Diseñar workflows', 'design', [
    ['Basics', 'Lo básico', ['overview', 'common-situations', 'canvas', 'create', 'add-steps', 'insert-step', 'organize', 'copy-and-extract', 'arazzo-file']],
    ['Data between steps', 'Datos entre pasos', ['wire-data', 'parameters-and-body', 'outputs', 'complete-gaps', 'required-fields']],
    ['Control the flow', 'Controlar el recorrido', [
      'success-and-errors',
      ['Routes', 'Rutas', ['branches', 'branch-menu', 'routes-panel', 'branch-other-status', 'branch-new-step', 'review']],
      'patterns',
      'dependencies',
      'reusables',
    ]],
    ['Other kinds of steps', 'Otros tipos de pasos', ['messaging', 'from-requests']],
    ['The Arazzo file', 'El archivo Arazzo', ['yaml-side-by-side', 'arazzo-editor', 'broken-yaml']],
  ]),
  section('Test workflows', 'Probar workflows', 'test', [
    ['Start here', 'Para empezar', ['overview', 'what-to-test']],
    ['Inputs and cases', 'Inputs y casos', ['inputs', 'cases', 'adjust-cases', 'custom-cases']],
    ['Run', 'Ejecutar', ['run', 'run-on-canvas', 'probe-routes', 'debug', 'lists', 'simulation']],
    ['Results', 'Resultados', ['results', 'step-results', 'overview-tab', 'reports']],
  ]),
  section('Runner', 'Runner', 'runner', [
    ['Start here', 'Empieza aquí', ['overview', 'open-and-environment', 'lifecycle']],
    ['Run requests', 'Ejecutar requests', ['requests', 'requests-settings', 'requests-results']],
    ['Run workflows', 'Ejecutar workflows', ['workflows', 'workflows-cases', 'workflows-lists', 'workflows-results']],
    ['Data files', 'Archivos de datos', ['data-files', 'data-mapping']],
    ['Performance', 'Rendimiento', [
      'performance',
      'load-profiles',
      'pass-criteria',
      'safety',
      ['Results', 'Resultados', ['performance-results', 'performance-chart', 'performance-table']],
      'performance-workflows',
    ]],
  ]),
  section('Send requests', 'Enviar requests', 'requests', [
    ['Basics', 'Lo básico', ['overview', 'http', 'params-headers-body', 'auto-headers', 'send-files', 'response-details', 'files', 'cookies-and-examples']],
    ['Variables and checks', 'Variables y comprobaciones', ['variables-and-checks', 'save-variables', 'checks', 'check-operators', 'check-expressions', 'check-results', 'checks-from-postman']],
    ['Scripts', 'Scripts', ['scripts', 'scripts-api']],
    ['Other protocols', 'Otros protocolos', ['graphql', 'grpc', 'websocket']],
    ['Create requests faster', 'Crear requests más rápido', ['curl', 'generate-from-contract']],
  ]),
  section('Mock servers', 'Mock servers', 'mocks', [
    ['Start here', 'Para empezar', ['overview', 'create', 'start-stop']],
    ['Routes and responses', 'Rutas y respuestas', ['routes', 'responses', 'templates', 'auth-and-errors']],
    ['Use and inspect', 'Usar y revisar', ['with-workflows', 'log', 'security']],
  ]),
  section('Contracts', 'Contratos', 'contracts', [
    ['Start here', 'Empieza aquí', ['overview', 'add', 'list']],
    ['Edit and validate', 'Editar y validar', ['edit', 'lint-errors', 'impact', 'try-it-out']],
    ['How Luvin uses a contract', 'Cómo usa Luvin un contrato', ['operations-and-steps', 'schemas-and-cases', 'servers-and-credentials', 'examples', 'response-check']],
    ['Events, references and URLs', 'Eventos, referencias y URLs', ['asyncapi', 'references', 'remote-and-refs']],
    'troubleshooting',
  ]),
  section('Environments', 'Ambientes', 'environments', [
    ['Start here', 'Empieza aquí', ['overview', 'manage']],
    ['What an environment holds', 'Qué guarda un ambiente', ['base-urls', 'variables-and-secrets', 'credentials']],
    ['Use variables', 'Usar variables', ['use-variables', 'variable-levels', 'suggestions']],
    ['Dynamic variables', 'Variables dinámicas', ['dynamic-variables', 'generators', 'postman-variables']],
    ['Files, teams and problems', 'Archivos, equipos y problemas', ['files-and-teams', 'import', 'mock-environments', 'troubleshooting']],
  ]),
  section('Authorization', 'Autorización', 'authorization', [
    ['Start here', 'Empieza aquí', ['overview', 'where-it-applies', 'inherit-and-none']],
    ['Types', 'Tipos', ['api-key', 'basic', 'bearer', 'oauth2', 'oauth1', 'digest', 'ntlm', 'aws-sigv4', 'akamai', 'wsse']],
    ['Collections and workflows', 'Colecciones y workflows', ['contract-credentials', 'collection', 'workflow', 'token-from-login']],
    ['Security and problems', 'Seguridad y problemas', ['secrets', 'troubleshooting']],
  ]),
  section('Workspaces', 'Workspaces', 'workspaces', [
    ['Workspaces and collections', 'Workspaces y colecciones', ['overview', 'create-and-open', 'collections', 'collection-authorization', 'collection-overview']],
    ['History', 'Historial', ['history', 'history-requests', 'history-runs', 'history-settings']],
    ['Documentation', 'Documentación', ['documentation']],
    ['Files and teams', 'Archivos y equipos', ['files', 'git', 'without-workspace']],
  ]),
  section('Dev Tools', 'Dev Tools', 'dev-tools', ['overview', 'network', 'console-and-performance', 'terminal', 'connection-help']),
  section('Reference', 'Referencia', 'reference', [
    ['Specifications', 'Especificaciones', ['support', 'limitations']],
    ['Syntax', 'Sintaxis', ['expressions', 'criteria', 'shortcuts']],
    ['Messages', 'Mensajes', ['failure-reasons', 'analysis-messages']],
    ['Help', 'Ayuda', ['faq', 'glossary', 'examples', 'privacy', 'whats-new']],
  ]),
]

export default defineConfig({
  // Dónde se publica: se usa en las URLs canónicas y en el mapa del sitio. Cámbialo si el dominio es otro.
  site: 'https://docs.lu-vin.com',
  integrations: [
    starlight({
      title: 'Luvin Docs',
      description: 'Test the chain, not just the call. How to design, run and share API workflows with Luvin.',
      logo: { src: './src/assets/logo.svg', alt: '' },
      favicon: '/favicon.svg',
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        es: { label: 'Español', lang: 'es' },
      },
      customCss: ['@fontsource-variable/inter', './src/styles/luvin.css'],
      // Piezas propias: la portada con buscador grande y la sección sobre el título de cada página.
      components: {
        Head: './src/components/Head.astro',
        Header: './src/components/Header.astro',
        Search: './src/components/Search.astro',
        Sidebar: './src/components/Sidebar.astro',
        TableOfContents: './src/components/TableOfContents.astro',
        Hero: './src/components/Hero.astro',
        PageTitle: './src/components/PageTitle.astro',
      },
      sidebar,
    }),
  ],
})
