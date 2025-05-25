// components/ui/PageHeader.tsx
import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function PageHeader({
  title,
  description,
  action,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`mb-10 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800">{title}</h1>
          {description && (
            <p className="mt-3 text-lg text-gray-600 max-w-3xl">
              {description}
            </p>
          )}
        </div>
        {action && <div className="md:ml-4">{action}</div>}
      </div>
    </div>
  );
}
