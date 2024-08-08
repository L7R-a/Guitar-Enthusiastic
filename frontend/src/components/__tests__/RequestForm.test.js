import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RequestForm from '../RequestForm'; // Adjust the path as needed
import '@testing-library/jest-dom';

// Mocking primereact/toast
jest.mock('primereact/toast', () => {
    const React = require('react');
    return {
        Toast: React.forwardRef((props, ref) => {
            ref.current = { show: jest.fn() };
            return <div>Toast Mock</div>;
        }),
    };
});

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
}));


describe('RequestForm Component', () => {
    let mockSetVisibleRequest;

    beforeEach(() => {
        mockSetVisibleRequest = jest.fn();
        localStorage.clear(); // Clear localStorage before each test

        // Reset fetch mock
        global.fetch = jest.fn();
    });

    test('renders the form with all fields', () => {
        render(
            <MemoryRouter>
                <RequestForm setVisibleRequest={mockSetVisibleRequest} />
            </MemoryRouter>
        );

        expect(screen.getByLabelText(/Song:/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Artist:/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Additional Comments:/)).toBeInTheDocument();
        expect(screen.getByText('Request')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('shows error toast when song or artist is missing', async () => {
        render(
            <MemoryRouter>
                <RequestForm setVisibleRequest={mockSetVisibleRequest} />
            </MemoryRouter>
        );

        const requestButton = screen.getByText('Request');
        fireEvent.click(requestButton);

        await waitFor(() => {
            expect(screen.getByText('Toast Mock')).toBeInTheDocument();
        });
    });

    test('handles cancel button click', () => {
        render(
            <MemoryRouter>
                <RequestForm setVisibleRequest={mockSetVisibleRequest} />
            </MemoryRouter>
        );

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockSetVisibleRequest).toHaveBeenCalledWith(false);
    });
});
