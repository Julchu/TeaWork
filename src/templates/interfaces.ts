import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  FieldValue,
  FirestoreDataConverter,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from './setup';
import { CollectionReference } from '@firebase/firestore';

export type WithDocId<T> = { documentId: string } & T;

export enum Unit {
  // Mass
  kilogram = 'kg',
  pound = 'lb',

  // Volume
  litre = 'L',
  quart = 'qt',
  cup = 'cup',
  tablespoon = 'tbsp',
  teaspoon = 'tsp',

  item = 'item',
}

export type MassType = Unit.kilogram | Unit.pound;

export type VolumeType = Unit.litre | Unit.quart | Unit.cup | Unit.tablespoon | Unit.teaspoon;

export type UnitCategory = {
  mass: MassType;
  volume: VolumeType;
};

export enum Color {
  light = 'light',
  dark = 'dark',
}

export type ColorMode = Color.light | Color.dark;

export enum Season {
  spring = 'Spring',
  winter = 'Winter',
  summer = 'Summer',
  fall = 'Fall',
}

export enum Role {
  admin = 'admin',
  standard = 'standard',
}

export interface Ingredient {
  name: string;
  price?: number;
  unit?: Unit;
  image?: string;
  /** @param capacity and @param quantity used for @interfaceGroceryList */
  capacity?: number;
  quantity?: number;
  userId: string;
  season?: Season;
  createdAt?: Timestamp | FieldValue;
  lastUpdated?: Timestamp | FieldValue;
}

export interface PersonalIngredient extends Ingredient {
  price: number;
  unit: Unit;
}

export interface GroceryList {
  name: string;
  ingredients: Ingredient[];
  viewable?: boolean;
  userId: string;
  createdAt?: Timestamp | FieldValue;
}

// Public user data (aka not private auth data)
export interface User {
  uid: string;
  email: string;
  photoURL?: string;
  name?: string;
  location?: Address;
  createdAt?: Timestamp;
  role: Role;
  /**
   * @param: prefered units
   * @param: dark/light mode
   * @param: display name
   * @param: publically viewable grocery list profile */
  preferences?: {
    units?: UnitCategory;
    colorMode?: Color;
    displayName?: string;
    dismissedTutorial?: boolean;
    public?: boolean;
  };
}

/* TODO: create Time-to-live (TTL) grocery list w/ ingredients */

/* Logged in user features:
 * Save grocery list
 * Save price thresholds per ingredient
 *
 */

/* TODO: ask user if they want to save address of lowest ingredient
 * City, province/state, country
 */
export interface Address {
  locality: string;
  administrative_area_level_1: string;
  country: string;
}

// Firestore data converters

export const converter = <T>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: PartialWithFieldValue<T>) => {
    return data as DocumentData;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) =>
    snapshot.data(options) as T,
});

const collectionPoint = <T>(collectionPath: string): CollectionReference<T> =>
  collection(firestore, collectionPath).withConverter(converter<T>());

const docPoint = <T>(collectionPath: string, ...extraPaths: string[]): DocumentReference<T> =>
  doc(firestore, collectionPath, ...extraPaths).withConverter(converter<T>());

/* Db usage:
 * const ingredientsCollectionRef = db.ingredientCollection;
 * const ingredientDocumentRef = db.ingredientInfoDoc(id, ...extraPaths);
 * * const ingredientDocumentRef = doc(db.ingredientCollection, id, ...extraPaths);
 */
export const db = {
  // Collections
  groceryListCollection: collectionPoint<GroceryList>('groceryList'),
  ingredientCollection: collectionPoint<PersonalIngredient>('ingredients'),
  userCollection: collectionPoint<User>('users'),

  // Docs
  groceryListDoc: (...extraPaths: string[]) => docPoint<GroceryList>('groceryList', ...extraPaths),
  ingredientDoc: (...extraPaths: string[]) =>
    docPoint<PersonalIngredient>('ingredients', ...extraPaths),
  userDoc: (...extraPaths: string[]) => docPoint<User>('users', ...extraPaths),
};

// Test
/* All ingredient names will be placed in collection /ingredientNames within a document named as the first letter of the ingredient name
 * Ex: /ingredientNames/a/almond: { ingredientIds[]: list of id used in /ingredients for almond }
 */

