import {
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
} from "three";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function hideFallback(container) {
  const fallback = container.querySelector(".dal-fallback");
  if (fallback) fallback.classList.add("dal-hidden");
  const canvas = container.querySelector("canvas");
  if (canvas) canvas.classList.remove("dal-hidden");
}

function showFallbackOnly(container) {
  const fallback = container.querySelector(".dal-fallback");
  const canvas = container.querySelector("canvas");
  if (canvas) canvas.classList.add("dal-hidden");
  if (fallback) fallback.classList.remove("dal-hidden");
}

function attachVisibilityPause(container, instance) {
  if (!container || !instance) return null;
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) instance.resume();
      else instance.pause();
    },
    { threshold: 0.05, rootMargin: "50px" }
  );
  io.observe(container);
  return io;
}

function createAnimLoop(renderFrame) {
  let animId = null;
  let running = true;
  let visible = true;

  function animate() {
    if (!running) return;
    animId = requestAnimationFrame(animate);
    if (visible) renderFrame();
  }

  animate();

  return {
    pause() {
      visible = false;
    },
    resume() {
      visible = true;
    },
    stop() {
      running = false;
      visible = false;
      if (animId) cancelAnimationFrame(animId);
    },
  };
}

/** Hero: animated node network with mouse parallax */
export function initHeroNetwork(container) {
  if (!container || prefersReducedMotion() || isMobileViewport()) {
    showFallbackOnly(container);
    return null;
  }

  const canvas = container.querySelector("canvas");
  if (!canvas) return null;

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 14;

  const nodeCount = 55;
  const positions = new Float32Array(nodeCount * 3);
  const colors = new Float32Array(nodeCount * 3);
  const gold = new Color("#D4AF37");
  const white = new Color("#FFFFFF");

  for (let i = 0; i < nodeCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 4 + Math.random() * 3;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    const c = Math.random() > 0.3 ? gold : white;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));

  const points = new Points(
    geometry,
    new PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.9 })
  );
  scene.add(points);

  const linePositions = [];
  const threshold = 2.8;
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      if (Math.sqrt(dx * dx + dy * dy + dz * dz) < threshold) {
        linePositions.push(
          positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
          positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
        );
      }
    }
  }

  const lineGeo = new BufferGeometry();
  lineGeo.setAttribute("position", new Float32BufferAttribute(linePositions, 3));
  const lines = new LineSegments(
    lineGeo,
    new LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.2 })
  );
  scene.add(lines);

  let mouseX = 0;
  let mouseY = 0;
  const onMove = (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  };
  container.addEventListener("mousemove", onMove);

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight || 280;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const loop = createAnimLoop(() => {
    points.rotation.y += 0.002;
    points.rotation.x += 0.001;
    lines.rotation.y = points.rotation.y;
    lines.rotation.x = points.rotation.x;
    camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  });

  resize();
  hideFallback(container);

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  const visibilityIo = attachVisibilityPause(container, loop);

  return {
    pause: () => loop.pause(),
    resume: () => loop.resume(),
    destroy() {
      loop.stop();
      container.removeEventListener("mousemove", onMove);
      ro.disconnect();
      visibilityIo?.disconnect();
      geometry.dispose();
      lineGeo.dispose();
      renderer.dispose();
    },
  };
}

/** About: rotating DAL logo cube */
export function initAboutCube(container) {
  if (!container || prefersReducedMotion() || isMobileViewport()) {
    showFallbackOnly(container);
    return null;
  }

  const canvas = container.querySelector("canvas");
  if (!canvas) return null;

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new Scene();
  const camera = new PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 4;

  const loader = new TextureLoader();
  const texture = loader.load("/img/dal-logo.svg");
  texture.colorSpace = SRGBColorSpace;

  const materials = Array.from({ length: 6 }, () =>
    new MeshStandardMaterial({ map: texture, metalness: 0.3, roughness: 0.4 })
  );
  const cube = new Mesh(new BoxGeometry(2, 2, 2), materials);
  scene.add(cube);

  const ambient = new AmbientLight(0xffffff, 0.6);
  const dir = new DirectionalLight(0xd4af37, 1.2);
  dir.position.set(3, 4, 5);
  scene.add(ambient, dir);

  function resize() {
    const w = container.clientWidth;
    const h = 260;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const loop = createAnimLoop(() => {
    cube.rotation.x += 0.008;
    cube.rotation.y += 0.012;
    renderer.render(scene, camera);
  });

  resize();
  hideFallback(container);

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  const visibilityIo = attachVisibilityPause(container, loop);

  return {
    pause: () => loop.pause(),
    resume: () => loop.resume(),
    destroy() {
      loop.stop();
      ro.disconnect();
      visibilityIo?.disconnect();
      texture.dispose();
      cube.geometry.dispose();
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
}
