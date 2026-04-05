/** Hermes / RN предоставляют atob для JWT payload. */
declare function atob(data: string): string;

declare namespace NodeJS {
  interface ProcessEnv {
    PUBLIC_API_URL?: string;
  }
}
