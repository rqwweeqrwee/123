// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
const API_BASE = 'moonfy.onrender.com/api';
let currentUser = null;
let token = localStorage.getItem('moonfy_token');
let allTracks = [];
let userTracks = [];
let userPlaylists = [];
let favoritePlaylist = null;
let currentPlaylistId = null;
let currentProfileUserId = null;
let audioPlayer = null;
let isPlaying = false;
let currentTrack = null;
let currentTrackLikes = 0;
let currentTrackLiked = false;

let shuffle = false;
let repeat = 'off';
let crossfadeDuration = 0;
let nextTrackTimeout = null;

let isDraggingVolume = false;
let audioContext = null;
let analyser = null;
let source = null;
let eqFilters = [];
let crossfadeGain = null;

let currentUserFollowing = [];
let notifications = [];
let unreadCount = 0;
let currentSort = 'date_desc';
let playlistSearchQuery = '';
let complaints = [];

let searchDebounceTimer = null;
let userSearchDebounceTimer = null;

// ==================== ЭЛЕМЕНТЫ DOM ====================
const authContainer = document.getElementById('authContainer');
const appContainer = document.getElementById('appContainer');
const authForm = document.getElementById('authForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const authButton = document.getElementById('authButton');
const formTitle = document.getElementById('formTitle');
const toggleAuth = document.getElementById('toggleAuth');
const authMessage = document.getElementById('authMessage');
const emailGroup = document.getElementById('emailGroup');
const regEmail = document.getElementById('regEmail');
const avatarGroup = document.getElementById('avatarGroup');
const regAvatar = document.getElementById('regAvatar');
const regAvatarDropzone = document.getElementById('regAvatarDropzone');

const navLinks = document.querySelectorAll('.nav-link');
const homePage = document.getElementById('homePage');
const libraryPage = document.getElementById('libraryPage');
const followingPage = document.getElementById('followingPage');
const playlistDetailPage = document.getElementById('playlistDetailPage');
const userProfilePage = document.getElementById('userProfilePage');
const adminPage = document.getElementById('adminPage');

const menuAvatar = document.getElementById('menuAvatar');
const menuUsername = document.getElementById('menuUsername');
const sidebarUsername = document.getElementById('sidebarUsername');
const sidebarUserId = document.getElementById('sidebarUserId');
const sidebarAvatar = document.getElementById('sidebarAvatar');
const greetingName = document.getElementById('greetingName');
const profileMenu = document.getElementById('profileMenu');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutBtn = document.getElementById('logoutBtn');
const profileLink = document.getElementById('profileLink');
const settingsLink = document.getElementById('settingsLink');

const notificationsIcon = document.getElementById('notificationsIcon');
const notificationsBadge = document.getElementById('notificationsBadge');
const notificationsPanel = document.getElementById('notificationsPanel');
const notificationsList = document.getElementById('notificationsList');
const markAllRead = document.getElementById('markAllRead');

const showUploadBtn = document.getElementById('showUploadBtn');
const uploadTrackModal = document.getElementById('uploadTrackModal');
const uploadTrackForm = document.getElementById('uploadTrackModalForm');
const modalTrackTitle = document.getElementById('modalTrackTitle');
const modalTrackArtist = document.getElementById('modalTrackArtist');
const modalAudioFile = document.getElementById('modalAudioFile');
const modalUploadMessage = document.getElementById('modalUploadMessage');

const allTracksContainer = document.getElementById('allTracks');
const myTracksContainer = document.getElementById('myTracks');
const myPlaylistsContainer = document.getElementById('myPlaylists');
const recommendationsContainer = document.getElementById('recommendationsContainer');
const historyContainer = document.getElementById('historyContainer');
const followingList = document.getElementById('followingList');
const followersList = document.getElementById('followersList');
const searchResults = document.getElementById('searchResults');
const searchUserInput = document.getElementById('searchUserInput');
const playlistList = document.getElementById('playlistList');
const recentTracksSidebar = document.getElementById('recentTracksSidebar');

const createPlaylistBtn = document.getElementById('createPlaylistBtn');
const createPlaylistModal = document.getElementById('createPlaylistModal');
const createPlaylistForm = document.getElementById('createPlaylistForm');
const playlistName = document.getElementById('playlistName');
const playlistCollaborators = document.getElementById('playlistCollaborators');
const playlistCover = document.getElementById('playlistCover');
const playlistCoverDropzone = document.getElementById('playlistCoverDropzone');

const editPlaylistModal = document.getElementById('editPlaylistModal');
const editPlaylistForm = document.getElementById('editPlaylistForm');
const editPlaylistId = document.getElementById('editPlaylistId');
const editPlaylistName = document.getElementById('editPlaylistName');
const editPlaylistCollaborators = document.getElementById('editPlaylistCollaborators');
const editPlaylistCover = document.getElementById('editPlaylistCover');
const editPlaylistCoverDropzone = document.getElementById('editPlaylistCoverDropzone');

const sortTracksSelect = document.getElementById('sortTracksSelect');
const tabBtns = document.querySelectorAll('.tab-btn');
const playlistSearchInput = document.getElementById('playlistSearchInput');

const editProfileBtnSidebar = document.getElementById('editProfileBtnSidebar');
const editProfileModal = document.getElementById('editProfileModal');
const editProfileForm = document.getElementById('editProfileForm');
const editUsername = document.getElementById('editUsername');
const editEmail = document.getElementById('editEmail');
const editPassword = document.getElementById('editPassword');
const editAvatar = document.getElementById('editAvatar');
const avatarDropzone = document.getElementById('avatarDropzone');

const settingsModal = document.getElementById('settingsModal');
const settingsTabs = document.querySelectorAll('.settings-tab');
const settingsPanes = document.querySelectorAll('.settings-pane');
const settingsHueSlider = document.getElementById('settingsHueSlider');
const settingsHueValue = document.getElementById('settingsHueValue');
const bgTypeSelect = document.getElementById('bgTypeSelect');
const bgPresets = document.querySelectorAll('.bg-preset');
const eqSliders = document.querySelectorAll('.eq-slider');
const eqPresetBtns = document.querySelectorAll('.eq-preset-btn');
const resetEqBtn = document.getElementById('resetEqBtn');
const equalizerBtn = document.getElementById('equalizerBtn');
const adminHiddenBtn = document.getElementById('adminHiddenBtn');
const customBgUpload = document.getElementById('customBgUpload');
const customBgFile = document.getElementById('customBgFile');
const uploadCustomBgBtn = document.getElementById('uploadCustomBgBtn');
const removeCustomBgBtn = document.getElementById('removeCustomBgBtn');
const bgDropzone = document.getElementById('bgDropzone');
const crossfadeSlider = document.getElementById('crossfadeSlider');
const crossfadeValue = document.getElementById('crossfadeValue');

const audioPlayerElement = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const nowPlayingTitle = document.getElementById('nowPlayingTitle');
const nowPlayingArtist = document.getElementById('nowPlayingArtist');
const playerCover = document.getElementById('playerCover');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');
const progressFill = document.getElementById('progressFill');
const progressBar = document.getElementById('progressBar');
const volumeFill = document.getElementById('volumeFill');
const volumeIcon = document.getElementById('volumeIcon');
const volumeSlider = document.getElementById('volumeSlider');
const likeBtn = document.getElementById('likeBtn');
const trackLikeCount = document.getElementById('trackLikeCount');

const searchInput = document.getElementById('searchInput');
const backFromPlaylist = document.getElementById('backFromPlaylist');
const backFromUser = document.getElementById('backFromUser');

const adminTabs = document.querySelectorAll('.admin-tab');
const adminPanes = document.querySelectorAll('.admin-pane');
const usersList = document.getElementById('usersList');
const statsContainer = document.getElementById('statsContainer');
const adminTracksList = document.getElementById('adminTracksList');
const complaintsList = document.getElementById('complaintsList');
const analyticsContent = document.getElementById('analyticsContent');

const addToPlaylistModal = document.getElementById('addToPlaylistModal');
const playlistSelectGrid = document.getElementById('playlistSelectGrid');
const createNewPlaylistFromAdd = document.getElementById('createNewPlaylistFromAdd');
let currentTrackForPlaylist = null;

const commentsModal = document.getElementById('commentsModal');
const commentsList = document.getElementById('commentsList');
const commentText = document.getElementById('commentText');
const commentTrackId = document.getElementById('commentTrackId');
const addCommentBtn = document.getElementById('addCommentBtn');

const complaintModal = document.getElementById('complaintModal');
const complaintForm = document.getElementById('complaintForm');
const complaintTargetType = document.getElementById('complaintTargetType');
const complaintTargetId = document.getElementById('complaintTargetId');
const complaintReason = document.getElementById('complaintReason');

const wrappedModal = document.getElementById('wrappedModal');
const wrappedContent = document.getElementById('wrappedContent');

const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const animatedBg = document.getElementById('animatedBg');

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
async function fetchWithAuth(url, options = {}) {
    const headers = options.headers || {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, { ...options, headers });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function showNotification(message, type = 'info') {
    alert(message);
}

// Закрытие меню при клике вне
document.addEventListener('click', function(e) {
    if (!profileMenu.contains(e.target)) {
        dropdownMenu.classList.remove('show');
    }
    // Закрытие модальных окон при клике вне
    if (e.target.classList.contains('modal')) {
        e.target.classList.add('hidden');
    }
});

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', async () => {
    if (token) {
        try {
            const storedUser = localStorage.getItem('moonfy_user');
            if (storedUser) {
                currentUser = JSON.parse(storedUser);
                initApp();
            } else showAuthScreen();
        } catch(e) { showAuthScreen(); }
    } else showAuthScreen();
    loadThemeSettings();
    initPlayer();
    setupDropdown();
    setupVolumeDrag();
    setupSidebarToggle();
    setupSettings();
    setupAvatarDropzone();
    setupBgDropzone();
    setupAdminPanel();
    setupEditTrackModal();
    setupNotifications();
    setupComplaintModal();
    setupWrappedModal();
    setupMediaKeys();
    setupKeyboardControls();
});

