import { useNotification } from '../context/NotificationContext'

const TYPE_STYLES = {
  success: { icon: 'fa-check-circle', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
  error: { icon: 'fa-times-circle', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  warning: { icon: 'fa-exclamation-triangle', color: 'text-brand-500', bg: 'bg-brand-50', border: 'border-brand-200' },
  info: { icon: 'fa-info-circle', color: 'text-surface-800', bg: 'bg-surface-100', border: 'border-surface-200' }
}

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification()

  return (
    <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {notifications.map(n => {
        const style = TYPE_STYLES[n.type] || TYPE_STYLES.info
        return (
          <div
            key={n.id}
            className={`flex items-center gap-4 p-4 bg-white rounded-2xl shadow-xl border ${style.border} min-w-[300px] max-w-sm animate-slide-in pointer-events-auto`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style.bg} flex-shrink-0`}>
              <i className={`fas ${style.icon} ${style.color} text-lg`} />
            </div>
            <div className="flex-1">
              <span className="block text-sm font-bold text-surface-900 leading-tight">{n.message}</span>
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-surface-400 hover:text-surface-800 transition-colors p-1"
            >
              <i className="fas fa-times text-sm" />
            </button>
          </div>
        )
      })}
    </div>
  )
}