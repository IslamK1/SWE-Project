import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'providers.dart';
import 'package:scp_mobile/authentification/authChecker/auth_view_model.dart';


class SupplierChatView extends ConsumerStatefulWidget {
  const SupplierChatView({super.key});

  @override
  ConsumerState<SupplierChatView> createState() => _SupplierChatViewState();
}

class _SupplierChatViewState extends ConsumerState<SupplierChatView> {
  final _textCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();

  @override
  void dispose() {
    _textCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _send(int buyerId) {
    final text = _textCtrl.text.trim();
    if (text.isEmpty) return;

    ref.read(chatThreadsProvider.notifier).sendSupplierMessage(
      buyerId: buyerId,
      text: text,
    );

    _textCtrl.clear();

    Future.delayed(const Duration(milliseconds: 80), () {
      if (!_scrollCtrl.hasClients) return;
      _scrollCtrl.animateTo(
        _scrollCtrl.position.maxScrollExtent,
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final buyerId = ref.watch(selectedChatBuyerProvider);
    final messages = ref.watch(currentChatProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          buyerId == null ? "Chat" : "Chat • Buyer #$buyerId",
          style: const TextStyle(fontWeight: FontWeight.bold),
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
      body: buyerId == null
          ? const Center(
        child: Text(
          "Open an order and tap\n“Contact buyer” to chat.",
          textAlign: TextAlign.center,
        ),
      )
          : Column(
        children: [
          Expanded(
            child: messages.isEmpty
                ? const Center(
              child: Text(
                "No messages yet.\nStart the conversation!",
                textAlign: TextAlign.center,
              ),
            )
                : ListView.builder(
              controller: _scrollCtrl,
              padding: const EdgeInsets.symmetric(
                  horizontal: 12, vertical: 8),
              itemCount: messages.length,
              itemBuilder: (context, index) {
                final m = messages[index];
                final isSupplier = m['from'] == 'supplier';
                final text = m['text'] as String;

                return Align(
                  alignment: isSupplier
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  child: Container(
                    margin:
                    const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 8),
                    constraints: BoxConstraints(
                      maxWidth:
                      MediaQuery.of(context).size.width * 0.7,
                    ),
                    decoration: BoxDecoration(
                      color: isSupplier
                          ? Colors.blue
                          : Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      text,
                      style: TextStyle(
                        color: isSupplier
                            ? Colors.white
                            : Colors.black87,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding:
            const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textCtrl,
                    minLines: 1,
                    maxLines: 4,
                    decoration: const InputDecoration(
                      hintText: "Type a message...",
                      border: OutlineInputBorder(),
                      isDense: true,
                    ),
                    onSubmitted: (_) => _send(buyerId),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: () => _send(buyerId),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
