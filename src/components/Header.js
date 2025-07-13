import React from 'react';

const Header = () => (
  <header className="flex items-center justify-between p-4 bg-white shadow mb-6">
    <div className="flex items-center">
      <img
        src="/logo.png"
        alt="College Logo"
        className="h-12 w-auto mr-4"
        style={{ maxWidth: '100%' }}
      />
      <h1 className="text-2xl font-bold text-gray-800">Navrachana University</h1>
    </div>
    <img
      src="/logo2.png"
      alt="Bioshodh Lab Softwares Logo"
      className="h-12 w-auto ml-4"
      style={{ maxWidth: '100%' }}
    />
  </header>
);

export default Header; 