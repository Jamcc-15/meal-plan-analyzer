import type { ExcelData } from '../types/excel.types.ts'
import { APP_THEME } from '../themes/appTheme.ts'
import type { TableDensity } from '../types/app.types.ts'
import { normalizeText } from '../utils/normalizeText.ts'
import {
  TABLE_THEME,
  getCellTheme,
  getGroupTheme,
  getHeaderTheme,
  isLunchStart,
} from '../themes/tableTheme.ts'

type DataTableProps = {
  data: ExcelData | null
  filterText: string
  selectedValue: string | null
  selectedProductBase: string | null
  focusHeader: string | null
  productBaseByText: Record<string, string>
  tableDensity: TableDensity
  onSelect: (value: string) => void
  onHover: (value: string) => void
  onHoverEnd: () => void
}

const DataTable = ({
  data,
  filterText,
  selectedValue,
  selectedProductBase,
  focusHeader,
  productBaseByText,
  tableDensity,
  onSelect,
  onHover,
  onHoverEnd,
}: DataTableProps) => {
  if (!data || data.headers.length === 0) {
    return (
      <div className={APP_THEME.table.emptyState}>
        Aún no hay datos del Excel para mostrar.
      </div>
    )
  }

  const groups = data.headerGroups ?? []
  const hasGroupLabels = groups.some((group) => group.label.trim().length > 0)

  const normalizedFilter = normalizeText(filterText)
  const filteredRows =
    normalizedFilter.length === 0
      ? data.rows
      : data.rows.filter((row) =>
          data.headers.some((header) =>
            normalizeText(String(row[header] ?? '')).includes(normalizedFilter),
          ),
        )

  const densityTheme = APP_THEME.table.density[tableDensity]

  return (
    <div className={APP_THEME.table.container}>
      <div className={APP_THEME.table.scroll}>
        <table className={`${APP_THEME.table.base} ${densityTheme.tableText}`}>
          <thead className={APP_THEME.table.head}>
            {groups.length > 0 && hasGroupLabels ? (
              <tr>
                {groups.map((group, index) => (
                  <th
                    key={`${group.label}-${index}`}
                    colSpan={group.span}
                    className={`${APP_THEME.table.groupHeader} ${getGroupTheme(group.label)}`}
                  >
                    {group.label || ''}
                  </th>
                ))}
              </tr>
            ) : null}
            <tr>
              {data.headers.map((header, index) => (
                <th
                  key={header}
                  className={`${APP_THEME.table.columnHeader} ${densityTheme.headerY} ${getHeaderTheme(header)} ${
                    isLunchStart(header) ? TABLE_THEME.divider.lunchHeader : ''
                  } ${
                    index === 0
                      ? APP_THEME.table.firstHeaderSticky
                      : ''
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, rowIndex) => (
              <tr
                key={`${rowIndex}-${data.headers[0] ?? 'row'}`}
                className={rowIndex % 2 === 0 ? APP_THEME.table.rowEven : APP_THEME.table.rowOdd}
              >
                {data.headers.map((header, columnIndex) => {
                  const cellValue = row[header] || '-'
                  const normalizedCell = normalizeText(cellValue)
                  const isHighlighted =
                    selectedValue && normalizedCell === selectedValue
                  const sameProductBase =
                    focusHeader === header &&
                    Boolean(selectedProductBase) &&
                    productBaseByText[normalizedCell] === selectedProductBase

                  return (
                  <td
                    key={`${rowIndex}-${header}`}
                    onClick={() => onSelect(cellValue)}
                    onMouseEnter={() => onHover(cellValue)}
                    onMouseLeave={onHoverEnd}
                    title={cellValue}
                    className={`${APP_THEME.table.cell} ${densityTheme.cellY} ${TABLE_THEME.cell.hover} ${getCellTheme(header)} ${
                      isHighlighted ? TABLE_THEME.cell.selected : ''
                    } ${
                      sameProductBase ? TABLE_THEME.cell.sameBase : ''
                    } ${
                      isLunchStart(header) ? TABLE_THEME.divider.lunchCell : ''
                    } ${
                      columnIndex === 0
                        ? APP_THEME.table.firstCellSticky
                        : ''
                    }`}
                  >
                    {cellValue}
                  </td>
                  )
                })}
              </tr>
            ))}
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={data.headers.length}
                  className={APP_THEME.table.noResults}
                >
                  No hay coincidencias para el filtro actual.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
