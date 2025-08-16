if (window.location.href.includes('ordinals.com/content/')) {
  chrome.runtime.sendMessage(
    {
      type: 'FETCH_CONTENT',
      url: window.location.href
    },
    response => {
      if (response && response.status === 'success' && response.data) {
        // Sanitize HTML with DOMPurify (loaded via content script)
        const sanitizedHtml = DOMPurify.sanitize(response.data, {
          ALLOWED_TAGS: ['iframe', 'script', 'div', 'img', 'a', 'p', 'span', 'h1', 'h2', 'h3', 'style', 'link'],
          ALLOWED_ATTR: ['src', 'href', 'class', 'style', 'id', 'title', 'alt', 'width', 'height'],
          ALLOWED_URI_REGEXP: /^https:\/\//, // Restrict to HTTPS URLs
          ADD_ATTR: ['sandbox'], // Allow sandbox attribute for iframes
          FORBID_TAGS: ['object', 'applet'], // Block risky tags
          FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover'], // Block risky event handlers
          ADD_TAGS: ['iframe'], // Ensure iframes are allowed
          ADD_ATTR: ['sandbox'], // Add sandbox to iframes
        });

        // Add sandbox attribute to iframes
        const parser = new DOMParser();
        const doc = parser.parseFromString(sanitizedHtml, 'text/html');
        const iframes = doc.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
        });

        // Inject sanitized and sandboxed HTML
        const contentDiv = document.getElementById('content');
        if (contentDiv) {
          contentDiv.innerHTML = doc.body.innerHTML;
        }
      }
    }
  );
}