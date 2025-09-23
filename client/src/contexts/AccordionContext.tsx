import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface AccordionContextType {
  expandedItem: string | null;
  setExpandedItem: (itemId: string | null) => void;
  toggleExpanded: (itemId: string) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

export const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within an AccordionProvider');
  }
  return context;
};

interface AccordionProviderProps {
  children: ReactNode;
}

export const AccordionProvider: React.FC<AccordionProviderProps> = ({ children }) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleExpanded = (itemId: string) => {
    setExpandedItem(prev => prev === itemId ? null : itemId);
  };

  return (
    <AccordionContext.Provider value={{ expandedItem, setExpandedItem, toggleExpanded }}>
      {children}
    </AccordionContext.Provider>
  );
};
