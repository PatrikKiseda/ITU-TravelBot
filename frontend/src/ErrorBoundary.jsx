import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#ef4444', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#4ade80',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
          <details style={{ marginTop: '20px', textAlign: 'left' }}>
            <summary>Error Details</summary>
            <pre style={{ background: '#2a2a2a', padding: '10px', overflow: 'auto' }}>
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

