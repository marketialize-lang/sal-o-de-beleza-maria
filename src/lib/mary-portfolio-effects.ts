type PointerPoint = [number, number];

function initBeforeAfter(root: HTMLElement, signal: AbortSignal): () => void {
  const frame = root;
  const before = root.querySelector<HTMLElement>(".mary-ba__before");
  const after = root.querySelector<HTMLElement>(".mary-ba__after");
  const handle = root.querySelector<HTMLElement>(".mary-ba__handle");
  const lens = root.querySelector<HTMLElement>(".mary-ba__loupe");
  const lensInner = root.querySelector<HTMLElement>(".mary-ba__lz");
  const toggle = root.querySelector<HTMLButtonElement>(".mary-ba__toggle");
  if (!before || !after || !handle || !lens || !lensInner || !toggle) return () => {};

  lensInner.append(before.cloneNode(true), after.cloneNode(true));
  const zoom = Number(root.dataset.zoom) || 2.2;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const points: PointerPoint[] = [[.4,.2],[.62,.34],[.3,.37],[.76,.46],[.25,.55],[.16,.27],[.7,.62]];
  let x = .5, targetX = .5, lensX = 0, lensY = 0, targetLensX = 0, targetLensY = 0;
  let shown = false, dragging = false, lensEnabled = true, clock = 0, lastFrame = 0, raf = 0, visible = false, idleUntil = 0, pointIndex = 0, nextPoint = 0;

  const paint = () => {
    root.style.setProperty("--mary-ba-x", `${(x * 100).toFixed(2)}%`);
    handle.setAttribute("aria-valuenow", String(Math.round(x * 100)));
    const width = frame.clientWidth, height = frame.clientHeight, radius = lens.offsetWidth / 2;
    lensInner.style.width = `${width}px`;
    lensInner.style.height = `${height}px`;
    lens.style.left = `${lensX}px`;
    lens.style.top = `${lensY}px`;
    lensInner.style.transform = `translate(${radius - lensX * zoom}px,${radius - lensY * zoom}px) scale(${zoom})`;
  };
  const kick = () => { if (visible && !raf) raf = requestAnimationFrame(tick); };
  const wake = () => { idleUntil = clock + 6; kick(); };
  const setFromPointer = (event: PointerEvent) => {
    const bounds = frame.getBoundingClientRect();
    targetX = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
  };
  const tick = (time: number) => {
    raf = 0;
    if (!visible) { lastFrame = 0; return; }
    const dt = lastFrame ? Math.max(.004, Math.min(.05, (time - lastFrame) / 1000)) : 1 / 60;
    lastFrame = time;
    clock += dt;
    if (!reduced && clock > idleUntil && !dragging) {
      targetX = .5 + Math.sin(clock * .7) * .34;
      if (clock > nextPoint) { pointIndex = (pointIndex + 1) % points.length; nextPoint = clock + 1.3; }
      targetLensX = frame.clientWidth * points[pointIndex][0];
      targetLensY = frame.clientHeight * points[pointIndex][1];
      if (!shown && lensEnabled) { shown = true; lens.classList.add("is-on"); }
    }
    x += (targetX - x) * Math.min(1, dt * (dragging ? 30 : 6));
    lensX += (targetLensX - lensX) * Math.min(1, dt * 9);
    lensY += (targetLensY - lensY) * Math.min(1, dt * 9);
    paint();
    const settled = Math.abs(targetX - x) < .0005 && Math.abs(targetLensX - lensX) < .3 && Math.abs(targetLensY - lensY) < .3;
    if ((!reduced && !dragging) || !settled) raf = requestAnimationFrame(tick);
    else lastFrame = 0;
  };

  frame.addEventListener("pointerdown", (event) => {
    if (event.button > 0 || (event.target instanceof Element && event.target.closest(".mary-ba__toggle"))) return;
    dragging = true;
    root.classList.add("is-drag");
    setFromPointer(event);
    try { frame.setPointerCapture(event.pointerId); } catch { /* Capture is optional on older browsers. */ }
    wake();
  }, { signal });
  frame.addEventListener("pointermove", (event) => {
    const bounds = frame.getBoundingClientRect();
    targetLensX = event.clientX - bounds.left;
    targetLensY = event.clientY - bounds.top;
    if (lensEnabled && (event.pointerType === "mouse" || dragging)) {
      if (!shown) { lensX = targetLensX; lensY = targetLensY; }
      shown = true;
      lens.classList.add("is-on");
    }
    if (dragging) setFromPointer(event);
    wake();
  }, { signal });
  const endDrag = () => { dragging = false; root.classList.remove("is-drag"); kick(); };
  frame.addEventListener("pointerup", endDrag, { signal });
  frame.addEventListener("pointercancel", endDrag, { signal });
  frame.addEventListener("pointerleave", () => { shown = false; lens.classList.remove("is-on"); wake(); }, { signal });
  handle.addEventListener("keydown", (event) => {
    const step = event.shiftKey ? .1 : .02;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") targetX = Math.max(0, targetX - step);
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") targetX = Math.min(1, targetX + step);
    else if (event.key === "Home") targetX = 0;
    else if (event.key === "End") targetX = 1;
    else return;
    event.preventDefault();
    wake();
  }, { signal });
  toggle.addEventListener("click", () => {
    lensEnabled = !lensEnabled;
    toggle.setAttribute("aria-pressed", String(lensEnabled));
    toggle.querySelector("span")!.textContent = lensEnabled ? "Lupa ligada" : "Lupa desligada";
    if (!lensEnabled) { shown = false; lens.classList.remove("is-on"); }
    wake();
  }, { signal });

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) {
      lastFrame = 0;
      if (!lensX) { lensX = targetLensX = frame.clientWidth * .7; lensY = targetLensY = frame.clientHeight * .4; }
      kick();
    } else { shown = false; lens.classList.remove("is-on"); }
  });
  observer.observe(root);
  const resize = new ResizeObserver(paint);
  resize.observe(frame);
  paint();
  return () => { observer.disconnect(); resize.disconnect(); if (raf) cancelAnimationFrame(raf); };
}

