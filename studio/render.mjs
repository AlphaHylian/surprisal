// Render an episode's scene.tsx with the plan made by kit.make (episode/build/plan.json).
//   node render.mjs <episodeDir> [--draft] [--still <seconds>]
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ep = path.resolve(process.argv[2]);
const draft = process.argv.includes("--draft");
const stillAt = process.argv.includes("--still") ? Number(process.argv[process.argv.indexOf("--still") + 1]) : null;
const plan = JSON.parse(fs.readFileSync(path.join(ep, "build", "plan.json"), "utf8"));

fs.mkdirSync(path.join(here, "src", "episode"), { recursive: true });
fs.copyFileSync(path.join(ep, "scene.tsx"), path.join(here, "src", "episode", "Scene.tsx"));

const findChrome = () => {
  if (process.env.SURPRISAL_CHROME) return process.env.SURPRISAL_CHROME;
  const roots = ["/opt/pw-browsers", path.join(process.env.HOME, ".cache", "ms-playwright")];
  for (const r of roots) {
    if (!fs.existsSync(r)) continue;
    for (const d of fs.readdirSync(r).filter((d) => d.startsWith("chromium_headless_shell")).sort().reverse()) {
      for (const sub of ["chrome-linux/headless_shell", "chrome-headless-shell-linux64/chrome-headless-shell", "chrome-linux64/headless_shell"]) {
        const p = path.join(r, d, sub);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  return null; // let Remotion download its own
};

const serveUrl = await bundle({ entryPoint: path.join(here, "src", "index.ts"), publicDir: path.join(here, "public") });
const browserExecutable = findChrome();
const inputProps = { plan, captions: true };
const composition = await selectComposition({ serveUrl, id: "Episode", inputProps, browserExecutable });
const out = path.join(ep, "build");
if (stillAt !== null) {
  await renderStill({ composition, serveUrl, inputProps, browserExecutable, frame: Math.round(stillAt * plan.fps), output: path.join(out, `still_${stillAt}.png`) });
  console.log("still written");
} else {
  const t0 = Date.now();
  await renderMedia({
    composition, serveUrl, inputProps, browserExecutable,
    codec: "h264", crf: draft ? 28 : 18, scale: draft ? 0.5 : 1, enforceAudioTrack: true,
    outputLocation: path.join(out, "raw.mp4"),
    concurrency: Number(process.env.SURPRISAL_RENDER_CONCURRENCY || 2),
    onProgress: ({ progress }) => { if (Math.round(progress * 100) % 20 === 0) process.stdout.write(`\r[render] ${Math.round(progress * 100)}%  `); },
  });
  console.log(`\n[render] done in ${Math.round((Date.now() - t0) / 1000)} s`);
}
