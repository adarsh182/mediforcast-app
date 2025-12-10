import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

export default function UserManager({ onClose }) {
  const { users, currentUserId, addUser, updateUser, deleteUser, switchUser } = useUser();
  const { theme } = useTheme();
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({ name: '', age: '', gender: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const bgClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const inputBgClass = theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a name');
      return;
    }
    const newUser = addUser(formData);
    switchUser(newUser.id);
    setFormData({ name: '', age: '', gender: '' });
    setShowAddForm(false);
  };

  const handleUpdateUser = (userId, e) => {
    e.preventDefault();
    updateUser(userId, formData);
    setEditingUserId(null);
    setFormData({ name: '', age: '', gender: '' });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? All their history will be deleted.')) {
      deleteUser(userId);
      if (editingUserId === userId) {
        setEditingUserId(null);
      }
    }
  };

  const startEditing = (user) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name || '',
      age: user.age || '',
      gender: user.gender || '',
    });
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setFormData({ name: '', age: '', gender: '' });
  };

  // Only show added users, not default user
  const allUsers = users.filter(u => u.id !== 'default');
  
  // Get current user name for display
  const getCurrentUserName = () => {
    if (currentUserId === 'default') {
      return 'Default User';
    }
    const user = users.find(u => u.id === currentUserId);
    return user?.name || 'Default User';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgClass} border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${textClass}`}>Manage Users</h2>
          <button
            onClick={onClose}
            className={`text-2xl ${textSecondaryClass} hover:${textClass}`}
          >
            ×
          </button>
        </div>

        {/* Current User Indicator */}
        <div className={`${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-50'} border border-blue-500 rounded-lg p-3 mb-4`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
            <strong>Current User:</strong> {getCurrentUserName()}
            {currentUserId === 'default' && (
              <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">Default</span>
            )}
          </p>
        </div>

        {/* Users List */}
        <div className="space-y-3 mb-6">
          {allUsers.map((user) => (
            <div
              key={user.id}
              className={`${bgClass} border rounded-lg p-4 ${
                currentUserId === user.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {editingUserId === user.id ? (
                <form onSubmit={(e) => handleUpdateUser(user.id, e)} className="space-y-3">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Name"
                    className={`w-full p-2 ${inputBgClass} rounded border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="Age (optional)"
                      className={`p-2 ${inputBgClass} rounded border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className={`p-2 ${inputBgClass} rounded border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Gender (optional)</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className={`px-4 py-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} hover:opacity-80 ${textClass} rounded`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${textClass}`}>{user.name}</h3>
                      {currentUserId === user.id && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Active</span>
                      )}
                    </div>
                    {(user.age || user.gender) && (
                      <p className={`text-sm ${textSecondaryClass} mt-1`}>
                        {user.age && `Age: ${user.age}`}
                        {user.age && user.gender && ' • '}
                        {user.gender && `Gender: ${user.gender}`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {currentUserId !== user.id ? (
                      <button
                        onClick={() => switchUser(user.id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                      >
                        Activate
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-3 py-1 bg-gray-400 text-white text-sm rounded cursor-not-allowed"
                      >
                        Active
                      </button>
                    )}
                    {user.id !== 'default' && (
                      <>
                        <button
                          onClick={() => startEditing(user)}
                          className={`px-3 py-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} hover:opacity-80 ${textClass} text-sm rounded`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add User Form */}
        {showAddForm ? (
          <form onSubmit={handleAddUser} className={`${bgClass} border rounded-lg p-4 space-y-3`}>
            <h3 className={`font-semibold ${textClass} mb-2`}>Add New User</h3>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Name *"
              className={`w-full p-2 ${inputBgClass} rounded border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Age (optional)"
                className={`p-2 ${inputBgClass} rounded border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className={`p-2 ${inputBgClass} rounded border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Gender (optional)</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Add User
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', age: '', gender: '' });
                }}
                className={`px-4 py-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} hover:opacity-80 ${textClass} rounded`}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
          >
            + Add New User
          </button>
        )}
      </div>
    </div>
  );
}

