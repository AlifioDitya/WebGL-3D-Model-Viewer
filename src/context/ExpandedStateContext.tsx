import React, { createContext, useContext, useState } from "react";

interface ExpandedStateContextProps {
  expandedNodes: { [key: string]: boolean };
  toggleNode: (uuid: string) => void;
}

const ExpandedStateContext = createContext<
  ExpandedStateContextProps | undefined
>(undefined);

// eslint-disable-next-line
export const useExpandedState = () => {
  const context = useContext(ExpandedStateContext);
  if (!context) {
    throw new Error(
      "useExpandedState must be used within an ExpandedStateProvider",
    );
  }
  return context;
};

export const ExpandedStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleNode = (uuid: string) => {
    setExpandedNodes((prevState) => ({
      ...prevState,
      [uuid]: !prevState[uuid],
    }));
  };

  return (
    <ExpandedStateContext.Provider value={{ expandedNodes, toggleNode }}>
      {children}
    </ExpandedStateContext.Provider>
  );
};
