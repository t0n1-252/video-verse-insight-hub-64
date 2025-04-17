
import * as React from "react";
import { cn } from "@/lib/utils";

const Spinner = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-spin h-5 w-5 border-t-2 border-blue-500 rounded-full", className)}
      {...props}
    />
  );
};

export { Spinner };
