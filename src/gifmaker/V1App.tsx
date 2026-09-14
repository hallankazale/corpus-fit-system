import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, buildGif, deleteGif, exportLibraryZip, fileToDataUrl, frameDuration, listSaved, playbackFor, saveGif, shareBytes, slugify, split2x2, type Frame, type LoopMode, type SavedGif, type Settings } from "./original-mode-core";
import { centerFrames, guessFromFilename } from "./smart-tools";
import "./original-mode.css";

export function V1App() {
  const [name, setName] = useState("Exercício");
  const [category, setCategory] = useState("core");
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loopMode, setLoopMode] = useState<LoopMode>("ping-pong");
  const [delay, setDelay] = useState(650);
  const [startPause, setStartPause] = useState(300);
  const [endPause, setEndPause] = useState(300);
  const [size, setSize] = useState(512);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [working, setWorking] = useState(false);
  const [saved, setSaved] = useState<SavedGif[]>([]);
  const [message, setMessage] = useState("Importe uma colagem 2×2 ou quadros separados para começar.");
  const collageInput = useRef<HTMLInputElement>(null);
  const framesInput = useRef<HTMLInputElement>(null);
  const slug = useMemo(() => slugify(name) || "exercicio", [name]);
  const settings: Settings = { loopMode, delay, startPause, endPause, size };
  const playback = useMemo(() => playbackFor(frames, loopMode), [frames, loopMode]);
  const cycleMs = useMemo(() => playback.reduce((sum, frame) => sum + frameDuration(frame, frames, settings), 0), [playback, frames, delay, startPause, endPause, size, loopMode]);

  useEffect(() => { listSaved().then(setSaved).catch(() => undefined); }, []);
  useEffect(() => {
    if (!playback.length) return;
    const frame = playback[previewIndex % playback.length];
    const timer = window.setTimeout(() => setPreviewIndex(index => (index + 1) % playback.length), frameDuration(frame, frames, settings));
    return () => window.clearTimeout(timer);
  }, [previewIndex, playback, frames, delay, startPause, endPause, size, loopMode]);

  function detect(filename: string) {
    const guess = guessFromFilename(filename);
    if (!guess) return false;
    setName(guess.name);
    setCategory(guess.category);
    return true;
  }

  async function importCollage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setWorking(true);
    try {
      const recognized = detect(file.name);
      setFrames(await split2x2(await fileToDataUrl(file)));
      setPreviewIndex(0);
      setMessage(recognized ? "Colagem recortada e exercício reconhecido automaticamente." : "Colagem recortada em 4 quadros. Ajuste o nome se necessário.");
    } catch (error) { setMessage(`Erro ao importar: ${error instanceof Error ? error.message : String(error)}`); }
    finally { setWorking(false); event.target.value = ""; }
  }

  async function importSeparate(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setWorking(true);
    try {
      detect(files[0].name);
      const next = await Promise.all(files.map(async (file, index) => ({ id: crypto.randomUUID(), name: `frame-${index + 1}`, dataUrl: await fileToDataUrl(file) })));
      setFrames(next);
      setPreviewIndex(0);
      setMessage(`${next.length} quadros importados.`);
    } catch (error) { setMessage(`Erro ao importar: ${error instanceof Error ? error.message : String(error)}`); }
    finally { setWorking(false); event.target.value = ""; }
  }

  function normalize(list: Frame[]) { return list.map((frame, index) => ({ ...frame, name: `frame-${index + 1}` })); }
  function move(index: number, direction: -1 | 1) { const target = index + direction; if (target < 0 || target >= frames.length) return; setFrames(current => { const copy = [...current]; [copy[index], copy[target]] = [copy[target], copy[index]]; return normalize(copy); }); setPreviewIndex(0); }
  function duplicate(index: number) { setFrames(current => { const copy = [...current]; copy.splice(index + 1, 0, { ...copy[index], id: crypto.randomUUID() }); return normalize(copy); }); }
  function remove(id: string) { setFrames(current => normalize(current.filter(frame => frame.id !== id))); setPreviewIndex(0); }

  async function align() {
    if (!frames.length) return;
    setWorking(true); setMessage("Alinhando quadros...");
    try { setFrames(await centerFrames(frames)); setPreviewIndex(0); setMessage("Alinhamento concluído. Confira a prévia."); }
    catch (error) { setMessage(`Erro no alinhamento: ${error instanceof Error ? error.message : String(error)}`); }
    finally { setWorking(false); }
  }

  async function generate() {
    setWorking(true); setMessage("Gerando GIF...");
    try {
      const bytes = await buildGif(frames, settings);
      const item: SavedGif = { id: crypto.randomUUID(), name, slug, category, createdAt: new Date().toISOString(), bytes, frames: frames.map(frame => ({ name: frame.name, dataUrl: frame.dataUrl })), settings };
      await saveGif(item); setSaved(await listSaved()); setMessage(`Pronto: ${slug}.gif • ${frames.length} quadros • ~${(cycleMs / 1000).toFixed(1)}s`); await shareBytes(bytes, `${slug}.gif`);
    } catch (error) { setMessage(`Erro ao gerar: ${error instanceof Error ? error.message : String(error)}`); }
    finally { setWorking(false); }
  }

  async function exportZip() {
    if (!saved.length) return;
    setWorking(true);
    try { await shareBytes(await exportLibraryZip(saved), "trincado-exercise-assets.zip"); setMessage("Biblioteca exportada em ZIP com GIFs, frames e metadados."); }
    catch (error) { setMessage(`Erro no ZIP: ${error instanceof Error ? error.message : String(error)}`); }
    finally { setWorking(false); }
  }

  return <div className="v5-app">
    <header className="v5-header"><div><small>PROJETO TRINCADO</small><h1>GIF Maker Studio</h1><p>Produza e organize os GIFs do nosso app de academia direto no celular.</p></div><span>v1.0</span></header>
    <main>
      <section className="card hero"><div className="title-row"><div><small>PASSO 1</small><h2>Importar imagens</h2></div><span>PRODUÇÃO</span></div><p className="muted">Use nomes como <b>supino-reto-2x2.png</b> para o app preencher nome e categoria automaticamente.</p><div className="import-grid"><button className="import-main" onClick={() => collageInput.current?.click()}>▦ Colagem 2×2<small>Recorta 4 quadros sozinho</small></button><button className="import-alt" onClick={() => framesInput.current?.click()}>▣ Quadros separados<small>4, 6, 8 ou mais imagens</small></button></div><input ref={collageInput} hidden type="file" accept="image/*" onChange={importCollage}/><input ref={framesInput} hidden type="file" accept="image/*" multiple onChange={importSeparate}/></section>
      <section className="card form-grid"><label>Nome do exercício<input value={name} onChange={event => setName(event.target.value)}/></label><label>Categoria<select value={category} onChange={event => setCategory(event.target.value)}>{CATEGORIES.map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></label><div className="path">Destino: <b>{category}/{slug}/{slug}.gif</b></div></section>
      <section className="card"><div className="section-head"><div><h2>2. Quadros</h2><p className="muted">Reordene e use o alinhamento automático se houver “pulos”.</p></div><div>{frames.length > 0 && <button className="clear" disabled={working} onClick={align}>◎ Alinhar</button>}</div></div>{frames.length === 0 ? <div className="empty">Nenhum quadro importado.</div> : <div className="frames">{frames.map((frame,index) => <article key={frame.id}><img src={frame.dataUrl} alt={`Quadro ${index + 1}`}/><strong>{index + 1}</strong><div className="frame-actions"><button disabled={index===0} onClick={() => move(index,-1)}>←</button><button disabled={index===frames.length-1} onClick={() => move(index,1)}>→</button><button onClick={() => duplicate(index)}>＋</button><button className="danger" onClick={() => remove(frame.id)}>×</button></div></article>)}</div>}</section>
      <section className="card"><h2>3. Animação</h2><div className="two-col"><label>Loop<select value={loopMode} onChange={event => setLoopMode(event.target.value as LoopMode)}><option value="ping-pong">Ida e volta</option><option value="linear">Linear</option></select></label><label>Resolução<select value={size} onChange={event => setSize(Number(event.target.value))}><option value="384">384×384</option><option value="512">512×512</option><option value="640">640×640</option></select></label></div><label className="range">Tempo por quadro: <b>{delay} ms</b><input type="range" min="150" max="1200" step="50" value={delay} onChange={event => setDelay(Number(event.target.value))}/></label><div className="two-col"><label>Pausa inicial: <b>{startPause} ms</b><input type="range" min="0" max="1200" step="50" value={startPause} onChange={event => setStartPause(Number(event.target.value))}/></label><label>Pausa final: <b>{endPause} ms</b><input type="range" min="0" max="1200" step="50" value={endPause} onChange={event => setEndPause(Number(event.target.value))}/></label></div><div className="path">Ciclo aproximado: <b>{(cycleMs/1000).toFixed(1)} s</b> • {playback.length} passos</div><div className="preview">{playback.length ? <img src={playback[previewIndex % playback.length]?.dataUrl} alt="Prévia"/> : <div>Prévia aparecerá aqui</div>}</div></section>
      <section className="card"><h2>4. Gerar GIF</h2><button className="final-btn" disabled={working || frames.length < 2} onClick={generate}>{working ? "Processando..." : "Gerar GIF e compartilhar"}</button><p className="message">{message}</p></section>
      <section className="card"><div className="library-head"><div><h2>Biblioteca</h2><p className="muted">Tudo fica salvo localmente até você exportar.</p></div><b>{saved.length}</b></div>{saved.length === 0 ? <div className="empty">Nenhum GIF salvo.</div> : <div className="saved">{[...saved].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map(item => <article key={item.id}><div><strong>{item.name}</strong><small>{item.category}/{item.slug} • {item.frames?.length ?? "?"} quadros</small></div><div><button onClick={() => shareBytes(item.bytes, `${item.slug}.gif`)}>Compartilhar</button><button className="danger" onClick={async () => { await deleteGif(item.id); setSaved(await listSaved()); }}>Apagar</button></div></article>)}</div>}<button className="zip-btn" disabled={!saved.length || working} onClick={exportZip}>Exportar biblioteca em ZIP</button></section>
    </main>
    <footer>Trincado GIF Maker v1.0 • GIFs, frames e metadados organizados para o repositório.</footer>
  </div>;
}
