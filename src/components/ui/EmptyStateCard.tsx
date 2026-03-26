import { APP_THEME } from '../../themes/appTheme.ts'

type EmptyStateCardProps = {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  centered?: boolean
}

const EmptyStateCard = ({
  title,
  description,
  actionLabel,
  onAction,
  centered = false,
}: EmptyStateCardProps) => {
  return (
    <section className={`${APP_THEME.surface.card} p-6 sm:p-8 ${centered ? 'text-center' : ''}`}>
      <h2 className={`text-xl font-semibold ${APP_THEME.text.title}`}>{title}</h2>
      <p className={`mt-2 text-sm sm:text-base ${APP_THEME.text.body}`}>{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className={`mt-5 px-4 py-2 ${APP_THEME.button.primary}`}
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  )
}

export default EmptyStateCard
