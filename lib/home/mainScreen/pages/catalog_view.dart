import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'providers.dart';
import 'package:scp_mobile/authentification/authChecker/auth_view_model.dart';

class ConsumerCompaniesView extends ConsumerStatefulWidget {
  const ConsumerCompaniesView({super.key});

  @override
  ConsumerState<ConsumerCompaniesView> createState() =>
      _ConsumerCompaniesViewState();
}

class _ConsumerCompaniesViewState extends ConsumerState<ConsumerCompaniesView> {
  final _searchCtrl = TextEditingController();

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final companiesAsync = ref.watch(consumerCompaniesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Companies',
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
      body: companiesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text("Error: $e")),
        data: (companies) {
          final q = _searchCtrl.text.toLowerCase();
          final filtered = q.isEmpty
              ? companies
              : companies
              .where((c) =>
          (c['name'] as String).toLowerCase().contains(q) ||
              (c['city'] as String).toLowerCase().contains(q))
              .toList();

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(12),
                child: TextField(
                  controller: _searchCtrl,
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.search),
                    hintText: "Search suppliers...",
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (_) => setState(() {}),
                ),
              ),
              Expanded(
                child: filtered.isEmpty
                    ? const Center(child: Text("No companies found"))
                    : ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final c = filtered[index];
                    final id = c['id'] as int;
                    final name = c['name'] as String;
                    final city = c['city'] as String;

                    final linkStatus =
                        ref.watch(consumerLinksProvider)[id] ??
                            ConsumerLinkStatus.none;

                    String linkLabel;
                    bool linkEnabled = true;
                    switch (linkStatus) {
                      case ConsumerLinkStatus.none:
                        linkLabel = "Send link request";
                        break;
                      case ConsumerLinkStatus.pending:
                        linkLabel = "Pending...";
                        linkEnabled = false;
                        break;
                      case ConsumerLinkStatus.approved:
                        linkLabel = "Linked ✅";
                        linkEnabled = false;
                        break;
                      case ConsumerLinkStatus.rejected:
                        linkLabel = "Rejected";
                        linkEnabled = false;
                        break;
                    }

                    return Card(
                      child: ListTile(
                        title: Text(name,
                            style: const TextStyle(
                                fontWeight: FontWeight.bold)),
                        subtitle: Text(city),
                        onTap: () {
                          final current =
                          ref.read(selectedConsumerCompanyProvider);
                          if (current != null && current != id) {
                            ref.read(consumerCartProvider.notifier).clear();
                          }

                          ref
                              .read(selectedConsumerCompanyProvider.notifier)
                              .state = id;

                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ConsumerCatalogView(
                                companyId: id,
                                companyName: name,
                              ),
                            ),
                          );
                        },
                        trailing: TextButton(
                          onPressed: linkEnabled
                              ? () async {
                            // 1) instantly set status to Pending
                            ref.read(consumerLinksProvider.notifier).sendRequest(id);

                            // Tiny feedback to user
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text("Request sent to $name")),
                            );

                            // 2) wait 3 seconds
                            await Future.delayed(const Duration(seconds: 3));

                            // safety: if user left the page, do nothing
                            if (!context.mounted) return;

                            // 3) Change from Pending → Available
                            ref.read(consumerLinksProvider.notifier).state = {
                              ...ref.read(consumerLinksProvider),
                              id: ConsumerLinkStatus.approved,
                            };

                            // 4) Clear cart if switching companies
                            final current = ref.read(selectedConsumerCompanyProvider);
                            if (current != null && current != id) {
                              ref.read(consumerCartProvider.notifier).clear();
                            }

                            // 5) Save selected company
                            ref.read(selectedConsumerCompanyProvider.notifier).state = id;

                            // 6) Open catalog automatically
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => ConsumerCatalogView(
                                  companyId: id,
                                  companyName: name,
                                ),
                              ),
                            );
                          }
                              : null,
                          child: Text(linkLabel),
                        ),

                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class ConsumerCatalogView extends ConsumerWidget {
  final int companyId;
  final String companyName;

  const ConsumerCatalogView({
    super.key,
    required this.companyId,
    required this.companyName,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync =
    ref.watch(consumerProductsByCompanyProvider(companyId));
    final query = ref.watch(consumerSearchQueryProvider(companyId));

    return Scaffold(
      appBar: AppBar(
        title: Text("Catalog • $companyName",
            style: const TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            TextField(
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search),
                hintText: "Search products...",
                border: OutlineInputBorder(),
              ),
              onChanged: (v) => ref
                  .read(consumerSearchQueryProvider(companyId).notifier)
                  .state = v,
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
                    itemBuilder: (context, index) {
                      final p = filtered[index];
                      final name = p['name'] as String;
                      final price = (p['price'] as num).toDouble();

                      return Card(
                        child: ListTile(
                          title: Text(name,
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold)),
                          subtitle:
                          Text("₸${price.toStringAsFixed(0)}"),
                          trailing: IconButton(
                            icon: const Icon(Icons.add_shopping_cart),
                            onPressed: () =>
                                ref.read(consumerCartProvider.notifier).add(p),
                          ),
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
