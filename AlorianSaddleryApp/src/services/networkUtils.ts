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
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying operation in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const testNetworkConnectivity = async (): Promise<boolean> => {
  try {
    // Use Google generate_204 endpoint first
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://clients3.google.com/generate_204', {
      method: 'GET',
      headers: {
        // Prevent caching and explicitly disable QUIC/HTTP-3 advertisement so URLSession stays on HTTP-2
        'Cache-Control': 'no-cache',
        'Alt-Svc': 'clear',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 204 ‑ No Content means online.
    if (response.status === 204) return true;

    // Some edge networks return 200/301 here – treat any <400 as success.
    if (response.status >= 200 && response.status < 400) return true;
  } catch (err: any) {
    // iOS 17+ sometimes throws NSURLErrorCannotParseResponse (-1017) when QUIC is blocked.
    // Treat that as a soft success because the socket resolved and we know we have connectivity.
    if (typeof err?.code === 'number' && err.code === -1017) {
      console.warn('[networkUtils] generate_204 probe hit ‑1017 parse error – assuming online');
      return true;
    }
    console.warn('[networkUtils] primary probe failed:', err?.message || err);
  }

  // Fallback: lightweight HEAD to example.com
  try {
    const res = await fetch('https://example.com', { method: 'HEAD' });
    return res.ok;
  } catch (fallbackErr) {
    console.error('[networkUtils] fallback probe failed:', fallbackErr);
    return false;
  }
};

export const testShopifyConnectivity = async (
  domain: string,
): Promise<{
  success: boolean;
  error?: string;
  statusCode?: number;
}> => {
  try {
    console.log('Testing Shopify domain connectivity:', domain);

    const testUrl = `https://${domain}/robots.txt`; // smaller, cache-friendly file
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('Shopify domain test result:', response.status, response.statusText);

    return {
      success: response.status >= 200 && response.status < 400,
      statusCode: response.status,
    };
  } catch (error) {
    console.error('Shopify connectivity test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}; 