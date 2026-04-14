import { Component } from 'react';

export default class PreviewErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
          <p>Aperçu temporairement indisponible.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
