import { useEffect, useState } from 'react'
import { CsvIcon, ErrorIcon, PdfIcon, SuccessIcon } from '../ui/AppIcons.tsx'

type ResultsActionsProps = {
  onExportCsv: () => Promise<void> | void
  onExportPdf: () => Promise<void> | void
  onPreviewPdf: () => Promise<void> | void
}

type ActionType = 'preview' | 'csv' | 'pdf'
type ExportFormat = 'csv' | 'pdf'

type ToastState = {
  kind: 'success' | 'error'
  message: string
} | null

const LAST_EXPORT_FORMAT_STORAGE_KEY = 'minuta-analyzer:last-export-format'

const readLastExportFormat = (): ExportFormat => {
  const stored = localStorage.getItem(LAST_EXPORT_FORMAT_STORAGE_KEY)
  return stored === 'csv' ? 'csv' : 'pdf'
}

const ResultsActions = ({ onExportCsv, onExportPdf, onPreviewPdf }: ResultsActionsProps) => {
  const [loadingAction, setLoadingAction] = useState<ActionType | null>(null)
  const [lastExportFormat, setLastExportFormat] = useState<ExportFormat>(readLastExportFormat)
  const [toast, setToast] = useState<ToastState>(null)
  const isBusy = loadingAction !== null

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => {
      setToast(null)
    }, 2800)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [toast])

  const runAction = async (action: ActionType, runner: () => Promise<void> | void) => {
    try {
      setLoadingAction(action)
      await runner()
      if (action === 'csv' || action === 'pdf') {
        setLastExportFormat(action)
        localStorage.setItem(LAST_EXPORT_FORMAT_STORAGE_KEY, action)
      }
      const successLabel =
        action === 'preview'
          ? 'Vista previa PDF generada'
          : action === 'csv'
            ? 'CSV exportado correctamente'
            : 'PDF exportado correctamente'
      setToast({ kind: 'success', message: successLabel })
    } catch {
      const errorLabel =
        action === 'preview'
          ? 'No se pudo generar la vista previa'
          : action === 'csv'
            ? 'Falló la exportación CSV'
            : 'Falló la exportación PDF'
      setToast({ kind: 'error', message: errorLabel })
    } finally {
      setLoadingAction(null)
    }
  }

  const quickExportLabel = lastExportFormat === 'csv' ? 'Exportar rápido CSV' : 'Exportar rápido PDF'
  const quickExportIcon = lastExportFormat === 'csv' ? <CsvIcon className="h-4 w-4" /> : <PdfIcon className="h-4 w-4" />
  const runQuickExport = () => runAction(lastExportFormat, lastExportFormat === 'csv' ? onExportCsv : onExportPdf)

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={runQuickExport}
          disabled={isBusy}
          aria-busy={loadingAction === lastExportFormat}
          className="motion-icon motion-lift inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingAction === lastExportFormat ? (
            <span className="loading-dot h-4 w-4" />
          ) : (
            quickExportIcon
          )}
          {loadingAction === lastExportFormat ? 'Exportando rápido...' : quickExportLabel}
        </button>
        <button
          type="button"
          onClick={() => runAction('preview', onPreviewPdf)}
          disabled={isBusy}
          aria-busy={loadingAction === 'preview'}
          className="motion-icon motion-lift inline-flex items-center gap-2 rounded-xl border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingAction === 'preview' ? (
            <span className="loading-dot loading-dot--preview h-4 w-4" />
          ) : (
            <PdfIcon className="h-4 w-4" />
          )}
          {loadingAction === 'preview' ? 'Generando vista...' : 'Previsualizar PDF'}
        </button>
        <button
          type="button"
          onClick={() => runAction('csv', onExportCsv)}
          disabled={isBusy}
          aria-busy={loadingAction === 'csv'}
          className="motion-icon motion-lift inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingAction === 'csv' ? (
            <span className="loading-dot loading-dot--csv h-4 w-4" />
          ) : (
            <CsvIcon className="h-4 w-4" />
          )}
          {loadingAction === 'csv' ? 'Exportando...' : 'Exportar resumen CSV'}
        </button>
        <button
          type="button"
          onClick={() => runAction('pdf', onExportPdf)}
          disabled={isBusy}
          aria-busy={loadingAction === 'pdf'}
          className="motion-icon motion-lift inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingAction === 'pdf' ? (
            <span className="loading-dot loading-dot--pdf h-4 w-4" />
          ) : (
            <PdfIcon className="h-4 w-4" />
          )}
          {loadingAction === 'pdf' ? 'Exportando...' : 'Exportar resumen PDF'}
        </button>
      </div>
      {toast ? (
        <div
          className={`result-toast ${toast.kind === 'success' ? 'result-toast--success' : 'result-toast--error'}`}
          role="status"
          aria-live="polite"
        >
          {toast.kind === 'success' ? (
            <SuccessIcon className="h-4 w-4" />
          ) : (
            <ErrorIcon className="h-4 w-4" />
          )}
          {toast.message}
        </div>
      ) : null}
    </section>
  )
}

export default ResultsActions
