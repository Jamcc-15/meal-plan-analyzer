import LunchCoveragePanel from '../../components/lunch/LunchCoveragePanel.tsx'
import type { LunchCoverageItem } from '../../types/app.types.ts'
import type { ExcelData } from '../../types/excel.types.ts'
import EmptyStateCard from '../../components/ui/EmptyStateCard.tsx'

type LunchExplorationPageProps = {
  data: ExcelData | null
  lunchCoverage: LunchCoverageItem[]
}

const LunchExplorationPage = ({ data, lunchCoverage }: LunchExplorationPageProps) => {
  if (!data) {
    return (
      <main className="mx-auto w-full max-w-4xl">
        <EmptyStateCard
          title="Carga una minuta"
          description="Sube un archivo Excel para comenzar el análisis."
        />
      </main>
    )
  }

  return (
    <main className="space-y-6">
      <LunchCoveragePanel
        title="Almuerzo en construcción"
        description="Sección preparada para Entrada, Principal, Acompañamiento, Postre y Agua."
        items={lunchCoverage}
        showAction
      />
    </main>
  )
}

export default LunchExplorationPage
