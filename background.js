chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SYNC_EVENTS') {
    console.log('Syncing events:', message.events);
    // Add Google Calendar API sync logic here
  }
});

