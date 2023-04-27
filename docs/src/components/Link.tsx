/** @jsxImportSource react */
import type { AnchorHTMLAttributes, FunctionComponent, PropsWithChildren } from "react";

const { BASE_URL } = import.meta.env;

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export const Link: FunctionComponent<PropsWithChildren<LinkProps>> = ({
  children,
  href: hrefProp,
  ...otherProps
}) => {
  const href = hrefProp?.startsWith("/") ? `${BASE_URL.slice(0, -1)}${hrefProp}` : hrefProp ?? "";
  return (
    <a href={href} {...otherProps}>
      {children}
    </a>
  );
};
