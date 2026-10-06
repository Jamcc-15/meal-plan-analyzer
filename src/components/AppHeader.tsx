import type { MealScope } from '../types/app.types.ts'
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
  selectedPortion: PortionType
  onChangePortion: (portion: PortionType) => void
  stats: HeaderStats
  fileSection?: ReactNode
}

const steps = [
  { id: 1, title: '1. Cargar minuta', help: 'Sube un archivo Excel' },
  { id: 2, title: 'Revisar datos', help: 'Explora tabla y resumen lateral' },
  { id: 3, title: 'Analizar resultados', help: 'Ve totales por base y variedad' },
]

const AppHeader = ({
  currentStep,
  activeView,
  onChangeView,
  hasData,
  selectedMeal,
  selectedPortion,
  onChangePortion,
  stats,
  fileSection,
}: AppHeaderProps) => {
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

      {hasData ? (
        <AppNavigation
          activeView={activeView}
          onChangeView={onChangeView}
          selectedMeal={selectedMeal}
          selectedPortion={selectedPortion}
          onChangePortion={onChangePortion}
        />
      ) : null}
    </header>
  )
}

export default AppHeader
