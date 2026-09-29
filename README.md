# Minuta Analyzer

Aplicación en React + TypeScript + Vite para analizar minutas de desayuno y almuerzo desde archivos Excel.

## Objetivo

- Estandarizar y analizar minutas de alimentación escolar para desayuno y almuerzo.
- Detectar preparaciones no reconocidas por diccionario para mejorar cobertura.
- Entregar resultados visuales y exportables para revisión operativa.

## Contexto del proyecto

Minuta Analyzer es una aplicación para cargar minutas desde Excel, normalizarlas y transformarlas en resultados operativos más fáciles de revisar. El proyecto organiza la lógica por módulos de dominio y usa diccionarios, reglas y normalización de texto para reconocer preparaciones, detectar faltantes y apoyar la revisión operativa.

La aplicación está pensada para:

- Cargar archivos Excel con datos de minuta.
- Analizar el contenido por filas, columnas y categorías relevantes.
- Comparar texto normalizado contra diccionarios y reglas del dominio.
- Detectar elementos no reconocidos y mantener trazabilidad del análisis.
- Mostrar resultados claros y exportables para revisión.

## Prompt base para trabajar en el proyecto

Si quieres usar este README como contexto para otro asistente o para Copilot, este prompt resume el objetivo general del repo:

```text
Estás trabajando en Minuta Analyzer, una app en React + TypeScript + Vite para analizar minutas desde archivos Excel.

Objetivo del sistema:
- Normalizar texto de minutas.
- Comparar datos contra diccionarios y reglas del dominio.
- Identificar elementos no reconocidos para mejorar cobertura.
- Mostrar resultados claros, exportables y útiles para revisión operativa.

Contexto técnico:
- El proyecto está organizado por dominios y utilidades compartidas.
- La lógica de negocio, tipos y datos viven en src/features.
- La UI se compone con componentes en src/components, páginas en src/pages y hooks en src/hooks.
- La normalización de texto es crítica antes de cualquier matching.

Antes de cambiar lógica, revisa cómo afecta el parseo de Excel, la normalización y los diccionarios asociados.
```

## Requisitos previos

- Node.js 20 o superior.
- npm 10 o superior.
- Navegador moderno (Chrome, Edge, Firefox).

## Configuración

Este proyecto actualmente no requiere variables de entorno (`.env`) para ejecutarse en local.

## Estructura del proyecto

```text
src/
|-- App.tsx
|-- main.tsx
|-- components/
|   |-- AppHeader.tsx
|   |-- DataTable.tsx
|   |-- DictionaryManager.tsx
|   |-- ExcelUploader.tsx
|   |-- ResultsView.tsx
|   |-- SidePanel.tsx
|   |-- UnrecognizedList.tsx
|   |-- lunch/
|   |   |-- LunchCoveragePanel.tsx
|   |   |-- LunchSidePanel.tsx
|   |-- results/
|   |   |-- PendingSection.tsx
|   |   |-- ResultsActions.tsx
|   |   |-- ResultsColumn.tsx
|   |   |-- ResultsInsights.tsx
|   |   |-- RuleBar.tsx
|   |   |-- RulesValidationPanel.tsx
|   |   |-- SectionBreakdown.tsx
|   |   |-- ValidationRow.tsx
|   |-- ui/
|   |   |-- AppIcons.tsx
|   |   |-- EmptyStateCard.tsx
|-- features/
|   |-- breakfast/
|   |   |-- data/
|   |   |   |-- desayuno.rules.json
|   |   |   |-- desayunoDictionary.json
|   |   |-- rules/
|   |   |   |-- validation.ts
|   |   |-- types/
|   |   |   |-- analysis.types.ts
|   |   |   |-- rules.types.ts
|   |   |-- utils/
|   |   |   |-- analysis.ts
|   |   |   |-- addonAggregation.ts
|   |   |   |-- ruleMatching.ts
|   |   |-- index.ts
|   |-- lunch/
|   |   |-- data/
|   |   |   |-- almuerzoDictionary.json
|   |   |-- types/
|   |   |   |-- analysis.types.ts
|   |   |-- utils/
|   |   |   |-- analysis.ts
|   |   |-- index.ts
|-- hooks/
|   |-- useAnalysisState.ts
|   |-- useAppPreferences.ts
|   |-- useDictionary.ts
|   |-- useExcelParser.ts
|   |-- useReportExport.ts
|-- navigation/
|   |-- AppNavigation.tsx
|-- pages/
|   |-- ExplorationPage.tsx
|   |-- ResultsPage.tsx
|   |-- breakfast/
|   |   |-- BreakfastExplorationPage.tsx
|   |   |-- BreakfastResultsPage.tsx
|   |-- lunch/
|   |   |-- LunchExplorationPage.tsx
|   |   |-- LunchResultsPage.tsx
|-- themes/
|   |-- appTheme.ts
|   |-- systemTheme.ts
|   |-- tableTheme.ts
|-- types/
|   |-- app.types.ts
|   |-- breakfast-rules.types.ts
|   |-- excel.types.ts
|   |-- liquid-analysis.types.ts
|-- utils/
|   |-- excel.ts
|   |-- liquidAnalysis.ts
|   |-- lunchAnalysis.ts
|   |-- normalizeText.ts
|   |-- reportExport.ts
```

