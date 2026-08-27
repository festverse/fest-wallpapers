interface LoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudflareImageLoader(props: LoaderProps): string {
  if (!props || !props.src) {
    return "";
  }
  return props.src;
}
