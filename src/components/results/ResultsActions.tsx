import { useEffect, useState } from 'react'
import { ErrorIcon, PdfIcon, SuccessIcon } from '../ui/AppIcons.tsx'

type ResultsActionsProps = {
  onExportPdf: () => Promise<void> | void
  onPreviewPdf: () => Promise<void> | void
}

type ActionType = 'preview' | 'pdf'

type ToastState = {
  kind: 'success' | 'error'
  message: string
} | null

const ResultsActions = ({ onExportPdf, onPreviewPdf }: ResultsActionsProps) => {
  const [loadingAction, setLoadingAction] = useState<ActionType | null>(null)
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
      const successLabel =
        action === 'preview'
          ? 'Vista previa PDF generada'
          : 'PDF exportado correctamente'
      setToast({ kind: 'success', message: successLabel })
    } catch {
      const errorLabel =
        action === 'preview'
          ? 'No se pudo generar la vista previa'
          : 'Falló la exportación PDF'
      setToast({ kind: 'error', message: errorLabel })
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
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
