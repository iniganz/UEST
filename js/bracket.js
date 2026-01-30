/**
 * MLBB Tournament - Bracket System
 * Interactive tournament bracket with team management
 */

// ===================================
// STATE MANAGEMENT
// ===================================

let teams = [];
let bracket = [];
let currentMatchEdit = null;

const STORAGE_KEY_TEAMS = 'mlbb_bracket_teams';
const STORAGE_KEY_BRACKET = 'mlbb_bracket_data';

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    loadData();
    
    // Render initial state
    renderTeamList();
    renderBracket();
});

/**
 * Load data from localStorage
 */
function loadData() {
    teams = loadFromStorage(STORAGE_KEY_TEAMS, []);
    bracket = loadFromStorage(STORAGE_KEY_BRACKET, []);
}

/**
 * Save data to localStorage
 */
function saveData() {
    saveToStorage(STORAGE_KEY_TEAMS, teams);
    saveToStorage(STORAGE_KEY_BRACKET, bracket);
}

// ===================================
// TEAM MANAGEMENT
// ===================================

/**
 * Add a new team
 */
function addTeam() {
    const input = document.getElementById('newTeamName');
    const name = input.value.trim();
    
    if (!name) {
        alert('Masukkan nama tim!');
        return;
    }
    
    // Check for duplicate
    if (teams.some(t => t.name.toLowerCase() === name.toLowerCase())) {
        alert('Tim dengan nama tersebut sudah ada!');
        return;
    }
    
    // Add team
    const team = {
        id: generateId(),
        name: name,
        logo: null
    };
    
    teams.push(team);
    input.value = '';
    
    // Save and render
    saveData();
    renderTeamList();
    
    // Regenerate bracket if needed
    if (teams.length >= 2) {
        generateBracket();
    }
}

/**
 * Remove a team
 * @param {string} teamId - Team ID to remove
 */
function removeTeam(teamId) {
    if (!confirm('Yakin ingin menghapus tim ini?')) {
        return;
    }
    
    teams = teams.filter(t => t.id !== teamId);
    
    // Save and render
    saveData();
    renderTeamList();
    generateBracket();
}

/**
 * Shuffle teams randomly
 */
function shuffleTeams() {
    if (teams.length < 2) {
        alert('Minimal 2 tim untuk mengacak bracket!');
        return;
    }
    
    // Fisher-Yates shuffle
    for (let i = teams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [teams[i], teams[j]] = [teams[j], teams[i]];
    }
    
    // Save and regenerate bracket
    saveData();
    renderTeamList();
    generateBracket();
    
    alert('Bracket telah diacak!');
}

/**
 * Reset bracket (clear all results)
 */
function resetBracket() {
    if (!confirm('Yakin ingin mereset bracket? Semua hasil pertandingan akan dihapus.')) {
        return;
    }
    
    bracket = [];
    saveData();
    generateBracket();
    
    alert('Bracket telah direset!');
}

// ===================================
// BRACKET GENERATION
// ===================================

/**
 * Generate tournament bracket
 */
function generateBracket() {
    if (teams.length < 2) {
        bracket = [];
        saveData();
        renderBracket();
        return;
    }
    
    // Calculate number of rounds needed
    const numTeams = teams.length;
    const rounds = Math.ceil(Math.log2(numTeams));
    const bracketSize = Math.pow(2, rounds);
    
    // Create padded team list (with byes)
    const paddedTeams = [...teams];
    while (paddedTeams.length < bracketSize) {
        paddedTeams.push({ id: 'bye', name: 'BYE', isBye: true });
    }
    
    // Initialize bracket structure
    bracket = [];
    
    // Generate first round matches
    const firstRound = [];
    for (let i = 0; i < paddedTeams.length; i += 2) {
        const match = {
            id: generateId(),
            round: 1,
            matchNumber: Math.floor(i / 2) + 1,
            team1: paddedTeams[i],
            team2: paddedTeams[i + 1],
            score1: 0,
            score2: 0,
            winner: null,
            completed: false
        };
        
        // Auto-advance if bye
        if (match.team1.isBye) {
            match.winner = match.team2.id;
            match.completed = true;
        } else if (match.team2.isBye) {
            match.winner = match.team1.id;
            match.completed = true;
        }
        
        firstRound.push(match);
    }
    bracket.push(firstRound);
    
    // Generate subsequent rounds
    let prevRound = firstRound;
    for (let r = 2; r <= rounds; r++) {
        const currentRound = [];
        for (let i = 0; i < prevRound.length; i += 2) {
            const match = {
                id: generateId(),
                round: r,
                matchNumber: Math.floor(i / 2) + 1,
                team1: null,
                team2: null,
                score1: 0,
                score2: 0,
                winner: null,
                completed: false,
                sourceMatch1: prevRound[i].id,
                sourceMatch2: prevRound[i + 1]?.id
            };
            currentRound.push(match);
        }
        bracket.push(currentRound);
        prevRound = currentRound;
    }
    
    // Propagate winners from auto-advanced matches
    propagateWinners();
    
    saveData();
    renderBracket();
}

