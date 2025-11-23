import 'package:flutter_riverpod/flutter_riverpod.dart';

class ConsumerTabVM extends StateNotifier<int> {
  ConsumerTabVM() : super(1); // default = Catalog tab like you had

  void changeTab(int index) => state = index;
}

final consumerTabProvider =
StateNotifierProvider<ConsumerTabVM, int>(
      (ref) => ConsumerTabVM(),
);
