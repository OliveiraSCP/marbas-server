const log = document.getElementById('log');

function addLog(message) {
    const p = document.createElement('p');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

// Simulação de download 2
document.getElementById('download2').addEventListener('click', () => {
    addLog('Iniciando Download 2...');
    setTimeout(() => addLog('Download 2 concluído!'), 2000);
});

// Log para Download 1
document.getElementById('download1').addEventListener('click', () => {
    addLog('Preparando CleanPC BORGES.bat para download...');
    setTimeout(() => addLog('Download concluído!'), 2000);
});
