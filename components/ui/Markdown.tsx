// components/ui/Markdown.tsx
import ReactMarkdown from 'react-markdown';

export function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-lg font-bold my-2" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-md font-bold my-2" {...props} />,
        h4: ({ node, ...props }) => <h4 className="font-bold my-2" {...props} />,
        p: ({ node, ...props }) => <p className="my-2" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-2" {...props} />,
        li: ({ node, ...props }) => <li className="my-1" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
        em: ({ node, ...props }) => <em className="italic" {...props} />,
        pre: ({ node, ...props }) => <pre className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-2 rounded my-2 overflow-x-auto" {...props} />,
        code: ({ node, ...props }) => <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-1 py-0.5 rounded" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
