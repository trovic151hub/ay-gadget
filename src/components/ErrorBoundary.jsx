import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.warn('App error caught by boundary:', error?.message, info?.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-950 flex items-center justify-center px-6 text-center">
          <div>
            <div className="w-16 h-16 bg-surface-800 border border-surface-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-triangle-exclamation text-2xl text-brand-500" />
            </div>
            <h1 className="text-2xl font-bold font-display text-white mb-3">Something went wrong</h1>
            <p className="text-surface-400 text-sm max-w-sm mx-auto mb-8">
              An unexpected error occurred. Try going back to the homepage.
            </p>
            <Link
              to="/"
              onClick={() => this.setState({ hasError: false })}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-bold px-8 py-3 rounded-full transition-colors"
            >
              <i className="fas fa-house text-sm" /> Go Home
            </Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
