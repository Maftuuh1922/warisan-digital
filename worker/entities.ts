import { IndexedEntity, type Env } from "./core-utils";
import type { User, Batik, PengrajinDetails } from "@shared/types";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users"; // This indexes by id
  static readonly initialState: User = { id: "", name: "", email: "", role: 'artisan', status: 'pending' };
  static override keyOf(state: User): string {
    return state.id;
  }
  static async findByEmail(env: Env, email: string): Promise<UserEntity | null> {
    const { items } = await this.list(env);
    const userState = items.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!userState) return null;
    return new this(env, userState.id);
  }
  static async findById(env: Env, userId: string): Promise<UserEntity | null> {
    const user = new this(env, userId);
    if (await user.exists()) {
      return user;
    }
    return null;
  }
}
export class PengrajinDetailsEntity extends IndexedEntity<PengrajinDetails> {
  static readonly entityName = "pengrajin_details";
  static readonly indexName = "pengrajin_details_idx";
  static readonly initialState: PengrajinDetails = { id: "", userId: "", storeName: "", address: "", phoneNumber: "", qualificationDocumentUrl: "" };
  static override keyOf(state: PengrajinDetails): string {
    return state.id;
  }
  static async findByUserId(env: Env, userId: string): Promise<PengrajinDetailsEntity | null> {
    const { items } = await this.list(env);
    const detailsState = items.find(d => d.userId === userId);
    if (!detailsState) return null;
    return new this(env, detailsState.id);
  }
  static async findById(env: Env, id: string): Promise<PengrajinDetailsEntity | null> {
    const details = new this(env, id);
    if (await details.exists()) {
      return details;
    }
    return null;
  }
}
export class BatikEntity extends IndexedEntity<Batik> {
  static readonly entityName = "batik";
  static readonly indexName = "batiks";
  static readonly initialState: Batik = { id: "", name: "", motif: "", history: "", imageUrl: "", artisanId: "", artisanName: "" };
  static override keyOf(state: Batik): string {
    return state.id;
  }
  static async findById(env: Env, id: string): Promise<BatikEntity | null> {
    const batik = new this(env, id);
    if (await batik.exists()) {
      return batik;
    }
    return null;
  }
}