function initLiquidIndex(root: HTMLElement, signal: AbortSignal): () => void {
  const rows = Array.from(root.querySelectorAll<HTMLElement>(".mary-index__row"));
  const list = root.querySelector<HTMLElement>(".mary-index__list");
  const float = root.querySelector<HTMLElement>(".mary-index__float");
  const canvas = root.querySelector<HTMLCanvasElement>(".mary-index__canvas");
  const tag = root.querySelector<HTMLElement>(".mary-index__tag");
  const bigNumber = root.querySelector<HTMLElement>(".mary-index__big span");
  if (!rows.length || !list || !float || !canvas || !tag) return () => {};

  root.classList.add("is-on");
  const context = canvas.getContext("2d");
  if (!context) return () => {};
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = window.matchMedia("(hover: none)").matches;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const images: Array<HTMLImageElement | undefined> = [];
  let current = -1, previous = -1, reveal = 1;
  let px = 0, py = 0, tx = 0, ty = 0, vx = 0, vy = 0, clock = 0, raf = 0, lastFrame = 0;
  let visible = false, shown = false, mode = "", lastMove = -9, autoIndex = -1, autoAt = 0;
  const auto = root.dataset.auto !== "0" && !reduced;

  const imageFor = (index: number) => {
    if (images[index]) return images[index]!;
    const image = new Image();
    image.decoding = "async";
    image.addEventListener("load", () => { if (current === index) draw(); }, { signal });
    image.src = rows[index].dataset.img || "";
    images[index] = image;
    return image;
  };
  const ready = (image: HTMLImageElement) => image.complete && image.naturalWidth > 0;
  const size = () => {
    const width = float.offsetWidth, height = float.offsetHeight;
    if (!width) return;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  };
  const paintImage = (image: HTMLImageElement, zoom: number, top: number) => {
    if (!ready(image) || !context) return;
    const iw = image.naturalWidth, ih = image.naturalHeight;
    const scale = Math.max(canvas.width / iw, canvas.height / ih) * zoom;
    const width = iw * scale, height = ih * scale;
    const baseX = (canvas.width - width) / 2, baseY = (canvas.height - height) / 2;
    const bands = 16;
    const speed = Math.min(1, Math.hypot(vx, vy) / 2400);
    const maxOffset = (width - canvas.width) / 2;
    for (let band = 0; band < bands; band += 1) {
      let y0 = Math.round(canvas.height * band / bands);
      const y1 = Math.round(canvas.height * (band + 1) / bands);
      if (y1 <= top) continue;
      y0 = Math.max(y0, top);
      const wave = Math.sin(Math.PI * (band + .5) / bands);
      const drift = reduced ? 0 : -vx * .05 * wave + Math.sin(clock * 10 + band * .8) * speed * 22;
      const offset = Math.max(-maxOffset, Math.min(maxOffset, drift * dpr));
      context.drawImage(image, 0, (y0 - baseY) / scale, iw, (y1 - y0 + 1) / scale, baseX + offset, y0, width, y1 - y0 + 1);
    }
  };
  const draw = () => {
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (current < 0) return;
    const eased = reveal < 1 ? 1 - Math.pow(1 - reveal, 3) : 1;
    if (previous >= 0 && eased < 1) {
      paintImage(imageFor(previous), 1.1 + eased * .06, 0);
      context.fillStyle = `rgba(16,12,15,${(eased * .25).toFixed(3)})`;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    paintImage(imageFor(current), 1.1 + (1 - eased) * .12, Math.round(canvas.height * (1 - eased)));
  };
  const setRow = (index: number) => {
    if (index === current) return;
    previous = current;
    current = index;
    reveal = reduced || previous < 0 ? 1 : 0;
    imageFor(index);
    rows.forEach((row, rowIndex) => row.classList.toggle("is-on", rowIndex === index));
    tag.textContent = rows[index].dataset.tag || "";
    if (bigNumber) {
      bigNumber.style.transition = "none";
      bigNumber.style.transform = `translateY(${previous < index ? 30 : -30}%)`;
      bigNumber.textContent = rows[index].querySelector(".mary-index__no")?.textContent || "";
      void bigNumber.offsetWidth;
      bigNumber.style.transition = "";
      bigNumber.style.transform = "";
    }
    draw();
    kick();
  };
  const show = (on: boolean) => {
    if (on === shown) return;
    shown = on;
    root.classList.toggle("is-card", on);
    root.classList.toggle("is-hot", on);
    if (!on) { rows.forEach((row) => row.classList.remove("is-on")); current = -1; }
  };
  const place = (x: number, y: number, snap: boolean) => {
    const bounds = root.getBoundingClientRect(), width = float.offsetWidth, height = float.offsetHeight;
    tx = Math.max(width * .5, Math.min(bounds.width - width * .5, x));
    ty = Math.max(height * .55, Math.min(bounds.height - height * .5, y));
    if (snap) { px = tx; py = ty; }
  };
  const visibleRows = () => rows.filter((row) => !row.classList.contains("is-out"));
  const rowAt = (clientY: number) => rows.findIndex((row) => {
    const bounds = row.getBoundingClientRect();
    return !row.classList.contains("is-out") && clientY >= bounds.top && clientY <= bounds.bottom;
  });
  const tick = (time: number) => {
    raf = 0;
    if (!visible) { lastFrame = 0; return; }
    const dt = lastFrame ? Math.max(.004, Math.min(.05, (time - lastFrame) / 1000)) : 1 / 60;
    lastFrame = time;
    clock += dt;
    const bounds = root.getBoundingClientRect();
    if (touch && !reduced) {
      const mid = window.innerHeight * .5;
      let nearest = -1, nearestDistance = Number.POSITIVE_INFINITY;
      visibleRows().forEach((row) => {
        const rect = row.getBoundingClientRect();
        const distance = Math.abs((rect.top + rect.bottom) / 2 - mid);
        if (distance < nearestDistance) { nearestDistance = distance; nearest = rows.indexOf(row); }
      });
      const listBounds = list.getBoundingClientRect();
      if (nearest >= 0 && listBounds.top < mid && listBounds.bottom > mid - 40) {
        const rect = rows[nearest].getBoundingClientRect();
        setRow(nearest); show(true);
        place(bounds.width - float.offsetWidth * .5 - 8, (rect.top + rect.bottom) / 2 - bounds.top, !shown);
      } else show(false);
    } else if (auto && clock - lastMove > 3.5 && mode !== "key") {
      const visibleRowsNow = visibleRows();
      if (visibleRowsNow.length) {
        if (clock > autoAt) { autoIndex = (autoIndex + 1) % visibleRowsNow.length; autoAt = clock + 1.25; }
        const row = visibleRowsNow[autoIndex % visibleRowsNow.length];
        const rect = row.getBoundingClientRect(), listBounds = list.getBoundingClientRect();
        setRow(rows.indexOf(row)); show(true);
        place(listBounds.left - bounds.left + listBounds.width * (.6 + .08 * Math.sin(clock * .8)), (rect.top + rect.bottom) / 2 - bounds.top + Math.sin(clock * 2.3) * 10, false);
      }
    }
    const oldX = px, oldY = py, ease = reduced ? 1 : Math.min(1, dt * 7.5);
    px += (tx - px) * ease; py += (ty - py) * ease;
    vx += ((px - oldX) / dt - vx) * Math.min(1, dt * 12);
    vy += ((py - oldY) / dt - vy) * Math.min(1, dt * 12);
    if (reveal < 1) reveal = Math.min(1, reveal + dt / .55);
    const rotation = reduced ? 0 : Math.max(-9, Math.min(9, vx * .006));
    const stretch = reduced ? 1 : 1 + Math.min(.12, Math.abs(vy) * .00006);
    float.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) rotate(${rotation.toFixed(2)}deg) scale(${(2-stretch).toFixed(3)},${stretch.toFixed(3)})`;
    root.style.setProperty("--mary-index-x", `${(px / bounds.width * 100).toFixed(1)}%`);
    root.style.setProperty("--mary-index-y", `${(py / bounds.height * 100).toFixed(1)}%`);
    if (shown) draw();
    const moving = Math.abs(tx - px) > .3 || Math.abs(ty - py) > .3 || Math.abs(vx) > 2 || reveal < 1;
    if (moving || (auto && !touch) || (touch && !reduced)) raf = requestAnimationFrame(tick);
    else lastFrame = 0;
  };
  function kick() { if (!raf && visible) raf = requestAnimationFrame(tick); }

  root.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    lastMove = clock; mode = "mouse";
    const bounds = root.getBoundingClientRect(), listBounds = list.getBoundingClientRect();
    const index = event.clientX >= listBounds.left && event.clientX <= listBounds.right ? rowAt(event.clientY) : -1;
    if (index >= 0) {
      const first = !shown;
      setRow(index); show(true);
      place(event.clientX - bounds.left, event.clientY - bounds.top, first);
    } else show(false);
    kick();
  }, { signal });
  root.addEventListener("pointerleave", () => { lastMove = clock; show(false); kick(); }, { signal });
  rows.forEach((row, index) => {
    const button = row.querySelector<HTMLButtonElement>("button");
    if (!button) return;
    button.addEventListener("focus", () => {
      mode = "key";
      const bounds = root.getBoundingClientRect(), rowBounds = row.getBoundingClientRect();
      setRow(index); show(true);
      place(rowBounds.left - bounds.left + rowBounds.width * .74, (rowBounds.top + rowBounds.bottom) / 2 - bounds.top, true);
      kick();
    }, { signal });
    button.addEventListener("blur", () => {
      window.setTimeout(() => {
        if ((!root.contains(document.activeElement) || !document.activeElement?.closest(".mary-index__row")) && mode === "key") {
          mode = ""; show(false); lastMove = clock; kick();
        }
      }, 0);
    }, { signal });
  });
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) { lastFrame = 0; kick(); } });
  observer.observe(root);
  const resize = new ResizeObserver(() => { size(); draw(); });
  resize.observe(float);
  size();
  if (reduced) {
    setRow(0); show(true);
    const bounds = root.getBoundingClientRect(), row = rows[0].getBoundingClientRect();
    place(row.left - bounds.left + row.width * .74, (row.top + row.bottom) / 2 - bounds.top, true);
    float.style.transform = `translate3d(${px}px,${py}px,0)`;
  }
  return () => { observer.disconnect(); resize.disconnect(); if (raf) cancelAnimationFrame(raf); };
}

export function initMaryPortfolioEffects(scope: ParentNode = document): () => void {
  const controller = new AbortController();
  const cleanups: Array<() => void> = [];
  scope.querySelectorAll<HTMLElement>(".mary-ba").forEach((root) => cleanups.push(initBeforeAfter(root, controller.signal)));
  scope.querySelectorAll<HTMLElement>(".mary-index").forEach((root) => cleanups.push(initLiquidIndex(root, controller.signal)));
  return () => { controller.abort(); cleanups.forEach((cleanup) => cleanup()); };
}
