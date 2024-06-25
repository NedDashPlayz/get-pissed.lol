document.addEventListener('DOMContentLoaded', function() {
    const clickScreen = document.getElementById('click-screen');
    const audio = document.getElementById('background-audio');
    const loginButton = document.getElementById('login-button');

    // Set initial volume to 20% (0.2)
    audio.volume = 0.2;

    // Click screen event listener to start playing audio
    clickScreen.addEventListener('click', function() {
        playAudioAndHideClickScreen();
    });

    // Function to play audio and hide click screen
    function playAudioAndHideClickScreen() {
        audio.play().then(() => {
            // Unmute the audio (just in case it was muted)
            audio.muted = false;
            // Smoothly hide the click screen
            clickScreen.classList.add('hidden');
        }).catch(error => {
            console.error('Error playing the audio:', error);
        });
    }

    // Discord OAuth2 variables
    const clientId = '1233815762938888272'; // Replace with your Discord application client ID
    const redirectUri = 'https://get-pissed.lol/'; // Replace with your redirect URI

    // Event listener for login button click
    loginButton.addEventListener('click', function() {
        const authUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20rpc.activities.write`;

        // Redirect user to Discord authorization page
        window.location.href = authUrl;
    });

    // Function to handle OAuth2 callback
    async function handleOAuth2Callback() {
        const code = new URLSearchParams(window.location.search).get('code');

        if (code) {
            try {
                // Exchange code for access token
                const response = await fetch(`http://localhost:3000/oauth2/callback?code=${code}`);
                const data = await response.json();

                console.log('User Activity Data:', data);

                // Example: Displaying user's username on the profile card
                const usernameElement = document.querySelector('.username');
                usernameElement.textContent = data.username;

                // Example: Displaying user's avatar
                const profilePicElement = document.querySelector('.profile-pic');
                profilePicElement.src = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`;

                // Example: Displaying user's status
                const statusTextElement = document.querySelector('.status-text');
                statusTextElement.textContent = data.status;

                // Hide the login button and show the profile card
                loginButton.style.display = 'none';
                clickScreen.style.display = 'none';
                document.querySelector('.container').style.display = 'flex';
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
    }

    // Call OAuth2 callback handler
    handleOAuth2Callback();
});