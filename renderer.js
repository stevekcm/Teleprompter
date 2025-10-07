document.getElementById('closeBtn').addEventListener('click', () => {
  if (window.electronAPI && window.electronAPI.closeWindow) {
    window.electronAPI.closeWindow();
  } else {
    window.close();
  }
});

document.addEventListener('keydown', (e) => {
  if (window.electronAPI && window.electronAPI.navigateSlide) {
    switch(e.key) {
      case 'ArrowLeft':
        window.electronAPI.navigateSlide('prev');
        break;
      case 'ArrowRight':
        window.electronAPI.navigateSlide('next');
        break;
      case ' ':
        window.electronAPI.navigateSlide('next');
        break;
    }
  }
});

console.log('✅ Renderer process loaded');