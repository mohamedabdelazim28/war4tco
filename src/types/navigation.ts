import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type UserTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Store: undefined;
  Profile: undefined;
};

export type MechanicTabParamList = {
  Requests: undefined;
  Jobs: undefined;
  Bookings: undefined;
  Profile: undefined;
};

export type SellerTabParamList = {
  Store: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  UserTabs: undefined;
  MechanicTabs: undefined;
  SellerTabs: undefined;
  SellerStack: undefined;
};

export type UserStackParamList = {
  UserTabs: { screen?: keyof UserTabParamList } | undefined;
  Store: undefined;
  Cart: undefined;
  Searching: { requestId: string };
  ActiveJob: { requestId: string };
  MechanicList: undefined;
  MechanicProfile: { mechanicId: string };
  Booking: { mechanicId: string };
  BookingSuccess: { bookingId?: string };
  EditProfile: undefined;
  Settings: undefined;
  AddVehicle: undefined;
  MyVehicles: undefined;
  PaymentMethods: undefined;
};

export type MechanicStackParamList = {
  MechanicTabs: undefined;
  ActiveJob: { requestId: string };
  RequestDetails: { requestId: string };
  EditProfile: undefined;
};

export type SellerStackParamList = {
  SellerTabs: undefined;
  EditProfile: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type UserStackScreenProps<T extends keyof UserStackParamList> =
  NativeStackScreenProps<UserStackParamList, T>;

export type UserTabScreenProps<T extends keyof UserTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<UserTabParamList, T>,
    NativeStackScreenProps<UserStackParamList>
  >;

export type MechanicTabScreenProps<T extends keyof MechanicTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MechanicTabParamList, T>,
    NativeStackScreenProps<MechanicStackParamList>
  >;

export type MechanicStackScreenProps<T extends keyof MechanicStackParamList> =
  NativeStackScreenProps<MechanicStackParamList, T>;

export type SellerTabScreenProps<T extends keyof SellerTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<SellerTabParamList, T>,
    NativeStackScreenProps<SellerStackParamList>
  >;

export type SellerStackScreenProps<T extends keyof SellerStackParamList> =
  NativeStackScreenProps<SellerStackParamList, T>;
