import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 32,
          background: '#1a1110',
          color: '#ff6b6b',
          minHeight: '100vh',
          fontFamily: 'monospace',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ color: '#ff4d4f', fontSize: 24, marginBottom: 16 }}>⚠️ Ứng dụng gặp lỗi Render (React Error Boundary)</h2>
          <div style={{
            background: '#2b1212',
            padding: 16,
            borderRadius: 8,
            border: '1px solid #792020',
            color: '#ffdcdb',
            whiteSpace: 'pre-wrap',
            marginBottom: 20
          }}>
            <strong>{this.state.error?.toString()}</strong>
          </div>
          {this.state.errorInfo?.componentStack && (
            <div style={{
              background: '#141414',
              padding: 16,
              borderRadius: 8,
              border: '1px solid #333',
              color: '#bbb',
              whiteSpace: 'pre-wrap',
              fontSize: 12,
              maxHeight: 400,
              overflow: 'auto'
            }}>
              <strong>Component Stack:</strong>
              {this.state.errorInfo.componentStack}
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 20,
              padding: '10px 20px',
              background: '#e03131',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
