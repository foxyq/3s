const CLIENT_ID = "73727255460-vvg1la8rk7ph4kh371k8hneeq12e9sge.apps.googleusercontent.com";
const REDIRECT_URI = `https://${chrome.runtime.id}.chromiumapp.org/`;
const SCOPES = ["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/userinfo.email"];


chrome.runtime.onInstalled.addListener(() => {
  console.log("SP Kronos: Extension installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SYNC_EVENTS') {
    // const token = await getOAuthToken();
    // if (!token) {
    //   console.error('No OAuth token');
    //   return;
    // }

    // for (const event of message.events) {
    //   await createCalendarEvent(event, token);
    // }

    sendResponse({ status: 'success' });
    return true; // keep the message channel open
  }

  if (message.type === 'AUTH_TEST') {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(CLIENT_ID)}` +
      `&response_type=token` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(SCOPES.join(' '))}`;

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true
      },
      (redirectUrl) => {
        if (chrome.runtime.lastError) {
          console.error("Auth Error:", chrome.runtime.lastError);
          sendResponse({ error: chrome.runtime.lastError.message });
          return;
        }

        if (redirectUrl) {
          const params = new URLSearchParams(redirectUrl.split('#')[1]);
          const accessToken = params.get('access_token');
          sendResponse({ token: accessToken });
        } else {
          sendResponse({ error: "No redirect URL received." });
        }
      }
    );

    return true; // ✅ Keeps sendResponse alive

  }

  // if (message.type === 'AUTH_TEST') {
  //   chrome.identity.getAuthToken({ interactive: true }, (token) => {
  //     if (chrome.runtime.lastError) {
  //       console.error("Auth Error:", chrome.runtime.lastError);
  //       sendResponse({ error: chrome.runtime.lastError.message });
  //       return;
  //     }

  //     console.log("Got token:", token);
  //     sendResponse({ token });
  //   });

  //   return true; // Keeps sendResponse alive for async
  // }
});
