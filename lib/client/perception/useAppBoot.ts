import { useEffect, useState } from "react";

let bootCompleted = false;

export function isBootSessionComplete(): boolean {
  return bootCompleted;
}

export function useAppBoot(isAppReady: boolean): boolean {
  const [bootReady, setBootReady] = useState(() => bootCompleted);

  useEffect(() => {
    if (!bootCompleted && isAppReady) {
      bootCompleted = true;
      setBootReady(true);
    } else if (bootCompleted) {
      setBootReady(true);
    }
  }, [isAppReady]);

  return bootReady;
}
