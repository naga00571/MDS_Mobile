import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = '@mds_access_token';
const REFRESH_TOKEN_KEY = '@mds_refresh_token';
const USER_ID_KEY = '@mds_user_id';
const USER_ROLE_KEY = '@mds_user_role';
const FIRST_NAME_KEY = '@mds_first_name';
const LAST_NAME_KEY = '@mds_last_name';
const COMMUNITY_ID_KEY = '@mds_community_id';

// --------------------------------------------------
// Save authentication information
// --------------------------------------------------

export const saveAuthData = async (
  accessToken: string,
  refreshToken: string,
  userId: number,
  userRole: string,
  communityId: number | null,
  firstName: string,
  lastName?: string | null,
) : Promise<void> => {

  await AsyncStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken,
  );

  await AsyncStorage.setItem(
    REFRESH_TOKEN_KEY,
    refreshToken,
  );

  await AsyncStorage.setItem(
    USER_ID_KEY,
    String(userId),
  );

  await AsyncStorage.setItem(
    USER_ROLE_KEY,
    userRole,
  );

  await AsyncStorage.setItem(
    FIRST_NAME_KEY,
    firstName,
  );

  await AsyncStorage.setItem(
    LAST_NAME_KEY,
    lastName ?? '',
  );

  await AsyncStorage.setItem(
    COMMUNITY_ID_KEY,
    communityId !== null && communityId !== undefined
      ? String(communityId)
      : '',
  );

};


// --------------------------------------------------
// Get access token
// --------------------------------------------------

export const getAccessToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
};

// --------------------------------------------------
// Check whether user is authenticated
// --------------------------------------------------
export const isAuthenticated = async (): Promise<boolean> => {
  const accessToken = await getAccessToken();

  console.log('MDS ACCESS TOKEN:', accessToken);
  
  return !!accessToken;
};


// --------------------------------------------------
// Get refresh token
// --------------------------------------------------

export const getRefreshToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
};


// --------------------------------------------------
// Get stored user ID
// --------------------------------------------------

export const getUserId = async (): Promise<number | null> => {
  const userId = await AsyncStorage.getItem(USER_ID_KEY);

  if (!userId) {
    return null;
  }

  return Number(userId);
};


// --------------------------------------------------
// Get stored user role
// --------------------------------------------------

export const getUserRole = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(USER_ROLE_KEY);
};

// --------------------------------------------------
// Get stored first name
// --------------------------------------------------
export const getUserFirstName = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(FIRST_NAME_KEY);
};


// --------------------------------------------------
// Get stored last name
// --------------------------------------------------
export const getUserLastName = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(LAST_NAME_KEY);
};

// --------------------------------------------------
// Get stored community Id
// --------------------------------------------------
export const getUserCommunityId = async (): Promise<number | null> => {
  const communityId = await AsyncStorage.getItem(COMMUNITY_ID_KEY);

  if (!communityId) {
    return null;
  }

  return Number(communityId);
};


// --------------------------------------------------
// Clear authentication information
// --------------------------------------------------
export const clearAuthData = async (): Promise<void> => {

  await AsyncStorage.removeItem(
    ACCESS_TOKEN_KEY,
  );

  await AsyncStorage.removeItem(
    REFRESH_TOKEN_KEY,
  );

  await AsyncStorage.removeItem(
    USER_ID_KEY,
  );

  await AsyncStorage.removeItem(
    USER_ROLE_KEY,
  );

  await AsyncStorage.removeItem(
    FIRST_NAME_KEY,
  );

  await AsyncStorage.removeItem(
    LAST_NAME_KEY,
  );

  await AsyncStorage.removeItem(
    COMMUNITY_ID_KEY,
  );

};