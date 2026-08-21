# USO DE IA — Savings Goal Wallet

## Herramienta utilizada
GitHub Copilot (Claude Sonnet 4.6) dentro de VS Code.

---

## Lo que fue generado con IA

| Artefacto | Participación IA |
|-----------|----------------|
| Fase de especificación (docs/spec/, ADRs, architecture.md) | IA generó el contenido completo a partir del prompt de arquitectura; el desarrollador revisó y aprobó las decisiones antes de continuar |
| `src/domain/` — entidades, value objects, errores, eventos | IA generó la estructura inicial; el desarrollador validó las invariantes y reglas de negocio |
| `src/application/` — use cases, ports | IA generó; el desarrollador verificó el flujo y las dependencias |
| `src/infrastructure/adapters/` — contrato y adapter de postMessage | IA generó los tipos discriminados y la lógica de validación |
| `src/infrastructure/store/` — Redux slice, selectors, store | IA generó la estructura; el desarrollador decidió no usar `createAsyncThunk` |
| `src/infrastructure/repositories/InMemoryGoalRepository.ts` | IA generó con seed data |
| `src/presentation/` — screens, components, hook | IA generó el boilerplate; el desarrollador revisó el flujo de navegación |
| `web/` — micro-app Vite para el WebView | IA generó la estructura HTML/CSS/JS y migró la carga desde HTML generado al dev server; el desarrollador eligió eliminar el fallback inline |
| `__tests__/` — todos los tests | IA generó los casos de prueba; el desarrollador verificó cobertura de edge cases |
| `jest.config.js` — configuración de transforms y mocks | IA diagnosticó y resolvió problemas de ESM y módulos nativos |
| `docs/` — toda la documentación | IA generó a partir de las decisiones tomadas durante el desarrollo |
| Configuración local del WebView | IA centralizó host y puerto, configuró Vite y documentó `adb reverse`; el desarrollador definió que ambas plataformas fueran configurables |

---

## Lo que fue escrito/modificado por el desarrollador

| Decisión | Justificación |
|----------|--------------|
| Rechazar arquitectura hexagonal completa | Demasiado ceremony para una demo de 30 min |
| Elegir Option B para librería nativa (`showConfirmDialog`) | Mejor balance demo value / tiempo / TurboModule |
| No usar `createAsyncThunk` | Mantener Redux como capa de proyección, no como orquestador |
| Diferir `libreria/` a P1 | Priorizar P0 funcional antes que P1 incompleto |
| Mover `web/` fuera de `app/` | Decisión arquitectónica del desarrollador — la IA tenía el HTML inline dentro de app |
| Corrección de rutas de importación en tests (`../../../` → `../../`) | Error introducido por la IA; corregido en la fase de validación |

---

## Prompts utilizados

1. Prompt inicial de arquitectura (documento de especificación completo)
2. "Start implementation" — inició la implementación desde el plan aprobado
3. "Quiero aclarar que por ahora no hagamos la parte nativa, retoma omitiendo lo nativo"
4. "Para la parte web debería ser una micro app dentro del monorepo no debería estar dentro del app"
5. "No veo los archivos .md que se plantearon desde el inicio"
6. "Servir el WebView desde el dev server de Vite"

---

## Lo que fue rechazado

| Sugerencia IA | Razón del rechazo |
|---------------|------------------|
| Usar `createAsyncThunk` para el depósito | Viola el principio de Redux como infraestructura |
| Mantener HTML inline en `app/src/web/` como fuente de verdad | No arquitectónicamente correcto — web app debe ser paquete independiente |
| Arquitectura hexagonal completa con ports explícitos | Over-engineering para el scope del challenge |

---

## Lo que fue corregido

| Problema | Corrección |
|---------|-----------|
| Rutas de importación en tests (`../../../src/` incorrecto) | Corregido a `../../src/` |
| `setupFilesAfterFramework` (typo en jest.config.js) | Eliminado — propiedad inexistente |
| `selectAllGoals` sin memoización causaba warning de react-redux v9 y exit code 1 | Envuelto con `createSelector` |
| `SafeAreaView` de `react-native` deprecado | Migrado a `react-native-safe-area-context` |
| `SESSION_INIT` no enviaba datos del goal | Extendido el tipo `NativeToWebMessage` y el payload |
| El WebView consumía un bundle inline que podía quedar desactualizado | Sustituido por la URL configurable del dev server de Vite |

---

## Decisiones humanas clave

1. **Arquitectura**: Lean Clean Architecture en lugar de hexagonal completa — más demostrable en 30 min
2. **Priorización**: P0 completo y testado antes de tocar P1 (librería nativa)
3. **Web como paquete independiente**: El desarrollador identificó que el HTML inline dentro de `app/` era arquitectónicamente incorrecto
4. **IA como asistente**: Todas las decisiones arquitectónicas fueron revisadas y aprobadas por el desarrollador antes de generar código
5. **Carga web en desarrollo**: El desarrollador eligió eliminar por completo el bundle inline y usar Vite mediante una URL configurable
