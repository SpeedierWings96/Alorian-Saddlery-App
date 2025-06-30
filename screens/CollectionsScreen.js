import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingSpinner from '../components/LoadingSpinner';
import shopifyService from '../services/shopify';

const CollectionsScreen = ({ navigation }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const data = await shopifyService.getCollections();
      setCollections(data.collections.edges.map(edge => edge.node));
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCollections();
  };

  const renderCollection = ({ item }) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() => navigation.navigate('Collection', { 
        handle: item.handle,
        title: item.title 
      })}
      activeOpacity={0.9}
    >
      {item.image ? (
        <Image
          source={{ uri: item.image.originalSrc }}
          style={styles.collectionImage}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={['#8B4513', '#D2691E']}
          style={styles.collectionImage}
        >
          <Text style={styles.placeholderText}>Alorian</Text>
        </LinearGradient>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      >
        <Text style={styles.collectionTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.collectionDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        renderItem={renderCollection}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8B4513']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No collections found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingVertical: 16,
  },
  collectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  collectionImage: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 60,
  },
  collectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default CollectionsScreen;