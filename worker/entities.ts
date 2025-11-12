import { IndexedEntity, type Env, Index } from "./core-utils";
import type { User, Batik, PengrajinDetails } from "@shared/types";
// A secondary index to map user UUIDs to user emails (the primary key for UserEntity)
class UserIdIndex extends Index<string> {
  static readonly entityName = "sys-index-root";
  constructor(env: Env) { super(env, 'user-id-to-email'); }
}
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users"; // This indexes by email
  static readonly initialState: User = { id: "", name: "", email: "", role: 'artisan', status: 'pending' };
  static override keyOf(state: User): string {
    return state.email.toLowerCase();
  }
  static async findByEmail(env: Env, email: string): Promise<UserEntity | null> {
    const user = new UserEntity(env, email.toLowerCase());
    if (await user.exists()) {
      return user;
    }
    return null;
  }
  static async findById(env: Env, userId: string): Promise<UserEntity | null> {
    const idx = new UserIdIndex(env);
    const email = (await idx.page(userId, 1)).items[0];
    if (!email) return null;
    return this.findByEmail(env, email);
  }
  static override async create<TCtor extends typeof UserEntity>(this: TCtor, env: Env, state: User): Promise<User> {
    const createdState = await super.create(env, state);
    const idx = new UserIdIndex(env);
    // Store the mapping: `userId` -> `email`
    await idx.add(`${state.id}:${state.email.toLowerCase()}`);
    return createdState;
  }
}
export class PengrajinDetailsEntity extends IndexedEntity<PengrajinDetails> {
  static readonly entityName = "pengrajin_details";
  static readonly indexName = "pengrajin_details_idx";
  static readonly initialState: PengrajinDetails = { id: "", userId: "", storeName: "", address: "", phoneNumber: "", qualificationDocumentUrl: "" };
  static override keyOf(state: PengrajinDetails): string {
    return state.userId;
  }
}
export class BatikEntity extends IndexedEntity<Batik> {
  static readonly entityName = "batik";
  static readonly indexName = "batiks";
  static readonly initialState: Batik = { id: "", name: "", motif: "", history: "", imageUrl: "", artisanId: "", artisanName: "" };
}