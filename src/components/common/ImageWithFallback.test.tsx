import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ImageWithFallback, { PLACEHOLDER_IMAGE_SRC } from './ImageWithFallback';

describe('ImageWithFallback', () => {
  it('renders the provided src when present', () => {
    render(<ImageWithFallback src="https://example.com/a.png" alt="Product" />);
    expect(screen.getByAltText('Product')).toHaveAttribute('src', 'https://example.com/a.png');
  });

  it('uses the placeholder immediately when src is empty', () => {
    render(<ImageWithFallback src="" alt="Empty" />);
    expect(screen.getByAltText('Empty')).toHaveAttribute('src', PLACEHOLDER_IMAGE_SRC);
  });

  it('swaps to the placeholder after the image fails to load', () => {
    render(<ImageWithFallback src="https://broken.example/dead.png" alt="Broken" />);
    const img = screen.getByAltText('Broken');
    expect(img).toHaveAttribute('src', 'https://broken.example/dead.png');

    fireEvent.error(img);
    expect(img).toHaveAttribute('src', PLACEHOLDER_IMAGE_SRC);
  });

  it('forwards native img props such as className and loading', () => {
    render(<ImageWithFallback src="https://example.com/a.png" alt="Props" className="object-cover" loading="lazy" />);
    const img = screen.getByAltText('Props');
    expect(img).toHaveClass('object-cover');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('defaults referrerPolicy to no-referrer so hotlink-protected hosts serve the image', () => {
    render(<ImageWithFallback src="https://static.ctonline.mx/x.jpg" alt="Hotlink" />);
    expect(screen.getByAltText('Hotlink')).toHaveAttribute('referrerpolicy', 'no-referrer');
  });

  it('allows overriding referrerPolicy', () => {
    render(<ImageWithFallback src="https://example.com/a.png" alt="Override" referrerPolicy="origin" />);
    expect(screen.getByAltText('Override')).toHaveAttribute('referrerpolicy', 'origin');
  });
});
