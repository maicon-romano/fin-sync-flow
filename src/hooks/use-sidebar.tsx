
import { useState, useEffect } from 'react';

export function useSidebar() {
  // Use localStorage to persist the sidebar state
  const [isOpen, setIsOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebar-state');
    return savedState ? savedState === 'open' : true; // Default to open
  });

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebar-state', isOpen ? 'open' : 'closed');
  }, [isOpen]);

  const toggleSidebar = () => setIsOpen(!isOpen);
  
  return { isOpen, toggleSidebar };
}
