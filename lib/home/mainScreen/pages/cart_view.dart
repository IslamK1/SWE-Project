import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'providers.dart';
import 'package:scp_mobile/home/mainScreen/mainScreen_viewModel.dart';
import 'package:scp_mobile/authentification/authChecker/auth_view_model.dart';

class ConsumerCartView extends ConsumerWidget {
  const ConsumerCartView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(consumerCartProvider);
    final total = ref.watch(consumerCartTotalPriceProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text("Shopping cart",
            style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_outlined),
            onPressed: () {
              ref.read(authProvider.notifier).logout();
            },
          )
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: cart.isEmpty
            ? const Center(child: Text("Cart is empty"))
            : Column(
          children: [
            Expanded(
              child: ListView.builder(
                itemCount: cart.length,
                itemBuilder: (context, index) {
                  final p = cart[index];
                  final name = p['name'] as String;
                  final price = (p['price'] as num).toDouble();
                  final qty = p['quantity'] as int? ?? 1;

                  return Card(
                    child: ListTile(
                      title: Text(name,
                          style: const TextStyle(
                              fontWeight: FontWeight.bold)),
                      subtitle: Text(
                          "₸${price.toStringAsFixed(0)} x $qty = ₸${(price * qty).toStringAsFixed(0)}"),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove),
                            onPressed: () => ref
                                .read(consumerCartProvider.notifier)
                                .removeOne(name),
                          ),
                          Text("$qty"),
                          IconButton(
                            icon: const Icon(Icons.add),
                            onPressed: () => ref
                                .read(consumerCartProvider.notifier)
                                .add({'name': name, 'price': price}),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerRight,
              child: Text("Total: ₸${total.toStringAsFixed(0)}",
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 18)),
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: () {
                final companyId =
                ref.read(selectedConsumerCompanyProvider);

                if (companyId == null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content: Text("Pick a company first")),
                  );
                  return;
                }

                // mock buyer id for demo
                const buyerId = 999;

                ref.read(consumerOrdersProvider.notifier).addOrder(
                  companyId: companyId,
                  buyerId: buyerId,
                  items: cart,
                  total: total,
                );

                ref.read(consumerCartProvider.notifier).clear();
                ref.read(consumerTabProvider.notifier).changeTab(0);
              },
              child: const Text("Checkout"),
            )
          ],
        ),
      ),
    );
  }
}
