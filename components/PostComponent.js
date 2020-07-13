/* components/PostComponent.js */
import React from 'react'
import {
  Text, View, Image, StyleSheet, Dimensions
} from 'react-native'

import { Ionicons, FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window')

export default function PostComponent({ name, location, image, description, owner }) {
  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <FontAwesome name="user-circle-o" size={28} color="black" />
        <View>
            <Text style={styles.owner}>{owner}</Text>
            <Text style={styles.location}>{location}</Text>
        </View>
      </View>
      <Image
        style={styles.image}
        source={{ uri: image }}
      />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  post: {
    border: '1px solid #333',
    marginTop: 25
  },  
  postHeader: {
    flex: 1, 
    flexDirection: 'row'
  }, 
  image: {
    width: width - 30,
    height: width - 30,
    borderRadius: 6
  },
  owner: {
    paddingHorizontal: 15,
    paddingTop: 0,
    paddingBottom: 0,
    fontSize: 16,
    fontWeight: 'bold'
  },
  location: {
    fontSize: 12,
    fontWeight: 'normal',
    paddingHorizontal: 15
  },
  name: {
    paddingHorizontal: 0,
    paddingBottom: 4,
    paddingTop: 10,
    fontSize: 16,
    fontWeight: "normal"
  },
  description: {
    color: 'rgb(33, 150, 243)',
    fontWeight: 'bold'
  }
})