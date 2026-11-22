---
title: Comparte un workspace con tu equipo usando git
description: Crea un workspace en una carpeta del disco, súbelo a git, ábrelo en el computador de un compañero con sus propios secretos y revisa el cambio de un workflow en un pull request.
sidebar:
  order: 6
---

Vas a crear un workspace en una carpeta, subirlo a git, abrirlo como si fueras un compañero y revisar el cambio de un workflow en un pull request. El resultado son workflows que tu equipo guarda, revisa y ejecuta desde un solo repositorio, sin ningún secreto dentro. Necesitas unos 30 minutos, Luvin y git instalados, un contrato OpenAPI propio y un repositorio git al que puedas subir cambios. Un segundo computador, o una segunda carpeta, hace de compañero.

## 1. Crea el workspace en una carpeta

1. En la pantalla de bienvenida, haz clic en **Crear un workspace**. Si ya hay un workspace abierto, abre antes su menú **Opciones del workspace** y elige **Cerrar y cambiar de workspace**.
2. Escribe `Shop tests` en **Nombre del workspace**.
3. Lee la línea **Se creará en**: muestra la carpeta. Para usar otro lugar, haz clic en **Cambiar ubicación**, luego en **Cambiar…**, y edita **Nombre de la carpeta** si quieres.
4. Haz clic en **Crear workspace**.

Luvin crea la carpeta con un archivo `luvin.yaml` dentro. Desde ahora, cada cambio que hagas se guarda automáticamente en archivos. Mira [Workspaces y colecciones](/es/workspaces/overview/).

## 2. Crea una colección y agrega contenido

1. En **Inicio**, haz clic en **Crea tu primera colección**. Escribe `payments` en **Nombre de la colección** y haz clic en **Crear**.
2. En **Acciones rápidas**, haz clic en **Importar Arazzo o contratos** y elige tu contrato OpenAPI.
3. Haz clic en **+** (**Crear o importar**) y elige **Nuevo Arazzo**. Arrastra dos operaciones al lienzo, como en [Arma tu primer workflow](/es/tutorials/first-workflow/).
4. Arriba de la barra lateral, haz clic en el ícono **Ambientes**. En su panel, haz clic en **+** (**Nuevo ambiente**), ponle el nombre `staging` y define su URL base.
5. En **Variables** agrega `clientId`, y en **Secretos** agrega `clientSecret` con su **Valor**.

Mira [URLs base, variables y secretos](/es/environments/variables-and-secrets/).

## 3. Mira qué hay en el disco

1. Abre el menú **Opciones del workspace** y elige **Mostrar en Finder** (**Mostrar en el explorador** en Windows).

La carpeta se ve así:

```text
shop-tests/
├── luvin.yaml
└── payments/
    ├── collection.yaml
    ├── payments.openapi.yaml
    ├── new.arazzo.yaml
    ├── environments/
    │   └── staging.yaml
    └── scenarios/
        └── new.arazzo.yaml
```

| Archivo | Qué contiene |
|---|---|
| `luvin.yaml` | El workspace: su nombre y la lista de colecciones. |
| `payments.openapi.yaml` | Tu contrato, tal como lo importaste. |
| `new.arazzo.yaml` | Los workflows. Este es el archivo que revisa tu equipo. |
| `environments/staging.yaml` | URLs base, variables y los **nombres** de los secretos. |
| `scenarios/new.arazzo.yaml` | Los inputs y los casos con datos propios de ese archivo Arazzo. |

Abre `environments/staging.yaml` en un editor:

```yaml
name: staging
servers:
  shop: https://staging.api.shop.test
variables:
  clientId: shop-staging-client
secrets:
  - clientSecret
```

El secreto tiene un nombre y ningún valor. El valor se guarda cifrado en tu computador, nunca en los archivos. Mira [Qué hay en el disco](/es/workspaces/files/).

:::caution[Los valores de Inputs se guardan tal como los escribes]
Luvin no oculta los valores que escribes en la pestaña **Inputs** ni en un caso: se escriben en `scenarios/` tal como los tecleaste. Si un valor es una contraseña o un token, crea un secreto y escribe `{{clientSecret}}` en su lugar.
:::

## 4. Haz commit y push

Usa tu cliente de git de siempre, o la pestaña **Terminal** de **Dev Tools**. En la carpeta del workspace:

```bash
git init
git add .
git commit -m "Add the shop workflows"
git remote add origin <tu repositorio>
git push -u origin main
```

No hay nada que poner en `.gitignore`: Luvin no escribe en la carpeta nada que debas dejar fuera. Mira [Llevar un workspace en git](/es/workspaces/git/).

## 5. Un compañero lo abre

En el computador del compañero:

1. Clona el repositorio: `git clone <tu repositorio>`.
2. Abre Luvin y haz clic en **Abrir un workspace**. Elige la carpeta clonada, la que tiene `luvin.yaml`.
3. En el panel **Ambientes** de la barra lateral, abre `staging`.
4. En **Secretos**, escribe el **Valor** de `clientSecret`. El nombre ya está en la lista.
5. En la barra de ejecución, elige **API real** y ejecuta un caso.

Si falta un valor, un aviso sobre el workflow dice **Faltan credenciales en «staging»**. Haz clic en **Completar** para abrir el ambiente.

El secreto del compañero queda en su computador, cifrado. Cada persona usa el suyo. Una buena costumbre es anotar en el `README.md` del workspace qué secretos necesita cada ambiente y a quién pedirlos.

## 6. Cambia un workflow y abre un pull request

1. El compañero crea una rama: `git switch -c add-idempotency-header`.
2. En Luvin, abre un workflow, hace clic en un paso en **Diseño** y le agrega un header. Luvin guarda solo.
3. En la terminal: `git diff`.

El cambio son unas pocas líneas del archivo Arazzo:

```diff
   - stepId: createOrder
     operationId: $sourceDescriptions.shop.createOrder
     parameters:
+      - name: Idempotency-Key
+        in: header
+        value: $inputs.requestId
```

4. Hace commit, sube la rama y abre un pull request en tu plataforma de git.

El pull request muestra qué cambió, línea por línea. Qué lee quien revisa:

| Cambio | Dónde se ve |
|---|---|
| Un paso nuevo, una conexión nueva o un criterio de éxito distinto | El archivo `*.arazzo.yaml` |
| Inputs iniciales nuevos o un caso con datos propios nuevo | El mismo archivo en `scenarios/` |
| Una URL base o una variable distinta | `environments/<nombre>.yaml` |

Quien revisa también puede traer la rama y abrir el workspace en Luvin para ejecutar los casos. Luvin lee los archivos cuando abres una colección y no vigila la carpeta: después de un `git pull` o de cambiar de rama, abre **Opciones del workspace**, elige **Cerrar y cambiar de workspace** y abre el workspace otra vez.

## Qué aprendiste

- Un workspace en una carpeta son archivos de texto, listos para git.
- Los valores de los secretos nunca van a los archivos: solo sus nombres.
- Un compañero agrega sus propios secretos después de clonar.
- Un pull request muestra el cambio de un workflow como un diff del Arazzo.
- Los valores escritos en **Inputs** se guardan tal como los escribes en `scenarios/`: usa un secreto para todo lo sensible.

## Siguiente

- [Qué hay en el disco](/es/workspaces/files/)
- [Llevar un workspace en git](/es/workspaces/git/)
- [Privacidad y seguridad](/es/reference/privacy/)
