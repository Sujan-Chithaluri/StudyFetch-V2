// components/ui/EmptyState.tsx
import Link from "next/link";
import { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
};

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-lg shadow">
      {icon && <div className="mx-auto mb-4">{icon}</div>}
      
      <h2 className="text-xl font-medium text-gray-700 mb-2">{title}</h2>
      
      {description && (
        <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      )}
      
      {action && (
        <Link
          href={action.href}
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
