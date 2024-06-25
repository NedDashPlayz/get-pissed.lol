document.addEventListener('DOMContentLoaded', function() {
    const clickScreen = document.getElementById('click-screen');
    const audio = document.getElementById('background-audio');

    clickScreen.addEventListener('click', function() {
        // Unmute the audio
        if (audio.muted) {
            audio.muted = false;
        }
        // Hide the click screen
        clickScreen.style.display = 'none';
    });
});
