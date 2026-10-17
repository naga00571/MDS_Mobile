import {API_BASE_URL} from './apiConfig';

export interface CreateUserRequest {
  mobile_number: string;
  first_name: string;
  last_name?: string | null;
  address?: string | null;
  address2?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  user_role: string;
  community_id: number;
}


export interface CreateUserResponse {
  user_id: number;
  mobile_number: string;
  first_name: string;
  last_name?: string | null;
  user_role: string;
  initial_passcode: string;
}

// in response to SELECT * FROM sp_fn_get_users();
// api/users/list
export interface GetUsersResponse {
  user_id: number;
  mobile_number: string;
  first_name: string;
  last_name?: string | null;
  passcode: string;
  user_role: string;
  community_id?: number | null;
  community_name?: string | null;
  is_active: boolean;
}

export interface LoginWithPasscodeRequest {
  mobile_number: string;
  passcode: string;
}

export interface LoginWithPasscodeResponse {
  user_id: number;
  mobile_number: string;
  first_name: string;
  last_name?: string | null;
  user_role: string;
  community_id: number | null;
  access_token: string;
  refresh_token: string;
}

// createUserWithPassCode : START 
export const createUserWithPassCode = async (
  request: CreateUserRequest,
): Promise<CreateUserResponse> => {

  const response = await fetch(
    `${API_BASE_URL}/api/users/create-with-passcode`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    let errorMessage = 'Failed to create user.';

    try {
        const errorData = await response.json();

        if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
        }
    } catch {
        // Keep the default error message
        }
    throw new Error(errorMessage);
  }

  const data: CreateUserResponse = await response.json();

  return data;
};
// createUserWithPassCode : END 


// get all users list : start
export const getUsers = async (): Promise<GetUsersResponse[]> => {

  const response = await fetch(
    `${API_BASE_URL}/api/users/list`,
    {
      method: 'GET',

      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    let errorMessage = 'Failed to get users.';

    try {
      const errorData = await response.json();

      if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      }
    } catch {
      // Keep the default error message
    }

    throw new Error(errorMessage);
  }

  const data: GetUsersResponse[] = await response.json();

  return data;
};
// get all users list : end


// START : of Login-with-passcode
export const loginWithPasscode = async (
  request: LoginWithPasscodeRequest,
): Promise<LoginWithPasscodeResponse> => {

  const response = await fetch(
    `${API_BASE_URL}/api/users/login_with_passcode`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    let errorMessage = 'Login failed.';

    try {
      const errorData = await response.json();

      if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(errorMessage);
  }

  const data: LoginWithPasscodeResponse =
    await response.json();

  return data;
};
// end of Login-with-passcode