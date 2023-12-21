/** @jsxImportSource react */
import type { FunctionComponent, HTMLAttributes } from "react";
import { NAVIGATION_ITEMS } from "src/config/navigation";
import { classNames, ucfirst } from "src/utils";
import { Link } from "../Link";

export type NavigationProps = Pick<HTMLAttributes<HTMLDivElement>, "className"> & {
  currentPage: string;
};

export const Navigation: FunctionComponent<NavigationProps> = ({ className, currentPage }) => {
  // const items = useNavigationStore((state) => state.items);
  return (
    <nav className={classNames("text-base lg:text-sm", className)}>
      <ul role="list" className="space-y-9">
        {NAVIGATION_ITEMS.map(([section, links]) => (
          <li key={section}>
            <h2 className="font-display font-medium text-slate-900 dark:text-white">{ucfirst(section)}</h2>
            <ul
              role="list"
              className="mt-2 space-y-2 border-l-2 border-slate-100 lg:mt-4 lg:space-y-4 lg:border-slate-200 dark:border-slate-800"
            >
              {links.map((link) => (
                <li key={link.href} className="relative">
                  <Link
                    href={link.href}
                    rel="prefetch"
                    className={classNames(
                      "block w-full pl-3.5 before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full",
                      link.href === currentPage
                        ? "font-semibold text-sky-500 before:bg-sky-500"
                        : "text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block dark:text-slate-400 dark:before:bg-secondary-400 dark:hover:text-secondary-200",
                    )}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
};
