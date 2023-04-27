/** @jsxImportSource react */
import type { FunctionComponent } from "react";
import { GITHUB_REPO_URL } from "src/config";
import { useIsScrolled } from "src/hooks";
import { classNames } from "src/utils";
import { Link } from "../Link";
import { Logo } from "../Logo";
import { Search } from "../Search";
import { GitHubIcon } from "../icon";

export type HeaderProps = { currentPage: string };

export const Header: FunctionComponent<HeaderProps> = ({ currentPage }) => {
  const isScrolled = useIsScrolled();
  return (
    <header
      className={classNames(
        "sticky top-0 z-50 flex flex-wrap items-center justify-between bg-white px-4 py-5 shadow-md shadow-slate-900/5 transition duration-500 dark:shadow-none sm:px-6 lg:px-8",
        isScrolled
          ? "dark:bg-slate-900/95 dark:backdrop-blur dark:[@supports(backdrop-filter:blur(0))]:bg-slate-900/75"
          : "dark:bg-transparent"
      )}
    >
      {/* <div className="mr-6 flex lg:hidden">
        <MobileNavigation navigation={navigation} />
      </div> */}
      <div className="relative flex flex-grow basis-0 items-center">
        <Link href="/" aria-label="Home page">
          <Logo />
        </Link>
      </div>
      <div className="-my-5 mr-6 sm:mr-8 md:mr-0">
        <Search />
      </div>
      <div className="relative flex basis-0 justify-end gap-6 sm:gap-8 md:flex-grow">
        {/* <ThemeSelector className="relative z-10" /> */}
        <Link href={GITHUB_REPO_URL} className="group" aria-label="GitHub" target="_blank">
          <GitHubIcon className="h-6 w-6 fill-slate-400 group-hover:fill-slate-500 dark:group-hover:fill-slate-300" />
        </Link>
      </div>
    </header>
  );
};