// ==================== АВТОРИЗАЦИЯ С АВАТАРОМ ====================
let isLoginMode = true;

if (regAvatarDropzone) {
    regAvatarDropzone.addEventListener('click', () => regAvatar.click());
    regAvatarDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        regAvatarDropzone.classList.add('dragover');
    });
    regAvatarDropzone.addEventListener('dragleave', () => {
        regAvatarDropzone.classList.remove('dragover');
    });
    regAvatarDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        regAvatarDropzone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            regAvatar.files = e.dataTransfer.files;
        } else {
            alert('Пожалуйста, перетащите изображение');
        }
    });
}

toggleAuth.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    formTitle.textContent = isLoginMode ? 'Вход' : 'Регистрация';
    authButton.textContent = isLoginMode ? 'Войти' : 'Зарегистрироваться';
    toggleAuth.textContent = isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти';
    authMessage.textContent = '';
    authMessage.className = 'message';
    emailGroup.style.display = isLoginMode ? 'none' : 'block';
    avatarGroup.style.display = isLoginMode ? 'none' : 'block';
    if (isLoginMode) {
        regEmail.required = false;
        regAvatar.required = false;
    } else {
        regEmail.required = true;
        regAvatar.required = false;
    }
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!isLoginMode) {
        const email = regEmail.value.trim();
        if (!email) {
            showAuthMessage('Введите email', 'error');
            return;
        }
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        if (regAvatar.files[0]) {
            formData.append('avatar', regAvatar.files[0]);
        }
        
        try {
            const response = await fetch(API_BASE + '/register', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                showAuthMessage('Регистрация успешна! Теперь войдите.', 'success');
                isLoginMode = true;
                formTitle.textContent = 'Вход';
                authButton.textContent = 'Войти';
                toggleAuth.textContent = 'Нет аккаунта? Зарегистрироваться';
                emailGroup.style.display = 'none';
                avatarGroup.style.display = 'none';
                usernameInput.value = '';
                passwordInput.value = '';
                regEmail.value = '';
                regAvatar.value = '';
            } else {
                showAuthMessage(data.error || 'Ошибка регистрации', 'error');
            }
        } catch (error) {
            showAuthMessage('Ошибка соединения с сервером', 'error');
            console.error(error);
        }
        return;
    }
    
    // Логин
    try {
        const response = await fetch(API_BASE + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('moonfy_token', token);
            localStorage.setItem('moonfy_user', JSON.stringify(currentUser));
            initApp();
        } else {
            showAuthMessage(data.error || 'Ошибка входа', 'error');
        }
    } catch (error) {
        showAuthMessage('Ошибка соединения с сервером', 'error');
        console.error(error);
    }
});

function showAuthMessage(text, type) {
    authMessage.textContent = text;
    authMessage.className = `message ${type}`;
}

function showAuthScreen() {
    authContainer.style.display = 'flex';
    appContainer.style.display = 'none';
}

function showAppScreen() {
    authContainer.style.display = 'none';
    appContainer.style.display = 'grid';
}

logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('moonfy_token');
    localStorage.removeItem('moonfy_user');
    token = null;
    currentUser = null;
    resetPlayer();
    showAuthScreen();
});

profileLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentUser) openUserProfile(currentUser.id);
    dropdownMenu.classList.remove('show');
});

settingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    settingsModal.classList.remove('hidden');
    dropdownMenu.classList.remove('show');
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        if (page === 'home') homePage.classList.add('active');
        else if (page === 'library') libraryPage.classList.add('active');
        else if (page === 'following') followingPage.classList.add('active');
        else if (page === 'admin') { adminPage.classList.add('active'); loadAdminData(); }
        dropdownMenu.classList.remove('show');
    });
});

function addAdminNavLink() {
    if (currentUser && currentUser.role === 'admin') {
        if (!document.querySelector('[data-page="admin"]')) {
            const adminLink = document.createElement('a');
            adminLink.href = '#';
            adminLink.className = 'nav-link';
            adminLink.dataset.page = 'admin';
            adminLink.innerHTML = '<i class="fas fa-cog"></i> Админ';
            document.querySelector('.nav-links').appendChild(adminLink);
            adminLink.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                adminLink.classList.add('active');
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                adminPage.classList.add('active');
                loadAdminData();
            });
        }
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ====================
async function initApp() {
    showAppScreen();
    updateUserInfo();
    await loadAllData();
    setupEventListeners();
    loadRecentTracksSidebar();
    addAdminNavLink();
    loadNotifications();
    showUploadBtn.style.display = 'inline-flex';
    const savedCrossfade = localStorage.getItem('crossfade');
    if (savedCrossfade) {
        crossfadeDuration = parseFloat(savedCrossfade);
        if (crossfadeSlider) crossfadeSlider.value = crossfadeDuration;
        if (crossfadeValue) crossfadeValue.textContent = crossfadeDuration + ' сек';
    }
}

function updateUserInfo() {
    if (!currentUser) return;
    menuUsername.textContent = currentUser.username;
    sidebarUsername.textContent = currentUser.username;
    sidebarUserId.textContent = currentUser.id;
    greetingName.textContent = currentUser.username;
    const avatarUrl = currentUser.avatar ? `http://localhost:3000/avatars/${currentUser.avatar}` : '';
    if (avatarUrl) {
        menuAvatar.src = avatarUrl;
        sidebarAvatar.src = avatarUrl;
    } else {
        menuAvatar.src = 'default-avatar.png';
        sidebarAvatar.src = 'default-avatar.png';
    }
}

async function loadAllData() {
    await Promise.all([
        loadAllTracks(),
        loadUserTracks(),
        loadUserPlaylists(),
        loadFavorites(),
        loadRecommendations(),
        loadFollowing(),
        loadFollowers(),
        loadHistory()
    ]);
    renderAllTracks();
    renderUserTracks();
    renderUserPlaylists();
    renderFollowing();
    renderFollowers();
    renderHistory();
    renderPopularTracks();
}

async function loadAllTracks() {
    const response = await fetch(`${API_BASE}/tracks`);
    if (response.ok) allTracks = await response.json();
}

async function loadUserTracks() {
    if (!currentUser) return;
    const response = await fetch(`${API_BASE}/users/${currentUser.id}/tracks`);
    if (response.ok) userTracks = await response.json();
}

async function loadUserPlaylists() {
    if (!currentUser) return;
    const response = await fetch(`${API_BASE}/users/${currentUser.id}/playlists`);
    if (response.ok) {
        userPlaylists = await response.json();
        renderPlaylistList();
    }
}

async function loadFavorites() {
    if (!currentUser) return;
    const response = await fetch(`${API_BASE}/users/${currentUser.id}/favorites`);
    if (response.ok) {
        favoritePlaylist = await response.json();
        updateLikeButton();
    }
}

async function loadRecommendations() {
    if (!currentUser) return;
    const response = await fetchWithAuth(`${API_BASE}/recommendations`);
    if (response.ok) {
        const recs = await response.json();
        renderRecommendations(recs);
    }
}

async function loadFollowing() {
    if (!currentUser) return;
    const response = await fetch(`${API_BASE}/users/${currentUser.id}/following`);
    if (response.ok) {
        const following = await response.json();
        currentUserFollowing = following.map(u => u.id);
        renderFollowing(following);
    }
}

async function loadFollowers() {
    if (!currentUser) return;
    const response = await fetch(`${API_BASE}/users/${currentUser.id}/followers`);
    if (response.ok) {
        const followers = await response.json();
        renderFollowers(followers);
    }
}

async function loadHistory() {
    if (!currentUser) return;
    const response = await fetchWithAuth(`${API_BASE}/history`);
    if (response.ok) {
        const history = await response.json();
        renderHistory(history);
    }
}

async function loadNotifications() {
    if (!currentUser) return;
    const response = await fetchWithAuth(`${API_BASE}/notifications`);
    if (response.ok) {
        notifications = await response.json();
        unreadCount = notifications.filter(n => !n.read).length;
        updateNotificationsBadge();
        renderNotifications();
    }
}

async function loadComplaints() {
    if (!currentUser || currentUser.role !== 'admin') return;
    const response = await fetchWithAuth(`${API_BASE}/admin/complaints`);
    if (response.ok) {
        complaints = await response.json();
        renderComplaints();
    }
}

async function loadAdminAnalytics() {
    if (!currentUser || currentUser.role !== 'admin') return;
    const response = await fetchWithAuth(`${API_BASE}/admin/analytics`);
    if (response.ok) {
        const analytics = await response.json();
        renderAnalytics(analytics);
    }
}

// ==================== РЕНДЕР ====================
function createTrackCard(track) {
    const liked = currentTrackLiked && currentTrack?.id === track.id;
    const likeCount = track.likes || 0;
    return `
        <div class="card" data-id="${track.id}" data-type="track" onclick="playTrack(${track.id})">
            <div class="card-cover">
                ${track.cover ? `<img src="http://localhost:3000/track_covers/${track.cover}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">` : 
                `<div class="default-cover"><i class="fas fa-music"></i><div class="cover-bars"><span></span><span></span><span></span><span></span></div></div>`}
                <span class="play-count"><i class="fas fa-headphones"></i> ${track.playCount || 0}</span>
            </div>
            <h4>${escapeHtml(track.title)} ${track.verified ? '<i class="fas fa-check-circle" style="color: var(--accent); font-size:0.8rem;"></i>' : ''}</h4>
            <p>${escapeHtml(track.artist)} · ${escapeHtml(track.username || 'Неизвестно')}</p>
            <div class="card-footer">
                <button class="like-button ${liked ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLikeFromCard(${track.id})">
                    <i class="${liked ? 'fas' : 'far'} fa-heart"></i>
                    <span class="like-count">${likeCount}</span>
                </button>
                <i class="fas fa-comment comment-icon" onclick="event.stopPropagation(); showComments(${track.id})"></i>
            </div>
        </div>
    `;
}

