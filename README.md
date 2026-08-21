# Savings Goal Wallet

Technical challenge de React Native para una experiencia de metas de ahorro.
La aplicación combina una pantalla nativa de listado, una micro-app web
embebida en un WebView, Redux Toolkit, comunicación bidireccional mediante
`postMessage` y una librería nativa reutilizable.

## Desarrollo rápido

Desde la raíz del monorepo:

```bash
yarn install
yarn dev
```

`yarn dev` solicita Android o iOS, inicia Vite y después arranca la plataforma
React Native seleccionada. En Android también ejecuta `adb reverse` para que el
WebView pueda acceder al servidor local en el puerto `5173`.

## Arquitectura

El proyecto usa una arquitectura Clean/Lean con patrones tácticos de DDD. Las
dependencias apuntan hacia el dominio:

```text
Presentation  ->  Application  ->  Domain
      |                |
      v                v
Infrastructure implements ports and adapters
```

### Capas

| Capa | Responsabilidad | Ubicación |
| --- | --- | --- |
| Domain | Entidades, value objects, eventos y reglas de negocio. No depende de React Native, Redux ni WebView. | `app/src/domain/` |
| Application | Casos de uso y orquestación mediante dependencias recibidas como parámetros. | `app/src/application/` |
| Infrastructure | Redux como proyección, repositorio en memoria y adaptadores para WebView y módulo nativo. | `app/src/infrastructure/` |
| Presentation | Screens, componentes y hooks que componen la experiencia. | `app/src/presentation/` |

Los casos de uso principales son `GetGoals` y `MakeDeposit`. El procesamiento
del mensaje WebView se hace a través de `WebViewMessageAdapter`; no existe
`createAsyncThunk` ni lógica de dominio en los reducers.

El repositorio actual es `InMemoryGoalRepository`, compartido por el singleton
del hook `useGoals`. Por ello los datos se reinician al reiniciar la aplicación;
no hay persistencia ni backend.

La arquitectura detallada y sus decisiones están en
[`docs/architecture.md`](docs/architecture.md) y [`docs/adr/`](docs/adr/).

## Estructura del monorepo

```text
/
├── app/                                  # Aplicación React Native
│   ├── src/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── __tests__/                        # Tests Jest por capa
│   ├── android/
│   └── ios/
├── web/                                  # Micro-app Vite para el WebView
│   └── src/
├── libraries/
│   └── native-implementations/           # Librería TurboModule
├── docs/                                 # Specs, ADRs y trazabilidad
├── scripts/start-project.js              # Orquestador de desarrollo
└── package.json                          # Workspace Yarn
```

Los workspaces son `app`, `web` y `libraries/*`. El paquete de la librería se
llama `react-native-native-implementations`.

## Dominio y estado

El agregado `SavingsGoal` trabaja con montos enteros en pesos colombianos
(COP). Sus conceptos principales son `Money`, `Progress`, `GoalId`,
`Deposit` y el evento `GoalCompleted`.

Las fábricas de dominio validan sus invariantes y retornan `Result`; los
errores son valores discriminados por `kind`. `applyDeposit` valida el abono,
calcula el progreso y emite `GoalCompleted` únicamente cuando el depósito cruza
el 100% por primera vez.

Redux Toolkit representa el estado de aplicación y no reemplaza al dominio.
Los reducers son transformaciones puras; `selectAllGoals` permanece memoizado
mediante `createSelector`.

## Contrato WebView (`postMessage`)

La comunicación es bidireccional y usa exclusivamente mensajes JSON. El
adaptador valida el mensaje crudo antes de entregarlo a la aplicación.

```text
React Native --postMessage(JSON)--> WebView
React Native <--postMessage(JSON)-- WebView
```

### Web hacia React Native

La micro-app envía estos mensajes con
`window.ReactNativeWebView.postMessage(JSON.stringify(message))`:

```typescript
type WebToNativeMessage =
  | { type: 'WEB_READY' }
  | {
      type: 'DEPOSIT_CONFIRMED';
      payload: { goalId: string; amount: number };
    };
```

`DEPOSIT_CONFIRMED` requiere un `goalId` no vacío y un `amount` que sea un
número finito positivo. Un JSON inválido, un tipo desconocido o un payload
inválido se convierte en un `ParseError` y no atraviesa el boundary.

### React Native hacia Web

React Native envía los mensajes mediante `webViewRef.current?.postMessage`:

```typescript
type NativeToWebMessage =
  | {
      type: 'SESSION_INIT';
      payload: {
        sessionId: string;
        goalId: string;
        goalName: string;
        targetAmount: number;
        accumulatedAmount: number;
        progressPercentage: number;
        isCompleted: boolean;
        userInfo: { displayName: string };
      };
    }
  | {
      type: 'GOAL_UPDATED';
      payload: {
        goalId: string;
        goalName: string;
        targetAmount: number;
        accumulatedAmount: number;
        progressPercentage: number;
        isCompleted: boolean;
      };
    };
```

