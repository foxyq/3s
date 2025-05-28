document.getElementById('syncButton').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: scrapeFromIframe,
  });
});




async function scrapeFromIframe() {
  function test() {
    console.log('Test function called');
  }


  const rows = document.querySelectorAll('.fc-widget-content .fc-row.fc-week .fc-content-skeleton');

  console.log(rows.length, 'rows found');
  let events = [];

  test()

  rows.forEach(row => {
    // 1. Extract dates from thead cells
    const dateCells = row.querySelectorAll('thead td[data-date]');
    const dates = Array.from(dateCells).map(cell => cell.getAttribute('data-date'));

    // 2. Find all event containers in the tbody
    const eventRows = row.querySelectorAll('tbody tr');
    eventRows.forEach((tr, rowIdx) => {
      // Each <td> in this row corresponds to a date column
      const tds = tr.querySelectorAll('td');
      tds.forEach((td, colIdx) => {
        // Only process if this td contains an event
        const eventLink = td.querySelector('a.fc-day-grid-event');
        if (eventLink) {
          // Extract title
          let title = eventLink.querySelector('.event-title')?.textContent?.trim();
          if (!title) {
            // Some events use .fc-title instead
            title = eventLink.querySelector('.fc-title')?.textContent?.trim();
          }

          // Extract start time and duration
          let start = '';
          let duration = '';
          let startEnd = eventLink.querySelector('.event-start-end')?.textContent?.trim();
          if (!startEnd) {
            // Some events use .event-start-time
            start = eventLink.querySelector('.event-start-time')?.textContent?.trim() || '';
            duration = eventLink.querySelector('.event-duration')?.textContent?.replace(/[\[\]h]/g, '').trim() || '';
          } else {
            // Format: "19:00-7:30"
            start = startEnd.split('-')[0] || '';
            // Try to get duration
            duration = eventLink.querySelector('.event-duration')?.textContent?.replace(/[\[\]h]/g, '').trim() || '';
          }

          // Find the date for this column
          const date = dates[colIdx] || '';

          events.push({
            title,
            date,
            start,
            duration
          });
        }
      });
    });
  });

  // console.log('Extracted events:', events);

  // Helper to parse date for sorting (handles empty dates)
  function parseDate(date) {
    return date ? new Date(date) : new Date(0);
  }


  // Sort by date ascending
  events.sort((a, b) => parseDate(a.date) - parseDate(b.date));

  const work = [];
  const training = [];
  const timeOff = [];

  // console.log(events)

  events.forEach(ev => {
    const t = ev.title.toUpperCase();

    // Training
    if (
      t.includes('CLASS') ||
      t.includes('ECMO') ||
      t.includes('EPIC') ||
      t.includes('QUALITY') ||
      t.includes('TRAINING') ||
      t.includes('EDUCATION') ||
      t.includes('NURSING')
    ) {
      training.push(ev);
    }
    // Time Off
    else if (
      t.includes('VACATION') ||
      t.includes('OFF') ||
      t.includes('NON SCHED DAY') ||
      t.includes('TIME OFF REQUEST') ||
      t.includes('SELF SCHEDULE')
    ) {
      timeOff.push(ev);
    }
    // Work
    else {
      work.push(ev);
    }
  });



  const realTimeOff = timeOff.filter(day => day.date !== '')
  console.log({ work, training, realTimeOff });



  chrome.runtime.sendMessage({ type: 'SYNC_EVENTS', events });
}
