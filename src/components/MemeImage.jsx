"use client";

import { useState } from "react";

export default function MemeImage({ src, alt }) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc("/fallback.png")}
      style={{ width: "100%", borderRadius: "12px" }}
    />
  );
}