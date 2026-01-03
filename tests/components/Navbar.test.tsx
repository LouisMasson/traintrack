import { render, screen } from '@testing-library/react';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('Navbar', () => {
  const defaultProps = {
    trainCount: 42,
    lastUpdate: new Date('2024-01-15T10:30:00'),
    isLoading: false,
  };

  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  it('should render the navbar', () => {
    render(<Navbar {...defaultProps} />);

    expect(screen.getByText('Train Tracker Switzerland')).toBeInTheDocument();
  });

  it('should display the train count', () => {
    render(<Navbar {...defaultProps} />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('trains')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<Navbar {...defaultProps} />);

    expect(screen.getByText('Live Map')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('should show green indicator when not loading', () => {
    render(<Navbar {...defaultProps} />);

    const indicator = document.querySelector('.bg-green-400');
    expect(indicator).toBeInTheDocument();
  });

  it('should show yellow indicator when loading', () => {
    render(<Navbar {...defaultProps} isLoading={true} />);

    const indicator = document.querySelector('.bg-yellow-400');
    expect(indicator).toBeInTheDocument();
  });

  it('should highlight active navigation link', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    render(<Navbar {...defaultProps} />);

    const liveMapLink = screen.getByText('Live Map');
    expect(liveMapLink).toHaveClass('text-red-500');
  });

  it('should highlight stats link when on stats page', () => {
    (usePathname as jest.Mock).mockReturnValue('/stats');
    render(<Navbar {...defaultProps} />);

    const analyticsLink = screen.getByText('Analytics');
    expect(analyticsLink).toHaveClass('text-red-500');
  });

  it('should handle null lastUpdate', () => {
    render(<Navbar {...defaultProps} lastUpdate={null} />);

    // Should not crash and should render
    expect(screen.getByText('Train Tracker Switzerland')).toBeInTheDocument();
  });

  it('should have correct link hrefs', () => {
    render(<Navbar {...defaultProps} />);

    const liveMapLink = screen.getByText('Live Map').closest('a');
    const analyticsLink = screen.getByText('Analytics').closest('a');

    expect(liveMapLink).toHaveAttribute('href', '/');
    expect(analyticsLink).toHaveAttribute('href', '/stats');
  });
});
