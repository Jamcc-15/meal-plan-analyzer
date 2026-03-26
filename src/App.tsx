import { useEffect, useState } from 'react'
import AppHeader from './components/AppHeader.tsx'
import ExplorationPage from './pages/ExplorationPage.tsx'
import ResultsPage from './pages/ResultsPage.tsx'
import useAppPreferences from './hooks/useAppPreferences.ts'
import useAnalysisState from './hooks/useAnalysisState.ts'
import useDictionary from './hooks/useDictionary.ts'
import useReportExport from './hooks/useReportExport.ts'
import useExcelParser from './hooks/useExcelParser.ts'
import { SYSTEM_THEME } from './themes/systemTheme.ts'

function App() {
  const { data, error, isLoading, parseFile, clearData } = useExcelParser()
  const {
    tableFilter,
    setTableFilter,
    selectedPortion,
    setSelectedPortion,
    selectedMeal,
    setSelectedMeal,
    tableDensity,
    setTableDensity,
    clearStoredFilter,
  } = useAppPreferences()
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [hoveredText, setHoveredText] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'exploracion' | 'resultados'>('exploracion')
  const dictionary = useDictionary()
  const {
    summary,
    liquidSummary,
    solidSummary,
    breakfastRawLiquid,
    breakfastRawSolid,
    unrecognizedItems,
    focusHeader,
    productBaseByText,
    selectedProductBase,
    lunchCoverage,
    rowCount,
    analyzedCount,
    recognizedCount,
    filteredRowCount,
    selectedStats,
    hoveredStats,
  } = useAnalysisState({
    data,
    dictionary,
    selectedPortion,
    selectedMeal,
    tableFilter,
    selectedText,
    hoveredText,
  })
  const { exportResultsCsv, exportResultsPdf, previewResultsPdf } = useReportExport({
    liquidSummary,
    solidSummary,
    breakfastRawLiquid,
    breakfastRawSolid,
  })
  const currentStep = !data ? 1 : activeView === 'exploracion' ? 2 : 3

  const handleClearAllData = () => {
    clearData()
    clearStoredFilter()
  }

  useEffect(() => {
    if (data) return
    setSelectedText(null)
    setHoveredText(null)
  }, [data])

  return (
    <div className={SYSTEM_THEME.layout.appShell}>
      <div className={SYSTEM_THEME.layout.appContent}>
        <AppHeader
          currentStep={currentStep}
          activeView={activeView}
          onChangeView={setActiveView}
          hasData={Boolean(data)}
          selectedMeal={selectedMeal}
          onChangeMeal={setSelectedMeal}
          selectedPortion={selectedPortion}
          onChangePortion={setSelectedPortion}
          stats={{
            rowCount,
            analyzedCount,
            recognizedCount,
            unrecognizedCount: selectedMeal === 'desayuno' ? summary.unrecognizedCount : '--',
          }}
        />

        <div key={activeView} className="view-switch">
          {activeView === 'exploracion' ? (
            <ExplorationPage
              data={data}
              error={error}
              isLoading={isLoading}
              parseFile={parseFile}
              onClearData={handleClearAllData}
              tableFilter={tableFilter}
              setTableFilter={setTableFilter}
              rowCount={rowCount}
              filteredRowCount={filteredRowCount}
              selectedText={selectedText}
              setSelectedText={setSelectedText}
              hoveredText={hoveredText}
              setHoveredText={setHoveredText}
              selectedProductBase={selectedProductBase}
              focusHeader={focusHeader}
              productBaseByText={productBaseByText}
              tableDensity={tableDensity}
              setTableDensity={setTableDensity}
              selectedMeal={selectedMeal}
              lunchCoverage={lunchCoverage}
              summary={summary}
              selectedCount={selectedStats.count}
              selectedDays={selectedStats.days}
              hoveredCount={hoveredStats.count}
              hoveredDays={hoveredStats.days}
              unrecognizedItems={unrecognizedItems}
              selectedPortion={selectedPortion}
              onViewResults={() => setActiveView('resultados')}
            />
          ) : (
            <ResultsPage
              data={data}
              selectedMeal={selectedMeal}
              lunchCoverage={lunchCoverage}
              liquidSummary={liquidSummary}
              solidSummary={solidSummary}
              breakfastRawLiquid={breakfastRawLiquid}
              breakfastRawSolid={breakfastRawSolid}
              onExportCsv={exportResultsCsv}
              onExportPdf={exportResultsPdf}
              onPreviewPdf={previewResultsPdf}
              onBackToExploration={() => setActiveView('exploracion')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
