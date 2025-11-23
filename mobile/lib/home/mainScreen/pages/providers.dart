import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

/// =======================
///     COMPANIES (mock)
/// =======================

final consumerCompaniesProvider =
FutureProvider<List<Map<String, dynamic>>>((ref) async {
  await Future.delayed(const Duration(milliseconds: 600));
  return const [
    {'id': 1, 'name': 'Green Farm', 'city': 'Astana'},
    {'id': 2, 'name': 'Agro Market', 'city': 'Almaty'},
    {'id': 3, 'name': 'Fresh Foods', 'city': 'Shymkent'},
  ];
});

/// =======================
///     PRODUCTS (mock + 1 backend example)
/// =======================

final consumerProductsByCompanyProvider =
FutureProvider.family<List<Map<String, dynamic>>, int>((ref, companyId) async {
  // same logic you had but renamed

  if (companyId == 1) {
    final uri = Uri.parse('http://localhost:8000/api/products/');
    final response = await http.get(uri);

    if (response.statusCode != 200) {
      throw Exception('Failed to load products: ${response.statusCode}');
    }

    final decoded = jsonDecode(response.body);
    final list = (decoded as List).map<Map<String, dynamic>>((item) {
      final map = item as Map<String, dynamic>;
      return {
        'name': map['name'] as String,
        'price': (map['price'] as num).toDouble(),
      };
    }).toList();

    return list;
  }

  await Future.delayed(const Duration(milliseconds: 300));

  switch (companyId) {
    case 2:
      return const [
        {'name': 'Carrots', 'price': 350.0},
        {'name': 'Cucumbers', 'price': 420.0},
        {'name': 'Onions', 'price': 250.0},
      ];
    case 3:
      return const [
        {'name': 'Milk', 'price': 600.0},
        {'name': 'Cheese', 'price': 1500.0},
        {'name': 'Butter', 'price': 800.0},
      ];
    default:
      return const [];
  }
});

final consumerSearchQueryProvider =
StateProvider.autoDispose.family<String, int>((ref, companyId) => '');

final selectedConsumerCompanyProvider = StateProvider<int?>((ref) => null);


/// =======================
///          CART
/// =======================

class ConsumerCartNotifier extends StateNotifier<List<Map<String, dynamic>>> {
  ConsumerCartNotifier() : super([]);

  void add(Map<String, dynamic> product) {
    final name = product['name'] as String;

    final index = state.indexWhere((item) => item['name'] == name);
    if (index == -1) {
      state = [...state, {...product, 'quantity': 1}];
    } else {
      final updated = [...state];
      final old = updated[index];
      final qty = (old['quantity'] as int? ?? 1) + 1;
      updated[index] = {...old, 'quantity': qty};
      state = updated;
    }
  }

  void removeOne(String name) {
    final index = state.indexWhere((item) => item['name'] == name);
    if (index == -1) return;

    final updated = [...state];
    final old = updated[index];
    final qty = (old['quantity'] as int? ?? 1);

    if (qty <= 1) {
      updated.removeAt(index);
    } else {
      updated[index] = {...old, 'quantity': qty - 1};
    }

    state = updated;
  }

  void clear() => state = [];
}

final consumerCartProvider =
StateNotifierProvider<ConsumerCartNotifier, List<Map<String, dynamic>>>(
      (ref) => ConsumerCartNotifier(),
);

final consumerCartTotalCountProvider = Provider<int>((ref) {
  final items = ref.watch(consumerCartProvider);
  return items.fold(0, (sum, i) => sum + (i['quantity'] as int? ?? 1));
});

final consumerCartTotalPriceProvider = Provider<double>((ref) {
  final items = ref.watch(consumerCartProvider);
  return items.fold(
    0.0,
        (sum, i) =>
    sum +
        ((i['price'] as num).toDouble() * (i['quantity'] as int? ?? 1)),
  );
});


/// =======================
///          ORDERS
/// =======================

class ConsumerOrdersNotifier extends StateNotifier<List<Map<String, dynamic>>> {
  ConsumerOrdersNotifier() : super([]);

  void addOrder({
    required int companyId,
    required int buyerId,
    required List<Map<String, dynamic>> items,
    required double total,
  }) {
    final now = DateTime.now();

    state = [
      ...state,
      {
        'id': now.millisecondsSinceEpoch,
        'companyId': companyId,
        'buyerId': buyerId,
        'items': items.map((e) => Map<String, dynamic>.from(e)).toList(),
        'total': total,
        'status': 'Pending',
        'createdAt': now,
      }
    ];
  }
}

final consumerOrdersProvider =
StateNotifierProvider<ConsumerOrdersNotifier, List<Map<String, dynamic>>>(
      (ref) => ConsumerOrdersNotifier(),
);


/// =======================
///       LINK REQUESTS
/// =======================

enum ConsumerLinkStatus { none, pending, approved, rejected }

class ConsumerLinksNotifier
    extends StateNotifier<Map<int, ConsumerLinkStatus>> {
  ConsumerLinksNotifier() : super({});

  ConsumerLinkStatus statusFor(int companyId) =>
      state[companyId] ?? ConsumerLinkStatus.none;

  void sendRequest(int companyId) {
    state = {...state, companyId: ConsumerLinkStatus.pending};
  }
}

final consumerLinksProvider =
StateNotifierProvider<ConsumerLinksNotifier, Map<int, ConsumerLinkStatus>>(
      (ref) => ConsumerLinksNotifier(),
);


/// =======================
///   CHAT per supplier
/// =======================

final selectedChatCompanyProvider = StateProvider<int?>((ref) => null);

class ConsumerChatThreadsNotifier
    extends StateNotifier<Map<int, List<Map<String, dynamic>>>> {
  ConsumerChatThreadsNotifier() : super({});

  List<Map<String, dynamic>> _thread(int companyId) =>
      state[companyId] ?? <Map<String, dynamic>>[];

  void sendUserMessage({
    required int companyId,
    required String text,
  }) {
    final t = text.trim();
    if (t.isEmpty) return;

    final msg = {
      'id': DateTime.now().millisecondsSinceEpoch,
      'text': t,
      'from': 'user',
      'createdAt': DateTime.now(),
    };

    state = {...state, companyId: [..._thread(companyId), msg]};
  }

  void receiveCompanyMessage({
    required int companyId,
    required String text,
  }) {
    final t = text.trim();
    if (t.isEmpty) return;

    final msg = {
      'id': DateTime.now().millisecondsSinceEpoch,
      'text': t,
      'from': 'company',
      'createdAt': DateTime.now(),
    };

    state = {...state, companyId: [..._thread(companyId), msg]};
  }
}

final consumerChatThreadsProvider = StateNotifierProvider<
    ConsumerChatThreadsNotifier, Map<int, List<Map<String, dynamic>>>>(
      (ref) => ConsumerChatThreadsNotifier(),
);

final currentConsumerChatProvider =
Provider.autoDispose<List<Map<String, dynamic>>>((ref) {
  final companyId = ref.watch(selectedChatCompanyProvider);
  final threads = ref.watch(consumerChatThreadsProvider);
  if (companyId == null) return [];
  return threads[companyId] ?? [];
});
