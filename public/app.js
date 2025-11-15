// API Configuration
const API_BASE = '/api';
let currentUser = null;
let authToken = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check Authentication
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (token) {
        authToken = token;
        fetchCurrentUser();
    } else {
        showAuthPages();
    }
}

// Fetch Current User
async function fetchCurrentUser() {
    try {
        const response = await fetch(`${API_BASE}/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            currentUser = userData;
            updateNavigation();
            
            // If trying to access admin page, verify access
            const hash = window.location.hash.substring(1);
            if (hash === 'admin') {
                if (currentUser.role === 'admin') {
                    showPage('admin');
                } else {
                    alert('Access denied. Admin privileges required. If you were just made an admin, please logout and login again to refresh your session.');
                    showPage('dashboard');
                }
            } else if (hash === 'dashboard' || hash === '') {
                showPage('dashboard');
            }
        } else {
            localStorage.removeItem('authToken');
            authToken = null;
            currentUser = null;
            showAuthPages();
        }
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}

// Update Navigation
function updateNavigation() {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const dashboardLink = document.getElementById('dashboardLink');
    const complaintLink = document.getElementById('complaintLink');
    const logoutLink = document.getElementById('logoutLink');
    const adminLink = document.getElementById('adminLink');

    if (currentUser) {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        dashboardLink.style.display = 'block';
        complaintLink.style.display = 'block';
        logoutLink.style.display = 'block';
        
        if (currentUser.role === 'admin') {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    } else {
        loginLink.style.display = 'block';
        registerLink.style.display = 'block';
        dashboardLink.style.display = 'none';
        complaintLink.style.display = 'none';
        logoutLink.style.display = 'none';
        adminLink.style.display = 'none';
    }
}

// Show Auth Pages
function showAuthPages() {
    if (!currentUser) {
        showPage('home');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Search and filter in dashboard
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(loadComplaints, 300));
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', loadComplaints);
    }

    // Admin search and filter
    const adminSearchInput = document.getElementById('adminSearchInput');
    const adminStatusFilter = document.getElementById('adminStatusFilter');
    
    if (adminSearchInput) {
        adminSearchInput.addEventListener('input', debounce(loadAdminComplaints, 300));
    }
    if (adminStatusFilter) {
        adminStatusFilter.addEventListener('change', loadAdminComplaints);
    }
}

// Show Page
async function showPage(pageName) {
    // Check admin access before showing admin page
    if (pageName === 'admin') {
        if (!currentUser || !authToken) {
            alert('Please login first to access admin dashboard.');
            showPage('login');
            return;
        }
        
        // Refresh user data from server to get latest role
        try {
            const response = await fetch(`${API_BASE}/me`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                currentUser = userData;
                updateNavigation();
                
                if (currentUser.role !== 'admin') {
                    alert('Access denied. Admin privileges required.\n\nIf you were just made an admin, please logout and login again to refresh your session.');
                    showPage('dashboard');
                    return;
                }
            } else {
                alert('Session expired. Please login again.');
                logout();
                return;
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            alert('Error verifying admin access. Please try again.');
            showPage('dashboard');
            return;
        }
    }

    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    const page = document.getElementById(pageName);
    if (page) {
        page.classList.add('active');
        window.location.hash = pageName;

        // Load data for specific pages
        if (pageName === 'dashboard') {
            loadComplaints();
        } else if (pageName === 'admin' && currentUser?.role === 'admin') {
            loadAdminComplaints();
        }
    }
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle Register
async function handleRegister(event) {
    event.preventDefault();
    const errorDiv = document.getElementById('registerError');
    errorDiv.classList.remove('show');

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            updateNavigation();
            showPage('dashboard');
        } else {
            errorDiv.textContent = data.error || 'Registration failed';
            errorDiv.classList.add('show');
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.classList.add('show');
    }
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    const errorDiv = document.getElementById('loginError');
    errorDiv.classList.remove('show');

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            updateNavigation();
            showPage('dashboard');
        } else {
            errorDiv.textContent = data.error || 'Login failed';
            errorDiv.classList.add('show');
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.classList.add('show');
    }
}

// Logout
function logout() {
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    updateNavigation();
    showPage('home');
}

// Load Complaints
async function loadComplaints() {
    const complaintsList = document.getElementById('complaintsList');
    if (!complaintsList) return;

    const search = document.getElementById('searchInput')?.value || '';
    const status = document.getElementById('statusFilter')?.value || 'all';

    complaintsList.innerHTML = '<div class="loading">Loading...</div>';

    // Check if user is logged in
    if (!authToken || !currentUser) {
        complaintsList.innerHTML = '<div class="error-message">Please login to view complaints. <a href="#" onclick="showPage(\'login\')">Login here</a></div>';
        return;
    }

    try {
        const params = new URLSearchParams();
        if (status !== 'all') params.append('status', status);
        if (search) params.append('search', search);

        const response = await fetch(`${API_BASE}/complaints?${params}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const complaints = await response.json();
            displayComplaints(complaints, complaintsList, false);
        } else {
            const data = await response.json().catch(() => ({ error: 'Unknown error' }));
            if (response.status === 401 || response.status === 403) {
                // Token expired or invalid
                localStorage.removeItem('authToken');
                authToken = null;
                currentUser = null;
                updateNavigation();
                complaintsList.innerHTML = '<div class="error-message">Session expired. Please <a href="#" onclick="showPage(\'login\')">login again</a>.</div>';
            } else {
                complaintsList.innerHTML = `<div class="error-message">Failed to load complaints: ${data.error || 'Unknown error'}</div>`;
            }
        }
    } catch (error) {
        console.error('Error loading complaints:', error);
        complaintsList.innerHTML = '<div class="error-message">Network error. Please check your connection and try again.</div>';
    }
}

