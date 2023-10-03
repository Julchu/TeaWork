import { createContext, FC, ReactElement, ReactNode, useContext, useEffect, useState } from 'react';

/* SidebarTypes
  * userActions: (isOpen: boolean, onClose: () => void) => ReactElement;
  n* ewGroceryList: (isOpen: boolean, onClose: () => void) => ReactElement;
*/
export enum SidebarEnums {
  userActions = 'userActions',
  newGroceryList = 'newGroceryList',
}

export type SidebarTypes = {
  [SidebarEnums.userActions]: ReactElement;
  [SidebarEnums.newGroceryList]: ReactElement;
};

// Required Provider context value/function types
type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  panelId: string;
  setPanelId: (id: string) => void;
};

/* Private functions that are passable across different scopes through context that can be used by sidebar
 * Initial/default Provider values */
export const SidebarContext = createContext<SidebarProps>({
  isOpen: false,
  setIsOpen: () => {},
  panelId: '',
  setPanelId: () => {},
});

/* Optional for custom hook return type
 * Public values/functions object when user calls useSidebar();
 * Required return type for useSidebar()
 */
type SidebarContextType = {
  isSidebarOpen: boolean;
  openSidebar: (panelId: string) => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  panelId: string;
};

/* Public sidebar hook
 * const {isSidebarOpen, openSidebar, closeSidebar, toggleSidebar, panelId} = useSidebar();
 */
export const useSidebarContext = (): SidebarContextType => {
  const { isOpen, setIsOpen, panelId, setPanelId } = useContext(SidebarContext);

  // Closes sidebar when new page is loaded (like when navigating using Chakra Link)
  useEffect(() => {
    return () => setIsOpen(false);
  }, [setIsOpen]);

  return {
    isSidebarOpen: isOpen,
    openSidebar: (id: string) => {
      setPanelId(id);
      setIsOpen(true);
    },
    closeSidebar: () => {
      setIsOpen(false);
      setPanelId('');
    },
    toggleSidebar: () => setIsOpen(!isOpen),
    panelId: panelId,
  };
};

/* Sidebar context wrapper */
export const SidebarProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [panelId, setPanelId] = useState<string>('');

  return (
    // Get initial values of Sidebar Context (SidebarProps)
    <SidebarContext.Provider value={{ isOpen, setIsOpen, panelId, setPanelId }}>
      {children}
    </SidebarContext.Provider>
  );
};
