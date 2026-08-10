import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { addToCart } from './redux/action';
import { useDispatch, useSelector } from 'react-redux';

type ProductItem = {
  name: string;
  color: string;
  price: number;
  image: string;
};

type ProductProps = {
  item: ProductItem;
};

type RootState = {
  reducer: ProductItem[];
};

const Product = ({ item }: ProductProps) => {
  const [added, setAdded] = useState(false);

  const dispatch = useDispatch();

  const cartItems = useSelector(
    (state: RootState) => state.reducer
  );

  const handleAddToCart = () => {
    console.log(`${item.name} added to cart`);

    dispatch(addToCart(item));
  };

  useEffect(() => {
    const isProductInCart = cartItems.some(
      (elem) => elem.name === item.name
    );

    setAdded(isProductInCart);
  }, [cartItems, item.name]);

  return (
    <View style={styles.card}>

      <Image
        source={{ uri: item.image }}
        style={styles.image}
      />

      <View style={styles.info}>

        <Text style={styles.name}>
          {item.name}
        </Text>

        <Text style={styles.color}>
          Color: {item.color}
        </Text>

        <Text style={styles.price}>
          Rs. {item.price.toLocaleString()}
        </Text>

        {added ? (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => console.log('Remove from cart')}
          >
            <Text style={styles.buttonText}>
              Remove from Cart
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={handleAddToCart}
          >
            <Text style={styles.buttonText}>
              Add to Cart
            </Text>
          </TouchableOpacity>
        )}

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },

  image: {
    width: 110,
    height: 130,
    resizeMode: 'contain',
    marginRight: 20,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  color: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },

  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },

  removeButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default Product;