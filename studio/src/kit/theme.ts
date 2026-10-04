// Brand tokens for Remotion scenes. Same palette as the channel art.
export const C = {
  bg: "#0E1726",
  bg2: "#152238",
  ink: "#F2EFE6",
  amber: "#FFB547",
  mint: "#4FD1C5",
  coral: "#FF6B6B",
  muted: "#8A97AB",
  dim: "#22324A",
  panel: "#16223A",
  green: "#3DDC84",
} as const;

// Fonts are installed system-wide by setup.sh (fontconfig), so plain family names work.
export const F = {
  bold: "'Space Grotesk Bold', sans-serif",
  med: "'Space Grotesk Medium', sans-serif",
  display: "'Fraunces SemiBold', serif",
  mono: "'JetBrains Mono Bold', monospace",
  emoji: "'Noto Color Emoji', sans-serif",
} as const;

// Canvas and safe zones for a 1080x1920 Short (pixels).
// Top ~170 px: keep clear (YouTube's top bar). Visuals: y 170..1170. Captions: centred at y 1250.
// Bottom ~470 px and the right edge below y~900 are covered by YouTube's title and buttons.
export const W = 1080;
export const H = 1920;
export const SAFE = { top: 170, bottom: 1170, left: 60, right: 1020, captionY: 1250 } as const;
export const CENTER = { x: W / 2, y: (SAFE.top + SAFE.bottom) / 2 } as const; // (540, 670)
