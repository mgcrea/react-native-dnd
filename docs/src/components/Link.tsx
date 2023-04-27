/** @jsxImportSource react */
import type { AnchorHTMLAttributes, FunctionComponent, PropsWithChildren } from "react";

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export const Link: FunctionComponent<PropsWithChildren<LinkProps>> = ({ children, ...otherProps }) => {
  return <a {...otherProps}>{children}</a>;
};
