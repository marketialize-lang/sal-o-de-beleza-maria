if (!window.__maryPortfolioEffectsLoaded) {
  window.__maryPortfolioEffectsLoaded = true;

  const referenceLabels = document.querySelectorAll(
    ".tons__barra-reflexo, [data-campo=\"reflexo\"]",
  );
  const syncReferenceLabel = () => {
    referenceLabels.forEach((label) => {
      if (label.textContent.trim() !== "Referência visual do portfólio") {
        label.textContent = "Referência visual do portfólio";
      }
    });
  };
  syncReferenceLabel();
  new MutationObserver(syncReferenceLabel).observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  document.querySelectorAll(".mary-ba").forEach((frame) => {
    if (frame.dataset.effectReady) return;
    frame.dataset.effectReady = "true";

    const before = frame.querySelector(".mary-ba__before");
    const after = frame.querySelector(".mary-ba__after");
    const handle = frame.querySelector(".mary-ba__handle");
    const lens = frame.querySelector(".mary-ba__loupe");
    const lensInner = frame.querySelector(".mary-ba__lz");
    const toggle = frame.querySelector(".mary-ba__toggle");
    if (!before || !after || !handle || !lens || !lensInner || !toggle) return;

    lensInner.append(before.cloneNode(true), after.cloneNode(true));
    const zoom = Number(frame.dataset.zoom) || 2.2;
    let split = 50;
    let dragging = false;
    let lensEnabled = true;

    const moveLens = (event) => {
      const bounds = frame.getBoundingClientRect();
      const x = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left));
      const y = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top));
      const radius = lens.offsetWidth / 2;
      lens.style.left = `${x}px`;
      lens.style.top = `${y}px`;
      lensInner.style.width = `${bounds.width}px`;
      lensInner.style.height = `${bounds.height}px`;
      lensInner.style.transform = `translate(${radius - x * zoom}px, ${radius - y * zoom}px) scale(${zoom})`;
      if (lensEnabled && event.pointerType === "mouse") lens.classList.add("is-on");
    };
    const setSplit = (clientX) => {
      const bounds = frame.getBoundingClientRect();
      split = Math.max(0, Math.min(100, ((clientX - bounds.left) / bounds.width) * 100));
      frame.style.setProperty("--mary-ba-x", `${split}%`);
      handle.setAttribute("aria-valuenow", String(Math.round(split)));
    };

    frame.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest(".mary-ba__toggle")) return;
      dragging = true;
      frame.classList.add("is-drag");
      frame.setPointerCapture(event.pointerId);
      setSplit(event.clientX);
      moveLens(event);
    });
    frame.addEventListener("pointermove", (event) => {
      moveLens(event);
      if (dragging) setSplit(event.clientX);
    });
    const stopDrag = () => {
      dragging = false;
      frame.classList.remove("is-drag");
    };
    frame.addEventListener("pointerup", stopDrag);
    frame.addEventListener("pointercancel", stopDrag);
    frame.addEventListener("pointerleave", () => lens.classList.remove("is-on"));
    handle.addEventListener("keydown", (event) => {
      const step = event.shiftKey ? 10 : 2;
      if (event.key === "ArrowLeft" || event.key === "ArrowDown") split -= step;
      else if (event.key === "ArrowRight" || event.key === "ArrowUp") split += step;
      else if (event.key === "Home") split = 0;
      else if (event.key === "End") split = 100;
      else return;
      event.preventDefault();
      split = Math.max(0, Math.min(100, split));
      frame.style.setProperty("--mary-ba-x", `${split}%`);
      handle.setAttribute("aria-valuenow", String(Math.round(split)));
    });
    toggle.addEventListener("click", () => {
      lensEnabled = !lensEnabled;
      toggle.setAttribute("aria-pressed", String(lensEnabled));
      toggle.querySelector("span").textContent = lensEnabled ? "Lupa ligada" : "Lupa desligada";
      if (!lensEnabled) lens.classList.remove("is-on");
    });
  });

  document.querySelectorAll(".mary-index").forEach((root) => {
    if (root.dataset.effectReady) return;
    root.dataset.effectReady = "true";

    const rows = Array.from(root.querySelectorAll(".mary-index__row"));
    const list = root.querySelector(".mary-index__list");
    const float = root.querySelector(".mary-index__float");
    const canvas = root.querySelector(".mary-index__canvas");
    const tag = root.querySelector(".mary-index__tag");
    const number = root.querySelector(".mary-index__big span");
    const context = canvas?.getContext("2d");
    const touchMode = navigator.maxTouchPoints > 0 || window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (!rows.length || !list || !float || !canvas || !tag || !context) return;

    root.classList.add("is-on");
    if (touchMode) root.classList.add("is-touch");
    const images = rows.map((row) => {
      const image = new Image();
      image.decoding = "async";
      image.src = row.dataset.img;
      image.addEventListener("load", draw);
      return image;
    });
    let active = -1;
    let targetX = 0, targetY = 0, x = 0, y = 0, velocity = 0, raf = 0;

    const resize = () => {
      const rect = float.getBoundingClientRect();
      const scale = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(rect.width * scale);
      canvas.height = Math.round(rect.height * scale);
      draw();
    };
    function draw() {
      if (!context || !canvas.width || active < 0) return;
      const image = images[active];
      if (!image.complete || !image.naturalWidth) return;
      const width = canvas.width, height = canvas.height;
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const imageWidth = image.naturalWidth * scale, imageHeight = image.naturalHeight * scale;
      const left = (width - imageWidth) / 2, top = (height - imageHeight) / 2;
      context.clearRect(0, 0, width, height);
      const bands = 18;
      for (let i = 0; i < bands; i += 1) {
        const y0 = Math.floor((height * i) / bands);
        const y1 = Math.ceil((height * (i + 1)) / bands);
        const wave = Math.sin((Math.PI * (i + 0.5)) / bands);
        const shift = Math.max(-width * 0.1, Math.min(width * 0.1, velocity * wave * 0.035));
        context.drawImage(image, 0, (y0 - top) / scale, image.naturalWidth, (y1 - y0) / scale, left + shift, y0, imageWidth, y1 - y0);
      }
    }
    const setActive = (index, pointerX, pointerY) => {
      if (index < 0 || index >= rows.length) return;
      active = index;
      root.classList.add("is-card", "is-hot");
      rows.forEach((row, rowIndex) => row.classList.toggle("is-on", rowIndex === index));
      tag.textContent = rows[index].dataset.tag || "";
      if (number) number.textContent = rows[index].querySelector(".mary-index__no")?.textContent || "";
      const bounds = root.getBoundingClientRect();
      targetX = Math.max(float.offsetWidth / 2, Math.min(bounds.width - float.offsetWidth / 2, pointerX - bounds.left));
      targetY = Math.max(float.offsetHeight / 2, Math.min(bounds.height - float.offsetHeight / 2, pointerY - bounds.top));
      if (!raf) raf = requestAnimationFrame(animate);
      draw();
    };
    function animate() {
      const oldX = x;
      x += (targetX - x) * 0.22;
      y += (targetY - y) * 0.22;
      velocity = x - oldX;
      if (!touchMode) {
        float.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${Math.max(-7, Math.min(7, velocity * 0.08))}deg) scale(${1 + Math.min(0.08, Math.abs(velocity) * 0.003)})`;
      }
      root.style.setProperty("--mary-index-x", `${(x / Math.max(1, root.clientWidth)) * 100}%`);
      root.style.setProperty("--mary-index-y", `${(y / Math.max(1, root.clientHeight)) * 100}%`);
      draw();
      if (Math.abs(targetX - x) > 0.5 || Math.abs(targetY - y) > 0.5 || Math.abs(velocity) > 0.5) {
        raf = requestAnimationFrame(animate);
      } else {
        velocity = 0;
        raf = 0;
      }
    }
    const hide = () => {
      root.classList.remove("is-card", "is-hot");
      rows.forEach((row) => row.classList.remove("is-on"));
    };
    root.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const row = event.target.closest(".mary-index__row");
      setActive(row ? rows.indexOf(row) : -1, event.clientX, event.clientY);
      if (!row) hide();
    });
    root.addEventListener("click", (event) => {
      if (!touchMode) return;
      const row = event.target.closest(".mary-index__row");
      if (!row) return;
      const bounds = root.getBoundingClientRect();
      setActive(rows.indexOf(row), bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
      row.append(float);
    });
    root.addEventListener("pointerleave", () => {
      if (!touchMode) hide();
    });
    rows.forEach((row, index) => {
      row.querySelector("button")?.addEventListener("focus", () => {
        const rect = row.getBoundingClientRect();
        setActive(index, rect.left + rect.width * 0.72, rect.top + rect.height / 2);
      });
      row.querySelector("button")?.addEventListener("blur", hide);
    });
    new ResizeObserver(resize).observe(float);
    resize();
  });
}
