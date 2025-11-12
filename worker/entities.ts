import { IndexedEntity } from "./core-utils";
import type { User, Batik, PengrajinDetails } from "@shared/types";


interface Env {
  id?: string | number;

  [key: string]: unknown;
}export class UserEntity extends IndexedEntity<User> {static readonly entityName = "user";static readonly indexName = "users";static readonly initialState: User = { id: "", name: "", email: "", role: 'artisan', status: 'pending' };static keyOf(state: User): string {
    return state.email.toLowerCase();
  }
  static async findByEmail(env: Env, email: string): Promise<UserEntity | null> {
    const user = new UserEntity(env, email.toLowerCase());
    if (await user.exists()) {
      return user;
    }
    return null;
  }
}

export class PengrajinDetailsEntity extends IndexedEntity<PengrajinDetails> {
  static readonly entityName = "pengrajin_details";
  static readonly indexName = "pengrajin_details_idx";
  static readonly initialState: PengrajinDetails = { userId: "", storeName: "", address: "", phoneNumber: "", qualificationDocumentUrl: "" };
  static keyOf(state: PengrajinDetails): string {
    return state.userId;
  }
}

export class BatikEntity extends IndexedEntity<Batik> {
  static readonly entityName = "batik";
  static readonly indexName = "batiks";
  static readonly initialState: Batik = { id: "", name: "", motif: "", history: "", imageUrl: "", artisanId: "", artisanName: "" };
}