import 'package:flutter_riverpod/flutter_riverpod.dart';

class SupplierTabVM extends StateNotifier<int> {
  SupplierTabVM() : super(0);

  void changeTab(int index) => state = index;
}

final supplierTabProvider =
StateNotifierProvider<SupplierTabVM, int>(
      (ref) => SupplierTabVM(),
);
