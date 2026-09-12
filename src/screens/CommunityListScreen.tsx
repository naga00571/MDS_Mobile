// import React, {useEffect, useState} from 'react';
import React, {useCallback, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';

import type {RootStackParamList} from '../../App';

import type {Community} from '../types/community';

// interface Community {
//   id: number;
//   community_name: string;
//   address: string;
//   address2: string | null;
//   latitude: number | null;
//   longitude: number | null;
//   poc_name: string;
//   poc_number: string;
//   is_active: boolean;
//   is_deleted: boolean;
// }

function CommunityListScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();  

  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCommunities = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        'http://10.0.2.2:8000/api/community/',
      );

      if (!response.ok) {
        throw new Error('Unable to retrieve communities.');
      }

      const data = await response.json();

      setCommunities(data);
    } catch (error) {
      console.error('Load communities error:', error);

      Alert.alert(
        'Error',
        'Unable to retrieve communities.',
      );
    } finally {
      setIsLoading(false);
    }
  };

//   useEffect(() => {
//     loadCommunities();
//   }, []);

    useFocusEffect(
        useCallback(() => {
            loadCommunities();
        }, []),
    );

  return (
    <SafeAreaView style={styles.container}>
      
      <Image
        source={require('../assets/images/MDS_app_background2.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />


      {/* Header */}
      <View style={styles.header}>

        <View style={styles.headerLeft}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
                COMMUNITY DETAILS
            </Text>
        </View>


        <TouchableOpacity 
            style={styles.addButton}
            onPress={() => 
                navigation.navigate('CommunityDetails', {
                    mode: 'ADD',
                })
            }
        >
          <Text style={styles.addButtonText}>
            + ADD
          </Text>
        </TouchableOpacity>

      </View>

      {/* Community List */}
      <ScrollView
        contentContainerStyle={styles.content}
      >

        {isLoading ? (

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />

            <Text style={styles.loadingText}>
              Loading communities...
            </Text>
          </View>

        ) : communities.length === 0 ? (

          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No active communities found.
            </Text>
          </View>

        ) : (

          communities.map(community => (

            <TouchableOpacity
              key={community.id}
              style={styles.communityCard}
              onPress={() =>
                navigation.navigate('CommunityDetails', {
                    mode: 'EDIT',
                    community: community,
                })
                }
            >

              <Text style={styles.communityName}>
                {community.community_name}
              </Text>

              <Text style={styles.address}>
                {community.address}
              </Text>

              <Text style={styles.poc}>
                POC: {community.poc_name}
              </Text>

              <Text style={styles.pocNumber}>
                📞 {community.poc_number}
              </Text>

            </TouchableOpacity>

          ))

        )}

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  header: {
    minHeight: 65,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#1B5E20',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    marginRight: 10,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },

  backButtonText: {
    fontSize: 28,
    fontWeight: '400',
  },

  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
    backgroundColor: '#1976d2',
  },

  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  loadingContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },

  emptyText: {
    fontSize: 16,
  },

  communityCard: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },

  communityName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1B5E20',
  },

  address: {
    fontSize: 15,
    marginBottom: 8,
  },

  poc: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
  },

  pocNumber: {
    fontSize: 14,
    marginTop: 4,
    color: '#444444',
  },
});

export default CommunityListScreen;