import {
  doc,
  increment,
  PartialWithFieldValue,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db, PersonalIngredient } from '../lib/firebase/interfaces';
import { firestore } from '../lib/firebase';

type CsvMethods = {
  csvToIngredient: () => void;
  csvToFirestore: () => void;
};

const useCsvHook = (): [CsvMethods, PersonalIngredient[], boolean, Error | undefined] => {
  const [csvData, setCSVData] = useState<PersonalIngredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  // TODO: make stepParser and wholeParser more similar; wholeParser sets data but stepParser doesn't
  // Parses through CSV and /save every ingredient to Firestore
  const stepParser = useCallback((data: string) => {
    Papa.parse(data, {
      header: true,
      worker: true,
      // Streaming and modifying row by row
      step: async (row: { data: Record<string, string> }) => {
        const batch = writeBatch(firestore);

        const { PLU, CATEGORY, COMMODITY, VARIETY, IMAGE, SIZE, ..._rest } = row.data;
        const ingredientDocRef = doc(db.ingredientCollection, PLU);

        const ingredientInfo = {
          plu: PLU.trim(),
          category: CATEGORY ? CATEGORY.trim().toLocaleLowerCase() : '',
          commodity: COMMODITY ? COMMODITY.trim().toLocaleLowerCase() : '',
          variety: VARIETY ? VARIETY.trim().toLocaleLowerCase() : '',
          image: IMAGE ? IMAGE.trim().toLocaleLowerCase() : '',
          size: SIZE ? SIZE.trim().toLocaleLowerCase() : '',
          count: increment(0),
          lastUpdated: serverTimestamp(),
        };

        batch.set(ingredientDocRef, ingredientInfo as PartialWithFieldValue<PersonalIngredient>);

        // Commit the batch
        await batch.commit();
      },

      complete: _ => {
        setLoading(false);
      },

      error: (error: Error) => {
        setError(error);
      },
    });
  }, []);

  const wholeParser = useCallback((data: string) => {
    Papa.parse(data, {
      header: true,
      worker: true,
      // Parsing the entire file at once
      complete: results => {
        const newResults = results.data.reduce<PersonalIngredient[]>((filteredData, nextValue) => {
          const { PLU, CATEGORY, COMMODITY, VARIETY, IMAGE, SIZE, ..._rest } = nextValue as Record<
            string,
            string
          >;

          const _ingredientInfo = {
            plu: PLU.trim(),
            category: CATEGORY ? CATEGORY.trim().toLocaleLowerCase() : '',
            commodity: COMMODITY ? COMMODITY.trim().toLocaleLowerCase() : '',
            variety: VARIETY ? VARIETY.trim().toLocaleLowerCase() : '',
            image: IMAGE ? IMAGE.trim().toLocaleLowerCase() : '',
            size: SIZE ? SIZE.trim().toLocaleLowerCase() : '',
          };

          // TODO: change Ingredient interface back to PLU version to push ingredientInfo
          // filteredData.push(ingredientInfo);
          return filteredData;
        }, []);
        setCSVData(newResults);
        setLoading(false);
      },

      error: (error: Error) => {
        setError(error);
      },
    });
  }, []);

  const csvToIngredient = useCallback<CsvMethods['csvToIngredient']>((): void => {
    setLoading(true);

    fetch('/file.csv')
      .then(response => {
        return response.text();
      })
      .then(data => {
        wholeParser(data);
      });
  }, [wholeParser]);

  const csvToFirestore = useCallback<CsvMethods['csvToFirestore']>(() => {
    setLoading(true);

    fetch('/file.csv')
      .then(response => {
        return response.text();
      })
      .then(data => {
        stepParser(data);
      });
  }, [stepParser]);

  return [{ csvToIngredient, csvToFirestore }, csvData, loading, error];
};

export default useCsvHook;