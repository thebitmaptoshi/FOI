if (window.location.href.includes('ordinals.com/content/')) {
  chrome.runtime.sendMessage(
    {
      type: 'FETCH_CONTENT',
      url: window.location.href
    },
    response => {
      if (response && response.status === 'success' && response.data) {
        // Inject the fetched HTML as-is
        const contentDiv = document.getElementById('content');
        if (contentDiv) {
          contentDiv.innerHTML = response.data;
        }
      }
    }
  );
}