import React, { useState } from 'react';
import Modal from '../ui/modal';
import { Button } from '../ui/button';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette, 
  Zap,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Define settings sections
type SettingsSection = 'profile' | 'notifications' | 'privacy' | 'integrations' | 'appearance' | 'performance';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: SettingsSection;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialSection = 'profile',
  isDarkMode,
  toggleDarkMode
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);

  // Settings navigation items
  const settingsSections = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <Shield size={18} /> },
    { id: 'integrations', label: 'Integrations', icon: <Globe size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
    { id: 'performance', label: 'Performance', icon: <Zap size={18} /> },
  ] as const;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      size="xl"
      className="h-[80vh] max-h-[600px] flex flex-col"
    >
      <div className="flex flex-col md:flex-row h-full overflow-hidden -mt-4 -mb-4">
        {/* Settings navigation */}
        <div className="w-full md:w-64 border-r border-border overflow-y-auto p-0">
          <nav className="p-2">
            <ul className="space-y-1">
              {settingsSections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                      activeSection === section.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0">{section.icon}</span>
                      <span>{section.label}</span>
                    </div>
                    <ChevronRight size={16} className={activeSection === section.id ? "opacity-100" : "opacity-0"} />
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Settings content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Profile Settings */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Profile Settings</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="displayName" className="block text-sm font-medium">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Your display name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="bio" className="block text-sm font-medium">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Tell us about yourself"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Notification Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Email Notifications</h4>
                    <p className="text-xs text-muted-foreground">Receive email notifications for important updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Push Notifications</h4>
                    <p className="text-xs text-muted-foreground">Receive push notifications in your browser</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Content Updates</h4>
                    <p className="text-xs text-muted-foreground">Get notified about content status changes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Appearance Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Dark Mode</h4>
                    <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isDarkMode}
                      onChange={toggleDarkMode}
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Theme Color</h4>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-full bg-blue-500 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
                    <button className="w-8 h-8 rounded-full bg-green-500 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
                    <button className="w-8 h-8 rounded-full bg-purple-500 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
                    <button className="w-8 h-8 rounded-full bg-orange-500 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
                    <button className="w-8 h-8 rounded-full bg-red-500 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Font Size</h4>
                  <select className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="small">Small</option>
                    <option value="medium" selected>Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Other sections would be implemented similarly */}
          {(activeSection === 'privacy' || activeSection === 'integrations' || activeSection === 'performance') && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} settings coming soon</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button>
          Save Changes
        </Button>
      </div>
    </Modal>
  );
};

export default SettingsModal;