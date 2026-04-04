import LunchCoveragePanel from '../../components/lunch/LunchCoveragePanel.tsx'
import EmptyStateCard from '../../components/ui/EmptyStateCard.tsx'
import type { LunchCoverageItem } from '../../types/app.types.ts'
import type { ExcelData } from '../../types/excel.types.ts'

type LunchResultsPageProps = {
  data: ExcelData | null
  lunchCoverage: LunchCoverageItem[]
}

const LunchResultsPage = ({ data, lunchCoverage }: LunchResultsPageProps) => {
  if (!data) {
    return (
      <main className="mx-auto w-full max-w-4xl">
        <EmptyStateCard
          title="No hay archivo cargado"
          description="Para ver resultados, primero debes cargar una minuta en Vista Exploración."
          centered
        />
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-4xl">
      <LunchCoveragePanel
        title="Resultados de Almuerzo en construcción"
        description="Ya detectamos columnas del bloque almuerzo. El siguiente paso es implementar reglas de clasificación para Entrada, Principal, Acompañamiento, Postre y Agua."
        items={lunchCoverage}
      />
    </main>
  )
}

export default LunchResultsPage
