import 'package:flutter_riverpod/flutter_riverpod.dart';

/// =======================
///      PRODUCTS (mock)
/// =======================

final productsByCompanyProvider =
FutureProvider.family<List<Map<String, dynamic>>, int>((ref, companyId) async {
  // TODO: replace later with backend
  return const [
    {'id': 1, 'name': 'Carrots', 'price': 350.0, 'amount': 350},
    {'id': 2, 'name': 'Cucumbers', 'price': 420.0, 'amount': 300},
    {'id': 3, 'name': 'Onions', 'price': 250.0, 'amount': 400},
  ];
});

final searchQueryProvider =
StateProvider.autoDispose.family<String, int>((ref, companyId) => '');


/// =======================
///          ORDERS
/// =======================

class OrdersNotifier extends StateNotifier<List<Map<String, dynamic>>> {
  OrdersNotifier() : super([]);

  void addMockOrdersIfEmpty() {
    if (state.isNotEmpty) return;

    final now = DateTime.now();
    state = [
      {
        'id': now.millisecondsSinceEpoch,
        'companyId': 1,
        'buyerId': 101,
        'items': [
          {'name': 'Carrots', 'quantity': 3},
          {'name': 'Cucumbers', 'quantity': 1},
        ],
        'total': 1800.0,
        'status': 'Pending',
        'createdAt': now.subtract(const Duration(days: 1)),
      },
      {
        'id': now.millisecondsSinceEpoch + 1,
        'companyId': 1,
        'buyerId': 102,
        'items': [
          {'name': 'Onions', 'quantity': 10},
        ],
        'total': 2500.0,
        'status': 'Accepted',
        'createdAt': now,
      },
      // Another company order (should not show for supplierId=1)
      {
        'id': now.millisecondsSinceEpoch + 2,
        'companyId': 2,
        'buyerId': 103,
        'items': [
          {'name': 'Tomatoes', 'quantity': 5},
        ],
        'total': 2000.0,
        'status': 'Pending',
        'createdAt': now.subtract(const Duration(days: 2)),
      },
    ];
  }

  void updateStatus(int orderId, String newStatus) {
    state = [
      for (final o in state)
        if (o['id'] == orderId) {...o, 'status': newStatus} else o
    ];
  }
}

final ordersProvider =
StateNotifierProvider<OrdersNotifier, List<Map<String, dynamic>>>(
      (ref) => OrdersNotifier(),
);


/// =======================
///     LINK REQUESTS
/// =======================

enum LinkStatus { pending, approved, rejected }

class LinkRequestsNotifier extends StateNotifier<List<Map<String, dynamic>>> {
  LinkRequestsNotifier() : super([]) {
    _seedMock();
  }

  void _seedMock() {
    final now = DateTime.now();
    state = [
      {
        'id': now.millisecondsSinceEpoch,
        'supplierCompanyId': 1,
        'consumerId': 2001,
        'consumerName': 'Cafe Dala',
        'status': LinkStatus.pending,
        'createdAt': now,
      },
      {
        'id': now.millisecondsSinceEpoch + 1,
        'supplierCompanyId': 1,
        'consumerId': 2002,
        'consumerName': 'Restaurant Aspan',
        'status': LinkStatus.pending,
        'createdAt': now.subtract(const Duration(hours: 5)),
      },
    ];
  }

  void approve(int requestId) {
    state = [
      for (final r in state)
        if (r['id'] == requestId) {...r, 'status': LinkStatus.approved} else r
    ];
  }

  void reject(int requestId) {
    state = [
      for (final r in state)
        if (r['id'] == requestId) {...r, 'status': LinkStatus.rejected} else r
    ];
  }
}

final linkRequestsProvider =
StateNotifierProvider<LinkRequestsNotifier, List<Map<String, dynamic>>>(
      (ref) => LinkRequestsNotifier(),
);


/// =======================
///      CHAT per buyer
/// =======================

final selectedChatBuyerProvider = StateProvider<int?>((ref) => null);

class ChatThreadsNotifier
    extends StateNotifier<Map<int, List<Map<String, dynamic>>>> {
  ChatThreadsNotifier() : super({});

  List<Map<String, dynamic>> _thread(int buyerId) =>
      state[buyerId] ?? <Map<String, dynamic>>[];

  void sendSupplierMessage({
    required int buyerId,
    required String text,
  }) {
    final t = text.trim();
    if (t.isEmpty) return;

    final msg = {
      'id': DateTime.now().millisecondsSinceEpoch,
      'text': t,
      'from': 'supplier',
      'createdAt': DateTime.now(),
    };

    state = {...state, buyerId: [..._thread(buyerId), msg]};
  }

  void receiveBuyerMessage({
    required int buyerId,
    required String text,
  }) {
    final t = text.trim();
    if (t.isEmpty) return;

    final msg = {
      'id': DateTime.now().millisecondsSinceEpoch,
      'text': t,
      'from': 'buyer',
      'createdAt': DateTime.now(),
    };

    state = {...state, buyerId: [..._thread(buyerId), msg]};
  }
}

final chatThreadsProvider = StateNotifierProvider<ChatThreadsNotifier,
    Map<int, List<Map<String, dynamic>>>>(
      (ref) => ChatThreadsNotifier(),
);

final currentChatProvider =
Provider.autoDispose<List<Map<String, dynamic>>>((ref) {
  final buyerId = ref.watch(selectedChatBuyerProvider);
  final threads = ref.watch(chatThreadsProvider);
  if (buyerId == null) return [];
  return threads[buyerId] ?? [];
});
