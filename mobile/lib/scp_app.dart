import 'package:flutter/material.dart';
import 'package:scp_mobile/authentification/authChecker/auth_checker_view.dart';

class scpApp extends StatelessWidget {
  const scpApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'SCP App',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: AuthCheckerView(),
    );
  }
}