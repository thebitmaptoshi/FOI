let fetchedContent = null; // Store fetched content temporarily

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FETCH_CONTENT') {
    fetch(message.url)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.text();
      })
      .then(data => {
        fetchedContent = data; // Store content
        sendResponse({ status: 'success', data: fetchedContent });
      })
      .catch(error => {
        console.error('Fetch error:', error);
        sendResponse({ status: 'error', error: error.message });
      });
    return true;
  } else if (message.type === 'GET_CONTENT') {
    if (fetchedContent) {
      sendResponse({ status: 'success', data: fetchedContent });
    } else {
      fetch(message.url || 'https://ordinals.com/content/85dfb4a5c63b52f0970b100ae05096ae722fdb8596bc6d9e4afdcb9df5e2c6fdi0')
        .then(response => response.text())
        .then(data => {
          fetchedContent = data;
          sendResponse({ status: 'success', data: fetchedContent });
        })
        .catch(error => {
          console.error('Refetch error:', error);
          sendResponse({ status: 'error', error: error.message });
        });
    }
    return true;
  } else if (message.type === 'INJECT_SCRIPT') {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]) {
        // Only inject scripts with HTTPS URLs
        if (message.src.startsWith('https://')) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: [message.src]
          }, () => {
            if (chrome.runtime.lastError) {
              console.error('Script injection failed:', chrome.runtime.lastError);
            } else {
              console.log('Script injected:', message.src);
            }
          });
        } else {
          console.error('Script injection skipped: Non-HTTPS URL', message.src);
        }
      }
    });
    sendResponse({ status: 'success' });
    return true;
  }
});

// Modify headers for specific domains to ensure compatibility with sanitized content
chrome.declarativeNetRequest.updateDynamicRules({
  removeRuleIds: [1],
  addRules: [
    {
      id: 1,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        responseHeaders: [
          { header: 'content-security-policy', operation: 'remove' },
          { header: 'x-frame-options', operation: 'remove' }
        ]
      },
      condition: {
        urlFilter: 'https://*',
        resourceTypes: [
          'main_frame',
          'sub_frame',
          'stylesheet',
          'script',
          'image',
          'font',
          'object',
          'xmlhttprequest',
          'media'
        ]
      }
    }
  ]
});