import { useEffect, useState } from "react";

const FALLBACK_VERSION = process.env.REACT_APP_VERSION || "0.1.0";

function useDeployVersionInfo() {
  const [versionInfo, setVersionInfo] = useState({
    version: FALLBACK_VERSION,
    buildTime: "",
    buildTimeVN: "",
    buildTimestamp: null,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    fetch(`${process.env.PUBLIC_URL || ""}/version.json`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Cannot load version.json (${response.status})`);
        }
        return response.json();
      })
      .then((payload) => {
        if (!isMounted) {
          return;
        }

        setVersionInfo({
          version: payload?.version || FALLBACK_VERSION,
          buildTime: payload?.buildTime || "",
          buildTimeVN: payload?.buildTimeVN || "",
          buildTimestamp: payload?.buildTimestamp || null,
          loading: false,
        });
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setVersionInfo((current) => ({
          ...current,
          version: current.version || FALLBACK_VERSION,
          loading: false,
        }));
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return versionInfo;
}

export default useDeployVersionInfo;