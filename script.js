document.addEventListener('DOMContentLoaded', function() {
    const clickScreen = document.getElementById('click-screen');
    const audio = document.getElementById('background-audio');
    const loginButton = document.getElementById('login-button');

    // 20 percent so that people don't want their ears pierced
    audio.volume = 0.2;

    // Click screen event listener for audio start
    clickScreen.addEventListener('click', function() {
        playAudioAndHideClickScreen();
    });

    // Function to play audio and hide click screen
    function playAudioAndHideClickScreen() {
        audio.play().then(() => {
            // Unmute the audio (just in case it was muted)
            audio.muted = false;
            // hide da screen with effect
            clickScreen.classList.add('hidden');
        }).catch(error => {
            console.error('Error playing the audio:', error);
        });
    }
});