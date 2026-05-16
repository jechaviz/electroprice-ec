import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

const NotFoundPage: React.FC = () => {
  useSEO({
    title: '404 - Page Not Found',
    description: 'The page you are looking for does not exist.',
    keywords: ['404', 'not found'],
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-base-100 text-base-content px-4">
      <div className="text-center max-w-lg">
        <div className="w-28 h-28 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/10">
          <span className="text-6xl font-black text-primary" style={{ fontFamily: 'Outfit, sans-serif' }}>404</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Page Not Found
        </h1>
        <p className="text-base-content/60 mb-8 text-lg">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="btn btn-primary rounded-2xl px-8 h-12 shadow-lg shadow-primary/20 font-bold"
        >
          <i className="fa-solid fa-house mr-2"></i> Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