function renderAllTracks() {
    if (!allTracksContainer) return;
    if (allTracks.length === 0) {
        allTracksContainer.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1; text-align: center;">Треков пока нет</p>';
        return;
    }
    allTracksContainer.innerHTML = allTracks.map(track => createTrackCard(track)).join('');
}

function renderUserTracks() {
    if (!myTracksContainer) return;
    let tracksToRender = [...userTracks];
    switch(currentSort) {
        case 'date_desc': tracksToRender.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
        case 'date_asc': tracksToRender.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
        case 'title_asc': tracksToRender.sort((a,b) => a.title.localeCompare(b.title)); break;
        case 'title_desc': tracksToRender.sort((a,b) => b.title.localeCompare(a.title)); break;
        case 'artist_asc': tracksToRender.sort((a,b) => a.artist.localeCompare(b.artist)); break;
        case 'artist_desc': tracksToRender.sort((a,b) => b.artist.localeCompare(a.artist)); break;
        case 'plays_desc': tracksToRender.sort((a,b) => (b.playCount || 0) - (a.playCount || 0)); break;
    }
    if (tracksToRender.length === 0) {
        myTracksContainer.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1; text-align: center;">У вас пока нет треков</p>';
        return;
    }
    myTracksContainer.innerHTML = tracksToRender.map(track => createTrackCard(track)).join('');
}

function renderUserPlaylists() {
    if (!myPlaylistsContainer) return;
    if (userPlaylists.length === 0) {
        myPlaylistsContainer.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1; text-align: center;">У вас пока нет плейлистов</p>';
        return;
    }
    myPlaylistsContainer.innerHTML = userPlaylists.map(playlist => `
        <div class="playlist-card" onclick="openPlaylist(${playlist.id})">
            ${playlist.cover ? `<img src="http://localhost:3000/covers/${playlist.cover}" class="playlist-cover">` : '<i class="fas fa-list"></i>'}
            <h4>${escapeHtml(playlist.name)}</h4>
            <p>${playlist.trackIds?.length || 0} треков</p>
            ${playlist.userId === currentUser?.id ? `<button onclick="event.stopPropagation(); deletePlaylist(${playlist.id});" class="btn-danger small">Удалить</button>` : ''}
            ${playlist.collaborators?.includes(currentUser?.id) ? `<button onclick="event.stopPropagation(); openEditPlaylistModal(${playlist.id});" class="btn-secondary small">Редактировать</button>` : ''}
        </div>
    `).join('');
}

function renderPlaylistList() {
    if (!playlistList) return;
    if (userPlaylists.length === 0) {
        playlistList.innerHTML = '<div class="no-playlists">Нет плейлистов</div>';
        return;
    }
    playlistList.innerHTML = userPlaylists.map(playlist => `
        <div class="sidebar-playlist-item" onclick="openPlaylist(${playlist.id})" title="${escapeHtml(playlist.name)}">
            <div class="sidebar-playlist-cover">
                ${playlist.cover ? `<img src="http://localhost:3000/covers/${playlist.cover}">` : '<i class="fas fa-list"></i>'}
            </div>
            <div class="sidebar-playlist-info">
                <div class="sidebar-playlist-name">${escapeHtml(playlist.name)}</div>
                <div class="sidebar-playlist-count">${playlist.trackIds?.length || 0} треков</div>
            </div>
        </div>
    `).join('');
}

function renderRecommendations(recs) {
    if (!recommendationsContainer) return;
    if (recs.length === 0) {
        recommendationsContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Пока нет рекомендаций</p>';
        return;
    }
    recommendationsContainer.innerHTML = recs.map(track => createTrackCard(track)).join('');
}

function renderPopularTracks() {
    const popular = [...allTracks].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 10);
    const container = document.getElementById('popularTracks');
    if (!container) return;
    if (popular.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Популярных треков пока нет</p>';
        return;
    }
    container.innerHTML = popular.map(track => createTrackCard(track)).join('');
}

function renderFollowing(following) {
    if (!followingList) return;
    if (following.length === 0) {
        followingList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Вы ни на кого не подписаны</p>';
        return;
    }
    followingList.innerHTML = following.map(user => `
        <div class="friend-card" onclick="openUserProfile(${user.id})">
            <div class="friend-avatar">
                ${user.avatar ? `<img src="http://localhost:3000/avatars/${user.avatar}">` : '<i class="fas fa-user"></i>'}
            </div>
            <h4>${escapeHtml(user.username)} ${user.verified ? '<i class="fas fa-check-circle" style="color: var(--accent); font-size:0.8rem;"></i>' : ''}</h4>
            <button onclick="event.stopPropagation(); unfollowUser(${user.id});" class="btn-secondary small">Отписаться</button>
        </div>
    `).join('');
}

function renderFollowers(followers) {
    if (!followersList) return;
    if (followers.length === 0) {
        followersList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">У вас пока нет подписчиков</p>';
        return;
    }
    followersList.innerHTML = followers.map(user => `
        <div class="friend-card" onclick="openUserProfile(${user.id})">
            <div class="friend-avatar">
                ${user.avatar ? `<img src="http://localhost:3000/avatars/${user.avatar}">` : '<i class="fas fa-user"></i>'}
            </div>
            <h4>${escapeHtml(user.username)} ${user.verified ? '<i class="fas fa-check-circle" style="color: var(--accent); font-size:0.8rem;"></i>' : ''}</h4>
        </div>
    `).join('');
}

function renderHistory(history) {
    if (!historyContainer) return;
    if (history.length === 0) {
        historyContainer.innerHTML = '<p style="color: var(--text-secondary);">История пуста</p>';
        return;
    }
    historyContainer.innerHTML = history.map(entry => `
        <div class="card" onclick="playTrack(${entry.track.id})">
            <div class="card-cover">
                ${entry.track.cover ? `<img src="http://localhost:3000/track_covers/${entry.track.cover}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">` : `<div class="default-cover"><i class="fas fa-music"></i></div>`}
            </div>
            <h4>${escapeHtml(entry.track.title)}</h4>
            <p>${escapeHtml(entry.track.artist)}</p>
            <small>${new Date(entry.listenedAt).toLocaleString()}</small>
        </div>
    `).join('');
}

