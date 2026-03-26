import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const baseProps: IconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const UploadIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M12 16V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M20 16.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5" />
  </svg>
)

export const TrashIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M6 6l1 14a1 1 0 0 0 1 .9h8a1 1 0 0 0 1-.9L18 6" />
    <path d="M10 10v7" />
    <path d="M14 10v7" />
  </svg>
)

export const CsvIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
    <path d="M8 15h8" />
    <path d="M8 12h4" />
    <path d="M8 18h6" />
  </svg>
)

export const PdfIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
    <path d="M8 12h8" />
    <path d="M8 16h8" />
    <path d="M8 20h5" />
  </svg>
)

export const ExploreIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M12 3 4 7v10l8 4 8-4V7z" />
    <path d="m12 3 8 4-8 4-8-4 8-4z" />
    <path d="v10" />
  </svg>
)

export const ResultsIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M4 19h16" />
    <path d="M7 16V9" />
    <path d="M12 16V5" />
    <path d="M17 16v-4" />
  </svg>
)

export const BreakfastIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M5 13h14" />
    <path d="M4 13a8 8 0 1 0 16 0" />
    <path d="M8 5v3" />
    <path d="M12 4v4" />
    <path d="M16 5v3" />
  </svg>
)

export const LunchIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M4 12h16" />
    <path d="M7 4v8" />
    <path d="M12 4v8" />
    <path d="M17 4v8" />
    <path d="M6 20h12" />
  </svg>
)

export const LiquidPortionIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M12 3s5 6 5 9a5 5 0 1 1-10 0c0-3 5-9 5-9z" />
  </svg>
)

export const SolidPortionIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M3 10h18" />
    <path d="M5 10v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    <path d="M8 10 9.5 6h5L16 10" />
  </svg>
)

export const SuccessIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.6 12.2 2.2 2.2 4.6-4.6" />
  </svg>
)

export const ErrorIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5" />
    <path d="M12 16h.01" />
  </svg>
)

