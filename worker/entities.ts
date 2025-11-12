/**
 * Entities for the Warisan Digital application.
 */
import { IndexedEntity } from "./core-utils";
import type { User } from "@shared/types";
// USER ENTITY: one DO instance per user
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "", email: "", role: 'artisan', status: 'pending' };
  // Seed data can be added here if needed for initial setup
  // static seedData: User[] = [
  //   { id: 'admin1', name: 'Admin Utama', email: 'admin@warisan.digital', role: 'admin', status: 'verified' },
  // ];
}