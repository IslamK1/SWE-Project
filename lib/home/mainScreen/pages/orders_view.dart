import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'providers.dart';
import 'package:scp_mobile/home/mainScreen/mainScreen_viewModel.dart';
import 'package:scp_mobile/authentification/authChecker/auth_view_model.dart';


class ConsumerOrdersView extends ConsumerWidget {
  const ConsumerOrdersView({super.key});

  String _formatDate(DateTime d) {
    final dd = d.day.toString().padLeft(2, '0');
    final mm = d.month.toString().padLeft(2, '0');
    final yy = d.year.toString();
    return "$dd.$mm.$yy";
  }

  Color _statusColor(String status) {
    switch (status) {
      case "Pending":
        return Colors.orange;
      case "Accepted":
        return Colors.blue;
      case "Delivering":
        return Colors.purple;
      case "Done":
        return Colors.green;
      case "Rejected":
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(consumerOrdersProvider);
    final companies = ref.watch(consumerCompaniesProvider).value ?? [];

    final companyNames = <int, String>{
      for (final c in companies) c['id'] as int: c['name'] as String
    };

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Orders',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
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
      body: orders.isEmpty
          ? const Center(child: Text('There are no orders yet'))
          : ListView.separated(
        padding: const EdgeInsets.all(12),
        itemCount: orders.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final o = orders[index];

          final companyId = o['companyId'] as int;
          final items = (o['items'] as List)
              .map((e) => Map<String, dynamic>.from(e))
              .toList();
          final total = (o['total'] as num).toDouble();
          final status = (o['status'] as String?) ?? "Pending";
          final createdAt = o['createdAt'] as DateTime;

          final companyName =
              companyNames[companyId] ?? 'Company #$companyId';

          final itemsPreview = items
              .map((i) => '${i['name']} x${i['quantity'] ?? 1}')
              .join(', ');

          return Container(
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.grey.shade300),
            ),
            padding: const EdgeInsets.all(12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // LEFT SIDE = texts
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        companyName,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        itemsPreview,
                        style: const TextStyle(color: Colors.black54),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 8),

                      // Date + Status row
                      Column(
                        children: [
                          Text(
                            _formatDate(createdAt),
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: _statusColor(status)
                                  .withOpacity(0.12),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              status,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: _statusColor(status),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(width: 8),

                // RIGHT SIDE = total + chat button
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '₸${total.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      height: 30,
                      child: TextButton(
                        style: TextButton.styleFrom(
                          padding:
                          const EdgeInsets.symmetric(horizontal: 8),
                          minimumSize: Size.zero,
                          tapTargetSize:
                          MaterialTapTargetSize.shrinkWrap,
                        ),
                        onPressed: () {
                          ref
                              .read(selectedChatCompanyProvider.notifier)
                              .state = companyId;
                          ref
                              .read(consumerTabProvider.notifier)
                              .changeTab(3);
                        },
                        child: const Text("Chat with Supplier"),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
