import * as supabaseStore from "../../lib/api/store-supabase";
import { store as localStoreInstance, predictBurnout, parseVoiceInput, generateStudyPlan, recoveryPlan } from "../../lib/api/store";

export * from "../../lib/api/store-supabase";
export { predictBurnout, parseVoiceInput, generateStudyPlan, recoveryPlan };

export const store = {
  ...localStoreInstance,
  register: supabaseStore.register,
  login: supabaseStore.login,
  logout: supabaseStore.logout,
};
