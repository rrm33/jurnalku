export default function Linkify({ children }) {
  if (!children || typeof children !== 'string') return children;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = children.split(urlRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a 
              key={i} 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-pink-600 font-bold hover:underline break-all"
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
}