function loadRecentTracksSidebar() {
    if (!recentTracksSidebar) return;
    const recent = [...allTracks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    if (recent.length === 0) {
        recentTracksSidebar.innerHTML = '<p style="color: var(--text-secondary);">Пока нет треков</p>';
        return;
    }
    recentTracksSidebar.innerHTML = recent.map(track => `
        <div class="recent-track-item" onclick="playTrack(${track.id})" title="${track.title} - ${track.artist}">
            <i class="fas fa-music"></i>
            <div class="recent-track-info">
                <div class="recent-track-title">${escapeHtml(track.title)}</div>
                <div class="recent-track-artist">${escapeHtml(track.artist)}</div>
            </div>
        </div>
    `).join('');
}

// ==================== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ (КРАСИВЫЙ) ====================
function showUserProfile(user, tracks) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    userProfilePage.classList.add('active');
    currentProfileUserId = user.id;
    const isFollowing = currentUserFollowing.includes(user.id);
    const isOwnProfile = currentUser && user.id === currentUser.id;
    
    const html = `
        <div class="user-profile-container">
            <div class="user-profile-avatar">
                ${user.avatar ? `<img src="http://localhost:3000/avatars/${user.avatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : `<i class="fas fa-user" style="font-size: 3rem;"></i>`}
            </div>
            <h2 class="user-profile-name">${escapeHtml(user.username)} ${user.verified ? '<i class="fas fa-check-circle" style="color: var(--accent);"></i>' : ''}</h2>
            <div class="user-profile-stats">
                <div class="user-profile-stat">
                    <div class="user-profile-stat-number">${user.followersCount || 0}</div>
                    <div class="user-profile-stat-label">подписчиков</div>
                </div>
                <div class="user-profile-stat">
                    <div class="user-profile-stat-number">${user.followingCount || 0}</div>
                    <div class="user-profile-stat-label">подписок</div>
                </div>
                <div class="user-profile-stat">
                    <div class="user-profile-stat-number">${tracks.length}</div>
                    <div class="user-profile-stat-label">треков</div>
                </div>
            </div>
            <div class="user-profile-actions">
                ${!isOwnProfile ? `
                    <button id="profileFollowBtn" class="btn-primary" onclick="toggleFollow(${user.id})">${isFollowing ? 'Отписаться' : 'Подписаться'}</button>
                    <button onclick="showComplaintModal('user', ${user.id})" class="btn-secondary"><i class="fas fa-flag"></i> Пожаловаться</button>
                ` : `
                    <button id="uploadFromProfileBtn" class="btn-primary"><i class="fas fa-upload"></i> Загрузить трек</button>
                    <button id="editProfileFromProfileBtn" class="btn-secondary"><i class="fas fa-edit"></i> Редактировать</button>
                `}
            </div>
        </div>
        <h3 style="margin-top: 30px;">Треки пользователя</h3>
        <div class="card-grid">
            ${tracks.map(track => createTrackCard(track)).join('') || '<p style="grid-column:1/-1; text-align:center;">У пользователя пока нет треков</p>'}
        </div>
    `;
    document.getElementById('userProfile').innerHTML = html;
    document.getElementById('uploadFromProfileBtn')?.addEventListener('click', () => uploadTrackModal.classList.remove('hidden'));
    document.getElementById('editProfileFromProfileBtn')?.addEventListener('click', openEditProfileModal);
}

// ==================== ТРЕКИ ====================
document.addEventListener('click', (e) => {
    if (e.target.closest('#showUploadBtn')) uploadTrackModal.classList.remove('hidden');
});

document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
    });
});

uploadTrackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = modalTrackTitle.value.trim();
    const artist = modalTrackArtist.value.trim();
    const file = modalAudioFile.files[0];
    if (!title || !artist || !file) {
        modalUploadMessage.textContent = 'Заполните все поля';
        modalUploadMessage.className = 'message error';
        return;
    }
    if (file.size > 50 * 1024 * 1024) {
        modalUploadMessage.textContent = 'Файл слишком большой (макс. 50 МБ)';
        modalUploadMessage.className = 'message error';
        return;
    }
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('title', title);
    formData.append('artist', artist);
    try {
        const response = await fetchWithAuth(`${API_BASE}/tracks`, { method: 'POST', body: formData });
        const data = await response.json();
        if (response.ok) {
            modalUploadMessage.textContent = 'Трек успешно загружен!';
            modalUploadMessage.className = 'message success';
            uploadTrackForm.reset();
            setTimeout(() => {
                uploadTrackModal.classList.add('hidden');
                modalUploadMessage.textContent = '';
            }, 2000);
            await loadAllData();
            loadRecentTracksSidebar();
        } else {
            modalUploadMessage.textContent = data.error || 'Ошибка загрузки';
            modalUploadMessage.className = 'message error';
        }
    } catch(error) {
        modalUploadMessage.textContent = 'Ошибка соединения с сервером';
        modalUploadMessage.className = 'message error';
        console.error(error);
    }
});

window.deleteTrack = async function(trackId) {
    if (!confirm('Вы уверены, что хотите удалить этот трек?')) return;
    try {
        const response = await fetchWithAuth(`${API_BASE}/tracks/${trackId}`, { method: 'DELETE' });
        if (response.ok) {
            await loadAllData();
            loadRecentTracksSidebar();
            if (currentTrack && currentTrack.id === trackId) resetPlayer();
        } else alert('Ошибка при удалении трека');
    } catch(error) { console.error(error); alert('Ошибка соединения с сервером'); }
};

function setupEditTrackModal() {
    const modal = document.getElementById('editTrackModal');
    const closeBtn = modal.querySelector('.close');
    const form = document.getElementById('editTrackForm');
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editTrackId').value;
        const title = document.getElementById('editTrackTitle').value.trim();
        const artist = document.getElementById('editTrackArtist').value.trim();
        const coverFile = document.getElementById('editTrackCover').files[0];
        const formData = new FormData();
        formData.append('title', title);
        formData.append('artist', artist);
        if (coverFile) formData.append('cover', coverFile);
        const response = await fetchWithAuth(`${API_BASE}/tracks/${id}`, { method: 'PUT', body: formData });
        if (response.ok) {
            modal.classList.add('hidden');
            await loadAllData();
        } else alert('Ошибка при обновлении');
    });
}

window.openEditTrackModal = async function(trackId) {
    const track = allTracks.find(t => t.id === trackId);
    if (!track) return;
    document.getElementById('editTrackId').value = track.id;
    document.getElementById('editTrackTitle').value = track.title;
    document.getElementById('editTrackArtist').value = track.artist;
    const coverDiv = document.getElementById('editTrackCurrentCover');
    coverDiv.innerHTML = track.cover ? `<img src="http://localhost:3000/track_covers/${track.cover}" style="max-width:100px; margin-top:10px;">` : '';
    document.getElementById('editTrackModal').classList.remove('hidden');
};

// ==================== ЛАЙКИ ====================
window.toggleLikeFromCard = async function(trackId) {
    await toggleLike('track', trackId);
    await loadAllTracks();
    renderAllTracks();
    renderUserTracks();
    renderPopularTracks();
    renderRecommendations(allTracks.slice(0,10));
};

async function toggleLike(targetType, targetId) {
    const response = await fetchWithAuth(`${API_BASE}/like`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetType, targetId })
    });
    if (response.ok) {
        const data = await response.json();
        if (targetType === 'track' && currentTrack && currentTrack.id === targetId) {
            currentTrackLikes = data.count;
            currentTrackLiked = data.liked;
            updateLikeButton();
        }
    }
}

likeBtn.addEventListener('click', async () => {
    if (!currentTrack) return;
    await toggleLike('track', currentTrack.id);
    updateLikeButton();
    const card = document.querySelector(`.card[data-id="${currentTrack.id}"] .like-button`);
    if (card) {
        card.classList.toggle('liked', currentTrackLiked);
        card.querySelector('i').className = currentTrackLiked ? 'fas fa-heart' : 'far fa-heart';
        card.querySelector('.like-count').textContent = currentTrackLikes;
    }
});

function updateLikeButton() {
    if (!currentTrack) {
        likeBtn.querySelector('i').className = 'far fa-heart';
        trackLikeCount.textContent = '0';
        return;
    }
    if (currentTrackLiked) likeBtn.querySelector('i').className = 'fas fa-heart';
    else likeBtn.querySelector('i').className = 'far fa-heart';
    trackLikeCount.textContent = currentTrackLikes;
}

// ==================== КОММЕНТАРИИ ====================
window.showComments = async function(trackId) {
    const response = await fetch(`${API_BASE}/tracks/${trackId}/comments`);
    const comments = await response.json();
    const commentsWithReactions = await Promise.all(comments.map(async (c) => {
        const reactionsRes = await fetch(`${API_BASE}/reactions/${c.id}`);
        const reactions = await reactionsRes.json();
        return { ...c, reactions };
    }));
    commentsList.innerHTML = commentsWithReactions.map(c => `
        <div class="comment" data-id="${c.id}">
            <img src="${c.avatar ? 'http://localhost:3000/avatars/' + c.avatar : 'default-avatar.png'}" class="comment-avatar">
            <div>
                <strong>${c.username}</strong> ${c.verified ? '<i class="fas fa-check-circle" style="color: var(--accent);"></i>' : ''} 
                <small>${new Date(c.createdAt).toLocaleString()}</small>
                <p>${c.text}</p>
                <div class="comment-reactions">
                    ${Object.entries(c.reactions || {}).map(([emoji, count]) => `<span class="reaction-badge" onclick="addReaction(${c.id}, '${emoji}')">${emoji} ${count}</span>`).join('')}
                    <button class="add-reaction-btn" onclick="showReactionPicker(${c.id})">+</button>
                </div>
                ${c.userId === currentUser?.id ? '<button onclick="deleteComment('+c.id+')">Удалить</button>' : ''}
                <button onclick="showComplaintModal('comment', ${c.id})" class="complaint-btn"><i class="fas fa-flag"></i></button>
            </div>
        </div>
    `).join('');
    commentTrackId.value = trackId;
    commentsModal.classList.remove('hidden');
};

window.addReaction = async function(commentId, emoji) {
    const response = await fetchWithAuth(`${API_BASE}/reactions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commentId, emoji })
    });
    if (response.ok) showComments(commentTrackId.value);
};

window.showReactionPicker = function(commentId) {
    const emojis = ['👍', '❤️', '🔥', '😍', '🎉', '👏'];
    const picker = document.createElement('div');
    picker.className = 'reaction-picker';
    picker.innerHTML = emojis.map(e => `<span onclick="addReaction(${commentId}, '${e}')">${e}</span>`).join('');
    const comment = document.querySelector(`.comment[data-id="${commentId}"] .comment-reactions`);
    comment.appendChild(picker);
    setTimeout(() => picker.remove(), 3000);
};

