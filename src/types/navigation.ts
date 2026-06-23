import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  ProductDetail: { handbagId: string };
  Reviews: { handbagId: string; handbagName: string };
  Favorites: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  AIStylist: undefined;
  StoreLocator: undefined;
};
