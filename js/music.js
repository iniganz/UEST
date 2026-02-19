/**
 * UEST MLBB CUP 4# - Background Music Player
 * Musik mulai saat user scroll / klik / sentuh halaman
 * Playlist berurutan + loop, posisi tersimpan antar halaman
 * Tampilan: disc berputar + judul lagu saja (tanpa tombol)
 */

(function () {
    'use strict';

    var PLAYLIST = [
        { src: 'music/1.mp3', title: 'Radiant Dawn', artist: 'Track I' },
        { src: 'music/2.mp3', title: 'Come Join the Fun', artist: 'Track II' }
    ];

    var STORAGE_KEY = 'uest_music';
    var VOLUME = 0.5;
    var audio = null;
    var trackIndex = 0;
    var started = false;

    // --- State ---
    function getState() {
        try {
            var d = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (d && typeof d.ti === 'number') {
                if (d.ti >= PLAYLIST.length) d.ti = 0;
                return d;
            }
        } catch (e) { }
        return { ti: 0, ct: 0 };
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                ti: trackIndex,
                ct: audio ? audio.currentTime || 0 : 0
            }));
        } catch (e) { }
    }

    // --- Init ---
    var saved = getState();
    trackIndex = saved.ti;

    document.addEventListener('DOMContentLoaded', function () {
        buildUI();
        setupAudio();
        waitForInteraction();
    });

    // --- Audio ---
    function setupAudio() {
        audio = document.createElement('audio');
        audio.preload = 'auto';
        audio.volume = VOLUME;
        document.body.appendChild(audio);

        audio.addEventListener('ended', function () {
            trackIndex = (trackIndex + 1) % PLAYLIST.length;
            loadTrack(0, true);
        });

        audio.addEventListener('error', function () {
            trackIndex = (trackIndex + 1) % PLAYLIST.length;
            setTimeout(function () { loadTrack(0, true); }, 500);
        });

        // Save posisi tiap detik
        setInterval(function () {
            if (audio && !audio.paused) save();
        }, 1000);

        window.addEventListener('beforeunload', save);

        // Load track (tapi belum play)
        loadTrack(saved.ct, false);
    }

    function loadTrack(seekTo, autoPlay) {
        audio.src = PLAYLIST[trackIndex].src;

        audio.addEventListener('canplay', function onReady() {
            audio.removeEventListener('canplay', onReady);
            if (seekTo > 0 && seekTo < audio.duration) {
                audio.currentTime = seekTo;
            }
            if (autoPlay) {
                audio.play().then(function () {
                    setPlaying(true);
                }).catch(function () {
                    setPlaying(false);
                });
            }
        });

        audio.load();
        updateInfo();
    }

    // --- Trigger: musik mulai saat interaksi pertama ---
    function waitForInteraction() {
        var events = ['scroll', 'click', 'touchstart', 'mousemove', 'keydown', 'wheel'];

        function onInteract() {
            if (started) return;
            started = true;

            // Hapus semua listener
            events.forEach(function (e) {
                document.removeEventListener(e, onInteract, true);
                window.removeEventListener(e, onInteract, true);
            });

            // Play
            if (audio) {
                audio.play().then(function () {
                    setPlaying(true);
                }).catch(function () {
                    setPlaying(false);
                });
            }
        }

        events.forEach(function (e) {
            document.addEventListener(e, onInteract, true);
            window.addEventListener(e, onInteract, true);
        });
    }

    // --- UI ---
    function setPlaying(playing) {
        var disc = document.getElementById('musicDisc');
        var notif = document.getElementById('musicNotification');
        if (disc) {
            if (playing) disc.classList.remove('paused');
            else disc.classList.add('paused');
        }
        if (notif) {
            if (playing) notif.classList.add('is-playing');
            else notif.classList.remove('is-playing');
        }
    }

    function updateInfo() {
        var t = PLAYLIST[trackIndex];
        var el = document.querySelector('.music-title');
        var ar = document.querySelector('.music-artist');
        if (el) el.textContent = t.title;
        if (ar) ar.textContent = t.artist;
    }

    function buildUI() {
        var t = PLAYLIST[trackIndex];
        var notif = document.createElement('div');
        notif.id = 'musicNotification';
        notif.innerHTML =
            '<div class="music-notif-inner">' +
                '<div class="music-disc-wrapper">' +
                    '<div class="music-disc paused" id="musicDisc">' +
                        '<div class="music-disc-inner">' +
                            '<i class="fas fa-music"></i>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="music-info">' +
                    '<span class="music-title">' + t.title + '</span>' +
                    '<span class="music-artist">' + t.artist + '</span>' +
                '</div>' +
            '</div>';
        document.body.appendChild(notif);
    }

})();
