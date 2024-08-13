import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history'; // Updated import
import ToolBar from '../ToolBar';
import Profile from '../Profile'; 
import '@testing-library/jest-dom';

describe('ToolBar component', () => {
  let mockSetIsEmptySearchTextVisible, mockHideSearch, mockSetSearchResults;

  beforeEach(() => {
    mockSetIsEmptySearchTextVisible = jest.fn();
    mockHideSearch = false;
    mockSetSearchResults = jest.fn();
    localStorage.clear();
  });

  test('renders ToolBar component', () => {
    render(
      <MemoryRouter>
        <ToolBar
          setIsEmptySearchTextVisible={mockSetIsEmptySearchTextVisible}
          hideSearch={mockHideSearch}
          setSearchResults={mockSetSearchResults}
        />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Request')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('handles search input and enter key press', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    render(
      <MemoryRouter>
        <ToolBar
          setIsEmptySearchTextVisible={mockSetIsEmptySearchTextVisible}
          hideSearch={mockHideSearch}
          setSearchResults={mockSetSearchResults}
        />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search');

    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockSetIsEmptySearchTextVisible).toHaveBeenCalledWith(false);
      expect(localStorage.getItem('searchText')).toBe('test');
      expect(mockSetSearchResults).toHaveBeenCalledWith([]);
    });
  });

  test('handles profile button click', async () => {
    // Mock localStorage data
    const mockUser = JSON.stringify([{ username: 'johndoe', name: 'John Doe', email: 'john@example.com', repliesNum: 10, requestsNum: 5 }]);
    localStorage.setItem('user', mockUser);
  
    // Mock API responses if needed
    global.fetch = jest.fn((url) => {
      if (url.includes('requests')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('replies')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.reject(new Error('Network response was not ok'));
    });
  
    render(<Profile />);
  
    // Wait for Profile component to render
    await waitFor(() => {
      expect(screen.getByText('Username:')).toBeInTheDocument();
      expect(screen.getByText('johndoe')).toBeInTheDocument();
      expect(screen.getByText('Name:')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Email:')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  test('handles request button click', async () => {
    render(
        <MemoryRouter>
            <ToolBar
                setIsEmptySearchTextVisible={mockSetIsEmptySearchTextVisible}
                hideSearch={mockHideSearch}
                setSearchResults={mockSetSearchResults}
            />
        </MemoryRouter>
    );

    // Click the request button
    const requestButton = screen.getByText('Request');
    fireEvent.click(requestButton);

    // Check if RequestForm is rendered
    await waitFor(() => {
        expect(screen.getByText('Request a song!')).toBeInTheDocument();
    });
});

test('handles logout button click', () => {
    const history = createMemoryHistory();
    render(
        <Router location={history.location} navigator={history}>
            <ToolBar
                setIsEmptySearchTextVisible={mockSetIsEmptySearchTextVisible}
                hideSearch={mockHideSearch}
                setSearchResults={mockSetSearchResults}
            />
        </Router>
    );

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    // Check if the navigation occurred
    expect(history.location.pathname).toBe('/');
});
  
});
