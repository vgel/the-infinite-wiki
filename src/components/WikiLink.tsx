import Link from "next/link";

type Props = React.AnchorHTMLAttributes<{}> & { href: string };

const WikiLink: React.FC<Props> = ({ children, className, ...props }) => {
  return (
    <Link
      {...props}
      className={`text-blue-600 visited:text-purple-800 hover:underline whitespace-nowrap ${className ?? ""}`}
    >
      {children}
    </Link>
  );
};

export default WikiLink;
