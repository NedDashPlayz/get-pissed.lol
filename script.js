document.addEventListener('DOMContentLoaded', function() {
    const clickScreen = document.getElementById('click-screen');
    const audio = document.getElementById('background-audio');

    // Set initial volume to 20% (0.2)
    audio.volume = 0.2;

    clickScreen.addEventListener('click', function() {
        // Play the audio
        audio.play().then(() => {
            // Unmute the audio (just in case it was muted)
            audio.muted = false;
            // Smoothly hide the click screen
            clickScreen.classList.add('hidden');
        }).catch(error => {
            console.error('Error playing the audio:', error);
        });
    });
});
