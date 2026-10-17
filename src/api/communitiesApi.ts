import {API_BASE_URL} from './apiConfig';

export interface ActiveCommunity {
  id: number;
  community_name: string;
  address?: string | null;
  is_active: boolean;
  is_deleted: boolean;
}

export const getActiveCommunities = async (): Promise<ActiveCommunity[]> => {
  const response = await fetch(
    `${API_BASE_URL}/api/community/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    let errorMessage = 'Failed to get active communities.';

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

  const data: ActiveCommunity[] = await response.json();
  return data;
};
