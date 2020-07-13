/* screens/CreatePostScreen.js */
import * as React from 'react';
import { StyleSheet, Text, ActivityIndicator, Button, View, Image, TextInput } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import Amplify, { Storage, DataStore, Predictions, Analytics } from 'aws-amplify';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions';
import * as ImageManipulator from "expo-image-manipulator";
import Constants from 'expo-constants';
import { Post } from '../src/models';

Amplify.addPluggable(new AmazonAIPredictionsProvider());

Analytics.record({
    name: 'createPost'
});

function uuid() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const initialFormState = {
  name: '', location: '', image: '', description: ''
}

function CreatePostScreen({ navigation }) {
  const [image, setImage] = React.useState(null)
  const [formState, setFormState] = React.useState(initialFormState)
  const [saving, setSaving] = React.useState(false)
  React.useEffect(() => {
    getPermissions()
  }, [])
  async function getPermissions() {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  };

  async function pickImage () {
    try {
      const imageId = uuid()
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true, aspect: [4, 3], quality: 1,
      });
      if (!result.cancelled) {
        const manipResult = await ImageManipulator.manipulateAsync(
          result.uri,
          [{ resize: { width: 385, height: 385 } }],
        );
        setFormState({ ...formState, image: imageId })
        setImage(manipResult.uri)
        setSaving(true)
        try {
          const response = await fetch(manipResult.uri)
          const blob = await response.blob()
          await Storage.put(imageId, blob)
          /* -- PREDICTIONS -- */
          console.log('asking for predictions');
          const predicted = await Predictions.identify({
            labels: {
                source: {
                    key: imageId
                },
                type: "ALL"
              }
            });
          console.log('predicted: ');
          console.log(predicted);
          let predictedLabel = '';
          for (let label of predicted.labels) {
            console.log(label);
            if(label.metadata?.confidence > 90.0) {
                predictedLabel +='#' + label.name + ' ';
            }
          }
          setFormState({ ...formState, description: predictedLabel, image: imageId })
          setSaving(false)
        } catch (error) {
          console.log({ error })
          setSaving(false)
        }
      }
      console.log({ result });
    } catch (error) {
      console.log({ error });
    }
  }

  async function createPost() {
    if (!image || !formState.name || !formState.location) return
    await DataStore.save(new Post(formState));
    Analytics.record({
        name: 'createPostComplete', 
        attributes: { tags: formState.description }
    });
    setFormState(initialFormState)
    setImage(null)
    navigation.navigate('Posts')
  }

  function onChangeText(key, value) {
    setFormState({ ...formState, [key]: value })
  }
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TextInput
        onChangeText={val => onChangeText('name', val)}
        placeholder="Post name"
        style={styles.inputStyle}
        value={formState.name}
      />
       <TextInput
        onChangeText={val => onChangeText('location', val)}
        placeholder="Post location"
        style={styles.inputStyle}
        value={formState.location}
      />
      <Button title="Choose an image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      <Button disabled={saving} title="Create Post" onPress={createPost} />
      {
        saving && (
          <View>
            <Text>Saving image... </Text><ActivityIndicator />
          </View>
        )
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
  }
});

export default CreatePostScreen