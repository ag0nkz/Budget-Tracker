import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type MainTabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  TransactionForm: { expenseId?: string } | undefined;
  IncomeForm: { incomeId?: string } | undefined;
};

export type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