// Load Admin Complaints
async function loadAdminComplaints() {
    const complaintsList = document.getElementById('adminComplaintsList');
    if (!complaintsList) return;

    const search = document.getElementById('adminSearchInput')?.value || '';
    const status = document.getElementById('adminStatusFilter')?.value || 'all';

    complaintsList.innerHTML = '<div class="loading">Loading...</div>';

    try {
        const params = new URLSearchParams();
        if (status !== 'all') params.append('status', status);
        if (search) params.append('search', search);

        const response = await fetch(`${API_BASE}/admin/complaints?${params}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const complaints = await response.json();
            displayComplaints(complaints, complaintsList, true);
        } else {
            complaintsList.innerHTML = '<div class="error-message">Failed to load complaints</div>';
        }
    } catch (error) {
        complaintsList.innerHTML = '<div class="error-message">Network error. Please try again.</div>';
    }
}

// Display Complaints
function displayComplaints(complaints, container, isAdmin) {
    if (complaints.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3>No complaints found</h3>
                <p>${isAdmin ? 'There are no complaints matching your criteria.' : 'You haven\'t filed any complaints yet.'}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = complaints.map(complaint => `
        <div class="complaint-card">
            <div class="complaint-header">
                <div class="complaint-title">Case: ${complaint.caseNumber}</div>
                <span class="status-badge status-${complaint.status}">${formatStatus(complaint.status)}</span>
            </div>
            <div class="complaint-info">
                <div class="complaint-info-item">
                    <span class="complaint-info-label">Vehicle Number</span>
                    <span class="complaint-info-value">${complaint.vehicleNumber}</span>
                </div>
                <div class="complaint-info-item">
                    <span class="complaint-info-label">Vehicle Type</span>
                    <span class="complaint-info-value">${complaint.vehicleType}</span>
                </div>
                <div class="complaint-info-item">
                    <span class="complaint-info-label">Theft Date</span>
                    <span class="complaint-info-value">${formatDate(complaint.theftDate)}</span>
                </div>
                <div class="complaint-info-item">
                    <span class="complaint-info-label">Filed On</span>
                    <span class="complaint-info-value">${formatDate(complaint.createdAt)}</span>
                </div>
            </div>
            <div class="complaint-actions">
                <button class="btn btn-primary" onclick="viewComplaintDetail(${complaint.id}, ${isAdmin})">View Details</button>
                ${isAdmin ? `<button class="btn btn-secondary" onclick="showAdminForm(${complaint.id})">Update Status</button>` : ''}
            </div>
        </div>
    `).join('');
}

// View Complaint Detail
async function viewComplaintDetail(complaintId, isAdmin = false) {
    const endpoint = isAdmin ? `${API_BASE}/admin/complaints/${complaintId}` : `${API_BASE}/complaints/${complaintId}`;
    
    try {
        const response = await fetch(endpoint, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const complaint = await response.json();
            displayComplaintDetail(complaint, isAdmin);
            showPage('complaintDetail');
        } else {
            alert('Failed to load complaint details');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Display Complaint Detail
function displayComplaintDetail(complaint, isAdmin) {
    const container = document.getElementById('complaintDetailContent');
    
    const documentsHtml = complaint.documents ? `
        <div class="detail-row">
            <div class="detail-label">Documents:</div>
            <div>
                ${complaint.documents.split(',').map(doc => `
                    <a href="/uploads/${doc}" target="_blank" class="btn btn-secondary" style="margin: 0.25rem;">View ${doc}</a>
                `).join('')}
            </div>
        </div>
    ` : '';

    const updatesHtml = complaint.updates && complaint.updates.length > 0 ? `
        <div class="updates-section">
            <h3>Case Updates</h3>
            ${complaint.updates.map(update => `
                <div class="update-item">
                    <div class="update-meta">
                        <span><strong>${update.updatedBy}</strong></span>
                        <span>${formatDate(update.createdAt)}</span>
                    </div>
                    <div class="update-message">${update.message}</div>
                </div>
            `).join('')}
        </div>
    ` : '';

    container.innerHTML = `
        <div class="complaint-detail">
            <div class="detail-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h2>Case Number: ${complaint.caseNumber}</h2>
                    <span class="status-badge status-${complaint.status}">${formatStatus(complaint.status)}</span>
                </div>
            </div>

            <div class="detail-section">
                <h3>Vehicle Information</h3>
                <div class="detail-row">
                    <div class="detail-label">Vehicle Number:</div>
                    <div>${complaint.vehicleNumber}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Vehicle Type:</div>
                    <div>${complaint.vehicleType}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Vehicle Model:</div>
                    <div>${complaint.vehicleModel}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Vehicle Color:</div>
                    <div>${complaint.vehicleColor}</div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Theft Information</h3>
                <div class="detail-row">
                    <div class="detail-label">Theft Date:</div>
                    <div>${formatDate(complaint.theftDate)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Theft Location:</div>
                    <div>${complaint.theftLocation}</div>
                </div>
                ${complaint.description ? `
                <div class="detail-row">
                    <div class="detail-label">Description:</div>
                    <div>${complaint.description}</div>
                </div>
                ` : ''}
            </div>

            <div class="detail-section">
                <h3>Complainant Information</h3>
                <div class="detail-row">
                    <div class="detail-label">Name:</div>
                    <div>${complaint.complainantName}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Phone:</div>
                    <div>${complaint.complainantPhone}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div>${complaint.complainantEmail}</div>
                </div>
                ${complaint.complainantAddress ? `
                <div class="detail-row">
                    <div class="detail-label">Address:</div>
                    <div>${complaint.complainantAddress}</div>
                </div>
                ` : ''}
                ${documentsHtml}
            </div>

            ${isAdmin ? `
            <div class="detail-section">
                <h3>Admin Information</h3>
                <div class="detail-row">
                    <div class="detail-label">Assigned Officer:</div>
                    <div>${complaint.assignedOfficer || 'Not assigned'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Filed On:</div>
                    <div>${formatDate(complaint.createdAt)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Last Updated:</div>
                    <div>${formatDate(complaint.updatedAt)}</div>
                </div>
            </div>
            ` : ''}

            ${updatesHtml}
        </div>
    `;
}

// Show Admin Form
function showAdminForm(complaintId) {
    const formHtml = `
        <div class="admin-form" id="adminForm${complaintId}">
            <h4>Update Complaint Status</h4>
            <div class="form-group">
                <label>Status</label>
                <select id="adminStatus${complaintId}" class="form-control">
                    <option value="pending">Pending</option>
                    <option value="under_investigation">Under Investigation</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>
            </div>
            <div class="form-group">
                <label>Assigned Officer</label>
                <input type="text" id="assignedOfficer${complaintId}" class="form-control" placeholder="Officer name">
            </div>
            <div class="form-group">
                <label>Update Message</label>
                <textarea id="updateMessage${complaintId}" class="form-control" rows="3" placeholder="Add a note about this update"></textarea>
            </div>
            <div class="form-actions">
                <button class="btn btn-primary" onclick="submitAdminUpdate(${complaintId})">Update</button>
                <button class="btn btn-secondary" onclick="document.getElementById('adminForm${complaintId}').remove()">Cancel</button>
            </div>
        </div>
    `;
    
    const complaintCard = event.target.closest('.complaint-card');
    const existingForm = complaintCard.querySelector('.admin-form');
    if (existingForm) {
        existingForm.remove();
    }
    complaintCard.insertAdjacentHTML('beforeend', formHtml);
}

// Submit Admin Update
async function submitAdminUpdate(complaintId) {
    const status = document.getElementById(`adminStatus${complaintId}`).value;
    const assignedOfficer = document.getElementById(`assignedOfficer${complaintId}`).value;
    const message = document.getElementById(`updateMessage${complaintId}`).value;

    try {
        const response = await fetch(`${API_BASE}/admin/complaints/${complaintId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status, assignedOfficer, message })
        });

        if (response.ok) {
            document.getElementById(`adminForm${complaintId}`).remove();
            loadAdminComplaints();
            alert('Complaint updated successfully');
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to update complaint');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Handle Complaint Submit
async function handleComplaintSubmit(event) {
    event.preventDefault();
    const errorDiv = document.getElementById('complaintError');
    errorDiv.classList.remove('show');

    const formData = new FormData();
    formData.append('vehicleNumber', document.getElementById('vehicleNumber').value);
    formData.append('vehicleType', document.getElementById('vehicleType').value);
    formData.append('vehicleModel', document.getElementById('vehicleModel').value);
    formData.append('vehicleColor', document.getElementById('vehicleColor').value);
    formData.append('theftDate', document.getElementById('theftDate').value);
    formData.append('theftLocation', document.getElementById('theftLocation').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('complainantName', document.getElementById('complainantName').value);
    formData.append('complainantPhone', document.getElementById('complainantPhone').value);
    formData.append('complainantEmail', document.getElementById('complainantEmail').value);
    formData.append('complainantAddress', document.getElementById('complainantAddress').value);

    const files = document.getElementById('documents').files;
    for (let i = 0; i < files.length; i++) {
        formData.append('documents', files[i]);
    }

    try {
        const response = await fetch(`${API_BASE}/complaints`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Complaint submitted successfully! Your case number is: ${data.caseNumber}`);
            document.getElementById('complaintForm').reset();
            showPage('dashboard');
        } else {
            // Handle different error types
            if (response.status === 401 || response.status === 403) {
                errorDiv.textContent = 'Session expired. Please login again.';
                errorDiv.classList.add('show');
                setTimeout(() => {
                    logout();
                    showPage('login');
                }, 2000);
            } else {
                const errorMsg = data.error || (data.errors && data.errors[0]?.message) || 'Failed to submit complaint';
                errorDiv.textContent = errorMsg;
                errorDiv.classList.add('show');
            }
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.classList.add('show');
    }
}

// Format Status
function formatStatus(status) {
    return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Format Date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ==================== CHATBOT FUNCTIONALITY ====================

let chatbotState = 'idle'; // 'idle', 'filing', 'tracking', 'collecting_info'
let chatbotData = {};

// Switch filing mode
function switchFilingMode(mode) {
    const formMode = document.getElementById('formMode');
    const chatbotMode = document.getElementById('chatbotMode');
    const formBtn = document.getElementById('formModeBtn');
    const chatbotBtn = document.getElementById('chatbotModeBtn');

    if (mode === 'form') {
        formMode.style.display = 'block';
        chatbotMode.style.display = 'none';
        formBtn.classList.add('active');
        chatbotBtn.classList.remove('active');
    } else {
        formMode.style.display = 'none';
        chatbotMode.style.display = 'block';
        formBtn.classList.remove('active');
        chatbotBtn.classList.add('active');
    }
}

// Reset chatbot
function resetChatbot() {
    chatbotState = 'idle';
    chatbotData = {};
    const messagesContainer = document.getElementById('chatbotMessages');
    messagesContainer.innerHTML = `
        <div class="message bot-message">
            <div class="message-content">
                <p>Hello! 👋 I'm here to help you file a vehicle theft complaint. I can also help you track your existing complaints.</p>
                <p>What would you like to do?</p>
                <div class="quick-options">
                    <button class="quick-option-btn" onclick="chatbotStartFiling()">File New Complaint</button>
                    <button class="quick-option-btn" onclick="chatbotStartTracking()">Track Complaint Status</button>
                </div>
            </div>
        </div>
    `;
}

// Start filing complaint via chatbot
function chatbotStartFiling() {
    // Remove quick options
    const messagesContainer = document.getElementById('chatbotMessages');
    const lastMessage = messagesContainer.lastElementChild;
    if (lastMessage && lastMessage.querySelector('.quick-options')) {
        const quickOptions = lastMessage.querySelector('.quick-options');
        quickOptions.style.display = 'none';
    }
    
    chatbotState = 'filing';
    chatbotData = {
        step: 0,
        vehicleNumber: '',
        vehicleType: '',
        vehicleModel: '',
        vehicleColor: '',
        theftDate: '',
        theftLocation: '',
        description: '',
        complainantName: '',
        complainantPhone: '',
        complainantEmail: '',
        complainantAddress: ''
    };
    
    addBotMessage("Great! Let's file your vehicle theft complaint. I'll need some information from you.");
    addBotMessage("Let's start with the vehicle details. What is your vehicle registration number?");
    chatbotData.step = 1;
}

// Start tracking complaint
function chatbotStartTracking() {
    // Remove quick options
    const messagesContainer = document.getElementById('chatbotMessages');
    const lastMessage = messagesContainer.lastElementChild;
    if (lastMessage && lastMessage.querySelector('.quick-options')) {
        const quickOptions = lastMessage.querySelector('.quick-options');
        quickOptions.style.display = 'none';
    }
    
    chatbotState = 'tracking';
    chatbotData = { step: 0 };
    addBotMessage("I can help you track your complaint status. Please provide your case number or vehicle registration number.");
}

// Add bot message
function addBotMessage(text, delay = 500) {
    setTimeout(() => {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        const p = document.createElement('p');
        p.innerHTML = text;
        contentDiv.appendChild(p);
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        scrollChatbotToBottom();
    }, delay);
}

// Add user message
function addUserMessage(text) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `<div class="message-content"><p>${text}</p></div>`;
    messagesContainer.appendChild(messageDiv);
    scrollChatbotToBottom();
}

// Show typing indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbotMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingDiv);
    scrollChatbotToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Scroll to bottom
function scrollChatbotToBottom() {
    const messagesContainer = document.getElementById('chatbotMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle chatbot input keypress
function handleChatbotKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatbotMessage();
    }
}

// Send chatbot message
async function sendChatbotMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Check if user is logged in
    if (!currentUser || !authToken) {
        addBotMessage("Please login first to file a complaint or track status.");
        addBotMessage("Click 'Login' in the navigation menu.");
        input.value = '';
        return;
    }
    
    addUserMessage(message);
    input.value = '';
    showTypingIndicator();
    
    // Process based on current state
    if (chatbotState === 'filing') {
        await handleFilingConversation(message);
    } else if (chatbotState === 'tracking') {
        await handleTrackingConversation(message);
    } else {
        hideTypingIndicator();
        addBotMessage("Please select an option: 'File New Complaint' or 'Track Complaint Status'");
    }
}

// Handle filing conversation
async function handleFilingConversation(message) {
    hideTypingIndicator();
    
    const step = chatbotData.step;
    
    switch (step) {
        case 1: // Vehicle number
            chatbotData.vehicleNumber = message;
            addBotMessage(`Got it! Vehicle number: ${message}`);
            addBotMessage("What type of vehicle is it? (e.g., Car, Motorcycle, Scooter, Bicycle, Truck, Other)");
            chatbotData.step = 2;
            break;
            
        case 2: // Vehicle type
            const vehicleType = message.toLowerCase().replace(/[^a-z]/g, '');
            let validType = 'other';
            if (vehicleType.includes('car')) validType = 'car';
            else if (vehicleType.includes('motorcycle') || vehicleType.includes('bike')) validType = 'motorcycle';
            else if (vehicleType.includes('scooter')) validType = 'scooter';
            else if (vehicleType.includes('bicycle') || vehicleType.includes('cycle')) validType = 'bicycle';
            else if (vehicleType.includes('truck')) validType = 'truck';
            
            chatbotData.vehicleType = validType;
            addBotMessage(`Vehicle type: ${validType}`);
            addBotMessage("What is the vehicle model? (e.g., Honda City, Yamaha R15)");
            chatbotData.step = 3;
            break;
            
        case 3: // Vehicle model
            chatbotData.vehicleModel = message;
            addBotMessage(`Model: ${message}`);
            addBotMessage("What color is the vehicle?");
            chatbotData.step = 4;
            break;
            
        case 4: // Vehicle color
            chatbotData.vehicleColor = message;
            addBotMessage(`Color: ${message}`);
            addBotMessage("When did the theft occur? Please provide date and time (e.g., 2024-01-15 14:30 or just date if time unknown)");
            chatbotData.step = 5;
            break;
            
        case 5: // Theft date
            let theftDate = message;
            // Try to parse and format date
            try {
                const date = new Date(message);
                if (!isNaN(date.getTime())) {
                    theftDate = date.toISOString().slice(0, 16);
                } else if (!message.includes('T') && message.match(/\d{4}-\d{2}-\d{2}/)) {
                    theftDate = message + 'T12:00';
                }
            } catch (e) {}
            chatbotData.theftDate = theftDate;
            addBotMessage(`Theft date: ${message}`);
            addBotMessage("Where did the theft occur? Please provide the location/address.");
            chatbotData.step = 6;
            break;
            
        case 6: // Theft location
            chatbotData.theftLocation = message;
            addBotMessage(`Location: ${message}`);
            addBotMessage("Any additional description or details about the incident? (Type 'skip' if none)");
            chatbotData.step = 7;
            break;
            
        case 7: // Description
            if (message.toLowerCase() !== 'skip') {
                chatbotData.description = message;
            }
            addBotMessage("Now I need your contact information.");
            addBotMessage("What is your full name?");
            chatbotData.step = 8;
            break;
            
        case 8: // Complainant name
            chatbotData.complainantName = message;
            addBotMessage(`Name: ${message}`);
            addBotMessage("What is your phone number?");
            chatbotData.step = 9;
            break;
            
        case 9: // Phone
            chatbotData.complainantPhone = message;
            addBotMessage(`Phone: ${message}`);
            addBotMessage("What is your email address?");
            chatbotData.step = 10;
            break;
            
        case 10: // Email
            chatbotData.complainantEmail = message;
            addBotMessage(`Email: ${message}`);
            addBotMessage("What is your address? (Type 'skip' if you prefer not to provide)");
            chatbotData.step = 11;
            break;
            
        case 11: // Address
            if (message.toLowerCase() !== 'skip') {
                chatbotData.complainantAddress = message;
            }
            addBotMessage("Perfect! I have all the information. Submitting your complaint now...");
            await submitChatbotComplaint();
            break;
            
        default:
            addBotMessage("I'm ready to help. Please select an option from above.");
    }
}

// Submit complaint from chatbot
async function submitChatbotComplaint() {
    showTypingIndicator();
    
    try {
        const formData = new FormData();
        formData.append('vehicleNumber', chatbotData.vehicleNumber);
        formData.append('vehicleType', chatbotData.vehicleType);
        formData.append('vehicleModel', chatbotData.vehicleModel);
        formData.append('vehicleColor', chatbotData.vehicleColor);
        formData.append('theftDate', chatbotData.theftDate);
        formData.append('theftLocation', chatbotData.theftLocation);
        formData.append('description', chatbotData.description || '');
        formData.append('complainantName', chatbotData.complainantName);
        formData.append('complainantPhone', chatbotData.complainantPhone);
        formData.append('complainantEmail', chatbotData.complainantEmail);
        formData.append('complainantAddress', chatbotData.complainantAddress || '');

        const response = await fetch(`${API_BASE}/complaints`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        hideTypingIndicator();
        
        const data = await response.json().catch(() => ({ error: 'Failed to parse response' }));

        if (response.ok) {
            addBotMessage(`✅ <strong>Complaint filed successfully!</strong>`);
            addBotMessage(`Your case number is: <strong>${data.caseNumber}</strong>`);
            addBotMessage("Please save this case number for tracking purposes.");
            addBotMessage("You can track your complaint status anytime by clicking 'Track Complaint Status' or visiting your dashboard.");
            
            // Reset for new complaint
            setTimeout(() => {
                resetChatbot();
            }, 3000);
        } else {
            if (response.status === 401 || response.status === 403) {
                addBotMessage(`❌ Session expired. Please logout and login again.`);
                setTimeout(() => {
                    logout();
                }, 2000);
            } else {
                const errorMsg = data.error || (data.errors && data.errors[0]?.message) || 'Failed to submit complaint';
                addBotMessage(`❌ Sorry, there was an error: ${errorMsg}`);
                addBotMessage("Would you like to try again? Click 'File New Complaint'.");
            }
        }
    } catch (error) {
        hideTypingIndicator();
        addBotMessage(`❌ Network error. Please check your connection and try again.`);
    }
}

// Handle tracking conversation
async function handleTrackingConversation(message) {
    hideTypingIndicator();
    
    const searchTerm = message.trim();
    addBotMessage(`Searching for complaints with "${searchTerm}"...`);
    showTypingIndicator();
    
    try {
        const params = new URLSearchParams();
        params.append('search', searchTerm);
        
        const response = await fetch(`${API_BASE}/complaints?${params}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        hideTypingIndicator();
        
        if (response.ok) {
            const complaints = await response.json();
            
            if (complaints.length === 0) {
                addBotMessage(`No complaints found matching "${searchTerm}".`);
                addBotMessage("Please check your case number or vehicle registration number and try again.");
                addBotMessage("You can also go to your Dashboard to see all your complaints.");
            } else {
                addBotMessage(`Found ${complaints.length} complaint(s):`);
                
                complaints.forEach(complaint => {
                    const statusBadge = `<span style="padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.875rem; background: #dbeafe; color: #1e40af;">${formatStatus(complaint.status)}</span>`;
                    addBotMessage(`
                        <div style="margin: 0.5rem 0; padding: 0.75rem; background: #f8fafc; border-radius: 6px; border-left: 3px solid #2563eb;">
                            <strong>Case Number:</strong> ${complaint.caseNumber}<br>
                            <strong>Vehicle:</strong> ${complaint.vehicleNumber} (${complaint.vehicleType})<br>
                            <strong>Status:</strong> ${statusBadge}<br>
                            <strong>Theft Date:</strong> ${formatDate(complaint.theftDate)}<br>
                            <strong>Filed On:</strong> ${formatDate(complaint.createdAt)}
                        </div>
                    `);
                });
                
                addBotMessage("For more details, visit your Dashboard or ask me about a specific case number.");
            }
        } else {
            addBotMessage(`Error: Failed to search complaints. Please try again.`);
        }
    } catch (error) {
        hideTypingIndicator();
        addBotMessage(`❌ Network error. Please check your connection and try again.`);
    }
}

// Handle hash navigation
window.addEventListener('hashchange', () => {
    const page = window.location.hash.substring(1) || 'home';
    showPage(page);
});

// Initialize page from hash
if (window.location.hash) {
    showPage(window.location.hash.substring(1));
}
