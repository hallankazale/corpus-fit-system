import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { GIFEncoder, applyPalette, quantize } from "gifenc";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { zipSync, strToU8 } from "fflate";
import "./gif-maker.css";

type Frame = { id: string; name: string; dataUrl: string };
type SavedGif = { id: string; name: string; slug: string; category: string; createdAt: string; bytes: Uint8Array };

const CATEGORIES = [
  ["chest", "Peito"], ["back", "Costas"], ["legs", "Pernas"], ["shoulders", "Ombros"], ["core", "Abdômen / Core"], ["cardio", "Cardio"]
] as const;

const DB_NAME = "trincado-gif-maker";
const STORE = "gifs";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function listSaved(): Promise<SavedGif[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as SavedGif[]);
    req.onerror = () => reject(req.error);
  });
}

async function saveGif(item: SavedGif) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const req = db.transaction(STORE, "readwrite").objectStore(STORE).put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function deleteGif(id: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const req = db.transaction(STORE, "readwrite").objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async function split2x2(dataUrl: string): Promise<Frame[]> {
  const img = await loadImage(dataUrl);
  const halfW = Math.floor(img.naturalWidth / 2);
  const halfH = Math.floor(img.naturalHeight / 2);
  const cells = [[0, 0], [halfW, 0], [0, halfH], [halfW, halfH]];
  return cells.map(([sx, sy], index) => {
    const canvas = document.createElement("canvas");
    canvas.width = halfW;
    canvas.height = halfH;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, halfW, halfH);
    ctx.drawImage(img, sx, sy, halfW, halfH, 0, 0, halfW, halfH);
    return { id: crypto.randomUUID(), name: `frame-${index + 1}`, dataUrl: canvas.toDataURL("image/png") };
  });
}