addCommentBtn.addEventListener('click', async () => {
    const trackId = commentTrackId.value;
    const text = commentText.value.trim();
    if (!text) return;
    const response = await fetchWithAuth(`${API_BASE}/tracks/${trackId}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text })
    });
    if (response.ok) {
        commentText.value = '';
        showComments(trackId);
    }
});

window.deleteComment = async function(commentId) {
    await fetchWithAuth(`${API_BASE}/comments/${commentId}`, { method: 'DELETE' });
    showComments(commentTrackId.value);
};

// ==================== ПЛЕЙЛИСТЫ ====================
if (playlistCoverDropzone) {
    playlistCoverDropzone.addEventListener('click', () => playlistCover.click());
    playlistCoverDropzone.addEventListener('dragover', (e) => { e.preventDefault(); playlistCoverDropzone.classList.add('dragover'); });
    playlistCoverDropzone.addEventListener('dragleave', () => playlistCoverDropzone.classList.remove('dragover'));
    playlistCoverDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        playlistCoverDropzone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) playlistCover.files = e.dataTransfer.files;
    });
}

if (editPlaylistCoverDropzone) {
    editPlaylistCoverDropzone.addEventListener('click', () => editPlaylistCover.click());
    editPlaylistCoverDropzone.addEventListener('dragover', (e) => { e.preventDefault(); editPlaylistCoverDropzone.classList.add('dragover'); });
    editPlaylistCoverDropzone.addEventListener('dragleave', () => editPlaylistCoverDropzone.classList.remove('dragover'));
    editPlaylistCoverDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        editPlaylistCoverDropzone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) editPlaylistCover.files = e.dataTransfer.files;
    });
}

createPlaylistForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = playlistName.value.trim();
    const collaboratorsStr = playlistCollaborators.value.trim();
    let collaborators = [];
    if (collaboratorsStr) collaborators = collaboratorsStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    const formData = new FormData();
    formData.append('name', name);
    formData.append('collaborators', JSON.stringify(collaborators));
    if (playlistCover.files[0]) formData.append('cover', playlistCover.files[0]);
    try {
        const response = await fetchWithAuth(`${API_BASE}/playlists`, { method: 'POST', body: formData });
        if (response.ok) {
            createPlaylistModal.classList.add('hidden');
            playlistName.value = '';
            playlistCollaborators.value = '';
            playlistCover.value = '';
            await loadUserPlaylists();
            renderUserPlaylists();
        }
    } catch(error) { console.error('Ошибка создания плейлиста:', error); }
});

window.openEditPlaylistModal = async function(playlistId) {
    const playlist = userPlaylists.find(p => p.id === playlistId);
    if (!playlist) return;
    editPlaylistId.value = playlist.id;
    editPlaylistName.value = playlist.name;
    editPlaylistCollaborators.value = (playlist.collaborators || []).join(', ');
    editPlaylistModal.classList.remove('hidden');
};

editPlaylistForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = editPlaylistId.value;
    const name = editPlaylistName.value.trim();
    const collaboratorsStr = editPlaylistCollaborators.value.trim();
    let collaborators = [];
    if (collaboratorsStr) collaborators = collaboratorsStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    const formData = new FormData();
    formData.append('name', name);
    formData.append('collaborators', JSON.stringify(collaborators));
    if (editPlaylistCover.files[0]) formData.append('cover', editPlaylistCover.files[0]);
    try {
        const response = await fetchWithAuth(`${API_BASE}/playlists/${id}`, { method: 'PUT', body: formData });
        if (response.ok) {
            editPlaylistModal.classList.add('hidden');
            await loadUserPlaylists();
            renderUserPlaylists();
        }
    } catch(error) { console.error('Ошибка обновления плейлиста:', error); }
});

window.deletePlaylist = async function(playlistId) {
    if (!confirm('Удалить плейлист?')) return;
    try {
        const response = await fetchWithAuth(`${API_BASE}/playlists/${playlistId}`, { method: 'DELETE' });
        if (response.ok) {
            await loadUserPlaylists();
            renderUserPlaylists();
        }
    } catch(error) { console.error('Ошибка удаления плейлиста:', error); }
};

window.openPlaylist = async function(playlistId) {
    try {
        const response = await fetch(`${API_BASE}/playlists/${playlistId}`);
        if (response.ok) {
            const playlist = await response.json();
            showPlaylistDetail(playlist);
        }
    } catch(error) { console.error('Ошибка загрузки плейлиста:', error); }
};

function showPlaylistDetail(playlist) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    playlistDetailPage.classList.add('active');
    currentPlaylistId = playlist.id;
    let tracksToShow = playlist.tracks || [];
    if (playlistSearchQuery) {
        tracksToShow = tracksToShow.filter(t => t.title.toLowerCase().includes(playlistSearchQuery) || t.artist.toLowerCase().includes(playlistSearchQuery));
    }
    const html = `
        <div style="margin-bottom: 30px; display: flex; align-items: center; gap: 20px;">
            ${playlist.cover ? `<img src="http://localhost:3000/covers/${playlist.cover}" class="playlist-cover-large">` : '<i class="fas fa-list" style="font-size: 80px;"></i>'}
            <div>
                <h2>${escapeHtml(playlist.name)}</h2>
                <p style="color: var(--text-secondary);">${playlist.tracks?.length || 0} треков</p>
                ${playlist.userId === currentUser?.id ? `<button onclick="deletePlaylist(${playlist.id})" class="btn-danger">Удалить плейлист</button>` : ''}
                ${playlist.collaborators?.includes(currentUser?.id) ? `<button onclick="openEditPlaylistModal(${playlist.id})" class="btn-secondary">Редактировать</button>` : ''}
                <button onclick="toggleSubscribePlaylist(${playlist.id})" class="btn-secondary" id="subscribePlaylistBtn">
                    ${playlist.subscribers?.includes(currentUser?.id) ? 'Отписаться' : 'Подписаться'}
                </button>
            </div>
        </div>
        <div class="card-grid">
            ${tracksToShow.map(track => createTrackCard(track)).join('') || '<p style="grid-column:1/-1; text-align:center;">Нет треков, соответствующих поиску</p>'}
        </div>
    `;
    document.getElementById('playlistDetail').innerHTML = html;
}

playlistSearchInput.addEventListener('input', (e) => {
    playlistSearchQuery = e.target.value.toLowerCase();
    if (currentPlaylistId) openPlaylist(currentPlaylistId);
});

window.toggleSubscribePlaylist = async function(playlistId) {
    const btn = document.getElementById('subscribePlaylistBtn');
    const isSubscribed = btn.textContent === 'Отписаться';
    const response = await fetchWithAuth(`${API_BASE}/playlists/${playlistId}/subscribe`, { method: isSubscribed ? 'DELETE' : 'POST' });
    if (response.ok) btn.textContent = isSubscribed ? 'Подписаться' : 'Отписаться';
};

backFromPlaylist.addEventListener('click', () => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    homePage.classList.add('active');
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector('[data-page="home"]').classList.add('active');
});

// ==================== ДОБАВЛЕНИЕ В ПЛЕЙЛИСТ ====================
window.showAddToPlaylistModal = function(trackId) {
    currentTrackForPlaylist = trackId;
    if (userPlaylists.length === 0) {
        playlistSelectGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center;">У вас нет плейлистов. Создайте новый.</p>';
    } else {
        playlistSelectGrid.innerHTML = userPlaylists.map(p => `
            <div class="playlist-select-item" onclick="selectPlaylistForAdd(${p.id})">
                ${p.cover ? `<img src="http://localhost:3000/covers/${p.cover}" class="playlist-select-cover">` : '<i class="fas fa-list"></i>'}
                <div class="playlist-select-name">${escapeHtml(p.name)}</div>
            </div>
        `).join('');
    }
    addToPlaylistModal.classList.remove('hidden');
};

window.selectPlaylistForAdd = async function(playlistId) {
    if (!currentTrackForPlaylist) return;
    try {
        const response = await fetchWithAuth(`${API_BASE}/playlists/${playlistId}/tracks`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackId: currentTrackForPlaylist })
        });
        if (response.ok) {
            addToPlaylistModal.classList.add('hidden');
            alert('Трек добавлен в плейлист');
        }
    } catch(error) { console.error('Ошибка добавления в плейлист:', error); }
};

createNewPlaylistFromAdd.addEventListener('click', () => {
    addToPlaylistModal.classList.add('hidden');
    createPlaylistModal.classList.remove('hidden');
});

// ==================== ПОДПИСКИ ====================
searchUserInput.addEventListener('input', (e) => {
    clearTimeout(userSearchDebounceTimer);
    userSearchDebounceTimer = setTimeout(() => {
        const query = e.target.value.trim();
        if (query) searchUsers(query);
        else searchResults.style.display = 'none';
    }, 300);
});

async function searchUsers(query) {
    const response = await fetch(`${API_BASE}/users?search=${encodeURIComponent(query)}`);
    if (response.ok) {
        const users = await response.json();
        renderSearchResults(users);
    }
}

function renderSearchResults(users) {
    searchResults.style.display = 'grid';
    if (users.length === 0) {
        searchResults.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Ничего не найдено</p>';
        return;
    }
    searchResults.innerHTML = users.map(user => `
        <div class="friend-card" onclick="openUserProfile(${user.id})">
            <div class="friend-avatar">
                ${user.avatar ? `<img src="http://localhost:3000/avatars/${user.avatar}">` : '<i class="fas fa-user"></i>'}
            </div>
            <h4>${escapeHtml(user.username)} ${user.verified ? '<i class="fas fa-check-circle" style="color: var(--accent);"></i>' : ''}</h4>
            ${user.id !== currentUser.id ? `<button onclick="event.stopPropagation(); toggleFollowFromCard(${user.id});" class="btn-primary small" id="followBtn-${user.id}">${currentUserFollowing.includes(user.id) ? 'Отписаться' : 'Подписаться'}</button>` : ''}
        </div>
    `).join('');
}

window.followUser = async function(userId) {
    const response = await fetchWithAuth(`${API_BASE}/users/${userId}/follow`, { method: 'POST' });
    if (response.ok) {
        currentUserFollowing.push(userId);
        await loadFollowing();
        await loadFollowers();
        if (currentProfileUserId === userId) {
            const btn = document.getElementById('profileFollowBtn');
            if (btn) btn.textContent = 'Отписаться';
        }
        const cardBtn = document.getElementById(`followBtn-${userId}`);
        if (cardBtn) cardBtn.textContent = 'Отписаться';
    }
};

window.unfollowUser = async function(userId) {
    const response = await fetchWithAuth(`${API_BASE}/users/${userId}/follow`, { method: 'DELETE' });
    if (response.ok) {
        currentUserFollowing = currentUserFollowing.filter(id => id !== userId);
        await loadFollowing();
        await loadFollowers();
        if (currentProfileUserId === userId) {
            const btn = document.getElementById('profileFollowBtn');
            if (btn) btn.textContent = 'Подписаться';
        }
        const cardBtn = document.getElementById(`followBtn-${userId}`);
        if (cardBtn) cardBtn.textContent = 'Подписаться';
    }
};

window.toggleFollowFromCard = async function(userId) {
    if (currentUserFollowing.includes(userId)) await unfollowUser(userId);
    else await followUser(userId);
};

window.openUserProfile = async function(userId) {
    const response = await fetch(`${API_BASE}/users/${userId}`);
    if (response.ok) {
        const user = await response.json();
        const tracksResponse = await fetch(`${API_BASE}/users/${userId}/tracks`);
        const tracks = tracksResponse.ok ? await tracksResponse.json() : [];
        showUserProfile(user, tracks);
    }
};

window.toggleFollow = async function(userId) {
    const btn = document.getElementById('profileFollowBtn');
    const isFollowing = btn.textContent === 'Отписаться';
    if (isFollowing) { await unfollowUser(userId); btn.textContent = 'Подписаться'; }
    else { await followUser(userId); btn.textContent = 'Отписаться'; }
};

backFromUser.addEventListener('click', () => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    followingPage.classList.add('active');
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector('[data-page="following"]').classList.add('active');
});

// ==================== РЕДАКТИРОВАНИЕ ПРОФИЛЯ ====================
function openEditProfileModal() {
    editUsername.value = currentUser.username;
    editEmail.value = currentUser.email || '';
    editPassword.value = '';
    editAvatar.value = '';
    editProfileModal.classList.remove('hidden');
}

editProfileBtnSidebar.addEventListener('click', openEditProfileModal);

function setupAvatarDropzone() {
    if (!avatarDropzone) return;
    avatarDropzone.addEventListener('click', () => editAvatar.click());
    avatarDropzone.addEventListener('dragover', (e) => { e.preventDefault(); avatarDropzone.classList.add('dragover'); });
    avatarDropzone.addEventListener('dragleave', () => avatarDropzone.classList.remove('dragover'));
    avatarDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        avatarDropzone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) editAvatar.files = e.dataTransfer.files;
        else alert('Пожалуйста, перетащите изображение');
    });
}

editProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', editUsername.value.trim());
    formData.append('email', editEmail.value.trim());
    if (editPassword.value.trim()) formData.append('password', editPassword.value.trim());
    if (editAvatar.files[0]) formData.append('avatar', editAvatar.files[0]);
    try {
        const response = await fetchWithAuth(`${API_BASE}/users/${currentUser.id}`, { method: 'PUT', body: formData });
        if (response.ok) {
            const updatedUser = await response.json();
            currentUser = updatedUser;
            localStorage.setItem('moonfy_user', JSON.stringify(currentUser));
            updateUserInfo();
            editProfileModal.classList.add('hidden');
            if (currentProfileUserId === currentUser.id) openUserProfile(currentUser.id);
            alert('Профиль обновлён');
        } else {
            const data = await response.json();
            alert(data.error || 'Ошибка обновления профиля');
        }
    } catch(error) { console.error(error); alert('Ошибка соединения с сервером'); }
});

// ==================== НАСТРОЙКИ ====================
function setupSettings() {
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            settingsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            settingsPanes.forEach(p => p.classList.remove('active'));
            document.getElementById(`settings${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)}`).classList.add('active');
        });
    });
    settingsModal.querySelector('.close').addEventListener('click', () => settingsModal.classList.add('hidden'));
    equalizerBtn.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
        settingsTabs.forEach(t => t.classList.remove('active'));
        document.querySelector('[data-tab="equalizer"]').classList.add('active');
        settingsPanes.forEach(p => p.classList.remove('active'));
        document.getElementById('settingsEqualizer').classList.add('active');
    });
    settingsHueSlider.addEventListener('input', (e) => {
        const hue = parseInt(e.target.value);
        setAccentHue(hue);
        settingsHueValue.textContent = hue + '°';
        localStorage.setItem('moonfy_hue', hue);
    });
    bgTypeSelect.addEventListener('change', (e) => {
        localStorage.setItem('moonfy_bg_type', e.target.value);
        updateBackground();
        if (e.target.value === 'custom') customBgUpload.style.display = 'block';
        else customBgUpload.style.display = 'none';
    });
    bgPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            const bgId = preset.dataset.bg;
            setBackgroundPreset(bgId);
            localStorage.setItem('moonfy_bg', bgId);
            bgPresets.forEach(p => p.classList.remove('active-bg'));
            preset.classList.add('active-bg');
            bgTypeSelect.value = 'animated';
            customBgUpload.style.display = 'none';
            if (currentUser?.settings?.customBg) {
                fetchWithAuth(`${API_BASE}/user/bg`, { method: 'DELETE' });
                delete currentUser.settings.customBg;
                localStorage.removeItem('customBg');
            }
        });
    });
    if (uploadCustomBgBtn) {
        uploadCustomBgBtn.addEventListener('click', async () => {
            const file = customBgFile.files[0];
            if (!file) return alert('Выберите файл');
            const formData = new FormData();
            formData.append('bg', file);
            const response = await fetchWithAuth(`${API_BASE}/user/bg`, { method: 'POST', body: formData });
            if (response.ok) {
                const data = await response.json();
                animatedBg.style.background = `url('/custom_bg/${data.filename}') center/cover`;
                animatedBg.style.animation = 'none';
                localStorage.setItem('customBg', data.filename);
                bgTypeSelect.value = 'custom';
                localStorage.setItem('moonfy_bg_type', 'custom');
                customBgUpload.style.display = 'block';
                alert('Фон применён');
            } else alert('Ошибка загрузки');
        });
    }
    if (removeCustomBgBtn) {
        removeCustomBgBtn.addEventListener('click', async () => {
            const response = await fetchWithAuth(`${API_BASE}/user/bg`, { method: 'DELETE' });
            if (response.ok) {
                localStorage.removeItem('customBg');
                bgTypeSelect.value = 'animated';
                setBackgroundPreset(localStorage.getItem('moonfy_bg') || '1');
                updateBackground();
                customBgUpload.style.display = 'none';
                alert('Фон удалён');
            }
        });
    }
    initEqualizerSettings();
    eqSliders.forEach(slider => {
        slider.addEventListener('input', function() {
            this.nextElementSibling.textContent = parseFloat(this.value).toFixed(1) + ' dB';
            updateEqualizer();
        });
    });
    resetEqBtn.addEventListener('click', () => {
        eqSliders.forEach(slider => { slider.value = 0; slider.nextElementSibling.textContent = '0.0 dB'; });
        updateEqualizer();
        localStorage.removeItem('moonfy_eq_preset');
        localStorage.removeItem('eq_values');
    });
    eqPresetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.preset;
            applyEqPreset(preset);
            localStorage.setItem('moonfy_eq_preset', preset);
        });
    });
    const lastPreset = localStorage.getItem('moonfy_eq_preset');
    if (lastPreset) applyEqPreset(lastPreset);
    else {
        const savedEq = localStorage.getItem('eq_values');
        if (savedEq) {
            const values = JSON.parse(savedEq);
            eqSliders.forEach((slider, i) => { if (values[i] !== undefined) { slider.value = values[i]; slider.nextElementSibling.textContent = values[i].toFixed(1) + ' dB'; } });
            updateEqualizer();
        }
    }
    eqSliders.forEach(slider => {
        slider.addEventListener('change', () => {
            const values = Array.from(eqSliders).map(s => parseFloat(s.value));
            localStorage.setItem('eq_values', JSON.stringify(values));
        });
    });
    if (crossfadeSlider) {
        crossfadeSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            crossfadeValue.textContent = val + ' сек';
            crossfadeDuration = val;
            localStorage.setItem('crossfade', val);
        });
    }
    if (adminHiddenBtn) {
        adminHiddenBtn.addEventListener('click', () => {
            if (currentUser && currentUser.role === 'admin') {
                settingsModal.classList.add('hidden');
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                adminPage.classList.add('active');
                const adminNav = document.querySelector('[data-page="admin"]');
                if (adminNav) { navLinks.forEach(l => l.classList.remove('active')); adminNav.classList.add('active'); }
                loadAdminData();
            } else alert('Доступ запрещён');
        });
    }
}

function setupBgDropzone() {
    if (!bgDropzone || !customBgFile) return;
    bgDropzone.addEventListener('click', () => customBgFile.click());
    bgDropzone.addEventListener('dragover', (e) => { e.preventDefault(); bgDropzone.classList.add('dragover'); });
    bgDropzone.addEventListener('dragleave', () => bgDropzone.classList.remove('dragover'));
    bgDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        bgDropzone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) customBgFile.files = e.dataTransfer.files;
        else alert('Пожалуйста, перетащите изображение');
    });
}

function setAccentHue(hue) { document.documentElement.style.setProperty('--accent-h', hue); }
function setBackgroundPreset(id) {
    const presets = {
        '1': 'radial-gradient(circle at 30% 40%, #3b1e5e, #0e0c14)',
        '2': 'radial-gradient(circle at 70% 20%, #b0266b, #1a1e2b)',
        '3': 'radial-gradient(circle at 50% 80%, #a78bfa, #181c27)',
        '4': 'radial-gradient(circle at 20% 70%, #2c3e50, #0a0c10)'
    };
    if (presets[id]) animatedBg.style.background = presets[id];
}
function updateBackground() {
    const type = bgTypeSelect.value;
    if (type === 'static') animatedBg.style.animation = 'none';
    else if (type === 'animated') animatedBg.style.animation = 'shiftBg 18s linear infinite';
    else if (type === 'custom') animatedBg.style.animation = 'none';
}
function loadThemeSettings() {
    const savedHue = localStorage.getItem('moonfy_hue') || 260;
    const savedBg = localStorage.getItem('moonfy_bg') || '1';
    const savedBgType = localStorage.getItem('moonfy_bg_type') || 'animated';
    const customBg = localStorage.getItem('customBg');
    setAccentHue(parseInt(savedHue));
    if (customBg && savedBgType === 'custom') {
        animatedBg.style.background = `url('/custom_bg/${customBg}') center/cover`;
        animatedBg.style.animation = 'none';
    } else setBackgroundPreset(savedBg);
    settingsHueSlider.value = savedHue;
    settingsHueValue.textContent = savedHue + '°';
    bgTypeSelect.value = savedBgType;
    updateBackground();
    bgPresets.forEach(p => p.classList.remove('active-bg'));
    document.querySelector(`.bg-preset[data-bg="${savedBg}"]`)?.classList.add('active-bg');
    if (savedBgType === 'custom' && customBg) customBgUpload.style.display = 'block';
}

// ==================== ЭКВАЛАЙЗЕР ====================
function initEqualizerSettings() {
    const eqFrequencies = [60, 150, 400, 1000, 2400, 15000];
    eqSliders.forEach((slider, index) => slider.dataset.freq = eqFrequencies[index]);
}
function initEqualizer() {
    if (!audioContext) return;
    const frequencies = [60, 150, 400, 1000, 2400, 15000];
    eqFilters = frequencies.map(freq => {
        const filter = audioContext.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1;
        filter.gain.value = 0;
        return filter;
    });
}
function connectEqualizer() {
    if (!audioContext || !source || eqFilters.length === 0) return;
    source.disconnect();
    analyser.disconnect();
    let lastNode = source;
    eqFilters.forEach(filter => { lastNode.connect(filter); lastNode = filter; });
    lastNode.connect(analyser);
    analyser.connect(audioContext.destination);
}
function updateEqualizer() {
    if (!audioContext || eqFilters.length === 0) return;
    eqFilters.forEach((filter, index) => { if (filter && eqSliders[index]) filter.gain.value = parseFloat(eqSliders[index].value); });
}
function applyEqPreset(preset) {
    const presets = {
        dance: [5,4,2,1,2,4], deep: [4,3,0,-2,1,3], electronic: [3,4,3,0,2,5], flat: [0,0,0,0,0,0],
        hiphop: [5,4,2,-1,2,4], jazz: [2,2,1,1,2,3], latin: [3,3,2,2,3,4], loudness: [6,5,3,2,4,6]
    };
    const values = presets[preset];
    if (values) {
        eqSliders.forEach((slider, index) => { slider.value = values[index]; slider.nextElementSibling.textContent = values[index].toFixed(1) + ' dB'; });
        updateEqualizer();
        localStorage.setItem('eq_values', JSON.stringify(values));
    }
}

// ==================== ПЛЕЕР ====================
function initPlayer() {
    audioPlayer = audioPlayerElement;
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    audioPlayer.addEventListener('ended', onTrackEnded);
    audioPlayer.addEventListener('play', initAudioContext);
    playPauseBtn.addEventListener('click', togglePlayPause);
    progressBar.addEventListener('click', seek);
    prevBtn.addEventListener('click', playPrevTrack);
    nextBtn.addEventListener('click', playNextTrack);
    const savedVolume = localStorage.getItem('volume');
    if (savedVolume !== null) {
        const vol = parseFloat(savedVolume);
        audioPlayer.volume = vol;
        volumeFill.style.width = vol * 100 + '%';
        updateVolumeIcon(vol);
    }
}
function initAudioContext() {
    if (audioContext) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaElementSource(audioPlayer);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    crossfadeGain = audioContext.createGain();
    crossfadeGain.gain.value = 1;
    initEqualizer();
    let lastNode = source;
    eqFilters.forEach(filter => { lastNode.connect(filter); lastNode = filter; });
    lastNode.connect(crossfadeGain);
    crossfadeGain.connect(analyser);
    analyser.connect(audioContext.destination);
}
function togglePlayPause() {
    if (!currentTrack) return;
    if (isPlaying) {
        audioPlayer.pause();
        playPauseBtn.classList.remove('fa-pause-circle');
        playPauseBtn.classList.add('fa-play-circle');
    } else {
        audioPlayer.play();
        playPauseBtn.classList.remove('fa-play-circle');
        playPauseBtn.classList.add('fa-pause-circle');
    }
    isPlaying = !isPlaying;
}
function updateProgress() {
    if (!audioPlayer.duration) return;
    progressFill.style.width = (audioPlayer.currentTime / audioPlayer.duration) * 100 + '%';
    currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
}
function updateDuration() { durationSpan.textContent = formatTime(audioPlayer.duration); }
function seek(e) {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioPlayer.currentTime = percent * audioPlayer.duration;
}
function onTrackEnded() {
    if (repeat === 'one') { audioPlayer.currentTime = 0; audioPlayer.play(); }
    else if (repeat === 'all') playNextTrack();
    else { playPauseBtn.classList.remove('fa-pause-circle'); playPauseBtn.classList.add('fa-play-circle'); isPlaying = false; }
}
function playPrevTrack() {
    let playlist = allTracks;
    if (playlist.length === 0 || !currentTrack) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(playlist[prevIndex].id);
}
function playNextTrack() {
    let playlist = allTracks;
    if (playlist.length === 0) return;
    if (shuffle) playTrack(playlist[Math.floor(Math.random() * playlist.length)].id);
    else {
        const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
        if (currentIndex === -1) { playTrack(playlist[0].id); return; }
        const nextIndex = (currentIndex + 1) % playlist.length;
        playTrack(playlist[nextIndex].id);
    }
}
window.playTrack = async function(trackId) {
    try {
        const track = allTracks.find(t => t.id === trackId);
        if (!track) return;
        if (isPlaying && crossfadeDuration > 0 && audioContext && crossfadeGain) {
            const now = audioContext.currentTime;
            crossfadeGain.gain.linearRampToValueAtTime(0, now + crossfadeDuration);
            setTimeout(() => crossfadeGain.gain.value = 1, crossfadeDuration * 1000);
        }
        currentTrack = track;
        audioPlayer.src = `http://localhost:3000/api/stream/${trackId}`;
        audioPlayer.play();
        nowPlayingTitle.textContent = track.title;
        nowPlayingArtist.textContent = track.artist;
        if (track.cover) playerCover.innerHTML = `<img src="http://localhost:3000/track_covers/${track.cover}" style="width:100%; height:100%; object-fit:cover;">`;
        else playerCover.innerHTML = '<i class="fas fa-music"></i>';
        playPauseBtn.classList.remove('fa-play-circle');
        playPauseBtn.classList.add('fa-pause-circle');
        isPlaying = true;
        const likeRes = await fetchWithAuth(`${API_BASE}/like/track/${trackId}`);
        if (likeRes.ok) { const data = await likeRes.json(); currentTrackLikes = data.count; currentTrackLiked = data.liked; updateLikeButton(); }
        await fetchWithAuth(`${API_BASE}/history`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackId }) });
    } catch(error) { console.error('Ошибка воспроизведения:', error); }
}
function resetPlayer() {
    if (nextTrackTimeout) clearTimeout(nextTrackTimeout);
    audioPlayer.pause();
    audioPlayer.src = '';
    nowPlayingTitle.textContent = 'Не выбрано';
    nowPlayingArtist.textContent = '';
    playerCover.innerHTML = '<i class="fas fa-music"></i>';
    playPauseBtn.classList.remove('fa-pause-circle');
    playPauseBtn.classList.add('fa-play-circle');
    isPlaying = false;
    currentTrack = null;
    progressFill.style.width = '0%';
    currentTimeSpan.textContent = '0:00';
    durationSpan.textContent = '0:00';
    updateLikeButton();
}

