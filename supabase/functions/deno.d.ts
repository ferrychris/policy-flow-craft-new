declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  }

  export const env: Env;
}

declare module 'std/http/server.ts' {
  export interface ServeInit {
    port?: number;
    hostname?: string;
  }

  export type Handler = (request: Request) => Response | Promise<Response>;

  export function serve(handler: Handler, init?: ServeInit): void;
}

declare module 'openai/mod.ts' {
  export class OpenAI {
    constructor(config: { apiKey: string });
    createChatCompletion(options: {
      model: string;
      messages: Array<{
        role: string;
        content: string;
      }>;
      max_tokens?: number;
    }): Promise<{
      choices: Array<{
        message?: {
          content?: string;
        };
      }>;
    }>;
  }
}
