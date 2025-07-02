// CALENDAR
function listCalendarEvents(token) {
    fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=5&orderBy=startTime&singleEvents=true", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            console.log("Upcoming events:", data);
            alert("Fetched events, check console.");
        })
        .catch(err => {
            console.error("Failed to fetch events:", err);
            alert("Failed to fetch calendar events.");
        });
}

function createTestEvent(token) {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    const start = `${year}-${month}-${day}T15:00:00`;
    const end = `${year}-${month}-${day}T16:00:00`;

    const event = {
        summary: "Test Event - 3PM",
        description: "This is a test event created by the extension",
        start: {
            dateTime: `${start}-07:00`, // Adjust timezone offset here
            timeZone: "America/Los_Angeles"
        },
        end: {
            dateTime: `${end}-07:00`,
            timeZone: "America/Los_Angeles"
        }
    };


    fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(event)
    })
        .then(res => res.json())
        .then(data => {
            console.log("Created test event:", data);
            alert("Created test event!");
        })
        .catch(err => {
            console.error("Failed to create event:", err);
            alert("Error creating event");
        });
}
// END CALENDAR

// UI
const loggedOutDiv = document.getElementById("loggedOut");
const loggedInDiv = document.getElementById("loggedIn");
const userEmailSpan = document.getElementById("userEmail");
const authBtn = document.getElementById("authBtn");
const logoutBtn = document.getElementById("logoutBtn");

function showLoggedOut() {
    // loggedOutDiv.style.display = "block";
    // loggedInDiv.style.display = "none";
}

function showLoggedIn(email) {
    userEmailSpan.textContent = email;
    // loggedOutDiv.style.display = "none";
    // loggedInDiv.style.display = "block";
}

// END UI

// LOCAL STORAGE
function saveEmail(email) {
    chrome.storage.local.set({ userEmail: email });
}

// Load email from storage and update UI accordingly
function loadEmail() {
    chrome.storage.local.get("userEmail", (data) => {
        if (data.userEmail) {
            showLoggedIn(data.userEmail);
        } else {
            showLoggedOut();
        }
    });
}
// END LOCAL STORAGE





// Get user email from Google API using token
function getUserEmail(token) {
    fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then((res) => res.json())
        .then((user) => {
            alert('got email: ' + user.email);
            saveEmail(user.email);
            showLoggedIn(user.email);
        })
        .catch((err) => {
            console.error("Failed to fetch user email:", err);
            showLoggedOut();
        });
}

document.getElementById("authBtn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "AUTH_TEST" }, (response) => {
        if (!response || response.error) {
            alert("Auth Error: " + (response?.error || "No response"));
            return;
        }

        const token = response.token;

        // alert("Success! Got token.");
        console.log("Access Token:", token);

        // listCalendarEvents(token);
        getUserEmail(token);
        // createTestEvent(token);
    });

});

