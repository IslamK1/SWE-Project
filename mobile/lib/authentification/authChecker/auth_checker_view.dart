import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:scp_mobile/authentification/login/login_view.dart';
import 'package:scp_mobile/home/SupplierScreen/SupplierScreen.dart';
import 'package:scp_mobile/home/mainScreen/mainScreen_view.dart';
import 'auth_view_model.dart';


class AuthCheckerView extends ConsumerWidget {
  const AuthCheckerView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLoggedIn = ref.watch(authProvider);
    if (isLoggedIn == 1) return const SupplierScreen();
    else if (isLoggedIn == 2) return const MainScreen();
    else return const LoginView();
  }
}
