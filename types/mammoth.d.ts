declare module 'mammoth' {
  export interface Image {
    contentType: string;
    read(encoding: string): Promise<string>;
    read(): Promise<Buffer>;
  }

  export interface ImageElement {
    src: string;
    style?: string;
    alt?: string;
  }

  export interface ConvertToHtmlResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export interface Options {
    styleMap?: string[];
    convertImage?: (image: Image) => Promise<ImageElement>;
  }

  export function convertToHtml(
    input: { arrayBuffer: ArrayBuffer } | { buffer: Buffer } | { path: string },
    options?: Options
  ): Promise<ConvertToHtmlResult>;

  export const images: {
    imgElement(handler: (image: Image) => Promise<ImageElement> | ImageElement): (image: Image) => Promise<ImageElement>;
  };
}
