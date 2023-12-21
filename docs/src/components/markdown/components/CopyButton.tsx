/** @jsxImportSource preact */
import type { FunctionalComponent as FunctionComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { classNames } from "src/utils";
import { ClipboardIcon } from "./ClipboardIcon";

export type CopyButtonProps = {
  code: string;
};

export const CopyButton: FunctionComponent<CopyButtonProps> = ({ code }) => {
  let [copyCount, setCopyCount] = useState(0);
  let wasCopied = copyCount > 0;

  useEffect(() => {
    if (copyCount === 0) {
      return;
    }
    let timeout = setTimeout(() => setCopyCount(0), 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [copyCount]);

  const handleClick = async () => {
    await window.navigator.clipboard.writeText(code);
    setCopyCount((count) => count + 1);
  };

  return (
    <button
      className={classNames(
        "group/button text-2xs absolute right-4 top-3.5 overflow-hidden rounded-full border border-zinc-500 py-1 pl-2 pr-3 font-medium opacity-60 backdrop-blur transition focus:opacity-100 group-hover:border-zinc-400 group-hover:opacity-100",
        wasCopied
          ? "bg-primary-400/10 ring-1 ring-inset ring-primary-400/20"
          : "hover:bg-white/7.5 dark:bg-white/2.5 bg-white/5 dark:hover:bg-white/5",
      )}
      onClick={handleClick}
    >
      <span
        aria-hidden={wasCopied}
        className={classNames(
          "pointer-events-none flex items-center gap-0.5 text-zinc-400 transition-transform duration-300 group-hover/button:text-zinc-300",
          wasCopied && "-translate-y-1.5 opacity-0",
        )}
      >
        <ClipboardIcon className="h-5 w-5 fill-zinc-500/20 stroke-zinc-500 transition-colors group-hover/button:stroke-zinc-400" />
        copy
      </span>
      <span
        aria-hidden={!wasCopied}
        className={classNames(
          "pointer-events-none absolute inset-0 flex items-center justify-center text-primary-400 transition-transform duration-300",
          !wasCopied && "translate-y-1.5 opacity-0",
        )}
      >
        copied!
      </span>
    </button>
  );
};
