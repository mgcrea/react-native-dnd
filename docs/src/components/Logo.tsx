/** @jsxImportSource react */
import type { FunctionComponent, HTMLAttributes, SVGAttributes } from "react";

export type LogoIconProps = SVGAttributes<SVGElement>;

export const LogoIcon: FunctionComponent<LogoIconProps> = (props) => {
  return (
    <svg width="100" height="100" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g transform="translate(100,100)">
        <circle
          className="logoAtom"
          stroke="#ffc743"
          strokeDasharray="5,5"
          strokeWidth="3"
          fill="none"
          r="10"
        />
        <g fill="none" stroke="#61dafb" strokeWidth="3">
          <ellipse rx="55" ry="20" />
          <ellipse rx="55" ry="20" transform="matrix(.5 .8660254 -.8660254 .5 0 0)" />
          <ellipse rx="55" ry="20" transform="matrix(-.5 .8660254 -.8660254 -.5 0 0)" strokeDasharray="5,5" />
        </g>
        {/* <g id="ellipseContainer">
          <circle id="movingCircle" cx="55" cy="0" r="5" fill="#61dafb"/>
        </g> */}
        <g transform="matrix(-.5 .8660254 -.8660254 -.5 0 0)">
          <g className="logoElectronContainer">
            <circle className="logoElectron" cx="55" cy="0" r="5" fill="#ffc743" />
          </g>
        </g>
      </g>
    </svg>
  );
};

export type LogoProps = HTMLAttributes<HTMLDivElement>;

export const Logo: FunctionComponent = (props) => {
  return (
    <div className="flex flex-row items-center" {...props}>
      <LogoIcon className="inline-block h-12 w-auto scale-[1.75] fill-slate-700 dark:fill-sky-100" />
      <div className="flex flex-col items-center">
        <span className="hidden px-3 font-mono text-xs font-semibold lg:inline-block">React Native</span>
        <span className="mx-3 hidden rounded-md bg-slate-800 px-2 font-mono font-semibold lg:inline-block">
          <span className="text-primary-500 cursor-move hover:text-[#ffc743]">Drag</span>
          <span className="font-black text-white">&</span>
          <span className="hover:text-primary-500 cursor-crosshair text-[#ffc743]">Drop</span>
        </span>
      </div>
    </div>
  );
};
