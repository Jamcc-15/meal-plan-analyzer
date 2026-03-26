import type { MealScope } from '../types/app.types.ts'
import type { PortionType } from '../types/liquid-analysis.types.ts'
import { APP_THEME } from '../themes/appTheme.ts'
import {
  BreakfastIcon,
  ExploreIcon,
  LiquidPortionIcon,
  LunchIcon,
  ResultsIcon,
  SolidPortionIcon,
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
  stats: HeaderStats
}

const steps = [
  { id: 1, title: '1. Cargar minuta', help: 'Sube un archivo Excel o CSV' },
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
  stats,
}: AppHeaderProps) => {
  return (
    <header className="mx-auto mb-6 max-w-6xl sm:mb-8 fade-up">
      <p className={`text-xs font-semibold uppercase tracking-[0.35em] ${APP_THEME.text.accent}`}>
        Analizador de Minutas Alimentarias
      </p>
      <h1 className={`mt-3 text-2xl font-semibold sm:text-3xl md:text-4xl ${APP_THEME.text.title}`}>
        Flujo guiado para analizar minutas
      </h1>
      <p className={`mt-2 max-w-2xl text-sm sm:text-base ${APP_THEME.text.body}`}>
        {hasData
          ? 'Carga el archivo, revisa celdas clave y pasa a resultados con una lectura rápida de hallazgos.'
          : 'Carga un archivo para comenzar el análisis.'}
      </p>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {steps.map((step) => {
          const isCurrent = currentStep === step.id
          const isDone = currentStep > step.id

          return (
            <div
              key={step.id}
              className={`rounded-2xl border px-4 py-3 shadow-sm transition ${
                isCurrent
                  ? 'border-orange-300 bg-orange-50/80'
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
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 shadow-sm">
            Filas Excel: <strong className="text-slate-900">{stats.rowCount}</strong>
          </span>
          <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 shadow-sm">
            Analizadas: <strong className="text-slate-900">{stats.analyzedCount}</strong>
          </span>
          <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 shadow-sm">
            Reconocidos: <strong className="text-slate-900">{stats.recognizedCount}</strong>
          </span>
          <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 shadow-sm">
            No reconocidos: <strong className="text-slate-900">{stats.unrecognizedCount}</strong>
          </span>
        </div>
      ) : null}

      {hasData ? (
        <>
          <div className={`mt-5 inline-flex p-1 ${APP_THEME.surface.panel}`}>
            <button
              type="button"
              className={`motion-icon motion-lift rounded-xl px-3 py-2 text-sm font-semibold ${
                activeView === 'exploracion'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              onClick={() => onChangeView('exploracion')}
            >
              <ExploreIcon className="mr-2 inline h-4 w-4" />
              2. Revisar datos
            </button>
            <button
              type="button"
              className={`motion-icon motion-lift rounded-xl px-3 py-2 text-sm font-semibold ${
                activeView === 'resultados'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              onClick={() => onChangeView('resultados')}
            >
              <ResultsIcon className="mr-2 inline h-4 w-4" />
              3. Analizar resultados
            </button>
          </div>

          <div className={`mt-3 inline-flex p-1 ${APP_THEME.surface.panel}`}>
            <button
              type="button"
              className={`motion-icon motion-lift rounded-xl px-3 py-2 text-sm font-semibold ${
                selectedMeal === 'desayuno'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              onClick={() => onChangeMeal('desayuno')}
            >
              <BreakfastIcon className="mr-2 inline h-4 w-4" />
              Bloque Desayuno
            </button>
            <button
              type="button"
              className={`motion-icon motion-lift rounded-xl px-3 py-2 text-sm font-semibold ${
                selectedMeal === 'almuerzo'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              onClick={() => onChangeMeal('almuerzo')}
            >
              <LunchIcon className="mr-2 inline h-4 w-4" />
              Bloque Almuerzo (en construcción)
            </button>
          </div>

          <div className={`mt-3 overflow-hidden transition-all duration-300 ${APP_THEME.surface.panel}`}>
            {selectedMeal === 'desayuno' ? (
              <div className="fade-up p-3 sm:p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                      Opciones del bloque desayuno
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Elige la porción que quieres analizar dentro del desayuno.
                    </p>
                  </div>
                  <BreakfastIcon className="mt-0.5 h-5 w-5 text-orange-500" />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    className={`motion-icon motion-lift flex items-center rounded-xl border px-3 py-3 text-left text-sm font-semibold ${
                      selectedPortion === 'porcion_liquida'
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-orange-200 bg-orange-50/70 text-slate-700 hover:bg-orange-100'
                    }`}
                    onClick={() => onChangePortion('porcion_liquida')}
                  >
                    <LiquidPortionIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span>Porción líquida</span>
                  </button>
                  <button
                    type="button"
                    className={`motion-icon motion-lift flex items-center rounded-xl border px-3 py-3 text-left text-sm font-semibold ${
                      selectedPortion === 'porcion_solida'
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-orange-200 bg-orange-50/70 text-slate-700 hover:bg-orange-100'
                    }`}
                    onClick={() => onChangePortion('porcion_solida')}
                  >
                    <SolidPortionIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span>Porción sólida</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="fade-up flex items-start justify-between gap-3 p-3 sm:p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                    Bloque almuerzo seleccionado
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Este bloque está en construcción. Pronto podrás analizar entrada, principal,
                    acompañamiento, postre y agua desde aquí.
                  </p>
                </div>
                <LunchIcon className="mt-0.5 h-5 w-5 text-sky-600" />
              </div>
            )}
          </div>
        </>
      ) : null}
    </header>
  )
}

export default AppHeader
