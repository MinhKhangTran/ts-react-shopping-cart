import { Box } from "@chakra-ui/react";
import { useEffect, useReducer } from "react";

type CartItemType = {
  id: number;
  category: string;
  description: string;
  image: string;
  price: number;
  title: string;
  // self added!
  amount: number;
};

interface ReducerState {
  loading: boolean;
  error: boolean;
  items: CartItemType[];
}

export enum ActionTypes {
  LOADING = "LOADING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR"
}

type ReducerAction =
  | { type: ActionTypes.LOADING }
  | { type: ActionTypes.ERROR }
  | { type: ActionTypes.SUCCESS; payload: CartItemType[] };

const reducer = (state: ReducerState, action: ReducerAction) => {
  switch (action.type) {
    case ActionTypes.LOADING:
      return { ...state, loading: true };
    case ActionTypes.SUCCESS:
      return { ...state, loading: false, items: action.payload };
    case ActionTypes.ERROR:
      return { ...state, error: true };
    default:
      return state;
  }
};

const initState = {
  loading: false,
  error: false,
  items: []
};

export default function App() {
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
  console.log(state.items);

  // total items amount for badge

  // add to cart

  // remove from cart

  return <Box></Box>;
}
