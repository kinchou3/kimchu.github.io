document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const bookContent = document.getElementById('book-content');
    const fontDecrease = document.getElementById('font-decrease');
    const fontIncrease = document.getElementById('font-increase');
    const toggleDarkmode = document.getElementById('toggle-darkmode');
    const fullscreenBtn = document.getElementById('fullscreen');
    const prevChapter = document.getElementById('prev-chapter');
    const nextChapter = document.getElementById('next-chapter');
    const progressBar = document.getElementById('progress-bar');
    
    // Current chapter tracking
    let currentChapter = 1;
    const totalChapters = 2; // Update this based on actual chapters
    
    // Font size control
    let fontSize = 16;
    const minFontSize = 12;
    const maxFontSize = 24;
    
    // Dark mode toggle
    toggleDarkmode.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        updateDarkModeButton();
    });
    
    function updateDarkModeButton() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        toggleDarkmode.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        toggleDarkmode.title = isDarkMode ? 'Toggle Light Mode' : 'Toggle Dark Mode';
    }
    
    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    updateDarkModeButton();
    
    // Font size controls
    fontDecrease.addEventListener('click', function() {
        if (fontSize > minFontSize) {
            fontSize--;
            updateFontSize();
        }
    });
    
    fontIncrease.addEventListener('click', function() {
        if (fontSize < maxFontSize) {
            fontSize++;
            updateFontSize();
        }
    });
    
    function updateFontSize() {
        bookContent.style.fontSize = fontSize + 'px';
        localStorage.setItem('readerFontSize', fontSize);
    }
    
    // Check for saved font size
    const savedFontSize = localStorage.getItem('readerFontSize');
    if (savedFontSize) {
        fontSize = parseInt(savedFontSize);
        updateFontSize();
    }
    
    // Fullscreen functionality
    fullscreenBtn.addEventListener('click', function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            }
        }
    });
    
    // Chapter navigation
    prevChapter.addEventListener('click', function() {
        if (currentChapter > 1) {
            currentChapter--;
            updateChapter();
        }
    });
    
    nextChapter.addEventListener('click', function() {
        if (currentChapter < totalChapters) {
            currentChapter++;
            updateChapter();
        }
    });
    
    function updateChapter() {
        // Scroll to chapter
        const chapterElement = document.getElementById(`chapter${currentChapter}`);
        if (chapterElement) {
            chapterElement.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Update progress bar
        const progressPercent = (currentChapter / totalChapters) * 100;
        progressBar.style.width = progressPercent + '%';
        
        // Update button states
        prevChapter.disabled = currentChapter === 1;
        nextChapter.disabled = currentChapter === totalChapters;
        
        // Save reading progress
        localStorage.setItem('readingProgress', currentChapter);
    }
    
    // Check for saved reading progress
    const savedProgress = localStorage.getItem('readingProgress');
    if (savedProgress) {
        currentChapter = parseInt(savedProgress);
        if (currentChapter > totalChapters) currentChapter = totalChapters;
        updateChapter();
    }
    
    // Initialize chapter navigation buttons
    updateChapter();
    
    // Bookmark functionality
    const bookmarkButtons = document.querySelectorAll('.book-actions .btn:nth-child(1)');
    bookmarkButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // In a real app, this would save to user's account
            localStorage.setItem(`bookmark_${window.location.pathname}`, currentChapter);
            alert(`Bookmarked at Chapter ${currentChapter}`);
        });
    });
    
    // Scroll progress tracking
    window.addEventListener('scroll', function() {
        const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = scrollPercentage + '%';
    });
});