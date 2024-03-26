import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const Search = React.forwardRef<SVGSVGElement, IconProps>(({ className, ...props }, ref) => (
  <svg
    ref={ref}
    {...props}
    className={className}
    width="24"
    height="25"
    viewBox="0 0 24 24"
    fill="white"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
));
Search.displayName = "Search";

interface SpinnerProps {
  className?: string;
  size?: number;
  color?: string;
  dur?: string;
}

export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size = 50, color = "#000", dur = ".9s", ...props }, ref) => {
    const animate = {
      repeatCount: "indefinite",
      calcMode: "spline",
      keyTimes: "0;0.5;1",
      keySplines: "0.25 0.1 0.25 1;0.25 0.1 0.25 1",
    };
    return (
      <svg
        ref={ref}
        className={className + " animate-spin"}
        width={size}
        height={size}
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <circle cx="10" cy="10" r="5" fill={color}>
          <animate attributeName="cx" values="10;25;10" dur={dur} {...animate} />
          <animate attributeName="cy" values="10;25;10" dur={dur} {...animate} />
        </circle>
        <circle cx="40" cy="10" r="5" fill={color}>
          <animate attributeName="cx" values="40;25;40" dur={dur} {...animate} />
          <animate attributeName="cy" values="10;25;10" dur={dur} {...animate} />
        </circle>
        <circle cx="40" cy="40" r="5" fill={color}>
          <animate attributeName="cx" values="40;25;40" dur={dur} {...animate} />
          <animate attributeName="cy" values="40;25;40" dur={dur} {...animate} />
        </circle>
        <circle cx="10" cy="40" r="5" fill={color}>
          <animate attributeName="cx" values="10;25;10" dur={dur} {...animate} />
          <animate attributeName="cy" values="40;25;40" dur={dur} {...animate} />
        </circle>
      </svg>
    );
  }
);
