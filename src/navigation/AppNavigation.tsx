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
} from '../components/ui/AppIcons.tsx'

type AppNavigationProps = {
  activeView: 'exploracion' | 'resultados'
  onChangeView: (view: 'exploracion' | 'resultados') => void
  selectedMeal: MealScope
  selectedPortion: PortionType
  onChangePortion: (portion: PortionType) => void
}

const AppNavigation = ({
  activeView,
  onChangeView,
  selectedMeal,
  selectedPortion,
  onChangePortion,
}: AppNavigationProps) => {
  return (
    <div className="mt-6 space-y-4">
      <div>
        <div
          className={`motion-lift group rounded-2xl border p-4 text-left transition ${
            activeView === 'resultados'
              ? 'border-orange-300 bg-white text-slate-900 shadow-[0_18px_35px_-24px_rgba(234,88,12,0.38)] ring-1 ring-orange-100'
              : 'border-orange-200 bg-linear-to-br from-orange-50 via-white to-amber-50 text-slate-900 shadow-[0_18px_35px_-28px_rgba(234,88,12,0.8)] hover:border-orange-400'
          }`}
          onClick={() => onChangeView('resultados')}
        >
          <span className="flex items-start justify-between gap-4">
            <span>
              <span className="block text-lg font-bold sm:text-xl">Analizar resultados</span>
              <span className="mt-2 block text-xs text-slate-600 sm:text-sm">
                Revisa cumplimiento, totales y hallazgos de la minuta.
              </span>
            </span>
            <ResultsIcon className="mt-1 h-6 w-6 shrink-0" />
          </span>
          <span className="mt-4 inline-flex items-center text-xs font-semibold text-orange-700">
            {activeView === 'resultados' ? 'Resultados visibles' : 'Ver análisis'}
            <span aria-hidden="true" className="ml-2 text-base">
              →
            </span>
          </span>
        </div>

        <button
          type="button"
          className={`motion-lift mt-3 flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
            activeView === 'exploracion'
              ? 'border-orange-200 bg-orange-50/70 text-slate-900 shadow-sm'
              : 'border-orange-100 bg-white/70 text-slate-600 hover:border-orange-200 hover:bg-orange-50/40'
          }`}
          onClick={() => onChangeView('exploracion')}
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100">
              <ExploreIcon className="h-4 w-4 text-orange-600" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">Revisar datos</span>
              <span className="mt-0.5 block truncate text-xs text-slate-600">
                Explora la tabla y revisa los registros cargados.
              </span>
            </span>
          </span>
          <span className="shrink-0 text-xs font-semibold text-orange-700">
            Abrir <span aria-hidden="true" className="ml-1 text-sm">→</span>
          </span>
        </button>
      </div>

      {activeView === 'exploracion' ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Contexto de revisión
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Estás revisando los datos del bloque seleccionado.
            </p>
          </div>
          <button
            type="button"
            className="motion-lift inline-flex items-center justify-center self-start rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 hover:border-orange-300 hover:bg-orange-100 sm:self-auto"
            onClick={() => onChangeView('resultados')}
          >
            Volver a analizar
            <span aria-hidden="true" className="ml-2 text-sm">
              →
            </span>
          </button>
        </div>
      ) : null}

      {activeView === 'exploracion' ? (
        <div className={`overflow-hidden transition-all duration-300 ${APP_THEME.surface.panel}`}>
          {selectedMeal === 'desayuno' ? (
            <div className="fade-up block-breakfast-panel p-2.5 sm:p-3">
              <div className="mb-1.5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-600">
                    Opciones del bloque desayuno
                  </p>
                  <p className="mt-0.5 text-xs text-slate-700">
                    Elige la porción que quieres analizar dentro del desayuno.
                  </p>
                </div>
                <BreakfastIcon className="mt-0.5 h-4 w-4 text-orange-600" />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  className={`motion-icon motion-lift portion-option flex items-center rounded-xl border px-3 py-2 text-left text-xs font-semibold sm:text-sm ${
                    selectedPortion === 'porcion_liquida'
                      ? 'portion-option--active border-orange-500 bg-orange-500 text-white'
                      : 'border-orange-200 bg-white/70 text-slate-700 hover:bg-orange-50'
                  }`}
                  onClick={() => onChangePortion('porcion_liquida')}
                >
                  <LiquidPortionIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span>Porción líquida</span>
                </button>
                <button
                  type="button"
                  className={`motion-icon motion-lift portion-option flex items-center rounded-xl border px-3 py-2 text-left text-xs font-semibold sm:text-sm ${
                    selectedPortion === 'porcion_solida'
                      ? 'portion-option--active border-orange-500 bg-orange-500 text-white'
                      : 'border-orange-200 bg-white/70 text-slate-700 hover:bg-orange-50'
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
                  Bloque almuerzo activo
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Ya puedes analizar entrada, principal, acompañamiento, postre y bebida desde
                  este bloque.
                </p>
              </div>
              <LunchIcon className="mt-0.5 h-5 w-5 text-sky-600" />
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default AppNavigation
