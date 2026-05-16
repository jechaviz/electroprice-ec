import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import ErrorBoundary from './ErrorBoundary'

const ErrorComponent = () => {
   throw new Error('Test error')
}

describe('ErrorBoundary', () => {
   it('renders children when no error', () => {
      render(
         <ErrorBoundary>
            <div>Test content</div>
         </ErrorBoundary>
      )
      expect(screen.getByText('Test content')).toBeInTheDocument()
   })

   it('renders error UI when error occurs', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
      render(
         <ErrorBoundary>
            <ErrorComponent />
         </ErrorBoundary>
      )
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      consoleSpy.mockRestore()
   })
})