import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSelector } from 'react-redux';

type Product = {
  name: string;
  color: string;
  price: number;
  image: string;
};

type RootState = {
  reducer: Product[];
};

const Header = () => {
  const cartData = useSelector(
    (state: RootState) => state.reducer
  );

  return (
    <View style={styles.header}>

      <Text style={styles.title}>
        My Store
      </Text>

      <TouchableOpacity style={styles.cartButton}>

        <Text style={styles.cartText}>
          🛒 Cart
        </Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {cartData.length}
          </Text>
        </View>

      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 70,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },

  cartButton: {
    position: 'relative',
    padding: 8,
  },

  cartText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },

  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'red',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Header;