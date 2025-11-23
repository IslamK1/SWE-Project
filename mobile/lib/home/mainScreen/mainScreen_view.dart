import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'mainScreen_viewModel.dart';
import 'package:scp_mobile/home/mainScreen/pages/view.dart';

class MainScreen extends ConsumerWidget {
  const MainScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final index = ref.watch(consumerTabProvider);

    final pages = const [
      ConsumerOrdersView(),
      ConsumerCompaniesView(),
      ConsumerCartView(),
      ConsumerChatView(),
    ];

    return Scaffold(
      body: pages[index],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.amber,
        unselectedItemColor: Colors.blueGrey,
        currentIndex: index,
        onTap: (i) => ref.read(consumerTabProvider.notifier).changeTab(i),
        items: const [
          BottomNavigationBarItem(
              icon: Icon(Icons.shopping_basket_outlined), label: 'Orders'),
          BottomNavigationBarItem(
              icon: Icon(Icons.history_outlined), label: 'Catalog'),
          BottomNavigationBarItem(
              icon: Icon(Icons.shopping_cart_outlined), label: 'Cart'),
          BottomNavigationBarItem(
              icon: Icon(Icons.chat_outlined), label: 'Chat'),
        ],
      ),
    );
  }
}
