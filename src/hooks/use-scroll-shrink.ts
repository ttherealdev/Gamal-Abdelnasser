import React from "react";

export function useScrollShrink(threshold = 20) {
  const [shrunk, setShrunk] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return shrunk;
}
