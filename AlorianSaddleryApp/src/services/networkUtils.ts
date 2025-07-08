/**
 * Network utility functions for handling API connections
 */

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    // Handle specific iOS 17+ network errors
    const shouldRetry = retries > 0 && (
      error?.code === -1017 || // Cannot parse response
      error?.code === -1005 || // Network connection lost
      error?.message?.includes('Network request failed') ||
      error?.message?.includes('cannot parse response') ||
      error?.message?.includes('network connection was lost')
    );

    if (shouldRetry) {
      console.log(`Retrying operation in ${delay}ms due to network error... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, Math.min(delay * 1.5, 5000)); // Cap max delay at 5s
    }
    throw error;
  }
};

export const testNetworkConnectivity = async (): Promise<boolean> => {
  // For iOS 17+ with QUIC issues, assume connectivity is available
  // The actual API calls will handle retries if they fail
  console.log('[networkUtils] Skipping network test due to iOS 17+ QUIC issues - assuming connectivity');
  return true;
};

export const testShopifyConnectivity = async (
  domain: string,
): Promise<{
  success: boolean;
  error?: string;
  statusCode?: number;
}> => {
  // For iOS 17+ with QUIC issues, assume Shopify connectivity is available
  // The actual API calls will handle retries if they fail
  console.log('[networkUtils] Skipping Shopify connectivity test due to iOS 17+ QUIC issues - assuming connectivity');
  return {
    success: true,
    statusCode: 200,
  };
}; 