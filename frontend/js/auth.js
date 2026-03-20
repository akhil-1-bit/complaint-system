// API Base Configuration - Auto-detect port 5000 if accessed via Live Server
const API_BASE = window.location.port !== '5000' ? 'http://localhost:5000' : '';

// Firebase Configuration Hub
const firebaseConfig = {
  // USER: Add your Firebase config here
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase if not already
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
let confirmationResult = null;

function showTab(type) {
  const citizenForm = document.getElementById('loginForm');
  const adminForm = document.getElementById('adminLoginForm');
  const citizenTab = document.getElementById('tab-citizen');
  const adminTab = document.getElementById('tab-admin');
  const msg = document.getElementById('msg');

  msg.innerText = '';
  if (type === 'citizen') {
    citizenForm.style.display = 'block';
    adminForm.style.display = 'none';
    citizenTab.style.color = 'var(--primary)';
    citizenTab.style.borderBottom = '2px solid var(--primary)';
    adminTab.style.color = 'var(--text-dim)';
    adminTab.style.borderBottom = 'none';
  } else {
    citizenForm.style.display = 'none';
    adminForm.style.display = 'block';
    adminTab.style.color = 'var(--primary)';
    adminTab.style.borderBottom = '2px solid var(--primary)';
    citizenTab.style.color = 'var(--text-dim)';
    citizenTab.style.borderBottom = 'none';
  }
}

// Admin Login Handler
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const msg = document.getElementById('msg');

  try {
    const response = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('adminId', data.adminId);
      localStorage.setItem('adminDeptId', data.departmentId);
      
      // Route based on department
      const routes = {
        1: 'police-admin.html',
        2: 'medical-admin.html',
        3: 'fire-admin.html',
        4: 'municipal-admin.html'
      };
      window.location.href = routes[data.departmentId] || 'main-admin.html';
    } else {
      msg.innerText = "Invalid authority credentials";
    }
  } catch (error) {
    msg.innerText = "Login connection failed";
  }
});

// Global export for HTML
window.showTab = showTab;

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;
  const otpSection = document.getElementById('otpSection');
  const submitBtn = document.getElementById('submitBtn');
  const msg = document.getElementById('msg');
  msg.innerText = '';

  if (!confirmationResult) {
    // Stage 1: Request OTP
    try {
      // In a real browser, you need a recaptcha container
      // For this demo, we assume the user has set up Recaptcha
      const recaptchaVerifier = new firebase.auth.RecaptchaVerifier('submitBtn', {
        'size': 'invisible'
      });
      
      // confirmationResult = await auth.signInWithPhoneNumber(phone, recaptchaVerifier);
      // SIMULATION for beginner tutorial:
      console.log("OTP Requested for", phone);
      otpSection.style.display = 'block';
      submitBtn.innerText = 'Verify OTP';
      confirmationResult = true; // Mock confirmation
      msg.innerText = "OTP sent (Simulated)";
      msg.style.color = "var(--success)";
    } catch (error) {
      msg.innerText = error.message;
    }
  } else {
    // Stage 2: Verify OTP and Login Backend
    const otp = document.getElementById('otp').value;
    try {
      // await confirmationResult.confirm(otp);
      
      msg.innerText = "Synchronizing location...";
      msg.style.color = "var(--primary)";

      // Get location - STRICT real-time check
      let coords;
      try {
        coords = await LocationService.getCurrentLocation(true);
      } catch (locError) {
        if (locError.code === 'PERMISSION_DENIED') {
          msg.innerText = "Error: Please allow location access to continue";
        } else {
          msg.innerText = "Location Error: " + locError.message;
        }
        msg.style.color = "var(--error)";
        return; // BLOCK LOGIN if location fails (User's requirement for exact location)
      }
      
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          email: email,
          latitude: coords.lat,
          longitude: coords.lon
        })
      });
      
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('userId', data.userId);
        window.location.href = 'citizen-home.html';
      } else {
        msg.innerText = "Backend login failed";
      }
    } catch (error) {
      msg.innerText = "Verification failed: " + error.message;
    }
  }
});
