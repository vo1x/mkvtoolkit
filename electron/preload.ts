import { ipcRenderer, contextBridge } from 'electron';

function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
    return null;
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (parent && Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
    return null;
  }
};

function useLoading() {
  const styleContent = `
  .sk-chase {
  
  }

  .sk-chase-dot {
      width: 40px;
      height: 40px;
      position: absolute;
      margin: auto;
      animation: sk-chase-dot 2.0s infinite ease-in-out both;
  }

  .sk-chase-dot:before {
    content: '';
    display: block;
    width: 25%;
    height: 25%;
    background-color: #fff;
    border-radius: 100%;
    animation: sk-chase-dot-before 2.0s infinite ease-in-out both; 
  }

  .sk-chase-dot:nth-child(1) { animation-delay: -1.1s; }
  .sk-chase-dot:nth-child(2) { animation-delay: -1.0s; }
  .sk-chase-dot:nth-child(3) { animation-delay: -0.9s; }
  .sk-chase-dot:nth-child(4) { animation-delay: -0.8s; }
  .sk-chase-dot:nth-child(5) { animation-delay: -0.7s; }
  .sk-chase-dot:nth-child(6) { animation-delay: -0.6s; }
  .sk-chase-dot:nth-child(1):before { animation-delay: -1.1s; }
  .sk-chase-dot:nth-child(2):before { animation-delay: -1.0s; }
  .sk-chase-dot:nth-child(3):before { animation-delay: -0.9s; }
  .sk-chase-dot:nth-child(4):before { animation-delay: -0.8s; }
  .sk-chase-dot:nth-child(5):before { animation-delay: -0.7s; }
  .sk-chase-dot:nth-child(6):before { animation-delay: -0.6s; }
  
  @keyframes sk-chase {
    100% { transform: rotate(360deg); } 
  }
  
  @keyframes sk-chase-dot {
    80%, 100% { transform: rotate(360deg); } 
  }

  @keyframes sk-chase-dot-before {
    50% {
      transform: scale(0.4); 
    } 100%, 0% {
      transform: scale(1.0); 
    } 
  }

  .app-loading-wrap {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #282c34;
    z-index: 9;
  }
  `;

  const htmlContent = `
    <div class="sk-chase">
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
      <div class="sk-chase-dot"></div>
    </div>
  `;

  const oStyle = document.createElement('style');
  const oDiv = document.createElement('div');

  oStyle.id = 'app-loading-style';
  oStyle.innerHTML = styleContent;
  oDiv.id = 'loading-to-remove';
  oDiv.className = 'app-loading-wrap';
  oDiv.innerHTML = htmlContent;

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    }
  };
}

const { appendLoading, removeLoading } = useLoading();

domReady().then(appendLoading);

declare global {
  interface Window {
    Main: typeof api;
    ipcRenderer: typeof ipcRenderer;
  }
}

const api = {
  sendMessage: (message: string) => {
    ipcRenderer.send('message', message);
  },
  Minimize: () => {
    ipcRenderer.send('minimize');
  },
  Maximize: () => {
    ipcRenderer.send('maximize');
  },
  Close: () => {
    ipcRenderer.send('close');
  },
  removeLoading: () => {
    removeLoading();
  },

  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  extractMediaInfo: (filePath: string) => ipcRenderer.invoke('extract-media-info', filePath),
  addProps: ({ filePath, muxedBy, telegramChannel }: { filePath: string; muxedBy: string; telegramChannel: string }) =>
    ipcRenderer.invoke('add-props', { filePath, muxedBy, telegramChannel }),
  renameTracks: ({ filePath, tracks }: { filePath: any; tracks: any }) =>
    ipcRenderer.invoke('rename-tracks', { filePath, tracks }),
  renameFile: ({ oldPath, newName }: { oldPath: string; newName: string }) =>
    ipcRenderer.invoke('rename-file', { oldPath, newName })
};

contextBridge.exposeInMainWorld('Main', api);
