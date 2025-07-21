import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Menu
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface SidebarProps {
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  signOut: () => Promise<void>;
  isCollapsible?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  firstName,
  lastName,
  profileImageUrl,
  signOut,
  isCollapsible = true,
}) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items with icons
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/generate', label: 'Generate Content', icon: <FileText size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button - only visible on small screens */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleMobileMenu}
          className="rounded-full"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Sidebar - hidden on mobile unless menu is open */}
      <aside 
        className={cn(
          "bg-card text-card-foreground border-r border-border transition-all duration-300 ease-in-out h-screen",
          isCollapsed ? "w-[70px]" : "w-64",
          "fixed left-0 top-0 z-20",
          "lg:relative",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Collapse button - only visible if isCollapsible is true */}
        {isCollapsible && (
          <div className="hidden lg:block absolute -right-3 top-20">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleCollapse}
              className="rounded-full h-6 w-6 p-0 border border-border bg-background"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </Button>
          </div>
        )}

        {/* User profile section */}
        <div className={cn(
          "p-4 border-b border-border",
          isCollapsed ? "flex justify-center" : ""
        )}>
          {profileImageUrl ? (
            <div className={cn(
              "flex items-center",
              isCollapsed ? "justify-center" : "flex-col"
            )}>
              <img
                src={profileImageUrl}
                alt="Profile"
                className={cn(
                  "rounded-full object-cover",
                  isCollapsed ? "w-10 h-10" : "w-16 h-16 mb-2"
                )}
              />
              {!isCollapsed && (
                <p className="font-medium text-center">{firstName} {lastName}</p>
              )}
            </div>
          ) : (
            <div className={cn(
              "flex items-center",
              isCollapsed ? "justify-center" : "flex-col"
            )}>
              <div className={cn(
                "rounded-full bg-muted flex items-center justify-center text-muted-foreground",
                isCollapsed ? "w-10 h-10" : "w-16 h-16 mb-2 text-xl"
              )}>
                {firstName?.charAt(0) || ''}
              </div>
              {!isCollapsed && (
                <p className="font-medium text-center">{firstName} {lastName}</p>
              )}
            </div>
          )}
        </div>

        {/* Navigation links */}
        <nav className="p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 transition-colors",
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={handleSignOut}
                className={cn(
                  "w-full flex items-center rounded-md px-3 py-2 transition-colors",
                  "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <span className="flex-shrink-0"><LogOut size={20} /></span>
                {!isCollapsed && <span className="ml-3">Sign out</span>}
              </button>
            </li>
          </ul>
        </nav>

        {/* Mobile overlay - only visible when mobile menu is open */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10 lg:hidden"
            onClick={toggleMobileMenu}
          />
        )}
      </aside>

      {/* Spacer div to push content when sidebar is expanded */}
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out hidden lg:block",
          isCollapsed ? "w-[70px]" : "w-64"
        )} 
      />
    </>
  );
};

export default Sidebar;