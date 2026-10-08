import { useEffect, useState } from 'react'
import AppHeader from './components/AppHeader.tsx'
import ExcelUploader from './components/ExcelUploader.tsx'
import BreakfastExplorationPage from './pages/breakfast/BreakfastExplorationPage.tsx'
import BreakfastResultsPage from './pages/breakfast/BreakfastResultsPage.tsx'
import LunchExplorationPage from './pages/lunch/LunchExplorationPage.tsx'
import LunchResultsPage from './pages/lunch/LunchResultsPage.tsx'
import useAppPreferences from './hooks/useAppPreferences.ts'
import useAnalysisState from './hooks/useAnalysisState.ts'
import usePersistentDictionary from './hooks/usePersistentDictionary.ts'
import QuickAdd from './components/QuickAdd.tsx'
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
  const { dictionary, setDictionary } = usePersistentDictionary()
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const {
    summary,
    breakfastRows,
    liquidSummary,
    solidSummary,
    breakfastRawLiquid,
    breakfastRawSolid,
    unrecognizedItems,
    unrecognizedItemsCombined,
    productBaseByText,
    selectedProductBase,
    lunchCoverage,
    lunchAnalysis,
    lunchValidation,
    lunchProductBaseByText,
    lunchSelectedStats,
    lunchHoveredStats,
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
  const {
    exportResultsPdf,
    previewResultsPdf,
    exportLunchResultsPdf,
    previewLunchResultsPdf,
  } = useReportExport({
    liquidSummary,
    solidSummary,
    breakfastRawLiquid,
    breakfastRawSolid,
    breakfastValidation,
    selectedNivel,
    lunchSummary: lunchAnalysis.summary,
    lunchUnrecognized: lunchAnalysis.unrecognized,
    lunchValidation,
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
    if (data) {
      setActiveView('resultados')
    }
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
          selectedPortion={selectedPortion}
          onChangePortion={setSelectedPortion}
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
          <div className="mx-auto my-4 max-w-6xl text-right">
            <button
              type="button"
              onClick={() => setShowQuickAdd(true)}
              className="rounded-lg border px-3 py-2 text-xs font-semibold"
            >
              Agregar rápido
            </button>
          </div>
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
            <LunchExplorationPage
              data={data}
              lunchCoverage={lunchCoverage}
              lunchSummary={lunchAnalysis.summary}
              lunchUnrecognized={lunchAnalysis.unrecognized}
              tableFilter={tableFilter}
              setTableFilter={setTableFilter}
              rowCount={rowCount}
              filteredRowCount={filteredRowCount}
              selectedText={selectedText}
              setSelectedText={setSelectedText}
              hoveredText={hoveredText}
              setHoveredText={setHoveredText}
              tableDensity={tableDensity}
              productBaseByText={lunchProductBaseByText}
              selectedCount={lunchSelectedStats.count}
              hoveredCount={lunchHoveredStats.count}
              onViewResults={() => setActiveView('resultados')}
            />
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
              onChangeNivel={setSelectedNivel}
              breakfastValidation={breakfastValidation}
              liquidDrilldown={liquidDrilldown}
              solidDrilldown={solidDrilldown}
              breakfastRows={breakfastRows}
              onExportPdf={exportResultsPdf}
              onPreviewPdf={previewResultsPdf}
              selectedMeal={selectedMeal}
              onChangeMeal={setSelectedMeal}
              onBackToExploration={() => setActiveView('exploracion')}
              onInspectProduct={handleInspectProduct}
            />
          ) : null}

          {activeView === 'resultados' && selectedMeal === 'almuerzo' ? (
            <LunchResultsPage
              data={data}
              lunchSummary={lunchAnalysis.summary}
              lunchRows={lunchAnalysis.rows}
              lunchUnrecognized={lunchAnalysis.unrecognized}
              lunchValidation={lunchValidation}
              onExportPdf={exportLunchResultsPdf}
              onPreviewPdf={previewLunchResultsPdf}
              selectedMeal={selectedMeal}
              onChangeMeal={setSelectedMeal}
              selectedNivel={selectedNivel}
              onChangeNivel={setSelectedNivel}
              detectedNivel={data?.detectedNivel ?? null}
            />
          ) : null}
        </div>
        {/* DictionaryEditor removed — quick add used for simple additions */}
        {showQuickAdd ? (
          <QuickAdd
            selectedPortion={selectedPortion}
            onClose={() => setShowQuickAdd(false)}
            onAdd={(updater) => setDictionary(updater(dictionary))}
            dictionary={dictionary}
          />
        ) : null}
      </div>
    </div>
  )
}

export default App
