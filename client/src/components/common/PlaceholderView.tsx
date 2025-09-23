import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface PlaceholderViewProps {
  title: string;
  message?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  title,
  message = "This feature is coming soon...",
  showBackButton = false,
  showHomeButton = false,
  icon,
  actions
}) => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        {icon && (
          <div className="flex justify-center mb-4">
            {icon}
          </div>
        )}
        <p className="text-gray-600 mb-6">{message}</p>
        
        {actions || (
          <div className="flex gap-3">
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
            )}
            {showHomeButton && (
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                Go to Home
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Specialized placeholder components
export const ComingSoonView: React.FC<{ title: string; message?: string }> = ({ 
  title, 
  message = "This feature is coming soon..." 
}) => (
  <PlaceholderView title={title} message={message} />
);

export const DetailView: React.FC<{ 
  title: string; 
  id: string; 
  message?: string; 
}> = ({ title, id, message }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const actualId = id || paramId;
  
  return (
    <PlaceholderView 
      title={title}
      message={message || `Details for ${title.toLowerCase()} #${actualId} coming soon...`}
      showBackButton
    />
  );
};

export const ErrorView: React.FC<{
  code: string;
  title: string;
  message: string;
  showHomeButton?: boolean;
  showReloadButton?: boolean;
}> = ({ code, title, message, showHomeButton = true, showReloadButton = false }) => {
  const navigate = useNavigate();

  const getErrorIcon = () => {
    switch (code) {
      case '404':
        return <div className="text-9xl font-bold text-gray-300">{code}</div>;
      case '401':
        return <div className="text-4xl font-bold text-gray-900">{code}</div>;
      case '403':
        return <div className="text-4xl font-bold text-gray-900">{code}</div>;
      case '500':
        return <div className="text-4xl font-bold text-gray-900">{code}</div>;
      default:
        return <div className="text-4xl font-bold text-gray-900">{code}</div>;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          {getErrorIcon()}
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600 mb-8">{message}</p>
        </div>
        <div className="space-y-4">
          {showHomeButton && (
            <button 
              onClick={() => navigate('/')} 
              className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors"
            >
              Go to Home
            </button>
          )}
          {showReloadButton && (
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Try Again
            </button>
          )}
          <button 
            onClick={() => navigate(-1)} 
            className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
