import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PriceHistory } from '../../types'

const mockUseTranslation = vi.hoisted(() => vi.fn())
const mockUseCurrency = vi.hoisted(() => vi.fn())

vi.mock('../../hooks/useTranslation', () => ({
   useTranslation: mockUseTranslation,
}))

vi.mock('../../contexts/CurrencyContext', () => ({
   useCurrency: mockUseCurrency,
}))

import PriceHistoryChart from './PriceHistoryChart'

describe('PriceHistoryChart', () => {
   const data: PriceHistory[] = [
      { date: '2026-04-01', price: 100 },
      { date: '2026-04-02', price: 125 },
   ]

   beforeEach(() => {
      vi.clearAllMocks()
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
         width: 720,
         height: 300,
         top: 0,
         right: 720,
         bottom: 300,
         left: 0,
         x: 0,
         y: 0,
         toJSON: () => ({}),
      } as DOMRect)

      mockUseTranslation.mockReturnValue({
         t: (key: string) => ({
            'priceHistory.title': 'Price history',
            'priceHistory.legend': 'Price',
            'priceHistory.empty': 'No price history available.',
         }[key] ?? key),
      })
   })

   it('shows only the loading state while currency data is unavailable', () => {
      mockUseCurrency.mockReturnValue({
         currency: 'USD',
         rates: null,
         loading: true,
      })

      const { container } = render(<PriceHistoryChart data={data} />)

      expect(container.querySelector('.loading-spinner')).toBeInTheDocument()
      expect(screen.queryByRole('heading', { level: 3, name: 'Price history' })).not.toBeInTheDocument()
   })

   it('renders an accessible chart and shows converted values on hover', () => {
      mockUseCurrency.mockReturnValue({
         currency: 'USD',
         rates: { USD: 2, MXN: 40 },
         loading: false,
      })

      render(<PriceHistoryChart data={data} />)

      const chart = screen.getByRole('img', { name: 'Price history' })

      expect(screen.getByRole('heading', { level: 3, name: 'Price history' })).toBeInTheDocument()
      expect(screen.getAllByText('Price')).toHaveLength(1)
      expect(chart).toBeInTheDocument()
      expect(screen.getByText('Apr 1')).toBeInTheDocument()
      expect(screen.getByText('Apr 2')).toBeInTheDocument()

      fireEvent.pointerMove(chart, { clientX: 84, clientY: 150 })

      expect(screen.getByText('$200.00')).toBeInTheDocument()
      expect(screen.getAllByText('Price')).toHaveLength(2)
   })
})
