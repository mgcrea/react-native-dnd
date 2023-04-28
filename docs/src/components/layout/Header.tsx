/** @jsxImportSource react */
import { Popover, Transition } from "@headlessui/react";
import { Fragment, FunctionComponent } from "react";
import { GITHUB_REPO_URL } from "src/config";
import { useIsScrolled } from "src/hooks";
import { classNames } from "src/utils";
import { Link } from "../Link";
import { Logo } from "../Logo";
import { Search } from "../Search";
import { CloseIcon, GitHubIcon, MenuIcon } from "../icon";
import { Navigation } from "./Navigation";

export type MenuToggleIconProps = { isOpen: boolean };

const MenuToggleIcon: FunctionComponent<MenuToggleIconProps> = ({ isOpen }) => {
  const ToggleIcon = isOpen ? CloseIcon : MenuIcon;
  return (
    // <button type="button" className="group relative" aria-label="Open navigation" onClick={onClick}>
    <ToggleIcon className="h-6 w-6 stroke-slate-400 transition-colors group-hover:stroke-slate-500" />
    // </button>
  );
};
// export type MenuToggleButtonProps = { "aria-expanded": boolean };

// const MenuToggleButton = forwardRef<HTMLButtonElement, MenuToggleButtonProps>(function MenuToggleButton(
//   props,
//   ref
// ) {
//   const ToggleIcon = props["aria-expanded"] ? CloseIcon : MenuIcon;
//   return (
//     <button type="button" className="group relative" aria-label="Open navigation" ref={ref} {...props}>
//       <ToggleIcon className="h-6 w-6 stroke-slate-400 transition-colors group-hover:stroke-slate-500" />
//     </button>
//   );
// });

const MobileNavigation: FunctionComponent<{ currentPage: string }> = ({ currentPage }) => {
  // const [isOpen, setIsOpen] = useState(false);
  // const navigationStore = useNavigationStore());
  // console.log({ navigation, navigationStore });
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button>
            <MenuToggleIcon isOpen={open} />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition duration-200 ease-out"
            enterFrom="transform opacity-0"
            enterTo="transform opacity-30"
            leave="transition duration-150 ease-out"
            leaveFrom="transform opacity-30"
            leaveTo="transform opacity-0"
          >
            <Popover.Overlay className="fixed inset-0 mt-20 bg-black opacity-30" />
          </Transition>
          {/* <Dialog open={isOpen} onClose={() => {}} className="fixed inset-0 top-20 z-50 lg:hidden">*/}
          <Transition
            as={Fragment}
            enter="transition duration-200 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-150 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Popover.Panel className="absolute z-10 mt-3">
              <div className="overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <Navigation
                  currentPage={currentPage}
                  className="max-h-[calc(100vh-5rem)] overflow-scroll p-6"
                />
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export type HeaderProps = { currentPage: string };

export const Header: FunctionComponent<HeaderProps> = ({ currentPage }) => {
  const isScrolled = useIsScrolled();
  return (
    <header
      className={classNames(
        "sticky top-0 z-50 flex h-20 flex-wrap items-center justify-between bg-white px-4 shadow-md shadow-slate-900/5 transition duration-500 dark:shadow-none sm:px-6 lg:px-8",
        isScrolled
          ? "dark:bg-slate-900/95 dark:backdrop-blur dark:[@supports(backdrop-filter:blur(0))]:bg-slate-900/75"
          : "dark:bg-transparent"
      )}
    >
      <div className="mr-6 flex lg:hidden">
        <MobileNavigation currentPage={currentPage} />
      </div>
      <div className="relative flex flex-grow basis-0 items-center">
        <Link href="/" aria-label="Home page">
          <Logo />
        </Link>
      </div>
      <div className="-my-5 mr-6 sm:mr-8 md:mr-0">
        <Search />
      </div>
      <div className="relative flex justify-end gap-6 sm:gap-8 md:flex-grow">
        {/* <ThemeSelector className="relative z-10" /> */}
        <Link href={GITHUB_REPO_URL} aria-label="GitHub" target="_blank">
          <GitHubIcon className="h-6 w-6 fill-slate-400 group-hover:fill-slate-500 dark:group-hover:fill-slate-300 md:h-8 md:w-8" />
        </Link>
      </div>
    </header>
  );
};
