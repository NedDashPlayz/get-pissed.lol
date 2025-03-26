document.addEventListener('DOMContentLoaded', function () {
    const clickScreen = document.getElementById('click-screen');
    const audio = document.getElementById('background-audio');
    const backgroundVideo = document.getElementById('background-video');
    const fallbackBackground = document.getElementById('fallback-background');

    // Fetch configuration from Pastebin or alternative
    const configUrl = 'https://raw.githubusercontent.com/610ud/get-pissed.lol/refs/heads/Overhaul/yes.json';

    fetch(configUrl)
        .then(response => response.json())
        .then(config => {
            // Update background video
            const videoSource = document.createElement('source');
            videoSource.src = config.background;
            videoSource.type = 'video/mp4';
            backgroundVideo.innerHTML = ''; // Clear existing sources
            backgroundVideo.appendChild(videoSource);

            // Update fallback background
            fallbackBackground.style.backgroundImage = `url(${config.fallbackBackground})`;

            // Update music
            const audioSource = document.createElement('source');
            audioSource.src = config.music;
            audioSource.type = 'audio/mpeg';
            audio.innerHTML = ''; // Clear existing sources
            audio.appendChild(audioSource);

            // Reload elements to apply changes
            backgroundVideo.load();
            audio.load();
        })
        .catch(error => console.error('Error fetching configuration:', error));

    // Set volume to 20%
    audio.volume = 0.2;

    // Click screen event
    clickScreen.addEventListener('click', function () {
        playAudioAndHideClickScreen();
    });

    function playAudioAndHideClickScreen() {
        audio.play().then(() => {
            audio.muted = false;
            clickScreen.classList.add('hidden');
            fetchDiscordPresence();
            setInterval(fetchDiscordPresence, 1000); // Update presence every 1 sec
            setInterval(verifyGameIcon, 15000); // Verify game icon every 15 seconds
        }).catch(error => console.error('Error playing the audio:', error));
    }

    // Show the video once it is ready to play and hide the fallback background
    backgroundVideo.addEventListener('canplay', function () {
        backgroundVideo.classList.remove('hidden');
        fallbackBackground.style.display = 'none';
    });

    let lastActivityTime = Date.now();
    let lastActivityId = null;
    let iconFetched = false;
    let currentActivity = null;
    let gameIconUrl = '';
    let iconFetchAttempts = 0;
    const maxIconFetchAttempts = 2;

    function fetchDiscordPresence() {
        const url = `https://lanapi.pixelvault.co/v1/users/543623256842829824`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const { discord_user, discord_status, activities } = data.data;
                    const username = discord_user.username;
                    const avatarUrl = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png`;

                    // Status icon selection
                    let statusIconUrl = '';
                    if (discord_status === 'dnd') {
                        statusIconUrl = 'https://pixelvault.co/cm2s6b1xo002eerha42ka3qnp/direct';
                    } else if (discord_status === 'idle') {
                        statusIconUrl = 'https://pixelvault.co/cm2s6awmh002cerhaoy8lnh7b/direct';
                    } else if (discord_status === 'online') {
                        statusIconUrl = 'https://pixelvault.co/cm2s6arb9002aerhayaxmsmcw/direct';
                    } else if (discord_status === 'offline') {
                        statusIconUrl = 'https://pixelvault.co/cm2s6jjz3002gerha5rfcvrmc/direct';
                    }

                    let activityHtml = '';
                    if (activities.length > 0) {
                        const activity = activities[0];
                        currentActivity = activity;
                        const activityName = activity.name || 'No Activity';
                        const state = activity.state || '';
                        const details = activity.details || '';
                        const activityId = activity.id;

                        // Image handling
                        let largeImageUrl = '';
                        let smallImageUrl = '';
                        let timeHtml = '';
                        let progressBarHtml = '';

                        if (activity.assets) {
                            if (activity.assets.large_image) {
                                if (activity.assets.large_image.startsWith('mp:attachments')) {
                                    largeImageUrl = `https://cdn.discordapp.com/${activity.assets.large_image.replace('mp:', '')}`;
                                } else if (activity.name === 'Spotify') {
                                    const spotifyImageId = activity.assets.large_image.replace('spotify:', '');
                                    largeImageUrl = `https://i.scdn.co/image/${spotifyImageId}`;
                                } else {
                                    largeImageUrl = `https://${activity.assets.large_image.split('/https/')[1]}`;
                                }
                            }
                            if (activity.assets.small_image) {
                                smallImageUrl = `https://${activity.assets.small_image.split('/https/')[1]}`;
                            }
                        }

                        // Timestamp and progress bar
                        if (activity.timestamps) {
                            const startTime = activity.timestamps.start;
                            const endTime = activity.timestamps.end || null;
                            const currentTime = Date.now();

                            if (startTime) {
                                const elapsed = Math.floor((currentTime - startTime) / 1000); // Time in seconds
                                const minutes = Math.floor(elapsed / 60);
                                const seconds = elapsed % 60;
                                const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                                if (endTime && endTime > startTime) {
                                    const totalDuration = Math.floor((endTime - startTime) / 1000);
                                    const remaining = totalDuration - elapsed;
                                    const remainingMinutes = Math.floor(remaining / 60);
                                    const remainingSeconds = remaining % 60;
                                    const formattedRemaining = `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
                                    timeHtml = `<p>Time Elapsed: ${formattedTime} / Remaining: ${formattedRemaining}</p>`;

                                    const progressPercentage = (elapsed / totalDuration) * 100;

                                    progressBarHtml = `
                                        <div class="progress-bar-container">
                                            <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                                        </div>
                                    `;
                                } else {
                                    timeHtml = `<p>Time Elapsed: ${formattedTime}</p>`;
                                }
                            }
                        }

                        activityHtml = `
                            <div class="activity">
                                <div class="activity-info">
                                    <p class="activity-name">${activityName}</p>
                                    <p class="activity-state">${state}</p>
                                    <p class="activity-details">${details}</p>
                                    ${timeHtml}
                                </div>
                                <div class="activity-images">
                                    ${largeImageUrl ? `<div class="large-image-container"><img src="${largeImageUrl}" alt="Large Activity Image" class="activity-large-image" />${smallImageUrl ? `<img src="${smallImageUrl}" alt="Small Activity Image" class="activity-small-image" />` : ''}</div>` : ''}
                                    ${progressBarHtml}
                                    ${gameIconUrl ? `<img src="${gameIconUrl}" alt="${activityName} Icon" class="activity-game-icon" />` : ''}
                                </div>
                            </div>
                        `;

                        const discordPresenceElement = document.getElementById('discord-presence');
                        discordPresenceElement.innerHTML = `
                            <div class="profile-container">
                                <div class="profile">
                                    <div class="profile-picture-container">
                                        <img src="${avatarUrl}" alt="Profile Picture" class="profile-picture" />
                                        <img src="${statusIconUrl}" alt="Status Icon" class="status-icon" />
                                    </div>
                                    <p class="username-js">${username}</p>
                                </div>
                                <div class="activity-container">
                                    ${activityHtml}
                                </div>
                            </div>
                        `;

                        lastActivityTime = Date.now();

                        // Reset iconFetched if the activity has changed
                        if (activityId !== lastActivityId) {
                            iconFetched = false;
                            lastActivityId = activityId;
                            gameIconUrl = ''; // Reset game icon URL
                            iconFetchAttempts = 0; // Reset icon fetch attempts
                            verifyGameIcon(); // Fetch the game icon immediately after detecting the game
                        }
                    } else {
                        const discordPresenceElement = document.getElementById('discord-presence');
                        discordPresenceElement.innerHTML = `
                            <div class="profile-container">
                                <div class="profile">
                                    <div class="profile-picture-container">
                                        <img src="${avatarUrl}" alt="Profile Picture" class="profile-picture" />
                                        <img src="${statusIconUrl}" alt="Status Icon" class="status-icon" />
                                    </div>
                                    <p class="username-js">${username}</p>
                                </div>
                                <div class="profile-info">
                                    <p>Online</p>
                                </div>
                            </div>
                        `;
                    }
                } else {
                    const discordPresenceElement = document.getElementById('discord-presence');
                    discordPresenceElement.innerHTML = '<p>Could not fetch Discord presence.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching Discord presence:', error);
                const discordPresenceElement = document.getElementById('discord-presence');
                discordPresenceElement.innerHTML = '<p>Offline</p>';
            });
    }

    function verifyGameIcon() {
        if (currentActivity && currentActivity.type !== 2 && !iconFetched && iconFetchAttempts < maxIconFetchAttempts) { // Type 2 is for listening to music
            fetch('games.json')
                .then(response => response.json())
                .then(gistData => {
                    const appId = currentActivity.application_id;
                    const iconString = gistData.find(game => game.id === appId)?.icon || '';
                    if (iconString) {
                        gameIconUrl = `https://cdn.discordapp.com/app-icons/${appId}/${iconString}`;
                    }

                    console.log('Activity:', currentActivity);
                    console.log('Game Icon URL:', gameIconUrl);

                    
                    const activityImages = document.querySelector('.activity-images');
                    if (activityImages && gameIconUrl) {
                        activityImages.innerHTML += `<img src="${gameIconUrl}" alt="${currentActivity.name} Icon" class="activity-game-icon" />`;
                        iconFetched = true;
                    }
                })
                .catch(error => console.error('Error fetching local games.json:', error));
            iconFetchAttempts++;
        }
    }

    // Typing effect
    const titles = ["ClouD", "610ud"];
    let index = 0, charIndex = 0, isDeleting = false;

    function typeTitle() {
        const currentTitle = titles[index];
        const placeholder = isDeleting
            ? currentTitle.substring(0, charIndex - 1)
            : currentTitle.substring(0, charIndex + 1);
        document.title = placeholder;

        if (isDeleting) charIndex--;
        else charIndex++;

        if (!isDeleting && charIndex === currentTitle.length) {
            isDeleting = true;
            setTimeout(typeTitle, 1000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            index = (index + 1) % titles.length;
            setTimeout(typeTitle, 750);
        } else {
            setTimeout(typeTitle, isDeleting ? 200 : 300);
        }
    }

    typeTitle();
});
