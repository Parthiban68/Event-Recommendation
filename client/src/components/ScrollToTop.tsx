import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const timer = window.setTimeout(() => {
        document
          .getElementById(hash.slice(1))
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);

      return () => window.clearTimeout(timer);
    }

    window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return null;
}
