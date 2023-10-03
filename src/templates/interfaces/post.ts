import { collection, doc, FirestoreDataConverter, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase/interfaces';

type Post = { title: string; content: string };

const postConverter: FirestoreDataConverter<Post> = {
  toFirestore(post) {
    return post;
  },

  fromFirestore(snapshot) {
    return snapshot.data() as Post;
  },
};

const PostCollection = () => collection(db, 'posts').withConverter(postConverter);

const PostDoc = (id: string) => doc(db, 'posts', id).withConverter(postConverter);

const postFunctions = async () => {
  const postsSnapshot = await getDocs(PostCollection());
  const posts = postsSnapshot.docs.map(doc => doc.data()); // has type Post[]

  const postSnapshot = await getDoc(PostDoc('1'));
  const post = postSnapshot.data(); // has type Post | undefined
};
