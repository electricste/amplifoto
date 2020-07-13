/* screens/PostsScreen.js */
import * as React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { DataStore, Storage } from 'aws-amplify'
import { Post } from '../src/models'
import PostComponent from '../components/PostComponent'

function PostsScreen() {
  const [posts, setPosts] = React.useState([]);
  let subscription;
  React.useEffect(() => {
    fetchPosts();
    subscribe();
    return () => subscription && subscription.unsubscribe();
  }, [])
  async function fetchPosts() {
    const dataStoreQuery = await DataStore.query(Post);
    const postData = await Promise.all(dataStoreQuery.map(async post => {
      post = { ...post };
      const signedImage = await Storage.get(post.image);
      post.image = signedImage;
      return post;
    }))
    setPosts(postData);
  }
  async function subscribe() {
    subscription = DataStore.observe(Post).subscribe((msg) => {
        console.log('received change on Post');
        console.log(msg);
        fetchPosts();
    });
  }
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.postListTitle}>All Posts</Text>
      {
        posts.map(post => (
          <PostComponent key={post.id} {...post} />
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 15
  },
  contentContainer: {
    paddingTop: 15,
  },
  optionIconContainer: {
    marginRight: 12,
  },
  userInfo: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    fontSize: 16,
    fontWeight: 'bold'
  },
  inputStyle: {
    height: 50,
    backgroundColor: '#ddd',
    marginBottom: 5,
    paddingHorizontal: 10
  },
  postListTitle: {
    height: 50,
    fontSize: 32,
    fontWeight: "bold"
  }
});

export default PostsScreen