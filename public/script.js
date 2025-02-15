document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    // const video = document.getElementById('background-video');

    // Disable controls
    // video.controls = false;

    // Prevent pausing
    // video.addEventListener('pause', () => {
    //     video.play();
    // });

    // Prevent user from pausing video using spacebar or 'k' key
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'k') {
            e.preventDefault();
        }
    });


    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        // Get the form data
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // Send a POST request to the backend
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Display error message if login fails
                loginError.textContent = data.error || 'An error occurred. Please try again.';
                loginError.style.color = 'red';
            } else {
                // Save the token and redirect to the dashboard or another page
                localStorage.setItem('token', data.token);
                setTimeout(function () {
                    window.location.href = '/dashboard';
                }, 2000);
            }
        } catch (error) {
            loginError.textContent = 'Error connecting to the server. Please try again.';
            loginError.style.color = 'red';
        }
    });
});


