import { onSnapshot, query, where } from 'firebase/firestore';
import { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react';
import { db, PersonalIngredient, WithDocId } from '../lib/firebase/interfaces';
import { useAuthContext } from './use-auth-context';

// Private context value types, set in Context Provider
type IngredientProps = {
  ingredientIndexes: Record<string, number>;
  setIngredientIndexes: (ingredients: Record<string, number>) => void;
  currentIngredients: WithDocId<PersonalIngredient>[];
  setCurrentIngredients: (ingredients: WithDocId<PersonalIngredient>[]) => void;
};

// Private context values
const IngredientContext = createContext<IngredientProps>({
  ingredientIndexes: {},
  setIngredientIndexes: () => {},
  currentIngredients: [],
  setCurrentIngredients: () => [],
});

// Public values
type IngredientContextType = {
  ingredientIndexes: Record<string, number>;
  currentIngredients: WithDocId<PersonalIngredient>[];
};

export const useIngredientContext = (): IngredientContextType => {
  const { authUser } = useAuthContext();
  const { ingredientIndexes, setIngredientIndexes, currentIngredients, setCurrentIngredients } =
    useContext(IngredientContext);

  // State for user's dictionary of ingredients
  // TODO: limit to 30 and add pagination
  useEffect(() => {
    if (!authUser?.uid) return;
    const q = query(db.ingredientCollection, where('userId', '==', authUser.uid));

    const unsubscribe = onSnapshot(q, querySnapshot => {
      const reducedIngredients: WithDocId<PersonalIngredient>[] = [];
      const reducedIndexes: Record<string, number> = {};

      querySnapshot.docs.forEach((ingredientDoc, index) => {
        reducedIngredients.push({ ...ingredientDoc.data(), documentId: ingredientDoc.id });
        reducedIndexes[ingredientDoc.data().name] = index;
      });

      setCurrentIngredients(reducedIngredients);
      setIngredientIndexes(reducedIndexes);
    });

    return () => unsubscribe();
  }, [authUser?.uid, setCurrentIngredients, setIngredientIndexes]);

  return { ingredientIndexes, currentIngredients };
};

export const IngredientProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [ingredientIndexes, setIngredientIndexes] = useState<Record<string, number>>({});
  const [currentIngredients, setCurrentIngredients] = useState<WithDocId<PersonalIngredient>[]>([]);

  return (
    <IngredientContext.Provider
      value={{ ingredientIndexes, setIngredientIndexes, currentIngredients, setCurrentIngredients }}
    >
      {children}
    </IngredientContext.Provider>
  );
};
