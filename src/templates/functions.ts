import { collection, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { firestore } from '.';
import { db, PersonalIngredient } from './interfaces';

// Retrieves list of documents
export const getDocuments = async (collectionName: string): Promise<void> => {
  const querySnapshot = await getDocs(collection(firestore, collectionName));
  querySnapshot.forEach(doc => {
    console.log(doc.id, doc.data());
  });
};

// Retrieves list of ingredient names
export const getIngredientNames = async (
  collectionName: string,
  documentId: string,
  callback: (arg0: PersonalIngredient) => void,
): Promise<void> => {
  const snap = await getDoc(
    // Retrieve single document with known id
    db.ingredientDoc(documentId),
  );
  if (snap.exists()) {
    callback(snap.data());
  }
};

const deleteDocument = async (collectionName: string, docName: string): Promise<void> => {
  await deleteDoc(doc(firestore, collectionName, docName));
};

export const deleteCollection = async (collectionName: string): Promise<void> => {
  const querySnapshot = await getDocs(collection(firestore, collectionName));
  querySnapshot.forEach(doc => {
    console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
    deleteDocument(collectionName, doc.id);
  });
};

export const buildIngredientsDb = async (): Promise<void> => {};

/*

const storageRef = ref(storage, 'some-child');

// 'file' comes from the Blob or File API
uploadBytes(storageRef, file).then(snapshot => {
  console.log('Uploaded a blob or file!');
});
*/

// Compares ingredients from sheets to Firestore using their unique PLU code
export const compareIngredients = async (): Promise<void> => {
  /* 16 columns:
   ** 0: "PLU"
   ** 1: "CATEGORY"
   ** 2: "COMMODITY"
   ** 3: "VARIETY"
   ** -- 4: "SIZE"
   ** -- 5: "MEASUREMENTS: NORTH AMERICA"
   ** -- 6: "MEASUREMENTS: REST OF WORLD"
   ** -- 7: "RESTRICTIONS / NOTES"
   ** -- 8: "BOTANICAL NAME"
   ** -- 9: "AKA"
   ** -- 10: "NOTES"
   ** -- 11: "REVISION DATE"
   ** -- 12: "DATE ADDED"
   ** -- 13: "GPC"
   ** 14: "IMAGE"
   ** -- 15: "IMAGE_SOURCE"
   */
};

// export const test = async (): Promise<void> => {
//   const ingredientDocumentRef = db.ingredientInfoDoc('banana');

//   const ingredientInfo: Ingredient = {
//     name: trimmedName,
//     submissions: arrayUnion(docRef.id),
//     count: increment(1),
//     total: increment(price),
//     lowest,
//     unit: existingUnit,
//   };

//   await setDoc(ingredientDocumentRef, ingredientInfo, { merge: true });
// };
