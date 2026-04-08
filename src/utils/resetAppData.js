import AsyncStorage from "@react-native-async-storage/async-storage";

export async function resetAppData() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log("ASYNC STORAGE KEYS BEFORE RESET:", keys);

    await AsyncStorage.clear();

    const afterKeys = await AsyncStorage.getAllKeys();
    console.log("ASYNC STORAGE KEYS AFTER RESET:", afterKeys);

    return true;
  } catch (err) {
    console.error("FAILED TO RESET STORAGE:", err);
    return false;
  }
}