// ==================== УПРАВЛЕНИЕ С КЛАВИАТУРЫ ====================
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.repeat) { e.preventDefault(); togglePlayPause(); }
        else if (e.code === 'ArrowRight') { e.preventDefault(); if (audioPlayer) audioPlayer.currentTime += 5; }
        else if (e.code === 'ArrowLeft') { e.preventDefault(); if (audioPlayer) audioPlayer.currentTime -= 5; }
    });
}

// ==================== ПЕРЕТАСКИВАНИЕ ГРОМКОСТИ ====================
function setupVolumeDrag() {
    volumeSlider.addEventListener('mousedown', (e) => { e.preventDefault(); isDraggingVolume = true; setVolume(e); });
    window.addEventListener('mousemove', (e) => { if (isDraggingVolume) setVolume(e); });
    window.addEventListener('mouseup', () => { isDraggingVolume = false; });
    function setVolume(e) {
        const rect = volumeSlider.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(rect.width, x));
        const percent = x / rect.width;
        audioPlayer.volume = percent;
        volumeFill.style.width = percent * 100 + '%';
        updateVolumeIcon(percent);
        localStorage.setItem('volume', percent);
    }
    volumeIcon.addEventListener('click', () => {
        if (audioPlayer.volume > 0) {
            audioPlayer.dataset.prevVolume = audioPlayer.volume;
            audioPlayer.volume = 0;
            volumeFill.style.width = '0%';
            updateVolumeIcon(0);
            localStorage.setItem('volume', 0);
        } else {
            const prev = parseFloat(audioPlayer.dataset.prevVolume) || 0.7;
            audioPlayer.volume = prev;
            volumeFill.style.width = prev * 100 + '%';
            updateVolumeIcon(prev);
            localStorage.setItem('volume', prev);
        }
    });
}
function updateVolumeIcon(vol) {
    if (vol === 0) volumeIcon.className = 'fas fa-volume-off';
    else if (vol < 0.5) volumeIcon.className = 'fas fa-volume-low';
    else volumeIcon.className = 'fas fa-volume-high';
}

