import { render, screen, fireEvent } from '@testing-library/react';
import TrainDetailsPanel from '@/components/TrainDetailsPanel';
import { TrainPosition } from '@/types/train';

describe('TrainDetailsPanel', () => {
  const mockTrain: TrainPosition = {
    id: 1,
    train_no: 'IC701',
    latitude: 47.378177,
    longitude: 8.540192,
    speed: 120,
    direction: 45,
    timestamp: '2024-01-15T10:30:00Z',
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render train number', () => {
    render(<TrainDetailsPanel train={mockTrain} onClose={mockOnClose} />);

    expect(screen.getByText('IC701')).toBeInTheDocument();
  });

  it('should render train type name', () => {
    render(<TrainDetailsPanel train={mockTrain} onClose={mockOnClose} />);

    expect(screen.getByText('(InterCity)')).toBeInTheDocument();
  });

  it('should render coordinates', () => {
    render(<TrainDetailsPanel train={mockTrain} onClose={mockOnClose} />);

    // Check for formatted coordinates display
    expect(screen.getByText('47.3782, 8.5402')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<TrainDetailsPanel train={mockTrain} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display speed when available', () => {
    render(<TrainDetailsPanel train={mockTrain} onClose={mockOnClose} />);

    expect(screen.getByText('120 km/h')).toBeInTheDocument();
  });

  it('should not display speed when null', () => {
    const trainWithoutSpeed: TrainPosition = {
      ...mockTrain,
      speed: null,
    };

    render(<TrainDetailsPanel train={trainWithoutSpeed} onClose={mockOnClose} />);

    expect(screen.queryByText(/km\/h/)).not.toBeInTheDocument();
  });

  it('should return null when train is null', () => {
    const { container } = render(<TrainDetailsPanel train={null} onClose={mockOnClose} />);

    expect(container.firstChild).toBeNull();
  });

  it('should display train type legend', () => {
    render(<TrainDetailsPanel train={mockTrain} onClose={mockOnClose} />);

    expect(screen.getByText('Train Types')).toBeInTheDocument();
    expect(screen.getByText('IC')).toBeInTheDocument();
    expect(screen.getByText('IR')).toBeInTheDocument();
    expect(screen.getByText('RE')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('should identify S-Bahn trains correctly', () => {
    const sBahnTrain: TrainPosition = {
      ...mockTrain,
      train_no: 'S12345',
    };

    render(<TrainDetailsPanel train={sBahnTrain} onClose={mockOnClose} />);

    expect(screen.getByText('(S-Bahn)')).toBeInTheDocument();
  });
});
