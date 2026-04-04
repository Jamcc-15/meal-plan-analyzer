import type { MealScope } from '../types/app.types.ts'
import type { Nivel } from '../features/breakfast/index.ts'
import type { PortionType } from '../types/liquid-analysis.types.ts'
import { APP_THEME } from '../themes/appTheme.ts'
import type { ReactNode } from 'react'
import AppNavigation from '../navigation/AppNavigation.tsx'
import {
  ExploreIcon,
  LiquidPortionIcon,
  ResultsIcon,
} from './ui/AppIcons.tsx'

type HeaderStats = {
  rowCount: number
  analyzedCount: number
  recognizedCount: number
  unrecognizedCount: number | string
}

type AppHeaderProps = {
  currentStep: number
  activeView: 'exploracion' | 'resultados'
  onChangeView: (view: 'exploracion' | 'resultados') => void
  hasData: boolean
  selectedMeal: MealScope
  onChangeMeal: (meal: MealScope) => void
  selectedPortion: PortionType
  onChangePortion: (portion: PortionType) => void
  selectedNivel: Nivel
  onChangeNivel: (nivel: Nivel) => void
  detectedNivel?: Nivel | null
  stats: HeaderStats
  fileSection?: ReactNode
}

const steps = [
  { id: 1, title: '1. Cargar minuta', help: 'Sube un archivo Excel' },
  { id: 2, title: '2. Revisar datos', help: 'Explora tabla y resumen lateral' },
  { id: 3, title: '3. Analizar resultados', help: 'Ve totales por base y variedad' },
]

const AppHeader = ({
  currentStep,
  activeView,
  onChangeView,
  hasData,
  selectedMeal,
  onChangeMeal,
  selectedPortion,
  onChangePortion,
  selectedNivel,
  onChangeNivel,
  detectedNivel = null,
  stats,
  fileSection,
}: AppHeaderProps) => {
  const detectedNivelLabel =
    detectedNivel === 'transicion' ? 'Transición' : detectedNivel === 'basica' ? 'Básica' : 'Media'

  return (
    <header className="mx-auto mb-6 max-w-6xl sm:mb-8 fade-up">
      <p className={`text-xs font-semibold uppercase tracking-[0.35em] ${APP_THEME.text.accent}`}>
        Analizador de Minutas Alimentarias
      </p>
      <h1 className={`mt-3 text-2xl font-semibold sm:text-3xl md:text-4xl ${APP_THEME.text.title}`}>
        Flujo guiado para analizar minutas
      </h1>
      <p className={`mt-2 max-w-2xl text-sm ${APP_THEME.text.body}`}>
        {hasData
          ? 'Carga el archivo, revisa celdas clave y pasa a resultados con una lectura rápida de hallazgos.'
          : 'Carga un archivo para comenzar el análisis.'}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {steps.map((step) => {
          const isCurrent = currentStep === step.id
          const isDone = currentStep > step.id

          return (
            <div
              key={step.id}
              className={`rounded-2xl border px-4 py-3 shadow-sm transition ${
                isCurrent
                  ? 'border-orange-400 bg-orange-100/80 ring-2 ring-orange-200/80'
                  : isDone
                    ? 'border-emerald-200 bg-emerald-50/70'
                    : 'border-slate-200 bg-white/80'
              }`}
            >
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                {step.id === 1 ? <LiquidPortionIcon className="h-4 w-4" /> : null}
                {step.id === 2 ? <ExploreIcon className="h-4 w-4" /> : null}
                {step.id === 3 ? <ResultsIcon className="h-4 w-4" /> : null}
                {step.title}
              </p>
              <p className="mt-1 text-xs text-slate-600">{step.help}</p>
            </div>
          )
        })}
      </div>

      {hasData ? (
        <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span className="rounded-full border border-slate-200 bg-slate-50/90 px-2.5 py-1">
            Filas Excel: <strong className="text-slate-900">{stats.rowCount}</strong>
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50/90 px-2.5 py-1">
            Analizadas: <strong className="text-slate-900">{stats.analyzedCount}</strong>
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50/90 px-2.5 py-1">
            Reconocidos: <strong className="text-slate-900">{stats.recognizedCount}</strong>
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50/90 px-2.5 py-1">
            No reconocidos: <strong className="text-slate-900">{stats.unrecognizedCount}</strong>
          </span>
        </div>
      ) : null}

      {fileSection ? <div className="mt-4">{fileSection}</div> : null}

      {hasData && selectedMeal === 'desayuno' ? (
        <div className={`mt-3 max-w-xl p-3 sm:p-3.5 ${APP_THEME.surface.panel}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">Nivel</p>
          {detectedNivel ? (
            <p className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              Nivel detectado: {detectedNivelLabel}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">
            {detectedNivel
              ? 'Detectado automáticamente. Puedes ajustarlo si corresponde.'
              : 'No se detectó automáticamente. Selecciona el nivel manualmente.'}
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {([
              ['transicion', 'Transición'],
              ['basica', 'Básica'],
              ['media', 'Media'],
            ] as const).map(([nivelValue, nivelLabel]) => (
              <button
                key={nivelValue}
                type="button"
                className={`motion-icon motion-lift rounded-xl border px-3 py-2 text-sm font-semibold ${
                  selectedNivel === nivelValue
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => onChangeNivel(nivelValue)}
              >
                {nivelLabel}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {hasData ? (
        <AppNavigation
          activeView={activeView}
          onChangeView={onChangeView}
          selectedMeal={selectedMeal}
          onChangeMeal={onChangeMeal}
          selectedPortion={selectedPortion}
          onChangePortion={onChangePortion}
        />
      ) : null}
    </header>
  )
}

export default AppHeader