/**
 * Propagate winners through the bracket
 */
function propagateWinners() {
    for (let r = 0; r < bracket.length - 1; r++) {
        const currentRound = bracket[r];
        const nextRound = bracket[r + 1];
        
        for (let i = 0; i < currentRound.length; i++) {
            const match = currentRound[i];
            if (match.winner) {
                const nextMatchIndex = Math.floor(i / 2);
                const nextMatch = nextRound[nextMatchIndex];
                
                if (nextMatch) {
                    const winningTeam = match.winner === match.team1?.id ? match.team1 : match.team2;
                    if (i % 2 === 0) {
                        nextMatch.team1 = winningTeam;
                    } else {
                        nextMatch.team2 = winningTeam;
                    }
                }
            }
        }
    }
}

// ===================================
// RENDERING
// ===================================

/**
 * Render team list in admin panel
 */
function renderTeamList() {
    const container = document.getElementById('teamList');
    const countEl = document.getElementById('teamCount');
    
    if (!container) return;
    
    if (teams.length === 0) {
        container.innerHTML = '<p style="color: var(--text-gray); grid-column: 1/-1;">Belum ada tim terdaftar</p>';
        if (countEl) countEl.textContent = '0';
        return;
    }
    
    if (countEl) countEl.textContent = teams.length;
    
    container.innerHTML = teams.map((team, index) => `
        <div class="team-item">
            <div class="team-avatar">${team.name.charAt(0).toUpperCase()}</div>
            <div class="team-info">
                <h4>${escapeHtml(team.name)}</h4>
            </div>
            <button class="btn-remove" onclick="removeTeam('${team.id}')" title="Hapus tim">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

/**
 * Render tournament bracket
 */
function renderBracket() {
    const container = document.getElementById('bracketDisplay');
    if (!container) return;
    
    if (bracket.length === 0 || teams.length < 2) {
        container.innerHTML = `
            <div class="bracket-empty">
                <i class="fas fa-trophy"></i>
                <h3>Bracket Belum Tersedia</h3>
                <p>Tambahkan minimal 2 tim untuk membuat bracket</p>
            </div>
        `;
        return;
    }
    
    const roundNames = getRoundNames(bracket.length);
    
    let html = '';
    
    bracket.forEach((round, roundIndex) => {
        const isLastRound = roundIndex === bracket.length - 1;
        
        html += `
            <div class="bracket-round ${isLastRound ? 'finals' : ''}">
                <div class="round-title">${roundNames[roundIndex]}</div>
                <div class="round-matches" style="display: flex; flex-direction: column; justify-content: space-around; height: 100%;">
        `;
        
        round.forEach((match, matchIndex) => {
            const team1 = match.team1;
            const team2 = match.team2;
            const isTeam1Winner = match.winner === team1?.id;
            const isTeam2Winner = match.winner === team2?.id;
            const canEdit = team1 && team2 && !team1.isBye && !team2.isBye;
            
            html += `
                <div class="bracket-match ${canEdit ? 'clickable' : ''}" 
                     ${canEdit ? `onclick="openScoreModal('${match.id}')"` : ''}>
                    <span class="match-number">M${match.matchNumber}</span>
                    
                    <div class="bracket-team ${isTeam1Winner ? 'winner' : ''} ${isTeam2Winner ? 'loser' : ''} ${!team1 ? 'empty' : ''}">
                        <div class="team-logo placeholder">${team1 ? team1.name.charAt(0).toUpperCase() : '?'}</div>
                        <span class="team-name">${team1 ? escapeHtml(team1.name) : 'TBD'}</span>
                        <span class="team-score">${match.completed ? match.score1 : '-'}</span>
                    </div>
                    
                    <div class="bracket-team ${isTeam2Winner ? 'winner' : ''} ${isTeam1Winner ? 'loser' : ''} ${!team2 ? 'empty' : ''}">
                        <div class="team-logo placeholder">${team2 ? team2.name.charAt(0).toUpperCase() : '?'}</div>
                        <span class="team-name">${team2 ? escapeHtml(team2.name) : 'TBD'}</span>
                        <span class="team-score">${match.completed ? match.score2 : '-'}</span>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    // Show champion if finals completed
    const finals = bracket[bracket.length - 1]?.[0];
    if (finals?.completed && finals.winner) {
        const champion = finals.winner === finals.team1?.id ? finals.team1 : finals.team2;
        html += `
            <div class="bracket-round">
                <div class="round-title" style="background: var(--gradient-gold); color: var(--dark-bg);">Champion</div>
                <div class="champion-display">
                    <div class="trophy">🏆</div>
                    <h3>JUARA 1</h3>
                    <div class="champion-name">${escapeHtml(champion.name)}</div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

/**
 * Get round names based on number of rounds
 */
function getRoundNames(numRounds) {
    const names = [];
    for (let i = 0; i < numRounds; i++) {
        const remaining = Math.pow(2, numRounds - i);
        if (remaining === 2) {
            names.push('Final');
        } else if (remaining === 4) {
            names.push('Semi Final');
        } else if (remaining === 8) {
            names.push('Quarter Final');
        } else {
            names.push(`Round of ${remaining}`);
        }
    }
    return names;
}

// ===================================
// SCORE MODAL
// ===================================

/**
 * Open score edit modal
 */
function openScoreModal(matchId) {
    // Find match
    let match = null;
    for (const round of bracket) {
        match = round.find(m => m.id === matchId);
        if (match) break;
    }
    
    if (!match || !match.team1 || !match.team2) return;
    
    currentMatchEdit = matchId;
    
    // Set modal content
    document.getElementById('team1Label').textContent = match.team1.name;
    document.getElementById('team2Label').textContent = match.team2.name;
    document.getElementById('score1Input').value = match.score1;
    document.getElementById('score2Input').value = match.score2;
    
    // Show modal
    document.getElementById('scoreModal').classList.add('active');
}

/**
 * Close score modal
 */
function closeScoreModal() {
    document.getElementById('scoreModal').classList.remove('active');
    currentMatchEdit = null;
}

/**
 * Save score from modal
 */
function saveScore() {
    if (!currentMatchEdit) return;
    
    const score1 = parseInt(document.getElementById('score1Input').value) || 0;
    const score2 = parseInt(document.getElementById('score2Input').value) || 0;
    
    // Find and update match
    for (const round of bracket) {
        const match = round.find(m => m.id === currentMatchEdit);
        if (match) {
            match.score1 = score1;
            match.score2 = score2;
            
            // Determine winner (higher score wins)
            if (score1 !== score2) {
                match.completed = true;
                match.winner = score1 > score2 ? match.team1.id : match.team2.id;
            } else {
                match.completed = false;
                match.winner = null;
            }
            
            break;
        }
    }
    
    // Propagate winners
    propagateWinners();
    
    // Save and re-render
    saveData();
    renderBracket();
    closeScoreModal();
}

// ===================================
// ADMIN PANEL
// ===================================

/**
 * Toggle admin panel visibility
 */
function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    const showBtn = document.getElementById('showAdminBtn');
    
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        showBtn.style.display = 'none';
    } else {
        panel.style.display = 'none';
        showBtn.style.display = 'block';
    }
}

// ===================================
// EXPORT / IMPORT
// ===================================

/**
 * Export bracket data as JSON
 */
function exportBracket() {
    const data = {
        teams: teams,
        bracket: bracket,
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `mlbb-bracket-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

/**
 * Prompt for import
 */
function importBracketPrompt() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.teams || !Array.isArray(data.teams)) {
                    throw new Error('Invalid format');
                }
                
                if (confirm(`Import ${data.teams.length} tim? Data saat ini akan diganti.`)) {
                    teams = data.teams;
                    bracket = data.bracket || [];
                    
                    saveData();
                    renderTeamList();
                    renderBracket();
                    
                    alert('Import berhasil!');
                }
            } catch (err) {
                alert('File tidak valid!');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// ===================================
// UTILITIES
// ===================================

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Generate unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Load from localStorage
 */
function loadFromStorage(key, defaultValue) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        return defaultValue;
    }
}

/**
 * Save to localStorage
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Storage error:', e);
    }
}

// Close modal on outside click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        closeScoreModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeScoreModal();
    }
});
