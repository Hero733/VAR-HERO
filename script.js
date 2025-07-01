document.addEventListener('DOMContentLoaded', () => {
    const loginPage = document.getElementById('login-page');
    const landingPage = document.getElementById('landing-page');
    const varDashboard = document.getElementById('var-dashboard');

    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const loginErrorMessage = document.getElementById('login-error-message');
    const logoutButton = document.getElementById('logout-button');

    const startSimulationBtn = document.getElementById('start-simulation-btn');
    const mainVideoPlayer = document.getElementById('main-video-player');
    const uploadClipBtn = document.getElementById('upload-clip-btn');
    const videoFileInput = document.getElementById('video-file-input');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const rewindBtn = document.getElementById('rewind-btn');
    const forwardBtn = document.getElementById('forward-btn');
    const slowMotionBtn = document.getElementById('slow-motion-btn');
    const varOverlay = document.getElementById('var-overlay');
    const varNotification = document.getElementById('var-notification');
    const decisionPanel = document.getElementById('decision-panel');
    const incidentTypeDisplay = document.getElementById('incident-type');
    const finalDecisionType = document.getElementById('final-decision-type'); // New: Select box for decision type
    const submitDecisionBtn = document.getElementById('submit-decision-btn'); // Renamed/New button
    const cancelDecisionBtn = document.getElementById('cancel-decision-btn'); // New: Cancel button
    const finalDecisionDisplay = document.getElementById('final-decision-display');

    const commLogDisplay = document.getElementById('comm-log-display');
    const refereeChatDisplay = document.getElementById('referee-chat-display');
    const refereeChatInput = document.getElementById('referee-chat-input');
    const sendRefereeChatBtn = document.getElementById('send-referee-chat-btn');

    const spotCheckBtn = document.getElementById('spot-check-btn');
    const spotCheckModal = document.getElementById('spot-check-modal');
    const spotCheckImage = document.getElementById('spot-check-image');
    const spotCheckDescription = document.getElementById('spot-check-description');
    const spotCheckTitle = document.getElementById('spot-check-title');
    const closeSpotCheckModalBtn = spotCheckModal.querySelector('.close-button');

    const currentIncidentDisplay = document.getElementById('current-incident-display');
    const varStatusDisplay = document.getElementById('var-status');
    const systemStatusDisplay = document.getElementById('system-status');
    const incidentList = document.getElementById('incident-list');

    // Allowed passwords
    const ALLOWED_PASSWORDS = ['21933', '25477', '73737'];

    // State variables
    let currentVideoTime = 0;
    let isSlowMotion = false;
    let varCheckActive = false;
    let incidentCounter = 0;
    let currentIncidentDetails = {}; // Store details of the current incident

    // --- Login Logic ---
    loginButton.addEventListener('click', () => {
        const enteredPassword = passwordInput.value;
        if (ALLOWED_PASSWORDS.includes(enteredPassword)) {
            loginPage.classList.remove('active');
            loginPage.classList.add('hidden');
            landingPage.classList.remove('hidden');
            landingPage.classList.add('active');
            loginErrorMessage.classList.add('hidden'); // Hide any previous error
            passwordInput.value = ''; // Clear password field
        } else {
            loginErrorMessage.textContent = 'รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง';
            loginErrorMessage.classList.remove('hidden');
            passwordInput.value = ''; // Clear password field
        }
    });

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });

    // --- Page Navigation ---
    function showPage(pageId) {
        document.querySelectorAll('.dashboard-page').forEach(page => {
            page.classList.remove('active');
            page.classList.add('hidden');
        });
        document.getElementById(pageId).classList.remove('hidden');
        document.getElementById(pageId).classList.add('active');

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        // Ensure the correct nav item is active
        const activeNavItem = document.querySelector(`.nav-item[data-page="${pageId.replace('-page', '')}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.closest('.nav-item').dataset.page;
            showPage(`${page}-page`);
        });
    });

    startSimulationBtn.addEventListener('click', () => {
        landingPage.classList.remove('active');
        landingPage.classList.add('hidden');
        varDashboard.classList.remove('hidden');
        varDashboard.classList.add('active');
        logCommMessage('ระบบ', 'VAR Simulator เริ่มทำงานแล้ว', 'system-msg');
        showPage('home-page'); // Initial setup for the home page when dashboard loads
    });

    logoutButton.addEventListener('click', () => {
        varDashboard.classList.remove('active');
        varDashboard.classList.add('hidden');
        loginPage.classList.remove('hidden');
        loginPage.classList.add('active');
        logCommMessage('ระบบ', 'ออกจากระบบ VAR Simulator แล้ว', 'system-msg');
        resetSimulator(); // Reset simulator state on logout
    });

    // --- Video Controls ---
    playPauseBtn.addEventListener('click', () => {
        if (mainVideoPlayer.paused) {
            mainVideoPlayer.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> หยุดชั่วคราว';
            logCommMessage('VAR', 'เล่นวิดีโอ', 'var-msg');
        } else {
            mainVideoPlayer.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i> เล่น';
            logCommMessage('VAR', 'หยุดวิดีโอชั่วคราว', 'var-msg');
        }
    });

    rewindBtn.addEventListener('click', () => {
        mainVideoPlayer.currentTime = Math.max(0, mainVideoPlayer.currentTime - 5);
        logCommMessage('VAR', 'ย้อนกลับ 5 วินาที', 'var-msg');
    });

    forwardBtn.addEventListener('click', () => {
        mainVideoPlayer.currentTime = Math.min(mainVideoPlayer.duration, mainVideoPlayer.currentTime + 5);
        logCommMessage('VAR', 'กรอไปข้างหน้า 5 วินาที', 'var-msg');
    });

    slowMotionBtn.addEventListener('click', () => {
        if (isSlowMotion) {
            mainVideoPlayer.playbackRate = 1.0;
            slowMotionBtn.innerHTML = '<i class="fas fa-hourglass-half"></i> สโลว์โมชั่น';
            isSlowMotion = false;
            logCommMessage('VAR', 'ปิดโหมดสโลว์โมชั่น (ความเร็วปกติ)', 'var-msg');
        } else {
            mainVideoPlayer.playbackRate = 0.25; // Example slow motion speed
            slowMotionBtn.innerHTML = '<i class="fas fa-hourglass"></i> ปกติ';
            isSlowMotion = true;
            logCommMessage('VAR', 'เปิดโหมดสโลว์โมชั่น (0.25x)', 'var-msg');
        }
    });

    mainVideoPlayer.addEventListener('play', () => {
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> หยุดชั่วคราว';
    });

    mainVideoPlayer.addEventListener('pause', () => {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i> เล่น';
    });

    // --- File Upload ---
    uploadClipBtn.addEventListener('click', () => {
        videoFileInput.click();
    });

    videoFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileURL = URL.createObjectURL(file);
            mainVideoPlayer.src = fileURL;
            mainVideoPlayer.load();
            mainVideoPlayer.play();
            logCommMessage('ระบบ', `อัปโหลดคลิป "${file.name}" แล้ว`, 'system-msg');
            triggerVARCheck('การทำฟาวล์น่าสงสัย'); // Automatically trigger VAR for new clip
        }
    });

    // --- VAR Check Logic ---
    function triggerVARCheck(incident) {
        if (varCheckActive) return; // Prevent multiple simultaneous VAR checks
        varCheckActive = true;
        incidentCounter++;
        const incidentTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        currentIncidentDetails = { type: incident, time: incidentTime }; // Store current incident

        currentIncidentDisplay.textContent = incident;
        varStatusDisplay.textContent = 'กำลังตรวจสอบ';
        varStatusDisplay.className = 'status-indicator warning';

        varOverlay.classList.remove('hidden');
        varOverlay.innerHTML = '<i class="fas fa-exclamation-triangle"></i> กำลังตรวจสอบ VAR';

        varNotification.textContent = `การแจ้งเตือน: กำลังตรวจสอบเหตุการณ์ "${incident}"`;
        varNotification.className = 'var-notification active';

        decisionPanel.classList.add('hidden'); // Hide decision panel initially
        finalDecisionType.value = ''; // Reset decision type dropdown
        finalDecisionDisplay.classList.add('hidden'); // Hide final decision display initially
        finalDecisionDisplay.textContent = 'รอการตัดสินใจขั้นสุดท้าย...';
        finalDecisionDisplay.className = 'final-decision-display'; // Reset class

        logCommMessage('ระบบ', `เหตุการณ์ VAR ใหม่: "${incident}" ที่เวลา ${incidentTime}`, 'system-msg');
        logCommMessage('VAR', `กำลังตรวจสอบ ${incident}...`, 'var-msg');

        // Simulate VAR analysis time
        setTimeout(() => {
            varNotification.textContent = `เหตุการณ์ "${incident}" พร้อมสำหรับการตัดสินใจ`;
            varNotification.className = 'var-notification info';
            decisionPanel.classList.remove('hidden');
            incidentTypeDisplay.textContent = incident;
            varOverlay.classList.add('hidden');
            logCommMessage('VAR', 'การตรวจสอบเสร็จสิ้น รอการตัดสินใจ', 'var-msg');
        }, 5000); // Simulate 5 seconds for VAR review
    }

    submitDecisionBtn.addEventListener('click', () => {
        const selectedDecision = finalDecisionType.value;
        const incident = incidentTypeDisplay.textContent;

        if (!selectedDecision) {
            alert('กรุณาเลือกประเภทการตัดสินใจ');
            return;
        }

        varCheckActive = false;
        varStatusDisplay.textContent = 'พร้อม';
        varStatusDisplay.className = 'status-indicator ready';

        let statusText = '';
        let statusClass = '';

        if (selectedDecision === 'ยืนยันการตัดสินเดิม') {
            statusText = `การตัดสินเดิมสำหรับ "${incident}" ได้รับการยืนยันแล้ว`;
            statusClass = 'success'; // Green for confirmed
        } else if (selectedDecision === 'ไม่มีความผิด') {
             statusText = `ผล VAR: "${incident}" - ${selectedDecision}`;
             statusClass = 'info'; // Blue for no foul
        }
        else {
            statusText = `ผล VAR: "${incident}" - ${selectedDecision}`;
            statusClass = 'changed'; // Orange/Red for changed/new decision
        }

        varNotification.textContent = statusText;
        varNotification.className = `var-notification ${statusClass}`;
        decisionPanel.classList.add('hidden');

        finalDecisionDisplay.textContent = `การตัดสินขั้นสุดท้าย: ${selectedDecision} สำหรับ "${incident}"`;
        // Determine the class based on the decision type
        if (selectedDecision === 'ยืนยันการตัดสินเดิม') {
            finalDecisionDisplay.className = 'final-decision-display result-confirmed';
        } else if (selectedDecision === 'ไม่มีความผิด') {
            finalDecisionDisplay.className = 'final-decision-display result-confirmed'; // Using confirmed style for no foul
        }
        else {
            finalDecisionDisplay.className = 'final-decision-display result-changed';
        }
        finalDecisionDisplay.classList.remove('hidden');


        logCommMessage('VAR', `ตัดสินใจสำหรับ "${incident}": ${selectedDecision}`, 'var-msg');
        addIncidentToHistory(incident, selectedDecision);
        currentIncidentDisplay.textContent = 'ไม่มี';
    });

    cancelDecisionBtn.addEventListener('click', () => {
        varCheckActive = false;
        varStatusDisplay.textContent = 'พร้อม';
        varStatusDisplay.className = 'status-indicator ready';
        varNotification.textContent = `การตรวจสอบ VAR ถูกยกเลิกสำหรับเหตุการณ์ "${incidentTypeDisplay.textContent}"`;
        varNotification.className = 'var-notification info';
        decisionPanel.classList.add('hidden');
        finalDecisionDisplay.classList.add('hidden');
        finalDecisionDisplay.textContent = 'รอการตัดสินใจขั้นสุดท้าย...';
        finalDecisionDisplay.className = 'final-decision-display'; // Reset class
        logCommMessage('VAR', `ยกเลิกการตัดสินใจสำหรับ "${incidentTypeDisplay.textContent}"`, 'var-msg');
        addIncidentToHistory(incidentTypeDisplay.textContent, 'ยกเลิกการตัดสิน');
        currentIncidentDisplay.textContent = 'ไม่มี';
    });


    // --- Communication Log ---
    function logCommMessage(sender, message, type) {
        const now = new Date();
        const time = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const logEntry = document.createElement('p');
        logEntry.classList.add('log-entry', type);
        logEntry.innerHTML = `<span style="opacity: 0.7;">[${time}]</span> <strong>${sender}:</strong> ${message}`;
        commLogDisplay.appendChild(logEntry);
        commLogDisplay.scrollTop = commLogDisplay.scrollHeight; // Auto-scroll to bottom
    }

    // --- Referee Chat ---
    sendRefereeChatBtn.addEventListener('click', sendRefereeChatMessage);
    refereeChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendRefereeChatMessage();
        }
    });

    function sendRefereeChatMessage() {
        const message = refereeChatInput.value.trim();
        if (message) {
            const now = new Date();
            const time = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
            const chatMessageDiv = document.createElement('div');
            chatMessageDiv.classList.add('chat-message', 'var'); // VAR sends message
            chatMessageDiv.innerHTML = `<p><span class="sender">VAR</span>: ${message}<span class="timestamp">${time}</span></p>`;
            refereeChatDisplay.appendChild(chatMessageDiv);
            refereeChatInput.value = '';
            refereeChatDisplay.scrollTop = refereeChatDisplay.scrollHeight; // Auto-scroll

            logCommMessage('VAR', `ส่งข้อความถึงกรรมการ: "${message}"`, 'var-msg');

            // Simulate referee response
            setTimeout(() => {
                const refereeResponse = "รับทราบ. กำลังดำเนินการตรวจสอบ";
                const refChatDiv = document.createElement('div');
                refChatDiv.classList.add('chat-message', 'referee');
                const responseTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                refChatDiv.innerHTML = `<p><span class="sender">กรรมการ</span>: ${refereeResponse}<span class="timestamp">${responseTime}</span></p>`;
                refereeChatDisplay.appendChild(refChatDiv);
                refereeChatDisplay.scrollTop = refereeChatDisplay.scrollHeight;
                logCommMessage('กรรมการ', `ตอบกลับ: "${refereeResponse}"`, 'ref-msg');
            }, 2000);
        }
    }

    // --- Spot Check Modal ---
    spotCheckBtn.addEventListener('click', () => {
        showSpotCheckModal('กำลังวิเคราะห์การสัมผัสบอล...');
    });

    function showSpotCheckModal(description = 'กำลังตรวจสอบจุดที่น่าสงสัย...') {
        spotCheckTitle.textContent = 'การตรวจสอบจุดสำคัญ';
        spotCheckDescription.textContent = description;
        // You can change spotCheckImage.src here dynamically if you have different images
        spotCheckImage.src = 'spot-check-placeholder.jpg'; // Example placeholder
        spotCheckModal.classList.remove('hidden');
    }

    window.hideSpotCheckModal = function() {
        spotCheckModal.classList.add('hidden');
    };

    closeSpotCheckModalBtn.addEventListener('click', hideSpotCheckModal);

    window.addEventListener('click', (event) => {
        if (event.target == spotCheckModal) {
            hideSpotCheckModal();
        }
    });

    // --- Incident History ---
    function addIncidentToHistory(type, status) {
        const now = new Date();
        const time = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const listItem = document.createElement('li');

        let statusClass = '';
        // Map decision types to appropriate status classes for visual representation
        if (status === 'ยืนยันการตัดสินเดิม') {
            statusClass = 'resolved'; // Green
        } else if (status === 'ยกเลิกการตัดสิน') {
            statusClass = 'dismissed'; // Grey
        } else {
            statusClass = 'pending'; // Orange for any new/changed decision
        }


        listItem.innerHTML = `
            <span class="incident-time">${time}</span>
            <span class="incident-description">${type}</span>
            <span class="incident-status ${statusClass}">${status}</span>
        `;
        incidentList.prepend(listItem); // Add to the top
    }

    // --- Initial setup/Reset ---
    function resetSimulator() {
        mainVideoPlayer.src = 'sample.mp4'; // Reset video
        mainVideoPlayer.load();
        mainVideoPlayer.pause();
        mainVideoPlayer.playbackRate = 1.0;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i> เล่น';
        slowMotionBtn.innerHTML = '<i class="fas fa-hourglass-half"></i> สโลว์โมชั่น';
        isSlowMotion = false;
        varCheckActive = false;

        varOverlay.classList.add('hidden');
        varNotification.textContent = 'ไม่มีการแจ้งเตือน VAR ใหม่';
        varNotification.className = 'var-notification';
        decisionPanel.classList.add('hidden');
        finalDecisionType.value = ''; // Reset dropdown
        finalDecisionDisplay.classList.add('hidden');
        finalDecisionDisplay.textContent = 'รอการตัดสินใจขั้นสุดท้าย...';
        finalDecisionDisplay.className = 'final-decision-display';

        currentIncidentDisplay.textContent = 'ไม่มี';
        varStatusDisplay.textContent = 'พร้อม';
        varStatusDisplay.className = 'status-indicator ready';
        systemStatusDisplay.textContent = 'ออนไลน์';
        systemStatusDisplay.className = 'status-indicator online';

        commLogDisplay.innerHTML = ''; // Clear log
        refereeChatDisplay.innerHTML = '<div class="chat-message system"><p>ระบบ: การเชื่อมต่อกับกรรมการสำเร็จ</p></div>'; // Clear chat
        refereeChatInput.value = '';
        incidentList.innerHTML = ''; // Clear incident history

        // Ensure only the login page is active at start
        loginPage.classList.remove('hidden');
        loginPage.classList.add('active');
        landingPage.classList.remove('active');
        landingPage.classList.add('hidden');
        varDashboard.classList.remove('active');
        varDashboard.classList.add('hidden');
        showPage('home-page'); // Default to home on dashboard, but dashboard is hidden
    }

    resetSimulator(); // Call on initial load to ensure correct state

    // Simulate an initial incident after a delay if the dashboard is loaded directly (for dev/testing)
    // In actual use, this would be triggered by a specific event.
    // setTimeout(() => {
    //     if (varDashboard.classList.contains('active')) {
    //         triggerVARCheck('ล้ำหน้า');
    //     }
    // }, 10000); // Trigger a VAR check 10 seconds after dashboard loads
});
