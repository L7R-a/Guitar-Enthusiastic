import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../Login';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';

// Mock useNavigate
jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

// Mock Toast
jest.mock('primereact/toast', () => ({
    Toast: jest.fn().mockImplementation(() => <div>Mocked Toast</div>),
}));

describe('Login Component', () => {
    const mockNavigate = jest.fn();
    const mockToast = { current: { show: jest.fn() } };

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    test('renders Login component', () => {
        render(<Login hide={jest.fn()} toast={mockToast} />);
        expect(screen.getByText('Guitar Enthusiast')).toBeInTheDocument();
        const loginElements = screen.getAllByText('Login');
        expect(loginElements.length).toBeGreaterThan(0);
        expect(screen.getByLabelText('Username:')).toBeInTheDocument();
        expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    });

    test('shows error message when fields are empty', async () => {
        render(<Login hide={jest.fn()} toast={mockToast} />);
        fireEvent.click(screen.getByRole('button', { name: /Login/i }));
        await waitFor(() => {
            expect(mockToast.current.show).toHaveBeenCalledWith({
                severity: 'error',
                summary: 'Error',
                detail: 'All fields are required',
                life: 5000,
            });
        });
    });

    test('calls login function with correct parameters', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ username: 'testuser' }),
            })
        );

        render(<Login hide={jest.fn()} toast={mockToast} />);
        fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: 'testuser', password: 'password' }),
            });
        });
    });

    test('navigates on successful login', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ username: 'testuser' }),
            })
        );

        render(<Login hide={jest.fn()} toast={mockToast} />);
        fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/Search');
        });
    });

    test('shows error message on failed login', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve(null),
            })
        );

        render(<Login hide={jest.fn()} toast={mockToast} />);
        fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        await waitFor(() => {
            expect(mockToast.current.show).toHaveBeenCalledWith({
                severity: 'error',
                summary: 'Error',
                detail: 'Invalid username or password',
                life: 5000,
            });
        });
    });
});
