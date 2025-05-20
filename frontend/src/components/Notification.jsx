import { useState, useEffect } from 'react';

const Notification = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible || !message) return null;

  const bgColor = 
    type === 'success' ? 'bg-green-100 border-green-400 text-green-700' :
    type === 'error' ? 'bg-red-100 border-red-400 text-red-700' :
    'bg-blue-100 border-blue-400 text-blue-700';

  return (
    <div className={`fixed top-4 right-4 px-4 py-3 rounded border ${bgColor} max-w-md`}>
      <span className="block sm:inline">{message}</span>
      <button 
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        className="absolute top-0 right-0 px-4 py-3"
      >
        <span className="text-xl">&times;</span>
      </button>
    </div>
  );
};

export default Notification; 