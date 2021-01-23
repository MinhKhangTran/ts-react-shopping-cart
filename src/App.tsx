import {
  Box,
  Grid,
  Text,
  Image,
  Spinner,
  VStack,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  IconButton,
  useDisclosure,
  Flex
} from "@chakra-ui/react";
import { AiFillShopping } from "react-icons/ai";
import { useEffect, useReducer, useRef } from "react";

type CartItemType = {
  id: number;
  category: string;
  description: string;
  image: string;
  price: number;
  title: string;

  amount: number;
};

interface ReducerState {
  loading: boolean;
  error: boolean;
  items: CartItemType[];
  cartItems: CartItemType[];
}

export enum ActionTypes {
  LOADING = "LOADING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
  ADD = "ADD",
  REMOVE = "REMOVE"
}

type ReducerAction =
  | { type: ActionTypes.LOADING }
  | { type: ActionTypes.ERROR }
  | { type: ActionTypes.SUCCESS; payload: CartItemType[] }
  | { type: ActionTypes.ADD; payload: CartItemType }
  | { type: ActionTypes.REMOVE; payload: number };

const reducer = (state: ReducerState, action: ReducerAction) => {
  switch (action.type) {
    case ActionTypes.LOADING:
      return { ...state, loading: true };
    case ActionTypes.SUCCESS:
      return { ...state, loading: false, items: action.payload };
    case ActionTypes.ERROR:
      return { ...state, error: true };
    case ActionTypes.ADD:
      const { id } = action.payload;
      const existedItem = state.cartItems.find((item) => item.id === id);
      // if it is already in cart
      if (existedItem) {
        const tempCart = state.cartItems.map((item) => {
          if (item.id === id) {
            return { ...item, amount: item.amount + 1 };
          } else {
            return item;
          }
        });
        return { ...state, cartItems: tempCart };
      } else {
        // first time
        return {
          ...state,
          cartItems: [...state.cartItems, { ...action.payload, amount: 1 }]
        };
      }
    case ActionTypes.REMOVE:
      let tempCart = state.cartItems
        .map((item) => {
          if (item.id === action.payload) {
            return { ...item, amount: item.amount - 1 };
          }
          return item;
        })
        .filter((item) => item.amount !== 0);
      return { ...state, cartItems: tempCart };

    default:
      return state;
  }
};

const initState = {
  loading: false,
  error: false,
  items: [],
  cartItems: []
};

export default function App() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();
  const [state, dispatch] = useReducer(reducer, initState);
  // fetching
  const fetchingItems = async () => {
    dispatch({ type: ActionTypes.LOADING });
    try {
      const response = await fetch("https://fakestoreapi.com/products");
      const data = await response.json();
      // console.log(data);
      dispatch({ type: ActionTypes.SUCCESS, payload: data });
    } catch (error) {
      dispatch({ type: ActionTypes.ERROR });
    }
  };

  useEffect(() => {
    fetchingItems();
  }, []);
  // console.log(state.items);

  // get total for badge
  const getTotalItems = (items: CartItemType[]) => {
    return items.reduce((total: number, item) => total + item.amount, 0);
  };

  // add to cart
  const addToCart = (item: CartItemType) => {
    dispatch({ type: ActionTypes.ADD, payload: item });
  };

  // remove from cart
  const removeFromCart = (id: number) => {
    dispatch({ type: ActionTypes.REMOVE, payload: id });
  };
  // Calculate total
  const totalSum = (items: CartItemType[]) => {};
  return (
    <Box bgGradient="linear(to-tr,blue.50,blue.300)">
      <Box pos="relative">
        <IconButton
          onClick={onOpen}
          ref={btnRef}
          aria-label="Shopping cart"
          icon={<AiFillShopping />}
          variant="ghost"
          pos="absolute"
          top="1%"
          right="1%"
          fontSize="30px"
        ></IconButton>
        <Box
          zIndex={state.cartItems?.length === 0 ? "-40" : "40"}
          pos="absolute"
          bg="blue.600"
          color="blue.100"
          top="0.75%"
          borderRadius="50%"
          h="25px"
          w="25px"
          right="0.75%"
        >
          <Grid placeItems="center" h="100%" w="100%">
            {getTotalItems(state.cartItems)}
          </Grid>
        </Box>
      </Box>
      <Grid
        gap={6}
        py={8}
        templateColumns={{ base: "repeat(1,1fr)", md: "repeat(3,1fr)" }}
        w={{ base: "90%", md: "80%" }}
        mx="auto"
      >
        {state.loading && <Spinner mt={4} />}
        {state.error && <Text mt={4}>Fehler:/</Text>}
        {state.items?.map((item: CartItemType) => {
          const { id, image, price, title } = item;
          return (
            <VStack
              shadow="md"
              borderRadius="md"
              bg="blue.100"
              padding={4}
              key={id}
            >
              <Text fontWeight="semibold">{title}</Text>
              <Image
                boxSize="200px"
                objectFit="cover"
                src={image}
                alt={title}
              />
              <Text fontWeight="bold">${price}</Text>
              <Button
                colorScheme="blue"
                variant="outline"
                onClick={() => {
                  addToCart(item);
                }}
              >
                Add To Cart
              </Button>
            </VStack>
          );
        })}
      </Grid>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay>
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Shopping Cart</DrawerHeader>

            <DrawerBody>
              {state.cartItems.length === 0 && (
                <Box>
                  <Text>Shopping cart is empty</Text>
                </Box>
              )}
              {state.cartItems.map((item) => {
                const { id, image, title, price, amount } = item;
                return (
                  <Box key={id}>
                    <Image
                      src={image}
                      alt={title}
                      boxSize="50px"
                      objectFit="cover"
                    />
                    <Text>{title}</Text>
                    <Text>{price}</Text>
                    <Flex align="center">
                      <Button
                        onClick={() => {
                          removeFromCart(id);
                        }}
                        variant="ghost"
                      >
                        -
                      </Button>
                      <Text mx={4}>{amount}</Text>
                      <Button
                        onClick={() => {
                          addToCart(item);
                        }}
                        variant="ghost"
                      >
                        +
                      </Button>
                    </Flex>
                  </Box>
                );
              })}
            </DrawerBody>

            <DrawerFooter>
              <Text fontWeight="bold">
                {state.cartItems.reduce((total, item) => {
                  return parseFloat(
                    (total + item.amount * item.price).toFixed(2)
                  );
                }, 0)}
              </Text>
            </DrawerFooter>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </Box>
  );
}
