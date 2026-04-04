import { useEffect, useState } from 'react'
import AppHeader from './components/AppHeader.tsx'
import ExcelUploader from './components/ExcelUploader.tsx'
import BreakfastExplorationPage from './pages/breakfast/BreakfastExplorationPage.tsx'
import BreakfastResultsPage from './pages/breakfast/BreakfastResultsPage.tsx'
import LunchExplorationPage from './pages/lunch/LunchExplorationPage.tsx'
import LunchResultsPage from './pages/lunch/LunchResultsPage.tsx'
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
    selectedNivel,
    setSelectedNivel,
    tableDensity,
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
    unrecognizedItemsCombined,
    productBaseByText,
    selectedProductBase,
    lunchCoverage,
    rowCount,
    analyzedCount,
    recognizedCount,
    filteredRowCount,
    selectedStats,
    hoveredStats,
    breakfastValidation,
    liquidDrilldown,
    solidDrilldown,
  } = useAnalysisState({
    data,
    dictionary,
    selectedPortion,
    selectedMeal,
    selectedNivel,
    tableFilter,
    selectedText,
    hoveredText,
  })
  const { exportResultsPdf, previewResultsPdf } = useReportExport({
    liquidSummary,
    solidSummary,
    breakfastRawLiquid,
    breakfastRawSolid,
    breakfastValidation,
    selectedNivel,
  })
  const currentStep = !data ? 1 : activeView === 'exploracion' ? 2 : 3

  const handleInspectProduct = (productBase: string) => {
    setSelectedMeal('desayuno')
    setTableFilter(productBase)
    setSelectedText(productBase)
    setActiveView('exploracion')
  }

  const handleClearAllData = () => {
    clearData()
    clearStoredFilter()
  }

  useEffect(() => {
    if (data) return
    setSelectedText(null)
    setHoveredText(null)
  }, [data])

  useEffect(() => {
    if (!data?.detectedNivel) return
    setSelectedNivel(data.detectedNivel)
  }, [data?.detectedNivel, setSelectedNivel])

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
          selectedNivel={selectedNivel}
          onChangeNivel={setSelectedNivel}
          detectedNivel={data?.detectedNivel ?? null}
          stats={{
            rowCount,
            analyzedCount,
            recognizedCount,
            unrecognizedCount: selectedMeal === 'desayuno' ? summary.unrecognizedCount : '--',
          }}
          fileSection={
            activeView === 'exploracion' ? (
              <ExcelUploader
                onFileSelected={parseFile}
                onClearData={handleClearAllData}
                hasData={Boolean(data)}
                isLoading={isLoading}
                error={error}
              />
            ) : null
          }
        />

        <div key={activeView} className="view-switch">
          {activeView === 'exploracion' && selectedMeal === 'desayuno' ? (
            <BreakfastExplorationPage
              data={data}
              tableFilter={tableFilter}
              setTableFilter={setTableFilter}
              rowCount={rowCount}
              filteredRowCount={filteredRowCount}
              selectedText={selectedText}
              setSelectedText={setSelectedText}
              hoveredText={hoveredText}
              setHoveredText={setHoveredText}
              selectedProductBase={selectedProductBase}
              productBaseByText={productBaseByText}
              tableDensity={tableDensity}
              summary={summary}
              selectedCount={selectedStats.count}
              selectedDays={selectedStats.days}
              hoveredCount={hoveredStats.count}
              hoveredDays={hoveredStats.days}
              unrecognizedItems={unrecognizedItems}
              failingRules={
                selectedPortion === 'porcion_liquida'
                  ? breakfastValidation.porcion_liquida.filter((item) => item.estado === 'no_cumple')
                  : breakfastValidation.porcion_solida.filter((item) => item.estado === 'no_cumple')
              }
              selectedPortion={selectedPortion}
              onViewResults={() => setActiveView('resultados')}
            />
          ) : null}

          {activeView === 'exploracion' && selectedMeal === 'almuerzo' ? (
            <LunchExplorationPage data={data} lunchCoverage={lunchCoverage} />
          ) : null}

          {activeView === 'resultados' && selectedMeal === 'desayuno' ? (
            <BreakfastResultsPage
              data={data}
              liquidSummary={liquidSummary}
              solidSummary={solidSummary}
              breakfastRawLiquid={breakfastRawLiquid}
              breakfastRawSolid={breakfastRawSolid}
              unrecognizedItems={unrecognizedItemsCombined}
              selectedNivel={selectedNivel}
              breakfastValidation={breakfastValidation}
              liquidDrilldown={liquidDrilldown}
              solidDrilldown={solidDrilldown}
              onExportPdf={exportResultsPdf}
              onPreviewPdf={previewResultsPdf}
              onBackToExploration={() => setActiveView('exploracion')}
              onInspectProduct={handleInspectProduct}
            />
          ) : null}

          {activeView === 'resultados' && selectedMeal === 'almuerzo' ? (
            <LunchResultsPage data={data} lunchCoverage={lunchCoverage} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default App