/* TODO: Google Maps reverse Geolocation for Ingredient submission location
// https://maps.googleapis.com/maps/api/geocode/json?latlng=43.639900,-79.390511&key=

latlong: 43.639900,-79.390511

{
	"plus_code": {
			"compound_code": "JJQ5+XQ9 Toronto, ON, Canada",
			"global_code": "87M2JJQ5+XQ9"
	},
	"results": [
			{
					"address_components": [
							{
									"long_name": "#2309",
									"short_name": "#2309",
									"types": [
											"subpremise"
									]
							},
							{
									"long_name": "5",
									"short_name": "5",
									"types": [
											"street_number"
									]
							},
							{
									"long_name": "Mariner Terrace",
									"short_name": "Mariner Terrace",
									"types": [
											"route"
									]
							},
							{
									"long_name": "Old Toronto",
									"short_name": "Old Toronto",
									"types": [
											"political",
											"sublocality",
											"sublocality_level_1"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							},
							{
									"long_name": "M5V 3V6",
									"short_name": "M5V 3V6",
									"types": [
											"postal_code"
									]
							}
					],
					"formatted_address": "5 Mariner Terrace #2309, Toronto, ON M5V 3V6, Canada",
					"geometry": {
							"location": {
									"lat": 43.63989,
									"lng": -79.390406
							},
							"location_type": "ROOFTOP",
							"viewport": {
									"northeast": {
											"lat": 43.6412389802915,
											"lng": -79.38905701970849
									},
									"southwest": {
											"lat": 43.6385410197085,
											"lng": -79.39175498029151
									}
							}
					},
					"place_id": "ChIJv5B_Gyg1K4gRhdOkg7gsWwM",
					"plus_code": {
							"compound_code": "JJQ5+XR Toronto, ON, Canada",
							"global_code": "87M2JJQ5+XR"
					},
					"types": [
							"establishment",
							"point_of_interest"
					]
			},
			{
					"address_components": [
							{
									"long_name": "5",
									"short_name": "5",
									"types": [
											"street_number"
									]
							},
							{
									"long_name": "Mariner Terrace",
									"short_name": "Mariner Terrace",
									"types": [
											"route"
									]
							},
							{
									"long_name": "Old Toronto",
									"short_name": "Old Toronto",
									"types": [
											"political",
											"sublocality",
											"sublocality_level_1"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							},
							{
									"long_name": "M5V 3V6",
									"short_name": "M5V 3V6",
									"types": [
											"postal_code"
									]
							}
					],
					"formatted_address": "5 Mariner Terrace, Toronto, ON M5V 3V6, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 43.6399232,
											"lng": -79.390209
									},
									"southwest": {
											"lat": 43.6395582,
											"lng": -79.3905967
									}
							},
							"location": {
									"lat": 43.6397355,
									"lng": -79.3904175
							},
							"location_type": "ROOFTOP",
							"viewport": {
									"northeast": {
											"lat": 43.64108968029149,
											"lng": -79.38905386970849
									},
									"southwest": {
											"lat": 43.63839171970849,
											"lng": -79.3917518302915
									}
							}
					},
					"place_id": "ChIJ18ifIig1K4gRLvLGHhVnRx8",
					"types": [
							"premise"
					]
			},
			{
					"address_components": [
							{
									"long_name": "3",
									"short_name": "3",
									"types": [
											"street_number"
									]
							},
							{
									"long_name": "Navy Wharf Court",
									"short_name": "Navy Wharf Ct",
									"types": [
											"route"
									]
							},
							{
									"long_name": "Old Toronto",
									"short_name": "Old Toronto",
									"types": [
											"political",
											"sublocality",
											"sublocality_level_1"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							},
							{
									"long_name": "M5V 3V1",
									"short_name": "M5V 3V1",
									"types": [
											"postal_code"
									]
							}
					],
					"formatted_address": "3 Navy Wharf Ct, Toronto, ON M5V 3V1, Canada",
					"geometry": {
							"location": {
									"lat": 43.6403025,
									"lng": -79.3908428
							},
							"location_type": "ROOFTOP",
							"viewport": {
									"northeast": {
											"lat": 43.64165148029149,
											"lng": -79.38949381970849
									},
									"southwest": {
											"lat": 43.63895351970849,
											"lng": -79.39219178029151
									}
							}
					},
					"place_id": "ChIJoaPQHCg1K4gRvLb_SXOPYMM",
					"plus_code": {
							"compound_code": "JJR5+4M Toronto, ON, Canada",
							"global_code": "87M2JJR5+4M"
					},
					"types": [
							"street_address"
					]
			},
			{
					"address_components": [
							{
									"long_name": "JJQ5+XQ",
									"short_name": "JJQ5+XQ",
									"types": [
											"plus_code"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "JJQ5+XQ Toronto, ON, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 43.64,
											"lng": -79.3905
									},
									"southwest": {
											"lat": 43.639875,
											"lng": -79.390625
									}
							},
							"location": {
									"lat": 43.6399,
									"lng": -79.39051099999999
							},
							"location_type": "GEOMETRIC_CENTER",
							"viewport": {
									"northeast": {
											"lat": 43.64128648029151,
											"lng": -79.38921351970849
									},
									"southwest": {
											"lat": 43.63858851970851,
											"lng": -79.3919114802915
									}
							}
					},
					"place_id": "GhIJ7lpCPujRRUARm27ZIf7YU8A",
					"plus_code": {
							"compound_code": "JJQ5+XQ Toronto, ON, Canada",
							"global_code": "87M2JJQ5+XQ"
					},
					"types": [
							"plus_code"
					]
			},
			{
					"address_components": [
							{
									"long_name": "Mariner Terrace",
									"short_name": "Mariner Terrace",
									"types": [
											"route"
									]
							},
							{
									"long_name": "Old Toronto",
									"short_name": "Old Toronto",
									"types": [
											"political",
											"sublocality",
											"sublocality_level_1"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							},
							{
									"long_name": "M5V 3V7",
									"short_name": "M5V 3V7",
									"types": [
											"postal_code"
									]
							}
					],
					"formatted_address": "Mariner Terrace, Toronto, ON M5V 3V7, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 43.6402097,
											"lng": -79.39065859999999
									},
									"southwest": {
											"lat": 43.6400983,
											"lng": -79.39122619999999
									}
							},
							"location": {
									"lat": 43.640154,
									"lng": -79.3909424
							},
							"location_type": "GEOMETRIC_CENTER",
							"viewport": {
									"northeast": {
											"lat": 43.6415029802915,
											"lng": -79.38959341970849
									},
									"southwest": {
											"lat": 43.6388050197085,
											"lng": -79.39229138029151
									}
							}
					},
					"place_id": "ChIJ0XCOBCg1K4gRyJwBa5-Opag",
					"types": [
							"route"
					]
			},
			{
					"address_components": [
							{
									"long_name": "M5V 3V6",
									"short_name": "M5V 3V6",
									"types": [
											"postal_code"
									]
							},
							{
									"long_name": "Old Toronto",
									"short_name": "Old Toronto",
									"types": [
											"political",
											"sublocality",
											"sublocality_level_1"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Toronto, ON M5V 3V6, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 43.640829,
											"lng": -79.3870409
									},
									"southwest": {
											"lat": 43.6392732,
											"lng": -79.3908632
									}
							},
							"location": {
									"lat": 43.64009009999999,
									"lng": -79.3882622
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 43.6414000802915,
											"lng": -79.3870409
									},
									"southwest": {
											"lat": 43.6387021197085,
											"lng": -79.3908632
									}
							}
					},
					"place_id": "ChIJg4K9Kyg1K4gRbibaBusWC5U",
					"types": [
							"postal_code"
					]
			},
			{
					"address_components": [
							{
									"long_name": "CityPlace",
									"short_name": "CityPlace",
									"types": [
											"neighborhood",
											"political"
									]
							},
							{
									"long_name": "Old Toronto",
									"short_name": "Old Toronto",
									"types": [
											"political",
											"sublocality",
											"sublocality_level_1"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							},
							{
									"long_name": "M5V",
									"short_name": "M5V",
									"types": [
											"postal_code",
											"postal_code_prefix"
									]
							}
					],
					"formatted_address": "CityPlace, Toronto, ON M5V, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 43.6439327,
											"lng": -79.3870354
									},
									"southwest": {
											"lat": 43.6365721,
											"lng": -79.4012834
									}
							},
							"location": {
									"lat": 43.6416061,
									"lng": -79.3901975
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 43.6439327,
											"lng": -79.3870354
									},
									"southwest": {
											"lat": 43.6365721,
											"lng": -79.4012834
									}
							}
					},
					"place_id": "ChIJPdbpgyc1K4gRCASt_ydVwQw",
					"types": [
							"neighborhood",
							"political"
					]
			},
			{
					"address_components": [
							{
									"long_name": "Entertainment District",
									"short_name": "Entertainment District",
									"types": [
											"neighborhood",
											"political"
									]
							},
							{
									"long_name": "Old Toronto",
									"short_name": "Old Toronto",
									"types": [
											"political",
											"sublocality",
											"sublocality_level_1"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Entertainment District, Toronto, ON, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 43.65082659999999,
											"lng": -79.37785149999999
									},
									"southwest": {
											"lat": 43.6387773,
											"lng": -79.3964338
									}
							},
							"location": {
									"lat": 43.6426611,
									"lng": -79.38879009999999
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 43.65082659999999,
											"lng": -79.37785149999999
									},
									"southwest": {
											"lat": 43.6387773,
											"lng": -79.3964338
									}
							}
					},
					"place_id": "ChIJpR7eNNA0K4gRERWq2YHrmxc",
					"types": [
							"neighborhood",
							"political"
					]
			},
			{
					"address_components": [
							{
									"long_name": "M5V",
									"short_name": "M5V",
									"types": [
											"postal_code",
											"postal_code_prefix"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Toronto, ON M5V, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 43.651014,
											"lng": -79.37407800000001
									},
									"southwest": {
											"lat": 43.611801,
											"lng": -79.41418299999999
									}
							},
							"location": {
									"lat": 43.6289467,
									"lng": -79.3944199
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 43.651014,
											"lng": -79.37407800000001
									},
									"southwest": {
											"lat": 43.611801,
											"lng": -79.41418299999999
									}
							}
					},
					"place_id": "ChIJDe9xKyU1K4gRoelH_y0d4Q4",
					"types": [
							"postal_code",
							"postal_code_prefix"
					]
			},
			{
					"address_components": [
							{
									"long_name": "Downtown Toronto",
									"short_name": "Downtown Toronto",
									"types": [
											"neighborhood",
											"political"
									]
							},
							{
									"long_name": "Old Toronto",
									"short_name": "Old Toronto",
									"types": [
											"political",
											"sublocality",
											"sublocality_level_1"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Downtown Toronto, Toronto, ON, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 43.6755833,
											"lng": -79.3470176
									},
									"southwest": {
											"lat": 43.6339328,
											"lng": -79.41131710000001
									}
							},
							"location": {
									"lat": 43.6548046,
									"lng": -79.3883031
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 43.6755833,
											"lng": -79.3470176
									},
									"southwest": {
											"lat": 43.6339328,
											"lng": -79.41131710000001
									}
							}
					},
					"place_id": "ChIJvRBz0jTL1IkRkwMHIgbSFbo",
					"types": [
							"neighborhood",
							"political"
					]
			},
			{
					"address_components": [
							{
									"long_name": "Old Toronto",
									"short_name": "Old Toronto",
									"types": [
											"political",
											"sublocality",
											"sublocality_level_1"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Old Toronto, Toronto, ON, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 43.75373099999999,
											"lng": -79.27971699999999
									},
									"southwest": {
											"lat": 43.6118399,
											"lng": -79.491969
									}
							},
							"location": {
									"lat": 43.6486795,
									"lng": -79.3803231
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 43.75373099999999,
											"lng": -79.27971699999999
									},
									"southwest": {
											"lat": 43.6118399,
											"lng": -79.491969
									}
							}
					},
					"place_id": "ChIJ2YVS1Po0K4gR8_c5_bvmDW4",
					"types": [
							"political",
							"sublocality",
							"sublocality_level_1"
					]
			},
			{
					"address_components": [
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Toronto, ON, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 43.8554579,
											"lng": -79.1168971
									},
									"southwest": {
											"lat": 43.5810245,
											"lng": -79.639219
									}
							},
							"location": {
									"lat": 43.653226,
									"lng": -79.3831843
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 43.8554579,
											"lng": -79.1168971
									},
									"southwest": {
											"lat": 43.5810245,
											"lng": -79.639219
									}
							}
					},
					"place_id": "ChIJpTvG15DL1IkRd8S0KlBVNTI",
					"types": [
							"locality",
							"political"
					]
			},
			{
					"address_components": [
							{
									"long_name": "Toronto",
									"short_name": "Toronto",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Toronto, ON, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 43.8554579,
											"lng": -79.00248100000002
									},
									"southwest": {
											"lat": 43.45829699999999,
											"lng": -79.639219
									}
							},
							"location": {
									"lat": 43.6689775,
									"lng": -79.29021329999999
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 43.8554579,
											"lng": -79.00248100000002
									},
									"southwest": {
											"lat": 43.45829699999999,
											"lng": -79.639219
									}
							}
					},
					"place_id": "ChIJ5b2RG4_L1IkRDtQ2gFEjLv4",
					"types": [
							"administrative_area_level_2",
							"political"
					]
			},
			{
					"address_components": [
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Ontario, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 56.931393,
											"lng": -74.3206479
									},
									"southwest": {
											"lat": 41.6765559,
											"lng": -95.1562271
									}
							},
							"location": {
									"lat": 51.253775,
									"lng": -85.32321399999999
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 56.931393,
											"lng": -74.3206479
									},
									"southwest": {
											"lat": 41.6765559,
											"lng": -95.1562271
									}
							}
					},
					"place_id": "ChIJrxNRX7IFzkwRCR5iKVZC-HA",
					"types": [
							"administrative_area_level_1",
							"political"
					]
			},
			{
					"address_components": [
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 83.63809999999999,
											"lng": -50.9766
									},
									"southwest": {
											"lat": 41.6765559,
											"lng": -141.00187
									}
							},
							"location": {
									"lat": 56.130366,
									"lng": -106.346771
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 83.63809999999999,
											"lng": -50.9766
									},
									"southwest": {
											"lat": 41.6765559,
											"lng": -141.00187
									}
							}
					},
					"place_id": "ChIJ2WrMN9MDDUsRpY9Doiq3aJk",
					"types": [
							"country",
							"political"
					]
			}
	],
	"status": "OK"
}

// https://maps.googleapis.com/maps/api/geocode/json?latlng=43.639900,-79.390511&key=

latlong: 43.892890,-79.233520

{
	"plus_code": {
			"compound_code": "VQV8+5H5 Markham, ON, Canada",
			"global_code": "87M2VQV8+5H5"
	},
	"results": [
			{
					"address_components": [
							{
									"long_name": "23",
									"short_name": "23",
									"types": [
											"street_number"
									]
							},
							{
									"long_name": "Almira Avenue",
									"short_name": "Almira Ave",
									"types": [
											"route"
									]
							},
							{
									"long_name": "Markham",
									"short_name": "Markham",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Regional Municipality of York",
									"short_name": "Regional Municipality of York",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							},
							{
									"long_name": "L6B 1B9",
									"short_name": "L6B 1B9",
									"types": [
											"postal_code"
									]
							}
					],
					"formatted_address": "23 Almira Ave, Markham, ON L6B 1B9, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 43.8930726,
											"lng": -79.2334784
									},
									"southwest": {
											"lat": 43.8929462,
											"lng": -79.2336095
									}
							},
							"location": {
									"lat": 43.8930048,
									"lng": -79.2335506
							},
							"location_type": "ROOFTOP",
							"viewport": {
									"northeast": {
											"lat": 43.8943583802915,
											"lng": -79.2321949697085
									},
									"southwest": {
											"lat": 43.8916604197085,
											"lng": -79.23489293029151
									}
							}
					},
					"place_id": "ChIJrTGQ1Cco1YkRTal1SdVs4do",
					"types": [
							"premise"
					]
			},
			{
					"address_components": [
							{
									"long_name": "21",
									"short_name": "21",
									"types": [
											"street_number"
									]
							},
							{
									"long_name": "Almira Avenue",
									"short_name": "Almira Ave",
									"types": [
											"route"
									]
							},
							{
									"long_name": "Markham",
									"short_name": "Markham",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Regional Municipality of York",
									"short_name": "Regional Municipality of York",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							},
							{
									"long_name": "L6B 1B9",
									"short_name": "L6B 1B9",
									"types": [
											"postal_code"
									]
							}
					],
					"formatted_address": "21 Almira Ave, Markham, ON L6B 1B9, Canada",
					"geometry": {
							"location": {
									"lat": 43.8929887,
									"lng": -79.2336457
							},
							"location_type": "ROOFTOP",
							"viewport": {
									"northeast": {
											"lat": 43.8943376802915,
											"lng": -79.2322967197085
									},
									"southwest": {
											"lat": 43.8916397197085,
											"lng": -79.23499468029151
									}
							}
					},
					"place_id": "ChIJNSA91Sco1YkR594LeGbDYSc",
					"plus_code": {
							"compound_code": "VQV8+5G Markham, ON, Canada",
							"global_code": "87M2VQV8+5G"
					},
					"types": [
							"street_address"
					]
			},
			{
					"address_components": [
							{
									"long_name": "1",
									"short_name": "1",
									"types": [
											"street_number"
									]
							},
							{
									"long_name": "Pingel Road",
									"short_name": "Pingel Rd",
									"types": [
											"route"
									]
							},
							{
									"long_name": "Markham",
									"short_name": "Markham",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Regional Municipality of York",
									"short_name": "Regional Municipality of York",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							},
							{
									"long_name": "L6B 1B7",
									"short_name": "L6B 1B7",
									"types": [
											"postal_code"
									]
							}
					],
					"formatted_address": "1 Pingel Rd, Markham, ON L6B 1B7, Canada",
					"geometry": {
							"location": {
									"lat": 43.8933326,
									"lng": -79.23350649999999
							},
							"location_type": "ROOFTOP",
							"viewport": {
									"northeast": {
											"lat": 43.8946815802915,
											"lng": -79.23215751970849
									},
									"southwest": {
											"lat": 43.8919836197085,
											"lng": -79.2348554802915
									}
							}
					},
					"place_id": "ChIJq6r2KyYo1YkR5QX6Is1cdrY",
					"plus_code": {
							"compound_code": "VQV8+8H Markham, ON, Canada",
							"global_code": "87M2VQV8+8H"
					},
					"types": [
							"establishment",
							"point_of_interest"
					]
			},
			{
					"address_components": [
							{
									"long_name": "VQV8+5H",
									"short_name": "VQV8+5H",
									"types": [
											"plus_code"
									]
							},
							{
									"long_name": "Markham",
									"short_name": "Markham",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Regional Municipality of York",
									"short_name": "Regional Municipality of York",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "VQV8+5H Markham, ON, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 43.893,
											"lng": -79.23349999999999
									},
									"southwest": {
											"lat": 43.892875,
											"lng": -79.23362499999999
									}
							},
							"location": {
									"lat": 43.89289,
									"lng": -79.23352
							},
							"location_type": "GEOMETRIC_CENTER",
							"viewport": {
									"northeast": {
											"lat": 43.89428648029151,
											"lng": -79.23221351970848
									},
									"southwest": {
											"lat": 43.89158851970851,
											"lng": -79.23491148029149
									}
							}
					},
					"place_id": "GhIJdXYyOEryRUARkL3e_fHOU8A",
					"plus_code": {
							"compound_code": "VQV8+5H Markham, ON, Canada",
							"global_code": "87M2VQV8+5H"
					},
					"types": [
							"plus_code"
					]
			},
			{
					"address_components": [
							{
									"long_name": "21-31",
									"short_name": "21-31",
									"types": [
											"street_number"
									]
							},
							{
									"long_name": "Almira Avenue",
									"short_name": "Almira Ave",
									"types": [
											"route"
									]
							},
							{
									"long_name": "Markham",
									"short_name": "Markham",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Regional Municipality of York",
									"short_name": "Regional Municipality of York",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							},
							{
									"long_name": "L6B 1B9",
									"short_name": "L6B 1B9",
									"types": [
											"postal_code"
									]
							}
					],
					"formatted_address": "21-31 Almira Ave, Markham, ON L6B 1B9, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 43.8932266,
											"lng": -79.23313069999999
									},
									"southwest": {
											"lat": 43.8931412,
											"lng": -79.2336882
									}
							},
							"location": {
									"lat": 43.8931839,
									"lng": -79.23340949999999
							},
							"location_type": "GEOMETRIC_CENTER",
							"viewport": {
									"northeast": {
											"lat": 43.8945328802915,
											"lng": -79.23206046970849
									},
									"southwest": {
											"lat": 43.8918349197085,
											"lng": -79.23475843029149
									}
							}
					},
					"place_id": "ChIJga6TLCYo1YkRmDSPCgJsOlY",
					"types": [
							"route"
					]
			},
			{
					"address_components": [
							{
									"long_name": "L6B 1B9",
									"short_name": "L6B 1B9",
									"types": [
											"postal_code"
									]
							},
							{
									"long_name": "Markham",
									"short_name": "Markham",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Regional Municipality of York",
									"short_name": "Regional Municipality of York",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Markham, ON L6B 1B9, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 43.89356000000001,
											"lng": -79.2313844
									},
									"southwest": {
											"lat": 43.8923559,
											"lng": -79.23484479999999
									}
							},
							"location": {
									"lat": 43.89296,
									"lng": -79.2336607
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 43.89430693029151,
											"lng": -79.2313844
									},
									"southwest": {
											"lat": 43.89160896970851,
											"lng": -79.23484479999999
									}
							}
					},
					"place_id": "ChIJFzebPSYo1YkRUKjZLkcj2o8",
					"types": [
							"postal_code"
					]
			},
			{
					"address_components": [
							{
									"long_name": "L6B",
									"short_name": "L6B",
									"types": [
											"postal_code",
											"postal_code_prefix"
									]
							},
							{
									"long_name": "Markham",
									"short_name": "Markham",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Regional Municipality of York",
									"short_name": "Regional Municipality of York",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Markham, ON L6B, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 43.9037854,
											"lng": -79.21572599999999
									},
									"southwest": {
											"lat": 43.8475441,
											"lng": -79.241136
									}
							},
							"location": {
									"lat": 43.8687116,
									"lng": -79.2253776
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 43.9037854,
											"lng": -79.21572599999999
									},
									"southwest": {
											"lat": 43.8475441,
											"lng": -79.241136
									}
							}
					},
					"place_id": "ChIJ9dpMrMbX1IkRAgCHXKOdoD4",
					"types": [
							"postal_code",
							"postal_code_prefix"
					]
			},
			{
					"address_components": [
							{
									"long_name": "Markham",
									"short_name": "Markham",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Regional Municipality of York",
									"short_name": "Regional Municipality of York",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Markham, ON, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 43.9634291,
											"lng": -79.170254
									},
									"southwest": {
											"lat": 43.7980491,
											"lng": -79.42882299999999
									}
							},
							"location": {
									"lat": 43.8561002,
									"lng": -79.3370188
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 43.9634291,
											"lng": -79.170254
									},
									"southwest": {
											"lat": 43.7980491,
											"lng": -79.42882299999999
									}
							}
					},
					"place_id": "ChIJqUwyoO_V1IkRYz2yLIFSPfc",
					"types": [
							"locality",
							"political"
					]
			},
			{
					"address_components": [
							{
									"long_name": "Regional Municipality of York",
									"short_name": "Regional Municipality of York",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Regional Municipality of York, ON, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 44.433499,
											"lng": -79.1560961
									},
									"southwest": {
											"lat": 43.749899,
											"lng": -79.775515
									}
							},
							"location": {
									"lat": 43.9884612,
									"lng": -79.4703885
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 44.433499,
											"lng": -79.1560961
									},
									"southwest": {
											"lat": 43.749899,
											"lng": -79.775515
									}
							}
					},
					"place_id": "ChIJeabS5K7NKogRZIooarTPjRA",
					"types": [
							"administrative_area_level_2",
							"political"
					]
			},
			{
					"address_components": [
							{
									"long_name": "Ontario",
									"short_name": "ON",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Ontario, Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 56.931393,
											"lng": -74.3206479
									},
									"southwest": {
											"lat": 41.6765559,
											"lng": -95.1562271
									}
							},
							"location": {
									"lat": 51.253775,
									"lng": -85.32321399999999
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 56.931393,
											"lng": -74.3206479
									},
									"southwest": {
											"lat": 41.6765559,
											"lng": -95.1562271
									}
							}
					},
					"place_id": "ChIJrxNRX7IFzkwRCR5iKVZC-HA",
					"types": [
							"administrative_area_level_1",
							"political"
					]
			},
			{
					"address_components": [
							{
									"long_name": "Canada",
									"short_name": "CA",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Canada",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 83.63809999999999,
											"lng": -50.9766
									},
									"southwest": {
											"lat": 41.6765559,
											"lng": -141.00187
									}
							},
							"location": {
									"lat": 56.130366,
									"lng": -106.346771
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 83.63809999999999,
											"lng": -50.9766
									},
									"southwest": {
											"lat": 41.6765559,
											"lng": -141.00187
									}
							}
					},
					"place_id": "ChIJ2WrMN9MDDUsRpY9Doiq3aJk",
					"types": [
							"country",
							"political"
					]
			}
	],
	"status": "OK"
}

// https://maps.googleapis.com/maps/api/geocode/json?latlng=43.639900,-79.390511&key=

latlong: 40.778270,-77.778460

{
	"plus_code": {
			"compound_code": "Q6HC+8J3 Boalsburg, PA, USA",
			"global_code": "87G4Q6HC+8J3"
	},
	"results": [
			{
					"address_components": [
							{
									"long_name": "914",
									"short_name": "914",
									"types": [
											"street_number"
									]
							},
							{
									"long_name": "Boal Avenue",
									"short_name": "Boal Ave",
									"types": [
											"route"
									]
							},
							{
									"long_name": "Boalsburg",
									"short_name": "Boalsburg",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Harris Township",
									"short_name": "Harris Township",
									"types": [
											"administrative_area_level_3",
											"political"
									]
							},
							{
									"long_name": "Centre County",
									"short_name": "Centre County",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Pennsylvania",
									"short_name": "PA",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "United States",
									"short_name": "US",
									"types": [
											"country",
											"political"
									]
							},
							{
									"long_name": "16827",
									"short_name": "16827",
									"types": [
											"postal_code"
									]
							},
							{
									"long_name": "1507",
									"short_name": "1507",
									"types": [
											"postal_code_suffix"
									]
							}
					],
					"formatted_address": "914 Boal Ave, Boalsburg, PA 16827, USA",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 40.77832980000001,
											"lng": -77.7783999
									},
									"southwest": {
											"lat": 40.7782001,
											"lng": -77.7785633
									}
							},
							"location": {
									"lat": 40.7782686,
									"lng": -77.77847559999999
							},
							"location_type": "ROOFTOP",
							"viewport": {
									"northeast": {
											"lat": 40.7796139302915,
											"lng": -77.7771326197085
									},
									"southwest": {
											"lat": 40.7769159697085,
											"lng": -77.77983058029152
									}
							}
					},
					"place_id": "ChIJUxbRY5CvzokRFB2F5oJAoSM",
					"types": [
							"premise"
					]
			},
			{
					"address_components": [
							{
									"long_name": "908",
									"short_name": "908",
									"types": [
											"street_number"
									]
							},
							{
									"long_name": "U.S. 322 Business",
									"short_name": "US-322 BUS",
									"types": [
											"route"
									]
							},
							{
									"long_name": "Boalsburg",
									"short_name": "Boalsburg",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Harris Township",
									"short_name": "Harris Township",
									"types": [
											"administrative_area_level_3",
											"political"
									]
							},
							{
									"long_name": "Centre County",
									"short_name": "Centre County",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Pennsylvania",
									"short_name": "PA",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "United States",
									"short_name": "US",
									"types": [
											"country",
											"political"
									]
							},
							{
									"long_name": "16827",
									"short_name": "16827",
									"types": [
											"postal_code"
									]
							}
					],
					"formatted_address": "908 US-322 BUS, Boalsburg, PA 16827, USA",
					"geometry": {
							"location": {
									"lat": 40.77824500000001,
									"lng": -77.778504
							},
							"location_type": "ROOFTOP",
							"viewport": {
									"northeast": {
											"lat": 40.77959398029151,
											"lng": -77.77715501970849
									},
									"southwest": {
											"lat": 40.77689601970851,
											"lng": -77.77985298029151
									}
							}
					},
					"place_id": "ChIJO7jSY5CvzokRbRZJkPqpwSo",
					"plus_code": {
							"compound_code": "Q6HC+7H Boalsburg, PA, USA",
							"global_code": "87G4Q6HC+7H"
					},
					"types": [
							"street_address"
					]
			},
			{
					"address_components": [
							{
									"long_name": "Q6HC+8J",
									"short_name": "Q6HC+8J",
									"types": [
											"plus_code"
									]
							},
							{
									"long_name": "Boalsburg",
									"short_name": "Boalsburg",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Harris Township",
									"short_name": "Harris Township",
									"types": [
											"administrative_area_level_3",
											"political"
									]
							},
							{
									"long_name": "Centre County",
									"short_name": "Centre County",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Pennsylvania",
									"short_name": "PA",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "United States",
									"short_name": "US",
									"types": [
											"country",
											"political"
									]
							},
							{
									"long_name": "16827",
									"short_name": "16827",
									"types": [
											"postal_code"
									]
							}
					],
					"formatted_address": "Q6HC+8J Boalsburg, PA, USA",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 40.778375,
											"lng": -77.778375
									},
									"southwest": {
											"lat": 40.77825,
											"lng": -77.77849999999999
									}
							},
							"location": {
									"lat": 40.77827,
									"lng": -77.77846
							},
							"location_type": "GEOMETRIC_CENTER",
							"viewport": {
									"northeast": {
											"lat": 40.7796614802915,
											"lng": -77.77708851970849
									},
									"southwest": {
											"lat": 40.7769635197085,
											"lng": -77.77978648029149
									}
							}
					},
					"place_id": "GhIJnbryWZ5jREARoE_kSdJxU8A",
					"plus_code": {
							"compound_code": "Q6HC+8J Boalsburg, PA, USA",
							"global_code": "87G4Q6HC+8J"
					},
					"types": [
							"plus_code"
					]
			},
			{
					"address_components": [
							{
									"long_name": "911-887",
									"short_name": "911-887",
									"types": [
											"street_number"
									]
							},
							{
									"long_name": "Boal Avenue",
									"short_name": "US-322 BUS",
									"types": [
											"route"
									]
							},
							{
									"long_name": "Boalsburg",
									"short_name": "Boalsburg",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Harris Township",
									"short_name": "Harris Township",
									"types": [
											"administrative_area_level_3",
											"political"
									]
							},
							{
									"long_name": "Centre County",
									"short_name": "Centre County",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Pennsylvania",
									"short_name": "PA",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "United States",
									"short_name": "US",
									"types": [
											"country",
											"political"
									]
							},
							{
									"long_name": "16827",
									"short_name": "16827",
									"types": [
											"postal_code"
									]
							}
					],
					"formatted_address": "911-887 Boal Ave, Boalsburg, PA 16827, USA",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 40.7785847,
											"lng": -77.77843419999999
									},
									"southwest": {
											"lat": 40.7783104,
											"lng": -77.779077
									}
							},
							"location": {
									"lat": 40.778453,
									"lng": -77.77875999999999
							},
							"location_type": "GEOMETRIC_CENTER",
							"viewport": {
									"northeast": {
											"lat": 40.7797965302915,
											"lng": -77.77740661970849
									},
									"southwest": {
											"lat": 40.7770985697085,
											"lng": -77.78010458029151
									}
							}
					},
					"place_id": "ChIJJ56SfJCvzokRfMQ2GzOEixE",
					"types": [
							"route"
					]
			},
			{
					"address_components": [
							{
									"long_name": "Boalsburg",
									"short_name": "Boalsburg",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Harris Township",
									"short_name": "Harris Township",
									"types": [
											"administrative_area_level_3",
											"political"
									]
							},
							{
									"long_name": "Centre County",
									"short_name": "Centre County",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Pennsylvania",
									"short_name": "PA",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "United States",
									"short_name": "US",
									"types": [
											"country",
											"political"
									]
							},
							{
									"long_name": "16827",
									"short_name": "16827",
									"types": [
											"postal_code"
									]
							}
					],
					"formatted_address": "Boalsburg, PA 16827, USA",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 40.795098,
											"lng": -77.7334389
									},
									"southwest": {
											"lat": 40.75778,
											"lng": -77.8114739
									}
							},
							"location": {
									"lat": 40.7756184,
									"lng": -77.79249919999999
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 40.795098,
											"lng": -77.7334389
									},
									"southwest": {
											"lat": 40.75778,
											"lng": -77.8114739
									}
							}
					},
					"place_id": "ChIJZaIQZnWvzokRYDYULxRNaMU",
					"types": [
							"locality",
							"political"
					]
			},
			{
					"address_components": [
							{
									"long_name": "16827",
									"short_name": "16827",
									"types": [
											"postal_code"
									]
							},
							{
									"long_name": "Boalsburg",
									"short_name": "Boalsburg",
									"types": [
											"locality",
											"political"
									]
							},
							{
									"long_name": "Centre County",
									"short_name": "Centre County",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Pennsylvania",
									"short_name": "PA",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "United States",
									"short_name": "US",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Boalsburg, PA 16827, USA",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 40.846973,
											"lng": -77.7136039
									},
									"southwest": {
											"lat": 40.733236,
											"lng": -77.82006490000001
									}
							},
							"location": {
									"lat": 40.7806924,
									"lng": -77.77953699999999
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 40.846973,
											"lng": -77.7136039
									},
									"southwest": {
											"lat": 40.733236,
											"lng": -77.82006490000001
									}
							}
					},
					"place_id": "ChIJxfk_uLivzokR702uMfI5ngI",
					"types": [
							"postal_code"
					]
			},
			{
					"address_components": [
							{
									"long_name": "Harris Township",
									"short_name": "Harris Township",
									"types": [
											"administrative_area_level_3",
											"political"
									]
							},
							{
									"long_name": "Centre County",
									"short_name": "Centre County",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Pennsylvania",
									"short_name": "PA",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "United States",
									"short_name": "US",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Harris Township, PA, USA",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 40.8264269,
											"lng": -77.69525109999999
									},
									"southwest": {
											"lat": 40.714631,
											"lng": -77.8523721
									}
							},
							"location": {
									"lat": 40.7582737,
									"lng": -77.7566523
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 40.8264269,
											"lng": -77.69525109999999
									},
									"southwest": {
											"lat": 40.714631,
											"lng": -77.8523721
									}
							}
					},
					"place_id": "ChIJtXMobxOwzokRpNVlbFqVRUg",
					"types": [
							"administrative_area_level_3",
							"political"
					]
			},
			{
					"address_components": [
							{
									"long_name": "Centre County",
									"short_name": "Centre County",
									"types": [
											"administrative_area_level_2",
											"political"
									]
							},
							{
									"long_name": "Pennsylvania",
									"short_name": "PA",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "United States",
									"short_name": "US",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Centre County, PA, USA",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 41.25266510000001,
											"lng": -77.14380389999999
									},
									"southwest": {
											"lat": 40.6915571,
											"lng": -78.37697589999999
									}
							},
							"location": {
									"lat": 40.8765649,
									"lng": -77.8367282
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 41.25266510000001,
											"lng": -77.14380389999999
									},
									"southwest": {
											"lat": 40.6915571,
											"lng": -78.37697589999999
									}
							}
					},
					"place_id": "ChIJGag74PqazokRAZZDKnhbMOk",
					"types": [
							"administrative_area_level_2",
							"political"
					]
			},
			{
					"address_components": [
							{
									"long_name": "Pennsylvania",
									"short_name": "PA",
									"types": [
											"administrative_area_level_1",
											"political"
									]
							},
							{
									"long_name": "United States",
									"short_name": "US",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "Pennsylvania, USA",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 42.5141658,
											"lng": -74.6895018
									},
									"southwest": {
											"lat": 39.7197989,
											"lng": -80.51989499999999
									}
							},
							"location": {
									"lat": 41.2033216,
									"lng": -77.1945247
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 42.5141658,
											"lng": -74.6895018
									},
									"southwest": {
											"lat": 39.7197989,
											"lng": -80.51989499999999
									}
							}
					},
					"place_id": "ChIJieUyHiaALYgRPbQiUEchRsI",
					"types": [
							"administrative_area_level_1",
							"political"
					]
			},
			{
					"address_components": [
							{
									"long_name": "United States",
									"short_name": "US",
									"types": [
											"country",
											"political"
									]
							}
					],
					"formatted_address": "United States",
					"geometry": {
							"bounds": {
									"northeast": {
											"lat": 74.071038,
											"lng": -66.885417
									},
									"southwest": {
											"lat": 18.7763,
											"lng": 166.9999999
									}
							},
							"location": {
									"lat": 37.09024,
									"lng": -95.712891
							},
							"location_type": "APPROXIMATE",
							"viewport": {
									"northeast": {
											"lat": 74.071038,
											"lng": -66.885417
									},
									"southwest": {
											"lat": 18.7763,
											"lng": 166.9999999
									}
							}
					},
					"place_id": "ChIJCzYy5IS16lQRQrfeQ5K5Oxw",
					"types": [
							"country",
							"political"
					]
			}
	],
	"status": "OK"
} */
