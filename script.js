document.addEventListener('click', function() {
    const audio = document.getElementById('background-audio');
    if (audio.muted) {
        audio.muted = false;
    }
});
