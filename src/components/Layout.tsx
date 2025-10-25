import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="relative flex w-full">
        {/* Sidebar */}
        <Sidebar /> 
        
        {/* Main content */}
        <div className="flex-1 flex flex-col lg:ml-6">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;