// ==================== ШАФФЛ И РЕПИТ ====================
shuffleBtn.addEventListener('click', () => { shuffle = !shuffle; shuffleBtn.classList.toggle('active'); });
repeatBtn.addEventListener('click', () => {
    if (repeat === 'off') { repeat = 'all'; repeatBtn.classList.add('active'); repeatBtn.classList.remove('repeat-one'); }
    else if (repeat === 'all') { repeat = 'one'; repeatBtn.classList.add('active', 'repeat-one'); }
    else { repeat = 'off'; repeatBtn.classList.remove('active', 'repeat-one'); }
});

// ==================== МЕНЮ ПРОФИЛЯ ====================
function setupDropdown() {
    profileMenu.addEventListener('click', (e) => { e.stopPropagation(); dropdownMenu.classList.toggle('show'); });
}

// ==================== СВОРАЧИВАНИЕ САЙДБАРА ====================
function setupSidebarToggle() { sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('collapsed')); }

// ==================== ПОИСК ====================
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        const query = e.target.value.toLowerCase();
        if (query.length === 0) { renderAllTracks(); return; }
        const filtered = allTracks.filter(t => t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query) || (t.username && t.username.toLowerCase().includes(query)));
        if (!homePage.classList.contains('active')) document.querySelector('[data-page="home"]').click();
        if (allTracksContainer) {
            if (filtered.length === 0) allTracksContainer.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1; text-align: center;">Ничего не найдено</p>';
            else allTracksContainer.innerHTML = filtered.map(track => createTrackCard(track)).join('');
        }
    }, 300);
});

