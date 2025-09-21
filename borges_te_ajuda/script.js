document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const finger = document.getElementById("finger");
  const app = document.getElementById("app");
  const menuItems = document.querySelectorAll(".menu-item");
  const panels = document.querySelectorAll(".panel");
  const hamburger = document.querySelector(".hamburger");
  const menu = document.querySelector(".menu");

  const enter = () => {
    splash.style.transition = "opacity .45s ease, transform .45s ease";
    splash.style.opacity = 0;
    splash.style.transform = "scale(.98)";
    setTimeout(() => {
      splash.classList.add("hidden");
      app.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 420);
  };
  finger.addEventListener("click", enter);
  finger.addEventListener("touchstart", e => { e.preventDefault(); enter(); }, { passive: false });

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      const exp = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!exp));
      menu.style.display = exp ? "none" : "flex";
    });
  }

  menuItems.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const target = btn.dataset.target;
      if (!target) return;
      panels.forEach(p => p.classList.add("hidden"));
      const panel = document.getElementById(target);
      if (panel) panel.classList.remove("hidden");
      menuItems.forEach(m => m.classList.remove("active"));
      btn.classList.add("active");
      if (window.innerWidth <= 880 && menu) {
        menu.style.display = "none";
        hamburger.setAttribute("aria-expanded", "false");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    const units = ["KB","MB","GB"];
    let i = -1;
    do { bytes /= 1024; i++; } while (bytes >= 1024 && i < units.length - 1);
    return bytes.toFixed((i<1)?0:1) + " " + units[i];
  }

  let currentDownload = null;
  function showFloatingDownload({fileName, sizeBytes}) {
    if (currentDownload) { currentDownload.remove(); currentDownload = null; }
    const wrap = document.createElement("div");
    wrap.className = "floating-download";
    wrap.innerHTML = `
      <div class="f-d-row">
        <div class="f-name">${fileName}</div>
        <button class="f-close" title="Fechar" aria-label="Fechar" disabled>✕</button>
      </div>
      <div class="f-size">${formatBytes(sizeBytes)}</div>
      <div class="f-bar-outer"><div class="f-bar-inner"></div></div>
      <div class="f-meta"><div class="f-percent">0%</div><div class="f-status">Iniciando...</div></div>
    `;
    document.body.appendChild(wrap);
    currentDownload = wrap;
    return wrap;
  }

  function simulateDownload({fileName, type}) {
    let sizeBytes;
    if (type === "rar" || type === "zip") {
      const mb = Math.floor(Math.random() * 80) + 12;
      sizeBytes = mb * 1024 * 1024;
    } else {
      const kb = Math.floor(Math.random() * 48) + 2;
      sizeBytes = kb * 1024;
    }

    const hud = showFloatingDownload({fileName, sizeBytes});
    const bar = hud.querySelector(".f-bar-inner");
    const percentEl = hud.querySelector(".f-percent");
    const statusEl = hud.querySelector(".f-status");
    const closeBtn = hud.querySelector(".f-close");
    closeBtn.disabled = true;

    const duration = Math.min(Math.max(1200, Math.round(sizeBytes / 1024) * 30), 20000);
    const tick = 60;
    const steps = Math.ceil(duration / tick);
    let step = 0;

    statusEl.textContent = "Baixando...";
    bar.style.width = "0%";
    percentEl.textContent = "0%";

    const interval = setInterval(() => {
      step++;
      const t = step / steps;
      const eased = Math.pow(t, 0.9);
      const pct = Math.min(100, Math.round(eased * 100));
      bar.style.width = pct + "%";
      percentEl.textContent = pct + "%";

      if (pct >= 100 || step >= steps) {
        clearInterval(interval);
        bar.style.width = "100%";
        percentEl.textContent = "100%";
        statusEl.textContent = "Concluído";

        const content = (type === "rar" || type === "zip")
          ? `Simulação de arquivo binário: ${fileName}\nTamanho simulado: ${formatBytes(sizeBytes)}\nGerado: ${new Date().toLocaleString()}`
          : `Simulação de script: ${fileName}\nInstruções: leia o README.\nGerado: ${new Date().toLocaleString()}`;
        const mime = (type === "rar" || type === "zip") ? "application/octet-stream" : "text/plain;charset=utf-8";
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);

        closeBtn.disabled = false;
        closeBtn.addEventListener("click", () => { hud.remove(); if (currentDownload === hud) currentDownload = null; });

        setTimeout(() => {
          hud.style.transition = "opacity .4s, transform .4s";
          hud.style.opacity = 0;
          hud.style.transform = "translateY(10px)";
          setTimeout(() => { hud.remove(); if (currentDownload === hud) currentDownload = null; }, 420);
        }, 1400);
      }
    }, tick);
  }

  document.querySelectorAll(".opt-btn, .dl-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const file = btn.dataset.file || "file.txt";
      const type = btn.dataset.type || (file.endsWith(".zip") ? "zip" : file.endsWith(".rar") ? "rar" : "txt");
      simulateDownload({fileName: file, type});
    });
  });

  document.querySelectorAll(".exp-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".sub-menu").forEach(sm => sm.classList.add("hidden"));
      const id = btn.dataset.menu;
      const menuEl = document.getElementById(id);
      if (menuEl) menuEl.classList.remove("hidden");
      menuEl?.scrollIntoView({behavior:"smooth", block:"center"});
    });
  });

  function toast(msg){
    const t = document.createElement("div");
    t.className = "bt-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(()=> t.style.opacity = '0', 2200);
    setTimeout(()=> t.remove(), 2600);
  }
});
