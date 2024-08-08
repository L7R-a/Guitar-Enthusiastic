import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For additional matchers
import Signup from '../Signup';

describe('Signup Component', () => {
  const mockHide = jest.fn();
  const mockSetVisibleSignup = jest.fn();
  const mockSetVisibleLogin = jest.fn();
  const mockToast = { current: { show: jest.fn() } };

  test('renders Signup component', () => {
    render(<Signup hide={mockHide} setVisibleSignup={mockSetVisibleSignup} setVisibleLogin={mockSetVisibleLogin} toast={mockToast} />);
  
    expect(screen.getByText('Guitar Enthusiast')).toBeInTheDocument();
    
    // Retrieve all elements with the text "Signup"
    const signupElements = screen.getAllByText('Signup');
    
    // Check if the number of "Signup" elements is as expected
    expect(signupElements).toHaveLength(2); // Adjust the length based on the number of expected "Signup" elements
    
    // Optionally check the specific element if needed
    expect(signupElements[0]).toHaveTextContent('Signup');
    
    // Check for the logo image
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
  });

  test('shows error message when fields are empty', async () => {
    render(<Signup hide={mockHide} setVisibleSignup={mockSetVisibleSignup} setVisibleLogin={mockSetVisibleLogin} toast={mockToast} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Signup/i }));
    
    await waitFor(() => {
      expect(mockToast.current.show).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          detail: 'All fields are required',
        })
      );
    });
  });

  test('shows error message for invalid password', async () => {
    render(<Signup hide={mockHide} setVisibleSignup={mockSetVisibleSignup} setVisibleLogin={mockSetVisibleLogin} toast={mockToast} />);
    
    // Fill in all required fields
    fireEvent.change(screen.getByTestId("SignUpName"), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByTestId("SignUpUsername"), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByTestId("SignUpEmail"), { target: { value: 'john@example.com' } });
    
    // Set invalid password and retype password
    fireEvent.change(screen.getByTestId("signUpPassword"), { target: { value: 'short' } });
    fireEvent.change(screen.getByTestId("signUpRePassword"), { target: { value: 'short' } });
    
    // Use waitFor to ensure state updates are complete before clicking
    await waitFor(() => expect(screen.getByTestId("signUpPassword").value).toBe('short'));
    await waitFor(() => expect(screen.getByTestId("signUpRePassword").value).toBe('short'));
    
    // Click the Signup button
    fireEvent.click(screen.getByRole('button', { name: /Signup/i }));
    
    // Wait for the toast to be shown and validate its content
    await waitFor(() => {
      expect(mockToast.current.show).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          detail: 'Password must contain at least 8 characters, one uppercase letter, one number and one special character',
        })
      );
    });
  });

  test('shows error message for invalid email', async () => {
    render(<Signup hide={mockHide} setVisibleSignup={mockSetVisibleSignup} setVisibleLogin={mockSetVisibleLogin} toast={mockToast} />);
    
    // Fill in all required fields
    fireEvent.change(screen.getByTestId("SignUpName"), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByTestId("SignUpUsername"), { target: { value: 'johndoe' } });
    
    // Set invalid email
    fireEvent.change(screen.getByTestId("SignUpEmail"), { target: { value: 'invalid-email' } });
    
    // Set valid password and retype password
    fireEvent.change(screen.getByTestId("signUpPassword"), { target: { value: 'Valid123!' } });
    fireEvent.change(screen.getByTestId("signUpRePassword"), { target: { value: 'Valid123!' } });
  
    // Use waitFor to ensure state updates are complete before clicking
    await waitFor(() => expect(screen.getByTestId("signUpPassword").value).toBe('Valid123!'));
    await waitFor(() => expect(screen.getByTestId("signUpRePassword").value).toBe('Valid123!'));
    await waitFor(() => expect(screen.getByTestId("SignUpEmail").value).toBe('invalid-email'));
    
    // Click the Signup button
    fireEvent.click(screen.getByRole('button', { name: /Signup/i }));
    
    // Wait for the toast to be shown and validate its content
    await waitFor(() => {
      expect(mockToast.current.show).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          detail: 'Invalid email address',
        })
      );
    });
  });

  test('shows error message for mismatched passwords', async () => {
    render(<Signup hide={mockHide} setVisibleSignup={mockSetVisibleSignup} setVisibleLogin={mockSetVisibleLogin} toast={mockToast} />);
    
    // Fill in all required fields
    fireEvent.change(screen.getByTestId("SignUpName"), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByTestId("SignUpUsername"), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByTestId("SignUpEmail"), { target: { value: 'john@example.com' } });
  
    // Set mismatched passwords
    fireEvent.change(screen.getByTestId("signUpPassword"), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByTestId("signUpRePassword"), { target: { value: 'Password2!' } });
    
    // Use waitFor to ensure state updates are complete before clicking
    await waitFor(() => expect(screen.getByTestId("signUpPassword").value).toBe('Password1!'));
    await waitFor(() => expect(screen.getByTestId("signUpRePassword").value).toBe('Password2!'));
  
    // Click the Signup button
    fireEvent.click(screen.getByRole('button', { name: /Signup/i }));
    
    // Wait for the toast to be shown and validate its content
    await waitFor(() => {
      expect(mockToast.current.show).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          detail: 'Passwords do not match',
        })
      );
    });
  });

  test('calls handleSignup with correct parameters and handles success', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );
  
    render(<Signup hide={mockHide} setVisibleSignup={mockSetVisibleSignup} setVisibleLogin={mockSetVisibleLogin} toast={mockToast} />);
    
    // Fill in all required fields
    fireEvent.change(screen.getByTestId("SignUpName"), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByTestId("SignUpUsername"), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByTestId("SignUpEmail"), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByTestId("signUpPassword"), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByTestId("signUpRePassword"), { target: { value: 'Password1!' } });
    
    // Click the Signup button
    fireEvent.click(screen.getByRole('button', { name: /Signup/i }));
    
    // Wait for the toast to be shown and validate its content
    await waitFor(() => {
      expect(mockToast.current.show).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'success',
          detail: 'Account created',
        })
      );
      expect(mockSetVisibleSignup).toHaveBeenCalledWith(false);
      expect(mockSetVisibleLogin).toHaveBeenCalledWith(true);
    });
  });
  
  test('shows error message on failed signup', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
      })
    );
  
    render(<Signup hide={mockHide} setVisibleSignup={mockSetVisibleSignup} setVisibleLogin={mockSetVisibleLogin} toast={mockToast} />);
    
    // Fill in all required fields
    fireEvent.change(screen.getByTestId("SignUpName"), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByTestId("SignUpUsername"), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByTestId("SignUpEmail"), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByTestId("signUpPassword"), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByTestId("signUpRePassword"), { target: { value: 'Password1!' } });
    
    // Click the Signup button
    fireEvent.click(screen.getByRole('button', { name: /Signup/i }));
    
    // Wait for the toast to be shown and validate its content
    await waitFor(() => {
      expect(mockToast.current.show).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          detail: 'Username already exists.',
        })
      );
    });
  });
});