// ==================== СОРТИРОВКА В БИБЛИОТЕКЕ ====================
if (sortTracksSelect) sortTracksSelect.addEventListener('change', (e) => { currentSort = e.target.value; renderUserTracks(); });

// ==================== ТАБЫ БИБЛИОТЕКИ ====================
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        myTracksContainer.style.display = 'none';
        myPlaylistsContainer.style.display = 'none';
        historyContainer.style.display = 'none';
        if (tab === 'myTracks') myTracksContainer.style.display = 'grid';
        else if (tab === 'myPlaylists') myPlaylistsContainer.style.display = 'grid';
        else if (tab === 'history') historyContainer.style.display = 'grid';
    });
});

// ==================== УВЕДОМЛЕНИЯ ====================
function setupNotifications() {
    notificationsIcon.addEventListener('click', (e) => { e.stopPropagation(); notificationsPanel.classList.toggle('hidden'); loadNotifications(); });
    document.addEventListener('click', (e) => { if (!notificationsPanel.contains(e.target) && !notificationsIcon.contains(e.target)) notificationsPanel.classList.add('hidden'); });
    markAllRead.addEventListener('click', async () => { await fetchWithAuth(`${API_BASE}/notifications/read-all`, { method: 'PUT' }); loadNotifications(); });
}
function renderNotifications() {
    if (notifications.length === 0) { notificationsList.innerHTML = '<p style="text-align:center; padding:20px;">Уведомлений нет</p>'; return; }
    notificationsList.innerHTML = notifications.map(n => `
        <div class="notification-item ${n.read ? '' : 'unread'}" onclick="markNotificationRead(${n.id})">
            <div class="notification-content"><div class="notification-message">${n.message}</div><div class="notification-time">${new Date(n.createdAt).toLocaleString()}</div></div>
        </div>
    `).join('');
}
window.markNotificationRead = async function(id) { await fetchWithAuth(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' }); loadNotifications(); };
function updateNotificationsBadge() {
    if (unreadCount > 0) { notificationsBadge.textContent = unreadCount; notificationsBadge.style.display = 'inline'; }
    else notificationsBadge.style.display = 'none';
}

// ==================== ЖАЛОБЫ ====================
function setupComplaintModal() {
    complaintForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const targetType = complaintTargetType.value;
        const targetId = parseInt(complaintTargetId.value);
        const reason = complaintReason.value.trim();
        if (!reason) return;
        const response = await fetchWithAuth(`${API_BASE}/complaints`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetType, targetId, reason })
        });
        if (response.ok) { alert('Жалоба отправлена'); complaintModal.classList.add('hidden'); complaintForm.reset(); }
        else alert('Ошибка при отправке жалобы');
    });
}
window.showComplaintModal = function(targetType, targetId) {
    complaintTargetType.value = targetType;
    complaintTargetId.value = targetId;
    complaintModal.classList.remove('hidden');
};

// ==================== МЕДИА-КЛАВИШИ ====================
function setupMediaKeys() {
    navigator.mediaSession?.setActionHandler('play', togglePlayPause);
    navigator.mediaSession?.setActionHandler('pause', togglePlayPause);
    navigator.mediaSession?.setActionHandler('previoustrack', playPrevTrack);
    navigator.mediaSession?.setActionHandler('nexttrack', playNextTrack);
}

// ==================== АДМИН-ПАНЕЛЬ ====================
function setupAdminPanel() {
    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            adminTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            adminPanes.forEach(p => p.classList.remove('active'));
            document.getElementById(`admin${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)}`).classList.add('active');
            if (targetTab === 'users') loadAdminUsers();
            else if (targetTab === 'stats') loadAdminStats();
            else if (targetTab === 'tracks') loadAdminTracks();
            else if (targetTab === 'complaints') loadComplaints();
            else if (targetTab === 'analytics') loadAdminAnalytics();
        });
    });
}
async function loadAdminData() { loadAdminUsers(); loadAdminStats(); loadAdminTracks(); loadComplaints(); loadAdminAnalytics(); }
async function loadAdminUsers() {
    const response = await fetchWithAuth(`${API_BASE}/admin/users`);
    if (response.ok) renderAdminUsers(await response.json());
}
function renderAdminUsers(users) {
    usersList.innerHTML = users.map(user => `
        <div class="admin-user-card">
            <img src="${user.avatar ? 'http://localhost:3000/avatars/' + user.avatar : 'default-avatar.png'}" class="admin-user-avatar">
            <div class="admin-user-info">
                <h4>${escapeHtml(user.username)} ${user.verified ? '✅' : ''} ${user.banned ? '🔴' : ''}</h4>
                <p>ID: ${user.id}</p><p>Email: ${user.email}</p><p>Роль: <span class="user-role">${user.role}</span></p>
                <p>Дата регистрации: ${new Date(user.createdAt).toLocaleString()}</p>
            </div>
            <div class="admin-user-actions">
                <select onchange="changeUserRole(${user.id}, this.value)">
                    <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                    <option value="artist" ${user.role === 'artist' ? 'selected' : ''}>Artist</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
                <button onclick="toggleUserVerify(${user.id}, ${!user.verified})" class="btn-secondary small">${user.verified ? 'Снять верификацию' : 'Верифицировать'}</button>
                <button onclick="toggleUserBan(${user.id}, ${!user.banned})" class="btn-warning small">${user.banned ? 'Разблокировать' : 'Заблокировать'}</button>
                <button onclick="deleteUser(${user.id})" class="btn-danger small">Удалить</button>
            </div>
        </div>
    `).join('');
}
window.changeUserRole = async function(userId, role) { await fetchWithAuth(`${API_BASE}/admin/users/${userId}/role`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) }); loadAdminUsers(); };
window.toggleUserVerify = async function(userId, verified) { await fetchWithAuth(`${API_BASE}/admin/users/${userId}/verify`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ verified }) }); loadAdminUsers(); };
window.toggleUserBan = async function(userId, banned) { await fetchWithAuth(`${API_BASE}/admin/users/${userId}/ban`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ banned }) }); loadAdminUsers(); };
window.deleteUser = async function(userId) { if (!confirm('Удалить пользователя? Это действие необратимо.')) return; await fetchWithAuth(`${API_BASE}/admin/users/${userId}`, { method: 'DELETE' }); loadAdminUsers(); };
async function loadAdminStats() {
    const response = await fetchWithAuth(`${API_BASE}/admin/stats`);
    if (response.ok) {
        const stats = await response.json();
        statsContainer.innerHTML = `
            <div class="stat-item">Всего пользователей: ${stats.totalUsers}</div>
            <div class="stat-item">Всего треков: ${stats.totalTracks}</div>
            <div class="stat-item">Всего плейлистов: ${stats.totalPlaylists}</div>
            <div class="stat-item">Всего комментариев: ${stats.totalComments}</div>
            <div class="stat-item">Всего подписок: ${stats.totalFollows}</div>
            <div class="stat-item">Всего записей в истории: ${stats.totalHistory}</div>
            <div class="stat-item">Всего лайков: ${stats.totalLikes}</div>
            <div class="stat-item">Всего жалоб: ${stats.totalComplaints}</div>
        `;
    }
}
async function loadAdminTracks() {
    const response = await fetch(`${API_BASE}/tracks`);
    if (response.ok) adminTracksList.innerHTML = (await response.json()).map(track => createTrackCard(track)).join('');
}
function renderComplaints() {
    complaintsList.innerHTML = complaints.map(c => `
        <div class="complaint-card">
            <p><strong>Жалоба #${c.id}</strong> от ${c.complainant?.username}</p>
            <p>Тип: ${c.targetType}, ID: ${c.targetId}</p><p>Причина: ${c.reason}</p><p>Статус: ${c.status}</p>
            <div class="complaint-actions"><button onclick="updateComplaintStatus(${c.id}, 'approved')" class="approve-btn">Одобрить</button><button onclick="updateComplaintStatus(${c.id}, 'rejected')" class="reject-btn">Отклонить</button></div>
        </div>
    `).join('') || '<p>Нет жалоб</p>';
}
window.updateComplaintStatus = async function(complaintId, status) { await fetchWithAuth(`${API_BASE}/admin/complaints/${complaintId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); loadComplaints(); };
function renderAnalytics(analytics) {
    if (!analyticsContent) return;
    analyticsContent.innerHTML = `
        <div class="analytics-grid">
            <div class="analytics-card"><h4>Рост пользователей (30 дней)</h4><div class="growth-list">${analytics.userGrowth.map(d => `<div class="growth-item">${d.date}: +${d.count}</div>`).join('')}</div></div>
            <div class="analytics-card"><h4>Самые популярные треки</h4><ul class="popular-list">${analytics.popularTracks.map(t => `<li>${escapeHtml(t.title)} - ${escapeHtml(t.artist)} (${t.playCount} прослушиваний)</li>`).join('')}</ul></div>
            <div class="analytics-card"><h4>Топ исполнителей</h4><ul class="popular-list">${analytics.topArtists.map(a => `<li>${escapeHtml(a.artist)} (${a.plays} прослушиваний)</li>`).join('')}</ul></div>
            <div class="analytics-card"><h4>Общая статистика</h4><p>Всего пользователей: ${analytics.totalUsers}</p><p>Всего треков: ${analytics.totalTracks}</p><p>Всего прослушиваний: ${analytics.totalPlays}</p></div>
        </div>
    `;
}

function setupEventListeners() {
    window.addEventListener('click', (e) => { if (e.target.classList.contains('modal')) e.target.classList.add('hidden'); });
}

// ==================== УДАЛЕНИЕ СТАТИСТИКИ ИЗ МЕНЮ ====================
// В index.html убрана ссылка statsLink, поэтому функция openStatsPage не вызывается.
// Никакой дополнительной статистики в приложении нет.
