import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Profile from '../Profile'; // Adjust the path as needed

// Mock fetch globally
global.fetch = jest.fn();

describe('Profile Component', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Set up mock fetch responses
        fetch.mockImplementation((url) => {
            if (url.includes('/requests/user/1')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([{ song: 'Test Song', artist: 'Test Artist', comment: 'Test Comment', date: '2024-01-01T00:00:00Z', number_of_replies: 2, link: '/test-link' }])
                });
            }
            if (url.includes('/replies/user/1')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([{ song: 'Reply Song', artist: 'Reply Artist', comment: 'Reply Comment', date: '2024-01-02T00:00:00Z', pdf: 'base64pdf', link: '/test-reply-link', request_id: '12345' }])
                });
            }
            return Promise.reject('Failed to fetch');
        });
    });

    test('renders user information correctly', () => {
        // Set up mock localStorage
        const mockUser = {
            id: '1',
            username: 'testuser',
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            joined: '2023-01-01T00:00:00Z',
            repliesNum: 5,
            requestsNum: 3
        };
        localStorage.setItem('user', JSON.stringify(mockUser));

        render(<Profile />);

        // Check if user information is displayed
        expect(screen.getByText('Username:')).toBeInTheDocument();
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('Name:')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email:')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('Password:')).toBeInTheDocument();
        expect(screen.getByText('••••••••')).toBeInTheDocument();
        expect(screen.getByText('Joined:')).toBeInTheDocument();

        expect(screen.getByText('Total Contributions:')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Total Requests:')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    test('toggles password visibility on click', () => {
        // Set up mock localStorage
        const mockUser = {
            id: '1',
            username: 'testuser',
            password: 'password123',
        };
        localStorage.setItem('user', JSON.stringify(mockUser));

        render(<Profile />);

        // Click to show password
        const passwordElement = screen.getByText('••••••••');
        fireEvent.click(passwordElement);
        expect(screen.getByText('password123')).toBeInTheDocument();
        
        // Click again to hide password
        fireEvent.click(screen.getByText('password123'));
        expect(screen.getByText('••••••••')).toBeInTheDocument();
    });
});