async function frameToRgba(frame: Frame, width: number, height: number) {
  const img = await loadImage(frame.dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  const scale = Math.min(width / img.naturalWidth, height / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
  return ctx.getImageData(0, 0, width, height).data;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

async function shareBytes(bytes: Uint8Array, filename: string) {
  const result = await Filesystem.writeFile({ path: filename, data: bytesToBase64(bytes), directory: Directory.Cache });
  await Share.share({ title: filename, text: "Arquivo criado no Trincado GIF Maker", url: result.uri, dialogTitle: "Salvar ou compartilhar" });
}

export function GifMakerApp() {
  const [name, setName] = useState("Elevação de pernas");
  const [category, setCategory] = useState("core");
  const [frames, setFrames] = useState<Frame[]>([]);
  const [delay, setDelay] = useState(650);
  const [endPause, setEndPause] = useState(300);
  const [size, setSize] = useState(512);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [working, setWorking] = useState(false);
  const [saved, setSaved] = useState<SavedGif[]>([]);
  const [message, setMessage] = useState("Importe uma colagem 2×2 ou quadros separados.");
  const collageInput = useRef<HTMLInputElement>(null);
  const framesInput = useRef<HTMLInputElement>(null);

  const slug = useMemo(() => slugify(name) || "exercicio", [name]);
  const playback = useMemo(() => frames.length >= 3 ? [...frames, ...frames.slice(1, -1).reverse()] : frames, [frames]);
  const cycleMs = useMemo(() => playback.reduce((total, frame) => {
    const isEnd = frame.id === frames[0]?.id || frame.id === frames[frames.length - 1]?.id;
    return total + delay + (isEnd ? endPause : 0);
  }, 0), [playback, frames, delay, endPause]);

  useEffect(() => { listSaved().then(setSaved).catch(() => undefined); }, []);
  useEffect(() => {
    if (!playback.length) return;
    const frame = playback[previewIndex % playback.length];
    const isEnd = frame?.id === frames[0]?.id || frame?.id === frames[frames.length - 1]?.id;
    const timer = window.setTimeout(() => setPreviewIndex(i => (i + 1) % playback.length), delay + (isEnd ? endPause : 0));
    return () => clearTimeout(timer);
  }, [previewIndex, delay, endPause, playback, frames]);

  async function onCollage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setWorking(true);
    try {
      const data = await fileToDataUrl(file);
      setFrames(await split2x2(data));
      setPreviewIndex(0);
      setMessage("Colagem dividida em 4 quadros. Confira a ordem e a prévia.");
    } finally {
      setWorking(false);
      e.target.value = "";
    }
  }

  async function onFrames(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setWorking(true);
    try {
      const next = await Promise.all(files.map(async (f, i) => ({ id: crypto.randomUUID(), name: `frame-${i + 1}`, dataUrl: await fileToDataUrl(f) })));
      setFrames(next);
      setPreviewIndex(0);
      setMessage(`${next.length} quadros importados.`);
    } finally {
      setWorking(false);
      e.target.value = "";
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= frames.length) return;
    setFrames(current => {
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
    setPreviewIndex(0);
  }

  async function generate() {
    if (frames.length < 2) {
      setMessage("Adicione pelo menos 2 quadros.");
      return;
    }
    setWorking(true);
    setMessage("Gerando GIF...");
    try {
      const gif = GIFEncoder();
      const sequence = frames.length >= 3 ? [...frames, ...frames.slice(1, -1).reverse()] : frames;
      for (const frame of sequence) {
        const rgba = await frameToRgba(frame, size, size);
        const palette = quantize(rgba, 256);
        const indexed = applyPalette(rgba, palette);
        const isEnd = frame.id === frames[0]?.id || frame.id === frames[frames.length - 1]?.id;
        gif.writeFrame(indexed, size, size, { palette, delay: delay + (isEnd ? endPause : 0) });
      }
      gif.finish();
      const bytes = new Uint8Array(gif.bytes());
      const item: SavedGif = { id: crypto.randomUUID(), name, slug, category, createdAt: new Date().toISOString(), bytes };
      await saveGif(item);
      setSaved(await listSaved());
      setMessage(`Pronto: ${slug}.gif • ciclo ~${(cycleMs / 1000).toFixed(1)}s • ${(bytes.length / 1024 / 1024).toFixed(2)} MB`);
      await shareBytes(bytes, `${slug}.gif`);
    } catch (error) {
      setMessage(`Erro ao gerar: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setWorking(false);
    }
  }

  async function exportZip() {
    if (!saved.length) {
      setMessage("Gere pelo menos um GIF antes de exportar o pacote.");
      return;
    }
    setWorking(true);
    try {
      const manifest = saved.map(({ bytes, ...meta }) => ({ ...meta, path: `${meta.category}/${meta.slug}/${meta.slug}.gif`, size: bytes.length }));
      const files: Record<string, Uint8Array> = { "manifest.json": strToU8(JSON.stringify(manifest, null, 2)) };
      for (const item of saved) files[`${item.category}/${item.slug}/${item.slug}.gif`] = item.bytes;
      const zip = zipSync(files, { level: 6 });
      await shareBytes(zip, "projeto-trincado-gifs.zip");
      setMessage(`Pacote organizado com ${saved.length} GIF(s) pronto para compartilhar.`);
    } catch (error) {
      setMessage(`Erro no pacote: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setWorking(false);
    }
  }

  return <div className="gm-app">
    <header className="gm-header"><div><small>PROJETO TRINCADO</small><h1>GIF Maker</h1><p>Crie nossos exercícios no celular e exporte tudo organizado.</p></div><span>v0.2</span></header>
    <main>
      <section className="gm-card gm-form">
        <label>Nome do exercício<input value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Elevação de pernas" /></label>
        <label>Categoria<select value={category} onChange={e => setCategory(e.target.value)}>{CATEGORIES.map(([v, l]) => <option value={v} key={v}>{l}</option>)}</select></label>
        <div className="gm-path">Arquivo: <b>{category}/{slug}/{slug}.gif</b></div>
      </section>

      <section className="gm-card">
        <h2>1. Imagens</h2><p className="muted">Use a colagem 2×2 que criamos ou selecione quadros separados.</p>
        <div className="gm-actions"><button onClick={() => collageInput.current?.click()}>Importar colagem 2×2</button><button className="secondary" onClick={() => framesInput.current?.click()}>Importar quadros</button></div>
        <input ref={collageInput} hidden type="file" accept="image/*" onChange={onCollage} />
        <input ref={framesInput} hidden type="file" accept="image/*" multiple onChange={onFrames} />
        {!!frames.length && <div className="gm-frames">{frames.map((frame, index) => <article key={frame.id}><img src={frame.dataUrl} /><strong>{index + 1}</strong><div><button onClick={() => move(index, -1)}>←</button><button onClick={() => move(index, 1)}>→</button><button onClick={() => setFrames(f => f.filter(x => x.id !== frame.id))}>×</button></div></article>)}</div>}
      </section>

      <section className="gm-card">
        <h2>2. Ajustes</h2>
        <div className="gm-grid">
          <label>Velocidade<select value={delay} onChange={e => setDelay(Number(e.target.value))}><option value="1000">Muito lenta</option><option value="700">Lenta</option><option value="450">Média</option><option value="250">Rápida</option></select></label>
          <label>Resolução<select value={size} onChange={e => setSize(Number(e.target.value))}><option value="384">384×384 leve</option><option value="512">512×512 recomendada</option><option value="640">640×640 alta</option></select></label>
        </div>
        <label style={{ marginTop: 12 }}>Ajuste fino: {delay} ms por quadro<input type="range" min="150" max="1200" step="50" value={delay} onChange={e => setDelay(Number(e.target.value))} /></label>
        <label style={{ marginTop: 12 }}>Pausa no início e no topo: {endPause} ms<input type="range" min="0" max="1000" step="50" value={endPause} onChange={e => setEndPause(Number(e.target.value))} /></label>
        <div className="gm-path" style={{ marginTop: 12 }}>Duração aproximada de um ciclo: <b>{(cycleMs / 1000).toFixed(1)} segundos</b></div>
        <div className="gm-preview">{playback.length ? <img src={playback[previewIndex % playback.length]?.dataUrl} /> : <div>Prévia aparecerá aqui</div>}</div>
        <small className="muted">A prévia usa exatamente o tempo que será gravado no GIF. O loop faz ida e volta automaticamente.</small>
      </section>

      <section className="gm-card"><h2>3. Gerar</h2><button className="primary" disabled={working || frames.length < 2} onClick={generate}>{working ? "Processando..." : "Gerar GIF e compartilhar"}</button><p className="gm-message">{message}</p></section>

      <section className="gm-card">
        <div className="gm-library-title"><div><h2>Biblioteca</h2><p className="muted">Fica guardada neste aparelho até você apagar os dados do app.</p></div><b>{saved.length}</b></div>
        {saved.length === 0 ? <div className="empty">Nenhum GIF gerado ainda.</div> : <div className="gm-saved">{[...saved].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(item => <article key={item.id}><div><strong>{item.name}</strong><small>{item.category}/{item.slug}/{item.slug}.gif • {(item.bytes.length / 1024 / 1024).toFixed(2)} MB</small></div><div><button onClick={() => shareBytes(item.bytes, `${item.slug}.gif`)}>Compartilhar</button><button className="danger" onClick={async () => { await deleteGif(item.id); setSaved(await listSaved()); }}>Apagar</button></div></article>)}</div>}
        <button className="zip" disabled={!saved.length || working} onClick={exportZip}>Exportar ZIP organizado</button>
      </section>
    </main>
    <footer>Quando terminar vários exercícios, envie o arquivo <b>projeto-trincado-gifs.zip</b> no ChatGPT.</footer>
  </div>;
}
