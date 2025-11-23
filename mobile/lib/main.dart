import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:scp_mobile/scp_app.dart';

void main() {
  runApp(
    const ProviderScope(
      child: scpApp(),
    )
  );
}