import React, { useState } from 'react';

/**
 * Inline neutral placeholder so a broken or missing product image never renders
 * as the browser's broken-image glyph. Encoded as a data URI so it needs no
 * network asset and works offline. Catalog records can carry dead third-party
 * image URLs (and some carry product-page URLs that are not images at all); the
 * server-side broken-image audit repairs records that still have a valid image,
 * but records whose every image is dead can only be covered here, in the UI.
 */
export const PLACEHOLDER_IMAGE_SRC =
   'data:image/svg+xml,' +
   encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120" role="img" aria-label="Imagen no disponible">' +
         '<rect width="160" height="120" fill="#e5e7eb"/>' +
         '<g fill="none" stroke="#9ca3af" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
            '<rect x="44" y="38" width="72" height="52" rx="6"/>' +
            '<circle cx="64" cy="58" r="7"/>' +
            '<path d="M50 86l22-20 16 14 12-10 14 16"/>' +
         '</g>' +
      '</svg>',
   );

type ImageWithFallbackProps = React.ImgHTMLAttributes<HTMLImageElement> & {
   fallbackSrc?: string;
};

/**
 * Drop-in replacement for `<img>` that swaps to a placeholder when the source
 * fails to load (or is empty). Forwards every native img prop, so existing
 * className/loading/alt usage is preserved verbatim.
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
   src,
   fallbackSrc = PLACEHOLDER_IMAGE_SRC,
   onError,
   ...rest
}) => {
   // Track the specific src that failed so changing `src` (e.g. a gallery swap)
   // re-attempts the new image instead of staying stuck on the placeholder.
   const [failedSrc, setFailedSrc] = useState<string | null>(null);

   const showFallback = !src || failedSrc === src;

   return (
      <img
         src={showFallback ? fallbackSrc : src}
         onError={(event) => {
            setFailedSrc(src ?? null);
            onError?.(event);
         }}
         {...rest}
      />
   );
};

export default ImageWithFallback;
