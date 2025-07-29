// User accounts storage (in a real app, this would be a database)
let users = JSON.parse(localStorage.getItem('bookHavenUsers')) || [];

// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');

// Helper functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(String(phone));
}

function validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(password);
}

// Register form submission
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        clearErrors();

        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const phone = document.getElementById('register-phone').value.trim();
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        const terms = document.querySelector('input[name="terms"]').checked;

        // Validation
        let isValid = true;

        if (username.length < 3) {
            showError('username-error', 'Username must be at least 3 characters');
            isValid = false;
        }

        if (!validateEmail(email)) {
            showError('email-error', 'Please enter a valid email address');
            isValid = false;
        }

        if (!validatePhone(phone)) {
            showError('phone-error', 'Please enter a valid phone number');
            isValid = false;
        }

        if (!validatePassword(password)) {
            showError('password-error', 'Password must be at least 8 characters with uppercase, lowercase, and number');
            isValid = false;
        }

        if (password !== confirm) {
            showError('confirm-error', 'Passwords do not match');
            isValid = false;
        }

        if (!terms) {
            alert('You must agree to the terms and conditions');
            isValid = false;
        }

        // Check if username or email already exists
        const userExists = users.some(user => 
            user.username === username || user.email === email
        );

        if (userExists) {
            alert('Username or email already exists');
            isValid = false;
        }

        if (isValid) {
            // Create new user
            const newUser = {
                username,
                email,
                phone,
                password, // In a real app, you would hash the password
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('bookHavenUsers', JSON.stringify(users));
            localStorage.setItem('bookHavenCurrentUser', JSON.stringify(newUser));

            alert('Registration successful! You are now logged in.');
            window.location.href = 'index.html';
        }
    });
}

// Login form submission
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        clearErrors();

        const usernameOrEmail = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.querySelector('input[name="remember"]').checked;

        // Find user by username or email
        const user = users.find(user => 
            user.username === usernameOrEmail || user.email === usernameOrEmail
        );

        if (!user) {
            alert('User not found. Please check your username/email or register.');
            return;
        }

        if (user.password !== password) {
            alert('Incorrect password. Please try again.');
            return;
        }

        // Login successful
        localStorage.setItem('bookHavenCurrentUser', JSON.stringify(user));

        if (rememberMe) {
            // Set cookie or localStorage for persistent login
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30); // 30 days
            document.cookie = `bookHavenRememberMe=true; expires=${expiryDate.toUTCString()}; path=/`;
        }

        alert('Login successful!');
        window.location.href = 'index.html';
    });
}

// Forgot password form submission
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        clearErrors();

        const email = document.getElementById('forgot-email').value.trim();

        if (!validateEmail(email)) {
            showError('forgot-email-error', 'Please enter a valid email address');
            return;
        }

        // Check if email exists
        const userExists = users.some(user => user.email === email);

        if (!userExists) {
            alert('No account found with that email address.');
            return;
        }

        // In a real app, you would send a password reset email
        alert(`Password reset link has been sent to ${email} (simulated).`);
        window.location.href = 'login.html';
    });
}

// Check if user is logged in and update UI
function checkAuthState() {
    const currentUser = JSON.parse(localStorage.getItem('bookHavenCurrentUser'));
    const loginBtn = document.querySelector('.login-btn');

    if (currentUser && loginBtn) {
        loginBtn.textContent = 'Logout';
        loginBtn.href = '#';
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('bookHavenCurrentUser');
            window.location.href = 'index.html';
        });
    }
}

// Initialize auth state check
document.addEventListener('DOMContentLoaded', checkAuthState);
