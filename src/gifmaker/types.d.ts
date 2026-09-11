declare module "gifenc" {
  export function GIFEncoder(): {
    writeFrame(indexed: Uint8Array, width: number, height: number, options: { palette: number[][] | Uint8Array; delay?: number }): void;
    finish(): void;
    bytes(): Uint8Array;
  };
  export function quantize(rgba: Uint8ClampedArray | Uint8Array, maxColors: number): number[][] | Uint8Array;
  export function applyPalette(rgba: Uint8ClampedArray | Uint8Array, palette: number[][] | Uint8Array): Uint8Array;
}
