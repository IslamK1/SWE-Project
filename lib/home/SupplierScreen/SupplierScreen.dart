import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'supplierScreen_viewModel.dart';
import 'pages/providers.dart';
import 'pages/view.dart';

class SupplierScreen extends ConsumerStatefulWidget {
  const SupplierScreen({super.key});

  @override
  ConsumerState<SupplierScreen> createState() => _SupplierScreenState();
}

class _SupplierScreenState extends ConsumerState<SupplierScreen> {
  bool _seeded = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    if (!_seeded) {
      _seeded = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(ordersProvider.notifier).addMockOrdersIfEmpty();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final index = ref.watch(supplierTabProvider);

    const supplierCompanyId = 2;
    const supplierCompanyName = "Company #2";

    final pages = [
      const SupplierOrdersView(supplierCompanyId: supplierCompanyId),
      const SupplierCatalogView(
        companyId: supplierCompanyId,
        companyName: supplierCompanyName,
      ),
      const SupplierLinkRequestsView(supplierCompanyId: supplierCompanyId),
      const SupplierChatView(),
    ];

    return Scaffold(
      body: pages[index],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: index,
        onTap: (i) => ref.read(supplierTabProvider.notifier).changeTab(i),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_basket_outlined),
            label: "Orders",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.inventory_2_outlined),
            label: "Catalog",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.link_outlined),
            label: "Requests",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat_outlined),
            label: "Chat",
          ),
        ],
      ),
    );
  }
}
