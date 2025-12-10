import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

const DEFAULT_USER = {
  id: 'default',
  name: 'Default User',
  createdAt: new Date().toISOString(),
};

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('default');

  // Load users from localStorage on mount
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('sumo_users') || '[]');
    const savedCurrentUserId = localStorage.getItem('sumo_current_user_id') || 'default';
    
    // Migrate old history format to user-specific format
    const oldHistory = localStorage.getItem('symptom_history');
    if (oldHistory) {
      try {
        const historyData = JSON.parse(oldHistory);
        if (Array.isArray(historyData) && historyData.length > 0) {
          // Migrate to default user
          localStorage.setItem('sumo_history_default', oldHistory);
          console.log(`Migrated ${historyData.length} history entries to default user`);
        }
        // Remove old history key
        localStorage.removeItem('symptom_history');
      } catch (e) {
        console.error('Error migrating history:', e);
      }
    }
    
    // If no users exist, create default user
    if (savedUsers.length === 0) {
      const defaultUsers = [DEFAULT_USER];
      localStorage.setItem('sumo_users', JSON.stringify(defaultUsers));
      setUsers(defaultUsers);
    } else {
      setUsers(savedUsers);
    }
    
    // Check if current user exists, if not use default
    const userExists = savedUsers.find(u => u.id === savedCurrentUserId);
    if (userExists || savedCurrentUserId === 'default') {
      setCurrentUserId(savedCurrentUserId);
    } else {
      setCurrentUserId('default');
      localStorage.setItem('sumo_current_user_id', 'default');
    }
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('sumo_users', JSON.stringify(users));
    }
  }, [users]);

  // Save current user ID to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sumo_current_user_id', currentUserId);
  }, [currentUserId]);

  const addUser = (userData) => {
    const newUser = {
      id: `user_${Date.now()}`,
      name: userData.name,
      age: userData.age || '',
      gender: userData.gender || '',
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (userId, userData) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, ...userData, updatedAt: new Date().toISOString() } : user
      )
    );
  };

  const deleteUser = (userId) => {
    if (userId === 'default') {
      alert('Cannot delete the default user.');
      return false;
    }
    
    // Delete user's history
    localStorage.removeItem(`sumo_history_${userId}`);
    
    setUsers(prev => prev.filter(user => user.id !== userId));
    
    // If deleted user was current, switch to default
    if (currentUserId === userId) {
      setCurrentUserId('default');
    }
    
    return true;
  };

  const switchUser = (userId) => {
    setCurrentUserId(userId);
  };

  const getCurrentUser = () => {
    if (currentUserId === 'default') {
      return DEFAULT_USER;
    }
    return users.find(u => u.id === currentUserId) || DEFAULT_USER;
  };

  return (
    <UserContext.Provider
      value={{
        users,
        currentUserId,
        currentUser: getCurrentUser(),
        addUser,
        updateUser,
        deleteUser,
        switchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