El flujo es: la web anuncia `WEB_READY`, React Native responde con
`SESSION_INIT`, la web confirma el abono, `MakeDeposit` actualiza el dominio y
Redux, y finalmente React Native envía `GOAL_UPDATED` para refrescar la vista
web sin remontarla.

El contrato completo está en
[`docs/spec/03-webview-contract.md`](docs/spec/03-webview-contract.md). El
adaptador que procesa `event.nativeEvent.data` es
`app/src/infrastructure/adapters/WebViewMessageAdapter.ts`; la Presentation
no interpreta directamente el JSON crudo.

## Librería nativa

La librería independiente vive en
`libraries/native-implementations/` y se consume desde la app únicamente a
través de `NativeDialogAdapter`.

Está implementada como TurboModule/codegen y expone:

```typescript
showConfirmDialog(options: {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onPress: () => void;
  onCancel?: () => void;
}): void;
```

La capacidad se utiliza para mostrar los diálogos de abono exitoso y meta
completada. La integración y el contrato nativo están descritos en
[`docs/spec/05-native-library.md`](docs/spec/05-native-library.md).

## Requisitos y configuración

- Node.js `>=18`.
- Yarn Classic para el workspace raíz.
- Android Studio, Android SDK, un emulador o dispositivo Android y JDK para
  Android.
- Xcode y CocoaPods para iOS.
- Un dispositivo o simulador configurado para React Native 0.81.

Instala dependencias desde la raíz:

```bash
yarn install
```

El `postinstall` compila automáticamente la librería nativa con `bob`. Si se
cambian archivos en `libraries/native-implementations/src/`, recompílala
manualmente porque `app/` consume `lib/module/`:

```bash
cd libraries/native-implementations
npx bob build
```

## Ejecutar la aplicación

### Opción recomendada

```bash
yarn dev
```

El script pregunta la plataforma y arranca el servidor Vite y la aplicación.

### Comandos separados

Servidor web:

```bash
yarn workspace savings-goal-web dev
```

Aplicación Android:

```bash
adb reverse tcp:5173 tcp:5173
yarn workspace app android
```

Aplicación iOS:

```bash
yarn workspace app ios
```

El WebView usa por defecto `http://localhost:5173/`. El simulador iOS puede
resolver `localhost`; Android necesita `adb reverse`. Un dispositivo iOS
físico debe usar la dirección LAN del equipo de desarrollo en
`app/src/infrastructure/config/webViewConfig.ts`, ya que la configuración
actual no lee una variable de entorno.

## Tests y validación

Los tests cubren el dominio, casos de uso, reducers y selectors de Redux, el
parser del contrato WebView, el adaptador del diálogo nativo y un smoke test de
la app. `web/` y la integración real del WebView quedan fuera de los tests
unitarios porque requieren un dispositivo o navegador/runtime específico.

Ejecutar los tests de la app:

```bash
yarn workspace app test
```

Con coverage:

```bash
yarn workspace app test --coverage
```

Lint y typecheck:

```bash
yarn workspace app lint
cd app
npx tsc --noEmit
```

Tests y typecheck de la librería:

```bash
cd libraries/native-implementations
npx jest
npx tsc
```

La estrategia completa está en
[`docs/spec/07-test-strategy.md`](docs/spec/07-test-strategy.md).

## Limitaciones conocidas

- El repositorio de metas es en memoria y se reinicia al cerrar la app.
- No existe backend, autenticación, persistencia real ni auditoría de
  transacciones.
- La URL del WebView está configurada para desarrollo local.
- La comunicación WebView se valida en el adapter nativo; la micro-app web no
  tiene una suite de tests propia.

## Documentación

- [`docs/architecture.md`](docs/architecture.md): arquitectura y decisiones.
- [`docs/spec/`](docs/spec/): requisitos, dominio, contrato, Redux,
  aceptación, tests y trazabilidad.
- [`docs/adr/`](docs/adr/): decisiones arquitectónicas.
- [`docs/ia/USO_IA.md`](docs/ia/USO_IA.md): registro del uso de IA.

## Flujo principal

1. La app carga las metas desde el repositorio en memoria.
2. El usuario abre el detalle de una meta.
3. El WebView anuncia `WEB_READY` y recibe `SESSION_INIT`.
4. El usuario confirma un abono desde la micro-app web.
5. El adapter valida `DEPOSIT_CONFIRMED`.
6. `MakeDeposit` ejecuta las reglas de `SavingsGoal`.
7. Redux proyecta el nuevo estado y el WebView recibe `GOAL_UPDATED`.
8. Si la meta se completa, el adaptador nativo muestra el diálogo
   correspondiente.
