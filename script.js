document.addEventListener('DOMContentLoaded', function() {
    const clickScreen = document.getElementById('click-screen');
    const audio = document.getElementById('background-audio');

    // Set volume to 20% to avoid loud audio
    audio.volume = 0.2;

    // Event listener to start audio and hide the click screen
    clickScreen.addEventListener('click', function() {
        playAudioAndHideClickScreen();
    });

    function playAudioAndHideClickScreen() {
        audio.play().then(() => {
            audio.muted = false;
            clickScreen.classList.add('hidden');
            fetchDiscordPresence(); // Fetch presence initially
            // Set up auto-update every 1ms ( Discord API rate limit is 1 request per second )
            setInterval(fetchDiscordPresence, 1); // i.e. 1 ms of delay
        }).catch(error => {
            console.error('Error playing the audio:', error);
        });
    }

    function fetchDiscordPresence() {
        const url = `https://api.lanyard.rest/v1/users/543623256842829824`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const { discord_user, discord_status, activities } = data.data;
                    const username = `${discord_user.username}`;
                    const avatarUrl = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png`;
                    let activityHtml = '';

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

                    if (activities.length > 0) {
                        const activity = activities[0]; // Get the primary activity
                        const largeImageUrl = activity.assets ? 'https://' + activity.assets.large_image.split('/https/')[1] : '';
                        const smallImageUrl = activity.assets ? 'https://' + activity.assets.small_image.split('/https/')[1] : '';
                        const state = activity.state || '';
                        const details = activity.details || '';

                        // Calculate music time elapsed or remaining
                        let timeHtml = '';
                        let progressBarHtml = '';
                        if (activity.type === 2 && activity.timestamps) { // Music activity with timestamp
                            const startTime = activity.timestamps.start; // Start time in UNIX ms
                            const endTime = activity.timestamps.end || null; // Optional end time
                            const currentTime = Date.now(); // Current time in UNIX ms

                            // Calculate elapsed time if start exists
                            if (startTime) {
                                const elapsed = Math.floor((currentTime - startTime) / 1000); // Time in seconds
                                const minutes = Math.floor(elapsed / 60);
                                const seconds = elapsed % 60;
                                const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                                if (endTime) {
                                    // If endTime exists, calculate remaining time
                                    const totalDuration = Math.floor((endTime - startTime) / 1000);
                                    const remaining = totalDuration - elapsed;
                                    const remainingMinutes = Math.floor(remaining / 60);
                                    const remainingSeconds = remaining % 60;
                                    const formattedRemaining = `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
                                    timeHtml = `<p>Time Elapsed: ${formattedTime} / Remaining: ${formattedRemaining}</p>`;

                                    // Calculate the percentage of the track that has been played
                                    const progressPercentage = (elapsed / totalDuration) * 100;

                                    // Add progress bar
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

                        // Check if the activity is related to music (type 2)
                        if (activity.type === 2) { // Music activity
                            activityHtml = `
                                <div class="activity">
                                    <div class="activity-image-container">
                                        <img src="${largeImageUrl}" alt="Music Image" class="activity-image" />
                                    </div>
                                    <div class="activity-info">
                                        <p class="activity-name">${activity.name}</p>
                                        <p class="activity-state">Listening to: ${state}</p>
                                        <p class="activity-details">${details}</p>
                                        ${timeHtml}
                                        ${progressBarHtml} 
                                    </div>
                                </div>
                            `;
                        } else {
                            // For non-music activities (like coding)
                            activityHtml = `
                                <div class="activity">
                                    <div class="activity-image-container">
                                        <img src="${largeImageUrl}" alt="Large Activity Image" class="activity-image" />
                                        <img src="${smallImageUrl}" alt="Small Activity Image" class="activity-small-image" />
                                    </div>
                                    <div class="activity-info">
                                        <p class="activity-name">${activity.name}</p>
                                        <p class="activity-state">${state}</p>
                                        <p class="activity-details">${details}</p>
                                    </div>
                                </div>
                            `;
                        }
                    }

                    const discordPresenceElement = document.getElementById('discord-presence');
                    discordPresenceElement.innerHTML = `
                        <div class="profile">
                            <div class="profile-image-container">
                                <img src="${avatarUrl}" alt="Profile Picture" class="profile-picture" />
                                <img src="${statusIconUrl}" alt="Status Icon" class="status-icon" />
                            </div>
                            <div class="profile-info">
                                <p>${username}</p>
                            </div>
                        </div>
                        ${activityHtml}
                    `;

                    const style = document.createElement('style');
                    style.innerHTML = `
                        .profile {
                            display: flex;
                            align-items: center;
                        }
                        .profile-image-container {
                            position: relative;
                            display: inline-block;
                        }
                        .profile-picture {
                            width: 50px;
                            height: 50px;
                            border-radius: 50%;
                        }
                        .status-icon {
                            width: 14px;
                            height: 14px;
                            position: absolute;
                            bottom: 3px;
                            right: 3px;
                            border-radius: 50%;
                        }
                        .activity {
                            display: flex;
                            align-items: center;
                            margin-top: 10px;
                        }
                        .activity-image-container {
                            position: relative;
                            display: inline-block;
                        }
                        .activity-image {
                            width: 85px;
                            height: 85px;
                            border-radius: 10px;
                            margin-right: 10px;
                        }
                        .activity-small-image {
                            width: 30px;
                            height: 30px;
                            position: absolute;
                            bottom: 3px;
                            right: 3px;
                            border-radius: 50%;
                        }
                        .activity-info {
                            flex-grow: 1;
                        }
                        .activity-name {
                            font-weight: bold;
                        }
                        .activity-state {
                            color: gray;
                        }
                        .activity-details {
                            font-size: 0.9em;   
                            color: #555;
                                }
                          .profile-info {
                        margin-left: 35px; /* Add some space between the image and the username */
                        font-size: 1.2em;
                        font-weight: bold;
                        
                                }
                    `;
                    document.head.appendChild(style);
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

    // Typing effect for the tab title
    const titles = ["ClouD", "610ud"];
    let index = 0;
    let charIndex = 0;
    let currentTitle = titles[index];
    let isDeleting = false;
    let speed = 350;
    let eraseSpeed = 150;
    let pauseBetween = 50;
    let placeholder = "";

    function typeTitle() {
        if (!isDeleting && charIndex < currentTitle.length) {
            placeholder = currentTitle.substring(0, charIndex + 1);
            document.title = placeholder;
            charIndex++;
            setTimeout(typeTitle, speed);
        } else if (isDeleting && charIndex >= 0) {
            placeholder = currentTitle.substring(0, charIndex);
            document.title = placeholder;
            charIndex--;
            setTimeout(typeTitle, eraseSpeed);
        } else {
            isDeleting = !isDeleting;
            index = (index + 1) % titles.length;
            currentTitle = titles[index];
            setTimeout(typeTitle, pauseBetween);
        }
    }

    typeTitle();
});
