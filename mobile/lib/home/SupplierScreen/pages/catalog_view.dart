import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'providers.dart';
import 'package:scp_mobile/authentification/authChecker/auth_view_model.dart';

class SupplierCatalogView extends ConsumerWidget {
  final int companyId;
  final String companyName;

  const SupplierCatalogView({
    super.key,
    required this.companyId,
    required this.companyName,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(productsByCompanyProvider(companyId));
    final query = ref.watch(searchQueryProvider(companyId));

    return Scaffold(
      appBar: AppBar(
        title: Text("Catalog • $companyName",
            style: const TextStyle(fontWeight: FontWeight.bold)),
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
        child: Column(
          children: [
            TextField(
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search),
                hintText: "Search products...",
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onChanged: (v) =>
              ref.read(searchQueryProvider(companyId).notifier).state = v,
            ),
            const SizedBox(height: 12),
            Expanded(
              child: productsAsync.when(
                loading: () =>
                const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(child: Text("Error: $e")),
                data: (products) {
                  final q = query.toLowerCase();
                  final filtered = q.isEmpty
                      ? products
                      : products
                      .where((p) =>
                      (p['name'] as String)
                          .toLowerCase()
                          .contains(q))
                      .toList();

                  if (filtered.isEmpty) {
                    return const Center(child: Text("No products found"));
                  }

                  return ListView.builder(
                    itemCount: filtered.length,
                    itemBuilder: (context, i) {
                      final p = filtered[i];
                      final name = p['name'] as String;
                      final price = (p['price'] as num).toDouble();
                      final amount = p['amount'];

                      return Card(
                        child: ListTile(
                          title: Text(name,
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold)),
                          subtitle:
                          Text("₸${price.toStringAsFixed(0)} • amount $amount"),
                        ),
                      );
                    },
                  );
                },
              ),
            )
          ],
        ),
      ),
    );
  }
}
