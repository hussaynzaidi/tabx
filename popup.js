document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const createGroupBtn = document.getElementById('createGroup');
  const pinnedGroupsContainer = document.getElementById('pinnedGroups');
  const allGroupsContainer = document.getElementById('allGroups');
  const groupModal = document.getElementById('groupModal');
  const groupForm = document.getElementById('groupForm');
  const modalTitle = document.getElementById('modalTitle');
  const groupNameInput = document.getElementById('groupName');
  const groupColorInput = document.getElementById('groupColor');
  const isPinnedInput = document.getElementById('isPinned');
  const cancelBtn = document.getElementById('cancelBtn');
  const closeModalBtn = document.querySelector('.close');
  const groupSelect = document.getElementById('groupSelect');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  // DOM Elements for Add Tab Modal
  const addTabModal = document.getElementById('addTabModal');
  const addCurrentTabModalBtn = document.getElementById('addCurrentTabModal');
  const tabUrlInput = document.getElementById('tabUrl');
  const addUrlTabBtn = document.getElementById('addUrlTab');
  const cancelAddTabBtn = document.getElementById('cancelAddTab');

  // State
  let tabGroups = [];
  let currentEditingGroupId = null;
  // Default groups
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
        favIconUrl: 'https://www.instagram.com/favicon.ico',
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
          favIconUrl: '   https://ssl.gstatic.com/images/branding/product/2x/hh_gmail_16dp.png',
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

  // Initialize
  init();

  // Event Listeners
  createGroupBtn.addEventListener('click', () => openCreateGroupModal());
  closeModalBtn.addEventListener('click', () => closeModal());
  cancelBtn.addEventListener('click', () => closeModal());
  groupForm.addEventListener('submit', handleGroupFormSubmit);
  addCurrentTabModalBtn.addEventListener('click',() => addCurrentTabToGroupModal(currentEditingGroupId));

  // Event Listeners for Add Tab Modal
 addUrlTabBtn.addEventListener('click', () => addTabFromUrl(currentEditingGroupId));
  cancelAddTabBtn.addEventListener('click', () => closeAddTabModal());
  // Functions
  async function init() {
    await loadTabGroups();
    renderGroups();
  }
  async function addTabFromUrl(groupId) {
    const url = tabUrlInput.value.trim();
    if (!url) {
      showToast('Please enter a valid URL');
      return;
    }

    try {
      const groupIndex = tabGroups.findIndex(g => g.id === groupId);
      if (groupIndex === -1) {
        showToast('Group not found');
        return;
      }

      // Check if tab already exists in the group
      const tabExists = tabGroups[groupIndex].tabs.some(tab => tab.url === url);
      if (tabExists) {
        showToast('Tab already exists in this group');
        return;
      }

      // Deduce title from URL
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      const pathSegments = urlObj.pathname.split('/').filter(segment => segment);
      const pathTitle = pathSegments.map(segment => segment.replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase())).join(' - ');
      const title = pathTitle ? `${domain} - ${pathTitle}` : domain;

      // Add tab to group
      const tabInfo = {
        id: generateId(),
        title,
        url,
        favIconUrl: 'images/place.png', // Use default favicon
        addedAt: new Date().toISOString()
      };

      tabGroups[groupIndex].tabs.push(tabInfo);
      await saveTabGroups();
      renderGroups();
      closeAddTabModal();
      showToast('Tab added to group successfully');
    } catch (error) {
      console.error('Error adding tab:', error);
      showToast('Error adding tab');
    }
  }
  async function loadTabGroups() {
    try {
      const result = await chrome.storage.sync.get('tabGroups');
      if (result.tabGroups) {
        tabGroups = result.tabGroups;
      } else {
        // Initialize with default groups if none exist
        tabGroups = defaultGroups;
        await saveTabGroups();
      }
    } catch (error) {
      console.error('Error loading tab groups:', error);
      showToast('Error loading tab groups');
    }
  }

  async function saveTabGroups() {
    try {
      await chrome.storage.sync.set({ tabGroups });
    } catch (error) {
      console.error('Error saving tab groups:', error);
      showToast('Error saving tab groups');
    }
  }

  function renderGroups() {
    // Clear containers
    pinnedGroupsContainer.innerHTML = '';
    allGroupsContainer.innerHTML = '';

    const pinnedGroups = tabGroups.filter(group => group.isPinned);
    const unpinnedGroups = tabGroups.filter(group => !group.isPinned);

    // Render pinned groups
    if (pinnedGroups.length === 0) {
      pinnedGroupsContainer.innerHTML = createEmptyState('No pinned groups');
    } else {
      pinnedGroups.forEach(group => {
        pinnedGroupsContainer.appendChild(createGroupElement(group));
      });
    }

    // Render unpinned groups
    if (unpinnedGroups.length === 0) {
      allGroupsContainer.innerHTML = createEmptyState('No groups created yet');
    } else {
      unpinnedGroups.forEach(group => {
        allGroupsContainer.appendChild(createGroupElement(group));
      });
    }

    // Add drag and drop event listeners
    setupDragAndDrop();
  }

  function createEmptyState(message) {
    return `
      <div class="empty-state">
        <i class="fas fa-folder-open"></i>
        <p>${message}</p>
      </div>
    `;
  }

  function createGroupElement(group) {
    const groupElement = document.createElement('div');
    groupElement.className = 'group-card';
    groupElement.dataset.id = group.id;
    groupElement.style.borderLeftColor = group.color;
    groupElement.draggable = true;

    const tabsHtml = group.tabs.length > 0 
      ? group.tabs.map(tab => createTabElement(tab, group.id)).join('')
      : '<div class="empty-state"><p>No tabs in this group</p></div>';

    groupElement.innerHTML = `
      <div class="group-header">
        <div class="group-title">
          <span class="color-indicator" style="background-color: ${group.color}"></span>
          <span>${group.name}</span>
          <span class="tab-count">(${group.tabs.length})</span>
        </div>
        <div class="group-actions">
          ${group.tabs.length > 0 ? 
            `
            </button>
            <button class="group-action-btn restore-all" title="Open all tabs">
              <i class="fas fa-external-link-alt"></i>
            </button>
            <button class="group-action-btn close-all" title="Close all tabs">
              <i class="fas fa-times-circle"></i>
            </button>` : ''}
            <button class="group-action-btn add-new" title="Add a new tab">
              <i class="fas fa-plus"></i>
          <button class="group-action-btn edit" title="Edit group">
            <i class="fas fa-edit"></i>
          </button>
          <button class="group-action-btn delete" title="Delete group">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="tabs-container">
        ${tabsHtml}
      </div>
    `;

    // Add event listeners
    const editBtn = groupElement.querySelector('.edit');
    const deleteBtn = groupElement.querySelector('.delete');
    const restoreAllBtn = groupElement.querySelector('.restore-all');
    const closeAllBtn = groupElement.querySelector('.close-all');
    const addNewBtn = groupElement.querySelector('.add-new');

    editBtn.addEventListener('click', () => openEditGroupModal(group));
    deleteBtn.addEventListener('click', () => deleteGroup(group.id));
    addNewBtn.addEventListener('click', () => openAddTabModal(group.id));

    if (restoreAllBtn) {
      restoreAllBtn.addEventListener('click', () => restoreAllTabs(group.id));
    }

    if (closeAllBtn) {
      closeAllBtn.addEventListener('click', () => closeAllTabs(group.id));
    }

    const tabElements = groupElement.querySelectorAll('.tab-item');
    tabElements.forEach(tabElement => {
      const tabId = tabElement.dataset.id;
      const openTabBtn = tabElement.querySelector('.tab-open');
      const removeTabBtn = tabElement.querySelector('.tab-remove');

      if (openTabBtn) {
        openTabBtn.addEventListener('click', () => openTab(group.id, tabId));
      }

      if (removeTabBtn) {
        removeTabBtn.addEventListener('click', () => removeTab(group.id, tabId));
      }
    });

    return groupElement;
  }

  function createTabElement(tab, groupId) {
    return `
      <div class="tab-item" data-id="${tab.id}">
        <img class="tab-favicon" src="${tab.favIconUrl || 'images/icon48.png'}" alt="Favicon">
        <span class="tab-title" title="${tab.title}">${tab.title}</span>
        <button class="tab-open" title="Open tab">
          <i class="fas fa-external-link-alt"></i>
        </button>
        <button class="tab-remove" title="Remove from group">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  }

  function setupDragAndDrop() {
    const groupCards = document.querySelectorAll('.group-card');
    const dropZones = [pinnedGroupsContainer, allGroupsContainer];

    groupCards.forEach(card => {
      card.addEventListener('dragstart', handleDragStart);
      card.addEventListener('dragend', handleDragEnd);
    });

    dropZones.forEach(zone => {
      zone.addEventListener('dragover', handleDragOver);
      zone.addEventListener('dragenter', handleDragEnter);
      zone.addEventListener('dragleave', handleDragLeave);
      zone.addEventListener('drop', handleDrop);
    });
  }

  function handleDragStart(e) {
    draggedItem = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
  }

  function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDragEnter(e) {
    e.preventDefault();
    if (e.target.classList.contains('groups-container')) {
      e.target.classList.add('drag-over');
    }
  }

  function handleDragLeave(e) {
    if (e.target.classList.contains('groups-container')) {
      e.target.classList.remove('drag-over');
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    const container = e.target.closest('.groups-container');
    if (!container) return;

    container.classList.remove('drag-over');
    const groupId = e.dataTransfer.getData('text/plain');
    const groupIndex = tabGroups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) return;

    // Update pinned status based on which container it was dropped into
    const isPinned = container.id === 'pinnedGroups';
    tabGroups[groupIndex].isPinned = isPinned;
    
    saveTabGroups().then(() => {
      renderGroups();
    });
  }

  function populateGroupSelect() {
    // Clear existing options except the default one
    while (groupSelect.options.length > 1) {
      groupSelect.remove(1);
    }

    // Add options for each group
    tabGroups.forEach(group => {
      const option = document.createElement('option');
      option.value = group.id;
      option.textContent = group.name;
      groupSelect.appendChild(option);
    });
  }

  function openCreateGroupModal() {
    modalTitle.textContent = 'Create New Group';
    groupNameInput.value = '';
    groupColorInput.value = '#4285F4';
    isPinnedInput.checked = false;
    currentEditingGroupId = null;
    groupModal.classList.remove('hidden');
  }

  function openEditGroupModal(group) {
    modalTitle.textContent = 'Edit Group';
    groupNameInput.value = group.name;
    groupColorInput.value = group.color;
    isPinnedInput.checked = group.isPinned;
    currentEditingGroupId = group.id;
    groupModal.classList.remove('hidden');
  }

  function closeModal() {
    groupModal.classList.add('hidden');
  }

  async function handleGroupFormSubmit(e) {
    e.preventDefault();
    
    const name = groupNameInput.value.trim();
    const color = groupColorInput.value;
    const isPinned = isPinnedInput.checked;
    
    if (!name) {
      showToast('Group name cannot be empty');
      return;
    }
    
    if (currentEditingGroupId) {
      // Edit existing group
      const groupIndex = tabGroups.findIndex(g => g.id === currentEditingGroupId);
      if (groupIndex !== -1) {
        tabGroups[groupIndex].name = name;
        tabGroups[groupIndex].color = color;
        tabGroups[groupIndex].isPinned = isPinned;
      }
    } else {
      // Create new group
      const newGroup = {
        id: generateId(),
        name,
        color,
        isPinned,
        tabs: []
      };
      tabGroups.push(newGroup);
    }
    
    await saveTabGroups();
    closeModal();
    renderGroups();
    showToast(currentEditingGroupId ? 'Group updated successfully' : 'Group created successfully');
  }

  async function deleteGroup(groupId) {
    if (!confirm('Are you sure you want to delete this group?')) {
      return;
    }
    
    tabGroups = tabGroups.filter(group => group.id !== groupId);
    await saveTabGroups();
    renderGroups();
    
    showToast('Group deleted successfully');
  }

  async function addCurrentTabToGroup() {
    const selectedGroupId = groupSelect.value;
    
    if (!selectedGroupId) {
      showToast('Please select a group');
      return;
    }
    
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!activeTab) {
        showToast('No active tab found');
        return;
      }
      
      const groupIndex = tabGroups.findIndex(g => g.id === selectedGroupId);
      
      if (groupIndex === -1) {
        showToast('Selected group not found');
        return;
      }
      
      // Check if tab already exists in the group
      const tabExists = tabGroups[groupIndex].tabs.some(tab => tab.url === activeTab.url);
      
      if (tabExists) {
        showToast('Tab already exists in this group');
        return;
      }
      
      // Add tab to group
      const tabInfo = {
        id: generateId(),
        title: activeTab.title,
        url: activeTab.url,
        favIconUrl: activeTab.favIconUrl || '',
        addedAt: new Date().toISOString()
      };
      
      tabGroups[groupIndex].tabs.push(tabInfo);
      await saveTabGroups();
      renderGroups();
      
      showToast('Tab added to group successfully');
    } catch (error) {
      console.error('Error adding tab to group:', error);
      showToast('Error adding tab to group');
    }
  }

  async function addCurrentTabToGroupModal(groupId) {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!activeTab) {
        showToast('No active tab found');
        return;
      }
      
      const groupIndex = tabGroups.findIndex(g => g.id === groupId);
      
      if (groupIndex === -1) {
        showToast('Selected group not found');
        return;
      }
      
      // Check if tab already exists in the group
      const tabExists = tabGroups[groupIndex].tabs.some(tab => tab.url === activeTab.url);
      
      if (tabExists) {
        showToast('Tab already exists in this group');
        return;
      }
      
      // Add tab to group
      const tabInfo = {
        id: generateId(),
        title: activeTab.title,
        url: activeTab.url,
        favIconUrl: activeTab.favIconUrl || '',
        addedAt: new Date().toISOString()
      };
      
      tabGroups[groupIndex].tabs.push(tabInfo);
      await saveTabGroups();
      renderGroups();
      
      showToast('Tab added to group successfully');
      closeAddTabModal();
    } catch (error) {
      console.error('Error adding tab to group:', error);
      showToast('Error adding tab to group');
    }
  }
  function openAddTabModal(groupId){
    addTabModal.classList.remove('hidden');
    currentEditingGroupId = groupId;
  }
  function closeAddTabModal(){
    addTabModal.classList.add('hidden');
  }
  async function removeTab(groupId, tabId) {
    const groupIndex = tabGroups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) return;
    
    tabGroups[groupIndex].tabs = tabGroups[groupIndex].tabs.filter(tab => tab.id !== tabId);
    await saveTabGroups();
    renderGroups();
    
    showToast('Tab removed from group');
  }

  async function openTab(groupId, tabId) {
    const group = tabGroups.find(g => g.id === groupId);
    
    if (!group) return;
    
    const tab = group.tabs.find(t => t.id === tabId);
    
    if (!tab) return;
    
    try {
      await chrome.tabs.create({ url: tab.url });
    } catch (error) {
      console.error('Error opening tab:', error);
      showToast('Error opening tab');
    }
  }

  async function restoreAllTabs(groupId) {
    const group = tabGroups.find(g => g.id === groupId);
    
    if (!group || group.tabs.length === 0) return;
    
    try {
      //  for (const tab of group.tabs) {
     //   await chrome.tabs.create({ url: tab.url });
      //}
      //showToast(`Opened all tabs from "${group.name}"`);
      await Promise.all(group.tabs.map(tab => chrome.tabs.create({ url: tab.url })));
        showToast(`Opened all tabs from "${group.name}"`);
    } catch (error) {
      console.error('Error restoring tabs:', error);
      showToast('Error opening tabs');
    }
  }

  async function closeAllTabs(groupId) {
    const group = tabGroups.find(g => g.id === groupId);
    
    if (!group || group.tabs.length === 0) return;
    
    if (!confirm(`Are you sure you want to close all tabs from "${group.name}"?`)) {
      return;
    }
    
    try {
      const openTabs = await chrome.tabs.query({});
      for(const tab of group.tabs){
        const openTab = openTabs.find(openTab => openTab.url === tab.url);
        if(openTab){
          await chrome.tabs.remove(openTab.id);
        }
      }
      showToast(`Closed all tabs from "${group.name}"`);
   
    } catch (error) {
      console.error('Error closing tabs:', error);
      showToast('Error closing tabs');
    }
  }

  function showToast(message, duration = 3000) {
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
}); 
