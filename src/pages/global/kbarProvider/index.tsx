import { ReactNode } from 'react';
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch,
} from 'kbar';

import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import Divider from '@mui/material/Divider';

import useExistingSecurityActions from './useExistingSecurityActions';
import useNewSecurityActions from './useNewSecurityActions';
import Results from './Results';

export const newSecurityActionId = 'add-new-security-action';

const CommandBar = () => {
  const { palette } = useTheme();

  const { isLoading: existingLoading } = useExistingSecurityActions();
  const { isLoading: newLoading } = useNewSecurityActions();

  const isLoading = existingLoading || newLoading;

  // Backdrop styles
  const positionerStyle = {
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1300,
  };

  // Paper styles
  const animatorStyle = {
    maxWidth: '600px',
    width: '100%',
    background: palette.grey[900],
    borderRadius: '8px',
    border: `1px solid ${palette.grey[600]}`,
    overflow: 'hidden',
  };

  // Search bar styles
  const searchStyle = {
    padding: '14px 16px',
    fontSize: '16px',
    width: '100%',
    outline: 'none',
    border: 'none',
    background: 'transparent',
    color: palette.grey[100],
    fontFamily: 'Geist-Variable, Arial, sans-serif',
  };

  return (
    <KBarPortal>
      <KBarPositioner style={positionerStyle}>
        <KBarAnimator style={animatorStyle}>
          <KBarSearch style={searchStyle} defaultPlaceholder="Search your securities..." />
          <Divider sx={{ borderColor: palette.grey[800] }} />
          <Results loading={isLoading} />
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  );
};

const Provider = ({ children }: { children: ReactNode }) => {
  const initialActions = [{
    id: newSecurityActionId,
    name: 'Add a new security...',
    icon: <AddIcon />,
  }];

  return (
    <KBarProvider actions={initialActions}>
      <CommandBar />
      {children}
    </KBarProvider>
  );
};

export default Provider;
