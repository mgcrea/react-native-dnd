/** @jsxImportSource react */
import { Popover, Transition } from "@headlessui/react";
import { Fragment, type FunctionComponent } from "react";
import { CloseIcon, MenuIcon } from "../icon";
import { Navigation } from "./Navigation";

type MenuToggleIconProps = { isOpen: boolean };

const MenuToggleIcon: FunctionComponent<MenuToggleIconProps> = ({ isOpen }) => {
  const ToggleIcon = isOpen ? CloseIcon : MenuIcon;
  return (
    // <button type="button" className="group relative" aria-label="Open navigation" onClick={onClick}>
    <ToggleIcon className="h-6 w-6 stroke-slate-400 transition-colors group-hover:stroke-slate-500" />
    // </button>
  );
};

export const MobileNavigation: FunctionComponent<{ currentPage: string }> = ({ currentPage }) => {
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
                  className="max-h-[calc(var(--unit-100vh)-5rem)] overflow-scroll p-6"
                />
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};
