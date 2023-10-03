import { doc, DocumentReference, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db, PersonalIngredient, Unit } from '../lib/firebase/interfaces';
import {
  calcIndividualPrice,
  filterNullableObject,
  priceConverter,
  unitConverter,
} from '../lib/textFormatters';
import { useAuthContext } from './use-auth-context';
import { IngredientFormData } from '../components/HomeDashboard';

type IngredientMethods = {
  submitIngredient: (
    ingredientData: IngredientFormData,
  ) => Promise<DocumentReference<PersonalIngredient> | undefined>;

  updateIngredient: (
    ingredientData: IngredientFormData,
  ) => Promise<DocumentReference<PersonalIngredient> | undefined>;
};

const useIngredientHook = (): [IngredientMethods, boolean, Error | undefined] => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const { authUser } = useAuthContext();

  const submitIngredient = useCallback<IngredientMethods['submitIngredient']>(
    async ({ name, price, capacity, quantity, unit, image }) => {
      if (!authUser) return;
      setLoading(true);

      /* Save price per measurement per quantity
       * When displaying data, can measure based on current measurement and quantity to compare prices
       */
      const pricePerCapacity = calcIndividualPrice(price, capacity, quantity);
      const convertedUnit = unitConverter(unit);
      const convertedPricePerMeasurement = priceConverter(pricePerCapacity, unit, {
        mass: Unit.kilogram,
        volume: Unit.litre,
      }).toFixed(2);

      // Creating doc with auto-generated id
      const ingredientDocRef = doc(db.ingredientCollection);

      // Ensuring all fields are passed by typechecking Ingredient
      const newIngredient: PersonalIngredient = {
        name: name.trim().toLocaleLowerCase('en-US'),
        price: parseFloat(convertedPricePerMeasurement),
        unit: convertedUnit,
        userId: authUser.uid,
        createdAt: serverTimestamp(),
        image,
      };

      try {
        /* If you want to auto generate an ID, use addDoc() + collection()
         * If you want to manually set the ID, use setDoc() + doc()
         */
        await setDoc(ingredientDocRef, newIngredient);
      } catch (e) {
        setError(e as Error);
      }

      setLoading(false);
      return ingredientDocRef;
    },
    [authUser],
  );

  const updateIngredient = useCallback<IngredientMethods['updateIngredient']>(
    async ({ ingredientId, price, capacity, quantity, unit, location, image }) => {
      const pricePerMeasurement = calcIndividualPrice(price, capacity, quantity);
      const convertedPreviewPrice = priceConverter(pricePerMeasurement, unit, {
        mass: Unit.kilogram,
        volume: Unit.litre,
      }).toFixed(2);

      const ingredientDocRef = doc(db.ingredientCollection, ingredientId);

      const updatedIngredient = filterNullableObject({
        ingredientId,
        price: parseFloat(convertedPreviewPrice),
        unit,
        location,
        image,
      });

      try {
        await updateDoc(ingredientDocRef, updatedIngredient);
      } catch (e) {
        setError(e as Error);
      }

      return ingredientDocRef;
    },
    [],
  );

  return [{ submitIngredient, updateIngredient }, loading, error];
};

export default useIngredientHook;

// Examples
/* If you want to auto generate an ID, use addDoc() + collection()
 * If you want to manually set the ID, use setDoc() + doc()
 */

/* Add: auto-generate doc and give it ID automatically
 * addDoc(collection requires odd-numbered path)
 * Ex: db, collection: <collectionName>; becomes collectionName/0tG4ooMGjsdiyMfbjP3x
 * Ex: db, collection: <collectionName>, <documentName>, <subCollectionName>; collectionName/0tG4ooMGjsdiyMfbjP3x/strawberry
 */

/* const ingredientsCollectionRef = collection(db, 'ingredients').withConverter(ingredientsConverter);
try {
  const docRef = await addDoc(ingredientsCollectionRef, {
    name,
    price,
    unit,
    location,
  });
  console.log('Document written with ID: ', docRef.id);
} catch (e) {
  setError(e as Error);
}

return ingredientsCollectionRef; */

/* Setting (adding): create or overwrite a single document with manually-named document IDs
 * setDoc(collection requires even-numbered path)
 * Ex: db, collection: <collectionName>, <documentName>
 */

/* const ingredientDocumentRef = doc(db, 'ingredients').withConverter(ingredientsConverter);
try {
  await setDoc(ingredientDocumentRef, {
    name: name.trim().toLocaleLowerCase('en-US'),
    price,
    unit,
    location,
  });
} catch (e) {
  setError(e as Error);
}

return ingredientDocumentRef;

// Setting key as ingredient name, value as the ingredient's name
await setDoc(
  ingredientDocumentRef,
  {
    [`${trimmedName}`]: ingredientInfo,
  },
  { merge: true },
);
*/
