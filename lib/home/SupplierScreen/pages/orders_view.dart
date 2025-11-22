import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'providers.dart';
import 'package:scp_mobile/home/SupplierScreen/supplierScreen_viewModel.dart';
import 'package:scp_mobile/authentification/authChecker/auth_view_model.dart';

class SupplierOrdersView extends ConsumerWidget {
  final int supplierCompanyId;
  const SupplierOrdersView({super.key, required this.supplierCompanyId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(ordersProvider);

    final supplierOrders =
    orders.where((o) => o['companyId'] == supplierCompanyId).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text("Orders • Supplier",
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
      body: supplierOrders.isEmpty
          ? const Center(child: Text("No orders yet"))
          : ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: supplierOrders.length,
        itemBuilder: (context, index) {
          final o = supplierOrders[index];

          final orderId = o['id'] as int;
          final buyerId = o['buyerId'] as int? ?? -1;
          final total = (o['total'] as num).toDouble();
          final status = o['status'] as String;
          final createdAt = o['createdAt'] as DateTime;

          final items = (o['items'] as List)
              .map((e) => Map<String, dynamic>.from(e))
              .toList();

          return Card(
            margin: const EdgeInsets.only(bottom: 10),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Order #$orderId",
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 4),
                  Text("Buyer: #$buyerId"),

                  const SizedBox(height: 8),
                  ...items.map((i) {
                    final name = i['name'];
                    final qty = i['quantity'] ?? 1;
                    return Text("• $name x$qty");
                  }),

                  const SizedBox(height: 8),
                  Text("Total: ₸${total.toStringAsFixed(0)}",
                      style:
                      const TextStyle(fontWeight: FontWeight.bold)),
                  Text(
                    "${createdAt.day}-${createdAt.month}-${createdAt.year}",
                    style: const TextStyle(
                        color: Colors.grey, fontSize: 12),
                  ),

                  const SizedBox(height: 8),
                  Row(
                    children: [
                      DropdownButton<String>(
                        value: status,
                        items: const [
                          DropdownMenuItem(
                              value: "Pending",
                              child: Text("Pending")),
                          DropdownMenuItem(
                              value: "Accepted",
                              child: Text("Accepted")),
                          DropdownMenuItem(
                              value: "Delivering",
                              child: Text("Delivering")),
                          DropdownMenuItem(
                              value: "Done", child: Text("Done")),
                          DropdownMenuItem(
                              value: "Rejected",
                              child: Text("Rejected")),
                        ],
                        onChanged: (newStatus) {
                          if (newStatus == null) return;
                          ref
                              .read(ordersProvider.notifier)
                              .updateStatus(orderId, newStatus);
                        },
                      ),
                      const Spacer(),
                      TextButton.icon(
                        icon: const Icon(Icons.chat_outlined),
                        label: const Text("Contact buyer"),
                        onPressed: () {
                          ref
                              .read(selectedChatBuyerProvider.notifier)
                              .state = buyerId;
                          ref
                              .read(supplierTabProvider.notifier)
                              .changeTab(3);
                        },
                      ),
                    ],
                  )
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class SupplierLinkRequestsView extends ConsumerWidget {
  final int supplierCompanyId;
  const SupplierLinkRequestsView({super.key, required this.supplierCompanyId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final requests = ref.watch(linkRequestsProvider);

    final pending = requests
        .where((r) =>
    r['supplierCompanyId'] == supplierCompanyId &&
        r['status'] == LinkStatus.pending)
        .toList();

    final approved = requests
        .where((r) =>
    r['supplierCompanyId'] == supplierCompanyId &&
        r['status'] == LinkStatus.approved)
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text("Link Requests",
            style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          const Text("Pending",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),

          if (pending.isEmpty)
            const Text("No pending requests"),

          ...pending.map((r) {
            final id = r['id'] as int;
            final name = r['consumerName'] as String;
            final consumerId = r['consumerId'];

            return Card(
              child: ListTile(
                title: Text(name),
                subtitle: Text("Consumer #$consumerId"),
                trailing: Wrap(
                  spacing: 6,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.red),
                      onPressed: () =>
                          ref.read(linkRequestsProvider.notifier).reject(id),
                    ),
                    IconButton(
                      icon: const Icon(Icons.check, color: Colors.green),
                      onPressed: () =>
                          ref.read(linkRequestsProvider.notifier).approve(id),
                    ),
                  ],
                ),
              ),
            );
          }),

          const SizedBox(height: 16),
          const Text("Approved",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),

          if (approved.isEmpty)
            const Text("No approved consumers yet"),

          ...approved.map((r) {
            final name = r['consumerName'] as String;
            final consumerId = r['consumerId'];

            return Card(
              child: ListTile(
                title: Text(name),
                subtitle: Text("Consumer #$consumerId"),
                trailing: TextButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Block (stub)")),
                    );
                  },
                  child: const Text("Block"),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
