import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getWorkspaceByUserId } from '../utils/db';

const WorkspaceContext = createContext();

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
}

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);

  useEffect(() => {
    if (user) {
      const ws = getWorkspaceByUserId(user.id);
      setWorkspace(ws);
    } else {
      setWorkspace(null);
      setCurrentBrand(null);
      setCurrentProject(null);
    }
  }, [user]);

  const value = {
    workspace,
    setWorkspace,
    currentBrand,
    setCurrentBrand,
    currentProject,
    setCurrentProject
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
