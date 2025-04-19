
import { useState, useEffect } from 'react';

export function useSidebar() {
  // Use localStorage to persist the sidebar state
  const [isOpen, setIsOpen] = useState(() => {
    // Try to get the saved state from localStorage
    try {
      const savedState = localStorage.getItem('sidebar-state');
      return savedState ? savedState === 'open' : true; // Default to open
    } catch (error) {
      // If there's an error with localStorage (e.g., in private browsing), default to open
      return true;
    }
  });

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('sidebar-state', isOpen ? 'open' : 'closed');
    } catch (error) {
      // Silently fail if localStorage is not available
      console.log('Could not save sidebar state to localStorage');
    }
  }, [isOpen]);

  const toggleSidebar = () => setIsOpen(!isOpen);
  
  return { isOpen, toggleSidebar };
}
