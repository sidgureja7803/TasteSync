import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface TopbarProps {
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  signOut: () => Promise<void>;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({
  firstName,
  lastName,
  profileImageUrl,
  signOut,
  isDarkMode = false,
  toggleDarkMode = () => {},
}) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
  };

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isProfileDropdownOpen) setIsProfileDropdownOpen(false);
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        {/* Logo - visible on mobile, hidden on desktop (as it's in the sidebar) */}
        <Link to="/" className="text-2xl font-bold lg:hidden">
          TasteSync
        </Link>

        {/* Search bar */}
        <div className={cn(
          "relative transition-all duration-200 ease-in-out",
          isSearchActive ? "w-full md:w-96" : "w-10 md:w-64"
        )}>
          <div className="relative flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-0 top-0 h-10 w-10 text-muted-foreground"
              onClick={toggleSearch}
            >
              <Search size={18} />
            </Button>
            <input
              type="text"
              placeholder="Search..."
              className={cn(
                "h-10 w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isSearchActive ? "opacity-100" : "opacity-0 md:opacity-100"
              )}
              onFocus={() => setIsSearchActive(true)}
              onBlur={() => setTimeout(() => setIsSearchActive(false), 200)}
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            className="text-muted-foreground hover:text-foreground"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleNotifications}
              className="text-muted-foreground hover:text-foreground relative"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </Button>

            {/* Notifications dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-card border border-border overflow-hidden z-20">
                <div className="p-4 border-b border-border">
                  <h3 className="font-medium">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-border hover:bg-muted/50 cursor-pointer">
                    <p className="text-sm font-medium">New comment on your post</p>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                  </div>
                  <div className="p-4 border-b border-border hover:bg-muted/50 cursor-pointer">
                    <p className="text-sm font-medium">Your content was published</p>
                    <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                  </div>
                  <div className="p-4 hover:bg-muted/50 cursor-pointer">
                    <p className="text-sm font-medium">Content generation completed</p>
                    <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                  </div>
                </div>
                <div className="p-2 border-t border-border">
                  <Button variant="ghost" size="sm" className="w-full justify-center text-xs">
                    View all notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* User profile */}
          <div className="relative">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 hover:bg-muted"
              onClick={toggleProfileDropdown}
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  {firstName?.charAt(0) || ''}
                </div>
              )}
              <span className="hidden md:inline-block">{firstName || 'User'}</span>
              <ChevronDown size={16} className="text-muted-foreground" />
            </Button>

            {/* Profile dropdown */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card border border-border overflow-hidden z-20">
                <div className="p-2">
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </Link>
                  <Link 
                    to="/settings" 
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted"
                  >
                    <LogOut size={16} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;