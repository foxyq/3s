document.getElementById('syncButton').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: scrapeFromIframe,
  });
});

const isValidTitle = (title) => {
  return title && title.trim() !== '' && title.trim() !== 'OFF';
}

async function scrapeFromIframe() {
  console.log('gogo')
  const rows = document.querySelectorAll('.fc-row .fc-week .fc-widget-content');
  const eventEls = document.querySelectorAll('.fc-event-container a.fc-event');
  const events = [];

  console.log(rows)

  eventEls.forEach(el => {
    const title = el.querySelector('.event-title')?.innerText.trim() 
    
    if(!isValidTitle(title)) {
      return
    };  

    const timeRange = el.querySelector('.event-start-end')?.innerText.trim() || '';
    const dateCell = el.closest('td');
    const dateEl = dateCell?.getAttribute('data-date') || ''; 

    const [startTime, endTime] = timeRange.split('-');
    // if (!startTime || !endTime || !dateEl) return;

    const start =  startTime || ''
    const end =  endTime || '' 

    // const start = new Date(`${dateEl} ${startTime}`);
    // const end = new Date(`${dateEl} ${endTime}`);

    events.push({ title, date: '1', start, end });
  });

  console.log('Extracted events:', events);

  chrome.runtime.sendMessage({ type: 'SYNC_EVENTS', events });
}