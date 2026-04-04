import { useRef, useState, type ChangeEvent } from 'react'
import { APP_THEME } from '../themes/appTheme.ts'
import { SuccessIcon, TrashIcon, UploadIcon } from './ui/AppIcons.tsx'

type ExcelUploaderProps = {
  onFileSelected: (file: File) => void
  onClearData?: () => void
  hasData?: boolean
  isLoading?: boolean
  error?: string | null
}

const ExcelUploader = ({ onFileSelected, onClearData, hasData, isLoading, error }: ExcelUploaderProps) => {
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const showStatusRow = Boolean(fileName) || Boolean(hasData) || Boolean(isLoading)
  const hasLoadedData = Boolean(hasData) && !isLoading

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    onFileSelected(file)
  }

  const handleClear = () => {
    setFileName(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onClearData?.()
  }

  return (
    <div className="flex flex-col">
      <div
        className={`flex flex-col gap-2.5 p-3.5 sm:p-4 ${APP_THEME.surface.softPanel} ${
          hasLoadedData ? 'ring-1 ring-emerald-200/90 shadow-[0_16px_30px_-30px_rgba(16,185,129,0.7)]' : ''
        }`}
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className={`text-lg font-semibold ${APP_THEME.text.title}`}>
              Archivo de minuta
            </h2>
            <p className={`text-sm ${APP_THEME.text.body}`}>Excel</p>
            {fileName ? (
              <span className="inline-flex rounded-full bg-white/90 px-2.5 py-0.5 text-xs text-slate-600 shadow-sm">
                {fileName}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <label className="motion-icon motion-lift inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_16px_-12px_rgba(15,23,42,0.7)] hover:bg-slate-800">
              <UploadIcon className="mr-2 h-4 w-4" />
              {isLoading ? 'Procesando...' : hasLoadedData ? 'Cambiar archivo' : 'Elegir archivo'}
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleChange}
                disabled={isLoading}
              />
            </label>
            {hasData ? (
              <button
                type="button"
                onClick={handleClear}
                className="motion-icon motion-lift inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Limpiar información
              </button>
            ) : null}
            {showStatusRow && hasData ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                <SuccessIcon className="h-3.5 w-3.5" />
                Archivo listo para análisis
              </span>
            ) : null}
            {showStatusRow && isLoading ? <span className="text-xs text-orange-600">Leyendo archivo...</span> : null}
          </div>
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>
    </div>
  )
}

export default ExcelUploader
