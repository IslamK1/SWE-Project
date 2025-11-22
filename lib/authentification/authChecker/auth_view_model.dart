import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'dart:convert';
import 'package:http/http.dart' as http;
// for test
class AuthViewModel extends StateNotifier<int> {
  AuthViewModel() : super(1);

  void loginAsSupplier() => state = 1;

  void loginAsUser() => state = 2;

  void logout() => state = 0;
}

final authProvider = StateNotifierProvider<AuthViewModel, int>(
      (ref) => AuthViewModel(),
);


// auth

//
// class AuthService {
//   AuthService({required this.baseUrl});
//
//   final String baseUrl;
//
//   String? _token; // MVP: keep in memory
//
//   String? get token => _token;
//
//   Future<String> login({
//     required String email,
//     required String password,
//   }) async {
//     final uri = Uri.parse('$baseUrl/auth/login/');
//     final res = await http.post(
//       uri,
//       headers: {'Content-Type': 'application/json'},
//       body: jsonEncode({'email': email, 'password': password}),
//     );
//
//     if (res.statusCode != 200) {
//       throw Exception('Login failed: ${res.body}');
//     }
//
//     final data = jsonDecode(res.body) as Map<String, dynamic>;
//     final accessToken = data['access_token'] as String;
//     _token = accessToken;
//     return accessToken;
//   }
//
//   Future<Map<String, dynamic>> me() async {
//     final uri = Uri.parse('$baseUrl/auth/me/');
//     final res = await http.get(
//       uri,
//       headers: {
//         'Content-Type': 'application/json',
//         if (_token != null) 'Authorization': 'Bearer $_token',
//       },
//     );
//
//     if (res.statusCode != 200) {
//       throw Exception('Me failed: ${res.body}');
//     }
//
//     return jsonDecode(res.body) as Map<String, dynamic>;
//   }
//
//   Future<void> logout() async {
//     final uri = Uri.parse('$baseUrl/auth/logout/');
//     await http.post(
//       uri,
//       headers: {
//         'Content-Type': 'application/json',
//         if (_token != null) 'Authorization': 'Bearer $_token',
//       },
//     );
//
//     _token = null;
//   }
//
//   Future<void> registerConsumer({
//     required String email,
//     required String password,
//     required String firstName,
//     String? lastName,
//   }) async {
//     final uri = Uri.parse('$baseUrl/auth/register/');
//     final body = {
//       "email": email,
//       "password": password,
//       "first_name": firstName,
//       "last_name": lastName,
//       "is_consumer": true,
//       "is_supplier_owner": false,
//     };
//
//     final res = await http.post(
//       uri,
//       headers: {'Content-Type': 'application/json'},
//       body: jsonEncode(body),
//     );
//
//     if (res.statusCode != 200 && res.statusCode != 201) {
//       throw Exception('Register failed: ${res.body}');
//     }
//   }
//
//   Future<void> registerSupplierOwner({
//     required String email,
//     required String password,
//     required String firstName,
//     String? lastName,
//   }) async {
//     final uri = Uri.parse('$baseUrl/auth/register/');
//     final body = {
//       "email": email,
//       "password": password,
//       "first_name": firstName,
//       "last_name": lastName,
//       "is_consumer": false,
//       "is_supplier_owner": true,
//     };
//
//     final res = await http.post(
//       uri,
//       headers: {'Content-Type': 'application/json'},
//       body: jsonEncode(body),
//     );
//
//     if (res.statusCode != 200 && res.statusCode != 201) {
//       throw Exception('Register supplier failed: ${res.body}');
//     }
//   }
// }
//
// final authServiceProvider = Provider<AuthService>((ref) {
//   return AuthService(baseUrl: "http://10.0.2.2:8000"); // change if needed
// });
//
//
// class AuthViewModel extends StateNotifier<int> {
//   AuthViewModel(this._service) : super(0);
//
//   final AuthService _service;
//
//   Future<void> login({
//     required String email,
//     required String password,
//   }) async {
//     await _service.login(email: email, password: password);
//
//     final me = await _service.me();
//
//     final isConsumer = me['is_consumer'] == true;
//     final isOwner = me['is_supplier_owner'] == true;
//     final isManager = me['is_supplier_manager'] == true;
//     final isSales = me['is_supplier_repr'] == true;
//
//     if (isConsumer) {
//       state = 2;
//     } else if (isOwner || isManager || isSales) {
//       state = 1;
//     } else {
//       state = 0;
//     }
//   }
//
//   Future<void> logout() async {
//     await _service.logout();
//     state = 0;
//   }
// }
//
// final authProvider = StateNotifierProvider<AuthViewModel, int>(
//       (ref) => AuthViewModel(ref.read(authServiceProvider)),
// );
//
