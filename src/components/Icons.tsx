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
Spinner.displayName = "Spinner";

export const Reload = React.forwardRef<SVGSVGElement, IconProps>(({ className, ...props }, ref) => (
  <svg
    ref={ref}
    {...props}
    className={className}
    width="24"
    height="24"
    viewBox="0 0 65 65"
    fill="#000"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M32.5 4.999c-5.405 0-10.444 1.577-14.699 4.282l-5.75-5.75v16.11h16.11l-6.395-6.395c3.18-1.787 6.834-2.82 10.734-2.82 12.171 0 22.073 9.902 22.073 22.074 0 2.899-0.577 5.664-1.599 8.202l4.738 2.762c1.47-3.363 2.288-7.068 2.288-10.964 0-15.164-12.337-27.501-27.5-27.501z" />
    <path d="M43.227 51.746c-3.179 1.786-6.826 2.827-10.726 2.827-12.171 0-22.073-9.902-22.073-22.073 0-2.739 0.524-5.35 1.439-7.771l-4.731-2.851c-1.375 3.271-2.136 6.858-2.136 10.622 0 15.164 12.336 27.5 27.5 27.5 5.406 0 10.434-1.584 14.691-4.289l5.758 5.759v-16.112h-16.111l6.389 6.388z" />
  </svg>
));
Reload.displayName = "Reload";

export const Edit = React.forwardRef<SVGSVGElement, IconProps>(({ className, ...props }, ref) => (
  <svg
    ref={ref}
    {...props}
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#000"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
));
Edit.displayName = "Edit";

export const Close = React.forwardRef<SVGSVGElement, IconProps>(({ className, ...props }, ref) => (
  <svg
    ref={ref}
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    stroke="#000"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
));
Close.displayName = "Close";
