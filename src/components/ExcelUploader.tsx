import { useRef, useState, type ChangeEvent } from 'react'
import { APP_THEME } from '../themes/appTheme.ts'
import { TrashIcon, UploadIcon } from './ui/AppIcons.tsx'

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
    <div className="flex flex-col gap-4">
      <div className={`flex flex-col gap-3 p-4 sm:p-5 ${APP_THEME.surface.softPanel}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={`text-lg font-semibold ${APP_THEME.text.title}`}>
              Archivo de minuta
            </h2>
            <p className={`text-sm ${APP_THEME.text.body}`}>
              Excel o CSV
            </p>
          </div>
          <label className="motion-icon motion-lift inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_-12px_rgba(15,23,42,0.7)] hover:bg-slate-800 sm:px-5">
            <UploadIcon className="mr-2 h-4 w-4" />
            {isLoading ? 'Procesando...' : 'Elegir archivo'}
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
              className="motion-icon motion-lift inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:px-5"
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Limpiar información
            </button>
          ) : null}
        </div>
        {showStatusRow ? (
          <div className={`flex flex-wrap items-center gap-2 text-xs sm:text-sm ${APP_THEME.text.body}`}>
            {fileName ? (
              <span className="rounded-full bg-white/90 px-3 py-1 shadow-sm">{fileName}</span>
            ) : null}
            {hasData ? (
              <span className={APP_THEME.badge.success}>
                Archivo cargado y listo para analizar
              </span>
            ) : null}
            {isLoading ? (
              <span className="text-orange-600">Leyendo archivo...</span>
            ) : null}
          </div>
        ) : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>
    </div>
  )
}

export default ExcelUploader
