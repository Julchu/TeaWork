import {
  deleteDoc,
  doc,
  DocumentReference,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { GroceryListFormData } from '../components/GroceryLists';
import { db, GroceryList, Unit } from '../lib/firebase/interfaces';
import { oldUseAuthContext } from './old-use-auth-context';
import { filterNullableObject } from '../lib/textFormatters';

type GroceryListMethods = {
  submitGroceryList: (
    groceryListData: GroceryListFormData,
  ) => Promise<DocumentReference<GroceryList> | undefined>;

  updateGroceryList: (
    groceryListData: GroceryListFormData,
  ) => Promise<DocumentReference<GroceryList> | undefined>;

  deleteGroceryList: (groceryListId: string) => Promise<DocumentReference<GroceryList> | undefined>;
};

const useGroceryListHook = (): [GroceryListMethods, boolean, Error | undefined] => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const { authUser } = oldUseAuthContext();

  const submitGroceryList = useCallback<GroceryListMethods['submitGroceryList']>(
    async ({ name, ingredients, viewable = false }) => {
      if (!authUser) return;
      setLoading(true);

      // Creating doc with auto-generated id
      const groceryListDocRef = doc(db.groceryListCollection);

      // Ensuring all fields are passed by typechecking Ingredient
      const newList: GroceryList = {
        name: name.trim(),
        ingredients: ingredients.map(({ name: ingredientName, capacity, unit = Unit.item }) => {
          return { name: ingredientName, capacity, unit, userId: authUser.documentId };
        }),
        viewable,
        userId: authUser.documentId,
        createdAt: serverTimestamp(),
      };

      try {
        /* If you want to auto generate an ID, use addDoc() + collection()
         * If you want to manually set the ID, use setDoc() + doc()
         */
        await setDoc(groceryListDocRef, newList);
      } catch (e) {
        setError(e as Error);
      }

      setLoading(false);
      return groceryListDocRef;
    },
    [authUser],
  );

  const updateGroceryList = useCallback<GroceryListMethods['updateGroceryList']>(
    async ({ groceryListId, name, ingredients, viewable }) => {
      if (!authUser) return;
      const groceryListDocRef = doc(db.groceryListCollection, groceryListId);

      const upgradedList = filterNullableObject({
        name,
        ingredients,
        viewable,
      });

      try {
        await updateDoc(groceryListDocRef, upgradedList);
      } catch (e) {
        setError(e as Error);
      }

      return groceryListDocRef;
    },
    [authUser],
  );

  const deleteGroceryList = useCallback<GroceryListMethods['deleteGroceryList']>(
    async groceryListId => {
      if (!authUser) return;

      // TODO: fix updating list (shows wrong list deleted until refresh)
      const groceryListDocRef = doc(db.groceryListCollection, groceryListId);

      try {
        await deleteDoc(groceryListDocRef);
      } catch (e) {
        setError(e as Error);
      }

      return groceryListDocRef;
    },
    [authUser],
  );

  return [{ submitGroceryList, updateGroceryList, deleteGroceryList }, loading, error];
};

export default useGroceryListHook;