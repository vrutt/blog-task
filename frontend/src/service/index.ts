"use client";

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HttpStatusCode,
  InternalAxiosRequestConfig,
} from 'axios';

import { message } from 'antd';

import Cookies from 'js-cookie';


const BASE_URL = "http://localhost:3001";

export interface QueryParams {
  [key: string]: string | number | boolean;
}

const axiosInstance: AxiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig<unknown>) => {
    const authToken = Cookies.get('auth_token');
    if (authToken) {
      config.headers.set('Authorization', `Bearer ${authToken}`);
    }

    if (!config.headers['Content-Type']) {
      config.headers.set('Content-Type', 'application/json');
    }

    return config;
  }
);

function getQueryString(params: QueryParams): string {
  const filteredParams = Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
    .reduce(
      (acc, [key, value]) => {
        acc[key] = value as string;
        return acc;
      },
      {} as Record<string, string>
    );

  const queryString = new URLSearchParams(filteredParams).toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Constructs a URL for an API endpoint by concatenating the base URL and the
 * relative path of the endpoint. If query parameters are provided, this
 * function adds them to the URL as a query string.
 *
 * @param {string} endPointUrl - The relative path of the API endpoint.
 * @param {QueryParams} [queryParams={}] - Query parameters to add to the URL.
 * @returns {string} The complete URL of the API endpoint.
 */
function getURL(endPointUrl: string, queryParams: QueryParams = {}): string {
  const queryString = getQueryString(queryParams);

  return `${BASE_URL}${endPointUrl}${queryString}`;
}

/**
 * Type definition for API call response.
 */
interface APIResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

/**
 * Makes an API call with the given method and payload to the specified URL.
 * This function returns a promise that resolves to an object with `data`,
 * `status`, and `statusText` properties. If the API call fails, this function
 * throws an error.
 *
 * @param {string} url - The URL of the API endpoint.
 * @param {Record<string, any>} [payload={}] - The payload to send with the
 *   request. This is ignored if the method is 'GET'.
 * @param {'GET'|'POST'|'PUT'|'DELETE'|'PATCH'} [method='GET'] - The HTTP
 *   method to use.
 * @param {Record<string, string>} [customHeaders={}] - Additional headers to
 *   include in the request.
 * @returns {Promise<APIResponse<T>>}
 */
async function callAPI<T>(
  url: string,
  // Allow the payload having any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any> = {},
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  customHeaders: Record<string, string> = {}
): Promise<APIResponse<T>> {
  try {
    const config: AxiosRequestConfig = {
      method,
      url,
      data: method === 'GET' ? null : payload,
      headers: customHeaders,
    };

    const response: AxiosResponse<T> = await axiosInstance(config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  // Allow the error having any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('API call failed:', error.response || error.message);
    handleAPIErrorMessage(error);
    throw error;
  }
}

// Allow the error having any type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleAPIErrorMessage(error: any) {
  let errorMessage = 'An unexpected error occurred.'; // Default message

  console.log(error, 'error from the interceptor');

  if (error.response) {
    if (error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    } else if (error.response.status === HttpStatusCode.InternalServerError) {
      errorMessage = 'Internal server error. Please try again later.';
    } else if (error.response.status === HttpStatusCode.BadRequest) {
      errorMessage = 'Bad request. Please check the input and try again.';
    } else if (error.response.status === HttpStatusCode.UnAuthorized) {
      errorMessage = 'Bad request. Please check the input and try again.';
    } else {
      errorMessage = `Error: ${error.response.status}`;
    }
  } else if (error.request) {
    errorMessage = 'No response received from the server. Please try again.';
  } else {
    errorMessage = `Error: ${error.message}`;
  }

  if (Array.isArray(errorMessage)) {
    errorMessage.forEach((errorMessage: string) =>
    message(errorMessage, 5000)
    );
  } else if (typeof errorMessage === 'string') {
    message(errorMessage, 5000);
  }
}

export { handleAPIErrorMessage };

export { getQueryString, getURL, callAPI, axiosInstance };
