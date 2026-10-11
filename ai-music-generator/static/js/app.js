document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navCreate = document.getElementById('nav-create');
    const navHistory = document.getElementById('nav-history');
    const navFavorites = document.getElementById('nav-favorites');
    const navYoutube = document.getElementById('nav-youtube');
    
    const sectionCreate = document.getElementById('section-create');
    const sectionHistory = document.getElementById('section-history');
    const sectionFavorites = document.getElementById('section-favorites');
    const sectionYoutube = document.getElementById('section-youtube');

    function switchTab(activeNav, activeSection) {
        [navCreate, navHistory, navFavorites, navYoutube].forEach(n => n.classList.remove('active'));
        [sectionCreate, sectionHistory, sectionFavorites, sectionYoutube].forEach(s => s.classList.remove('active'));
        
        activeNav.classList.add('active');
        activeSection.classList.add('active');
    }

    navCreate.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(navCreate, sectionCreate);
    });

    navHistory.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(navHistory, sectionHistory);
        loadLibrary();
    });

    navFavorites.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(navFavorites, sectionFavorites);
        loadLibrary();
    });

    navYoutube.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(navYoutube, sectionYoutube);
    });

    // Tempo Slider Update
    const tempoSlider = document.getElementById('tempo');
    const tempoVal = document.getElementById('tempo-val');
    tempoSlider.addEventListener('input', () => {
        tempoVal.textContent = tempoSlider.value;
    });

    // Generate Form
    const generateForm = document.getElementById('generate-form');
    const generateBtn = document.getElementById('generate-btn');
    const btnText = generateBtn.querySelector('.btn-text');
    const loader = generateBtn.querySelector('.loader');
    const playerContainer = document.getElementById('player-container');
    const currentTrackTitle = document.getElementById('current-track-title');
    const downloadBtn = document.getElementById('download-midi-btn');
    const myPlayer = document.getElementById('myPlayer');
    const myVisualizer = document.getElementById('myVisualizer');

    // Specify a good soundfont for html-midi-player
    myPlayer.soundFont = 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus';

    generateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(generateForm);
        const payload = Object.fromEntries(formData.entries());
        
        // UI Loading state
        generateBtn.disabled = true;
        btnText.textContent = 'Generating...';
        loader.classList.remove('hidden');
        playerContainer.classList.add('hidden');
        
        // Stop current playback if any
        if (myPlayer.playing) {
            myPlayer.stop();
        }

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (data.success) {
                const track = data.track;
                const midiUrl = `/download/${track.filename}`;
                
                // Update player UI
                currentTrackTitle.textContent = track.title;
                downloadBtn.href = midiUrl;
                downloadBtn.download = track.title + '.mid';
                
                // Set MIDI source
                myPlayer.src = midiUrl;
                
                // Show player
                playerContainer.classList.remove('hidden');
                
                // Ensure visualizer is linked
                myVisualizer.src = midiUrl;
                
            } else {
                alert('Error generating music: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to connect to the server.');
        } finally {
            // Restore button state
            generateBtn.disabled = false;
            btnText.textContent = 'Generate Music';
            loader.classList.add('hidden');
        }
    });

    // Library Functions
    const historyGrid = document.getElementById('history-grid');
    const favoritesGrid = document.getElementById('favorites-grid');
    let currentEditId = null;

    async function loadLibrary() {
        historyGrid.innerHTML = '<div class="loading-state">Loading history...</div>';
        favoritesGrid.innerHTML = '<div class="loading-state">Loading favorites...</div>';
        try {
            const response = await fetch('/api/tracks');
            const tracks = await response.json();
            
            if (tracks.length === 0) {
                historyGrid.innerHTML = '<div class="loading-state">Your history is empty. Go create some music!</div>';
                favoritesGrid.innerHTML = '<div class="loading-state">You have no favorites yet.</div>';
                return;
            }
            
            historyGrid.innerHTML = '';
            favoritesGrid.innerHTML = '';
            
            let hasFavorites = false;
            let hasHistory = false;
            
            tracks.forEach(track => {
                const isFav = track.is_favorite;
                if (isFav) hasFavorites = true;
                hasHistory = true;
                
                const heartClass = isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
                const heartColor = isFav ? 'color: #f80759;' : '';
                
                const card = document.createElement('div');
                card.className = 'track-card';
                card.innerHTML = `
                    <div class="track-header">
                        <div>
                            <div class="track-title">${track.title}</div>
                            <div class="track-meta">
                                <span class="tag">${track.genre}</span>
                                <span class="tag">${track.mood}</span>
                                <span class="tag">${track.duration}s</span>
                            </div>
                        </div>
                        <button class="icon-btn fav-btn" style="border:none; background:transparent; ${heartColor}" data-id="${track.id}">
                            <i class="${heartClass} fa-lg"></i>
                        </button>
                    </div>
                    <div class="track-actions">
                        ${track.track_type === 'youtube' 
                            ? `<button class="icon-btn play-yt-btn" data-vid="${track.filename}" data-title="${track.title}"><i class="fa-brands fa-youtube"></i> Watch</button>`
                            : `<button class="icon-btn play-track-btn" data-url="/download/${track.filename}" data-title="${track.title}"><i class="fa-solid fa-play"></i> Play</button>
                               <a href="/download/${track.filename}" download="${track.title}.mid" class="icon-btn"><i class="fa-solid fa-download"></i></a>`
                        }
                        <button class="icon-btn edit-btn" data-id="${track.id}" data-title="${track.title}"><i class="fa-solid fa-pen"></i></button>
                        <button class="icon-btn delete delete-btn" data-id="${track.id}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                
                // Add to history grid always
                historyGrid.appendChild(card.cloneNode(true));
                
                // Add to favorites if favorited
                if (isFav) {
                    favoritesGrid.appendChild(card.cloneNode(true));
                }
            });
            
            if (!hasFavorites) {
                favoritesGrid.innerHTML = '<div class="loading-state">You have no favorite tracks yet. Click the heart icon on any track in your History to save it here!</div>';
            }
            
            // Attach event listeners to newly created buttons
            attachLibraryListeners();
            
        } catch (error) {
            console.error('Error:', error);
            historyGrid.innerHTML = '<div class="loading-state">Failed to load library.</div>';
            favoritesGrid.innerHTML = '<div class="loading-state">Failed to load library.</div>';
        }
    }

    function attachLibraryListeners() {
        // Play buttons
        document.querySelectorAll('.play-track-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = e.currentTarget.getAttribute('data-url');
                const title = e.currentTarget.getAttribute('data-title');
                
                // Switch to Create tab to show player
                navCreate.click();
                
                currentTrackTitle.textContent = title;
                downloadBtn.href = url;
                downloadBtn.download = title + '.mid';
                myPlayer.src = url;
                myVisualizer.src = url;
                
                playerContainer.classList.remove('hidden');
                
                // Auto play
                setTimeout(() => {
                    myPlayer.start();
                }, 500);
            });
        });

        // Play YouTube buttons
        document.querySelectorAll('.play-yt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const vid = e.currentTarget.getAttribute('data-vid');
                ytIframe.src = `https://www.youtube.com/embed/${vid}?autoplay=1`;
                ytPlayerContainer.classList.remove('hidden');
                navYoutube.click(); // Switch to youtube tab
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Are you sure you want to delete this track?')) {
                    const id = e.currentTarget.getAttribute('data-id');
                    try {
                        const response = await fetch(`/api/tracks/${id}`, {
                            method: 'DELETE'
                        });
                        if (response.ok) {
                            loadLibrary();
                        }
                    } catch (error) {
                        console.error('Error deleting:', error);
                    }
                }
            });
        });

        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentEditId = e.currentTarget.getAttribute('data-id');
                const currentTitle = e.currentTarget.getAttribute('data-title');
                
                editInput.value = currentTitle;
                editModal.classList.add('show');
            });
        });

        // Favorite toggle buttons
        document.querySelectorAll('.fav-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                try {
                    const response = await fetch(`/api/tracks/${id}/favorite`, {
                        method: 'PUT'
                    });
                    if (response.ok) {
                        loadLibrary(); // reload to reflect changes
                    }
                } catch (error) {
                    console.error('Error toggling favorite:', error);
                }
            });
        });
    }

    // Modal Handling
    const editModal = document.getElementById('edit-modal');
    const closeModal = document.querySelector('.close-modal');
    const editInput = document.getElementById('edit-title-input');
    const saveTitleBtn = document.getElementById('save-title-btn');

    closeModal.addEventListener('click', () => {
        editModal.classList.remove('show');
    });

    saveTitleBtn.addEventListener('click', async () => {
        if (!currentEditId || !editInput.value.trim()) return;
        
        try {
            const response = await fetch(`/api/tracks/${currentEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: editInput.value.trim() })
            });
            
            if (response.ok) {
                editModal.classList.remove('show');
                loadLibrary();
            }
        } catch (error) {
            console.error('Error updating title:', error);
        }
    });

    // Close modal if clicked outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.classList.remove('show');
        }
    });

    // YouTube Logic
    const ytUrlInput = document.getElementById('yt-url');
    const loadYtBtn = document.getElementById('load-yt-btn');
    const saveYtBtn = document.getElementById('save-yt-btn');
    const ytPlayerContainer = document.getElementById('yt-player-container');
    const ytIframe = document.getElementById('yt-iframe');
    let currentYtVideoId = null;

    function extractVideoID(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    loadYtBtn.addEventListener('click', () => {
        const url = ytUrlInput.value.trim();
        if (!url) return;
        
        const videoId = extractVideoID(url);
        if (videoId) {
            currentYtVideoId = videoId;
            ytIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            ytPlayerContainer.classList.remove('hidden');
            saveYtBtn.classList.remove('hidden');
        } else {
            alert("Invalid YouTube URL. Please enter a valid link.");
        }
    });

    saveYtBtn.addEventListener('click', async () => {
        if (!currentYtVideoId) return;
        
        try {
            const response = await fetch('/api/tracks/youtube', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    video_id: currentYtVideoId,
                    title: "Saved YouTube Video"
                })
            });
            
            if (response.ok) {
                alert('Saved to Favorites!');
                saveYtBtn.classList.add('hidden'); // Hide after saving
            }
        } catch (error) {
            console.error('Error saving youtube track:', error);
        }
    });
});
