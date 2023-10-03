import { createContext, useContext } from 'react';

type GroceryListProps = {
  expandedIndex: number[];
  setExpandedIndex: (index: number[]) => void;
  groceryListCreator?: string;
};

export const GroceryListContext = createContext<GroceryListProps>({
  expandedIndex: [],
  setExpandedIndex: () => {},
  groceryListCreator: '',
});

export const useGroceryListContext = (): GroceryListProps => useContext(GroceryListContext);
