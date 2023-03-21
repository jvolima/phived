import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import "src/components/InstallPwa/styles.css";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
  outcome: "accepted" | "dismissed";
  platform: string;
  }>;
  prompt(): Promise<void>;
  }

export function InstallPwa() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("transitionend", handler);
  }, []);

  const onClick = (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
  };
  if (!supportsPWA) {
    return null;
  }
  return (
    <button
      className="install select-none bg-darkerBlack dark:bg-lighterWhite text-lighterWhite dark:text-darkerBlack h-10 px-3 rounded-2xl text-base font-medium transition duration-100 hover:ease-in hover:opacity-80 xs:text-lg sm:px-4"
      aria-label="Install PWA"
      onClick={onClick}
    >
      install 
    </button>
  );
}
