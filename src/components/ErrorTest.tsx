'use client'
import React from 'react'

export class ErrorBoundary extends React.Component<{children: any}, {error: any}> {
  state = { error: null }
  static getDerivedStateFromError(error: any) { return { error } }
  componentDidCatch(error: any, info: any) { console.error("Caught:", error, info) }
  render() {
    if (this.state.error) {
      return <div className="text-red-500 border p-4">Error: {(this.state.error as Error).message}</div>
    }
    return this.props.children
  }
}
