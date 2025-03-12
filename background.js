// Initialize default groups if none exist
chrome.runtime.onInstalled.addListener(async () => {
  try {
    const result = await chrome.storage.sync.get('tabGroups');
    
    if (!result.tabGroups) {
      const defaultGroups = [
        {
          id: 'social-media',
          name: 'Social Media',
          color: '#4285F4',
          isPinned: true,
          tabs: [ {
            id: generateId(),
            title: 'Instagram',
            url: 'https://www.instagram.com',
            favIconUrl: 'https://static.cdninstagram.com/rsrc.php/v4/yV/r/ftfgD2tsNT7.png',
            addedAt: new Date().toISOString()
          },
          {
            id: generateId(),
            title: 'Facebook',
            url: 'https://www.facebook.com',
            favIconUrl: 'https://www.facebook.com/favicon.ico',
            addedAt: new Date().toISOString()
          },
          {
            id: generateId(),
            title: 'LinkedIn',
            url: 'https://www.linkedin.com',
            favIconUrl: 'https://www.linkedin.com/favicon.ico',
            addedAt: new Date().toISOString()
          }
              ]
        },
        {
          id: 'work',
          name: 'Work',
          color: '#34A853',
          isPinned: true,
          tabs: [
            {
              id: generateId(),
              title: 'Gmail',
              url: 'https://www.gmail.com',
              favIconUrl: 'https://ssl.gstatic.com/images/branding/product/2x/hh_gmail_16dp.png',
              addedAt: new Date().toISOString()
            },
            {
              id: generateId(),
              title: 'Google Drive',
              url: 'https://www.drive.google.com',
              favIconUrl: 'https://www.drive.google.com/favicon.ico',
              addedAt: new Date().toISOString()
            },
            {
              id: generateId(),
              title: 'Slack',
              url: 'https://www.slack.com',
              favIconUrl: 'https://www.slack.com/favicon.ico',
              addedAt: new Date().toISOString()
            }
          ]
        }
      ];
      
      await chrome.storage.sync.set({ tabGroups: defaultGroups });
      console.log('Default tab groups initialized');
    }
  } catch (error) {
    console.error('Error initializing tab groups:', error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureTab') {
    captureVisibleTab()
      .then(dataUrl => {
        sendResponse({ success: true, dataUrl });
      })
      .catch(error => {
        console.error('Error capturing tab:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    return true; 
  }
});

async function captureVisibleTab() {
  try {
    return await chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 50 });
  } catch (error) {
    console.error('Error capturing tab:', error);
    throw error;
  }
} 
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}