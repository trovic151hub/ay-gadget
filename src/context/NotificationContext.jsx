import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    setNotifications(prev => {
      if (prev.some(n => n.message === message)) return prev
      return [...prev, { id, message, type, duration }]
    })
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, duration)
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  return useContext(NotificationContext)
}
