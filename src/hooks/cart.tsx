import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const loadedProducts = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );
      if (loadedProducts) {
        setProducts([...JSON.parse(loadedProducts)]);
      }
    })();
    console.log(products);
  }, []);

  const addToCart = useCallback(
    (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CART
      (async () => {
        !products.find(prod => prod.id === product.id) &&
          setProducts([...products, { ...product, quantity: 1 }]);

        await AsyncStorage.setItem(
          '@GoMarketPlace:products',
          JSON.stringify(products),
        );
      })();
    },
    [products],
  );

  const increment = useCallback(
    id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      (async () => {
        const productsUpdateQuantity: Product[] = [];
        products.map(product => {
          if (id === product.id)
            productsUpdateQuantity.push({
              ...product,
              quantity: product.quantity + 1,
            });
          else productsUpdateQuantity.push(product);
          return productsUpdateQuantity;
        });

        setProducts(productsUpdateQuantity);
        await AsyncStorage.setItem(
          '@GoMarketPlace:products',
          JSON.stringify(productsUpdateQuantity),
        );
      })();
    },
    [products],
  );

  const decrement = useCallback(
    id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      (async () => {
        const productsUpdateQuantity: Product[] = [];
        products.forEach(product => {
          if (id === product.id) {
            if (product.quantity - 1 === 0) {
              return;
            }
            productsUpdateQuantity.push({
              ...product,
              quantity: product.quantity - 1,
            });
          } else productsUpdateQuantity.push(product);
        });

        setProducts(productsUpdateQuantity);
        await AsyncStorage.setItem(
          '@GoMarketPlace:products',
          JSON.stringify(productsUpdateQuantity),
        );
      })();
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
