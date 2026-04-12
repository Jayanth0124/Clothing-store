

declare module '@barba/core' {
  const barba: any;
  export default barba;
}

declare module '@barba/css' {
  const barbaCss: any;
  export default barbaCss;
}

declare module '@studio-freight/lenis' {
  export default class Lenis {
    constructor(options?: any);
    on(event: string, callback: (args: any) => void): void;
    raf(time: number): void;
    destroy(): void;
    start(): void;
    stop(): void;
  }
}