import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'PUBLIC' | 'NODAL_OFFICER' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  designation: string;
  department: string;
  role: UserRole;
  avatarBadge: string;
}

export const PRESET_USERS: Record<UserRole, UserProfile> = {
  PUBLIC: {
    id: 'usr_pub_001',
    name: 'Public Citizen / Researcher',
    designation: 'Open Data & Academic Access',
    department: 'National Portal of India — Citizen Gateway',
    role: 'PUBLIC',
    avatarBadge: 'CITIZEN'
  },
  NODAL_OFFICER: {
    id: 'usr_nodal_402',
    name: 'Shri A. K. Sharma',
    designation: 'Director (Infrastructure Monitoring)',
    department: 'MoSPI — Infrastructure & Project Monitoring Division (IPMD)',
    role: 'NODAL_OFFICER',
    avatarBadge: 'NODAL'
  },
  ADMIN: {
    id: 'usr_adm_999',
    name: 'Dr. V. K. Malhotra',
    designation: 'Director General (Data Systems & ML)',
    department: 'National Informatics Centre / MoSPI Central Atlas',
    role: 'ADMIN',
    avatarBadge: 'ADMIN'
  }
};

interface AuthContextType {
  role: UserRole;
  user: UserProfile;
  setRole: (role: UserRole) => void;
  switchPreset: (role: UserRole) => void;
  login: (role: UserRole, customName?: string) => void;
  logout: () => void;
  hasPermission: (permission: 'INTERVENE' | 'PIPELINE_RUN' | 'EXPORT_AUDIT' | 'ADMIN_ACCESS') => boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'paimana_gov_auth_role_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved && (saved === 'PUBLIC' || saved === 'NODAL_OFFICER' || saved === 'ADMIN')) {
        return saved as UserRole;
      }
    } catch {
      // fallback
    }
    return 'PUBLIC';
  });

  const [user, setUser] = useState<UserProfile>(PRESET_USERS[role]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setUser(PRESET_USERS[role]);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, role);
    } catch {
      // ignore
    }
  }, [role]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const switchPreset = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const login = (newRole: UserRole) => {
    setRoleState(newRole);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setRoleState('PUBLIC');
  };

  const hasPermission = (permission: 'INTERVENE' | 'PIPELINE_RUN' | 'EXPORT_AUDIT' | 'ADMIN_ACCESS'): boolean => {
    switch (permission) {
      case 'INTERVENE':
        return role === 'NODAL_OFFICER' || role === 'ADMIN';
      case 'PIPELINE_RUN':
        return role === 'ADMIN';
      case 'EXPORT_AUDIT':
        return role === 'NODAL_OFFICER' || role === 'ADMIN';
      case 'ADMIN_ACCESS':
        return role === 'ADMIN';
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        setRole,
        switchPreset,
        login,
        logout,
        hasPermission,
        isAuthModalOpen,
        setIsAuthModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
