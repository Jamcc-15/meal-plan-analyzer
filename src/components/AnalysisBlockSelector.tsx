import type { MealScope } from '../types/app.types.ts'
import { BreakfastIcon, LunchIcon } from './ui/AppIcons.tsx'

type AnalysisBlockSelectorProps = {
  selectedMeal: MealScope
  onChangeMeal: (meal: MealScope) => void
}

const AnalysisBlockSelector = ({ selectedMeal, onChangeMeal }: AnalysisBlockSelectorProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
    <div className="flex flex-col items-center gap-3 text-center">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Bloque a analizar
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Selecciona el servicio que quieres evaluar en este informe.
        </p>
      </div>
      <div className="grid w-full max-w-md grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          className={`motion-lift min-w-32 rounded-lg px-5 py-3 text-base font-semibold ${
            selectedMeal === 'desayuno'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-slate-700 hover:bg-white'
          }`}
          onClick={() => onChangeMeal('desayuno')}
        >
          <BreakfastIcon className="mr-2 inline h-4 w-4" />
          Desayuno
        </button>
        <button
          type="button"
          className={`motion-lift min-w-32 rounded-lg px-5 py-3 text-base font-semibold ${
            selectedMeal === 'almuerzo'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-white'
          }`}
          onClick={() => onChangeMeal('almuerzo')}
        >
          <LunchIcon className="mr-2 inline h-4 w-4" />
          Almuerzo
        </button>
      </div>
    </div>
  </section>
)

export default AnalysisBlockSelector
