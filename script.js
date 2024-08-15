document.addEventListener('DOMContentLoaded', function() {
    const clickScreen = document.getElementById('click-screen');
    const audio = document.getElementById('background-audio');
    const loginButton = document.getElementById('login-button');

    // Set volume to 20% to avoid loud audio
    audio.volume = 0.2;

    // Event listener to start audio and hide the click screen
    clickScreen.addEventListener('click', function() {
        playAudioAndHideClickScreen();
    });

    // Function to play audio and hide the click screen
    function playAudioAndHideClickScreen() {
        audio.play().then(() => {
            // Unmute the audio (if muted)
            audio.muted = false;
            // Add class to hide the click screen with a transition effect
            clickScreen.classList.add('hidden');
        }).catch(error => {
            console.error('Error playing the audio:', error);
        });
    }

    // Typing effect for the tab title
    const titles = ["ClouD", "610ud"]; // The texts to type and erase
    let index = 0;
    let charIndex = 0;
    let currentTitle = titles[index];
    let isDeleting = false;
    let speed = 350; // Typing speed (milliseconds per character)
    let eraseSpeed = 150; // Speed for erasing
    let pauseBetween = 1500; // Pause between typing and erasing

    function typeTitle() {
        if (!isDeleting && charIndex < currentTitle.length) {
            document.title = currentTitle.substring(0, charIndex + 1);
            charIndex++;
            setTimeout(typeTitle, speed);
        } else if (isDeleting && charIndex > 0) {
            document.title = currentTitle.substring(0, charIndex - 1);
            charIndex--;
            setTimeout(typeTitle, eraseSpeed);
        } else if (!isDeleting && charIndex === currentTitle.length) {
            isDeleting = true;
            setTimeout(typeTitle, pauseBetween);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            index = (index + 1) % titles.length;
            currentTitle = titles[index];
            setTimeout(typeTitle, speed);
        }
    }

    // Start the typing effect
    typeTitle();
});