## Arquitectura

- `features/breakfast` contiene el dominio, reglas, tipos y lógica de desayuno.
- `features/lunch` contiene el dominio, tipos y análisis visual de almuerzo.
- `types/` y `utils/` conservan capas de compatibilidad mientras se migra el código existente.
- `components/`, `pages/` y `hooks/` consumen esos módulos para mantener una UI desacoplada.

## Flujo de trabajo

1. Cargar Excel.
2. Normalizar texto.
3. Ejecutar matching contra el diccionario del bloque correspondiente.
4. Mostrar resultados, no reconocidos y detalle por producto base/variedad.

## Formato esperado del Excel

- Se usa la primera hoja del archivo.
- El parser detecta automáticamente la fila de encabezados (escanea hasta 20 filas).
- Columnas mínimas esperadas para análisis completo:
	- `Dia`
	- `Porción líquida`
	- `Porción sólida`
	- `Entrada`
	- `Principal`
	- `Acompañamiento`
	- `Postre`
	- `Agua`
- La columna `Dia` debe quedar en formato `dd-mm-yyyy` tras parseo.
- Filas sin contenido útil o con metadata administrativa se descartan automáticamente.

## Diccionarios y reglas

- Desayuno:
	- Diccionario: `src/features/breakfast/data/desayunoDictionary.json`
	- Reglas: `src/features/breakfast/data/desayuno.rules.json`
- Almuerzo:
	- Diccionario: `src/features/lunch/data/almuerzoDictionary.json`
- Normalización de texto previa al matching:
	- `src/utils/normalizeText.ts`

## Scripts

- `npm run dev`: inicia servidor de desarrollo con Vite.
- `npm run build`: ejecuta type-check y build de producción.
- `npm run preview`: sirve el build generado localmente.
- `npm run lint`: ejecuta ESLint sobre el proyecto.
- `npm run deploy`: publica `dist/` en GitHub Pages.

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Troubleshooting

- Error al leer Excel:
	- Verifica que el archivo tenga una hoja principal con encabezados detectables.
	- Revisa que `Dia` pueda convertirse a fecha válida.
- Muchas filas en “no reconocidos”:
	- Revisa normalización en `src/utils/normalizeText.ts`.
	- Agrega patrones al diccionario correspondiente.
- Fallo de build:
	- Ejecuta `npm run lint` y corrige errores de tipos/imports.

## Despliegue

- Este repositorio incluye soporte para GitHub Pages.
- Flujo:
	1. `npm run build`
	2. `npm run deploy`

## Contribución

- Usa ramas por cambio (`feature/*`, `fix/*`).
- Mantén cambios acotados por dominio (`features/breakfast` o `features/lunch`).
- Antes de abrir PR:
	1. `npm run lint`
	2. `npm run build`
	3. Verificar análisis con un Excel real.
