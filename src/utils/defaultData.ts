import { AppStateData, ApiCollection, ApiRequest, Environment } from '../types';

export const initialCollections: ApiCollection[] = [
  {
    id: 'col-json-placeholder',
    name: 'JSONPlaceholder API',
    description: 'Sample REST API collection for testing posts and resources',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'col-httpbin',
    name: 'HTTPBin Echo & Auth',
    description: 'HTTP request & response service for inspecting headers, auth and payloads',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const initialRequests: ApiRequest[] = [
  {
    id: 'req-get-posts',
    name: 'Get All Posts',
    method: 'GET',
    url: '{{baseUrl}}/posts',
    params: [
      { id: 'p1', key: '_limit', value: '5', enabled: true, description: 'Limit returned items' },
    ],
    headers: [
      { id: 'h1', key: 'Accept', value: 'application/json', enabled: true },
    ],
    auth: {
      type: 'none',
      bearer: { token: '' },
      basic: { username: '', password: '' },
      apikey: { key: '', value: '', addTo: 'header' },
    },
    body: {
      type: 'none',
      raw: '',
      formData: [],
    },
    collectionId: 'col-json-placeholder',
    updatedAt: Date.now(),
  },
  {
    id: 'req-create-post',
    name: 'Create New Post',
    method: 'POST',
    url: '{{baseUrl}}/posts',
    params: [],
    headers: [
      { id: 'h-ct', key: 'Content-Type', value: 'application/json; charset=UTF-8', enabled: true },
    ],
    auth: {
      type: 'none',
      bearer: { token: '' },
      basic: { username: '', password: '' },
      apikey: { key: '', value: '', addTo: 'header' },
    },
    body: {
      type: 'json',
      raw: '{\n  "title": "Built with ForanAPI",\n  "body": "Fast and lightweight Bruno-inspired API client.",\n  "userId": 1\n}',
      formData: [],
    },
    collectionId: 'col-json-placeholder',
    updatedAt: Date.now(),
  },
  {
    id: 'req-get-single',
    name: 'Get Single Post #1',
    method: 'GET',
    url: '{{baseUrl}}/posts/1',
    params: [],
    headers: [],
    auth: {
      type: 'none',
      bearer: { token: '' },
      basic: { username: '', password: '' },
      apikey: { key: '', value: '', addTo: 'header' },
    },
    body: {
      type: 'none',
      raw: '',
      formData: [],
    },
    collectionId: 'col-json-placeholder',
    updatedAt: Date.now(),
  },
  {
    id: 'req-httpbin-headers',
    name: 'Inspect Request Headers',
    method: 'GET',
    url: 'https://httpbin.org/headers',
    params: [],
    headers: [
      { id: 'h2', key: 'X-Client', value: 'ForanAPI-Desktop', enabled: true },
      { id: 'h3', key: 'X-Environment', value: 'Development', enabled: true },
    ],
    auth: {
      type: 'none',
      bearer: { token: '' },
      basic: { username: '', password: '' },
      apikey: { key: '', value: '', addTo: 'header' },
    },
    body: {
      type: 'none',
      raw: '',
      formData: [],
    },
    collectionId: 'col-httpbin',
    updatedAt: Date.now(),
  },
  {
    id: 'req-httpbin-bearer',
    name: 'Test Bearer Authentication',
    method: 'GET',
    url: 'https://httpbin.org/bearer',
    params: [],
    headers: [],
    auth: {
      type: 'bearer',
      bearer: { token: '{{bearerToken}}' },
      basic: { username: '', password: '' },
      apikey: { key: '', value: '', addTo: 'header' },
    },
    body: {
      type: 'none',
      raw: '',
      formData: [],
    },
    collectionId: 'col-httpbin',
    updatedAt: Date.now(),
  },
];

export const initialEnvironments: Environment[] = [
  {
    id: 'env-dev',
    name: 'Development',
    variables: [
      { id: 'v1', key: 'baseUrl', value: 'https://jsonplaceholder.typicode.com', enabled: true },
      { id: 'v2', key: 'bearerToken', value: 'foran_dev_secret_token_123', enabled: true, secret: true },
      { id: 'v3', key: 'apiKey', value: 'dev-api-key-999', enabled: true },
    ],
  },
  {
    id: 'env-prod',
    name: 'Production',
    variables: [
      { id: 'v4', key: 'baseUrl', value: 'https://jsonplaceholder.typicode.com', enabled: true },
      { id: 'v5', key: 'bearerToken', value: 'prod_token_secure_456', enabled: true, secret: true },
      { id: 'v6', key: 'apiKey', value: 'prod-live-key-xyz', enabled: true },
    ],
  },
];

export const defaultInitialState: AppStateData = {
  collections: initialCollections,
  folders: [],
  requests: initialRequests,
  environments: initialEnvironments,
  activeEnvironmentId: 'env-dev',
  theme: 'dark',
};

export function createNewBlankRequest(collectionId: string = 'col-json-placeholder', folderId?: string | null): ApiRequest {
  return {
    id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: 'Untitled Request',
    method: 'GET',
    url: '',
    params: [],
    headers: [],
    auth: {
      type: 'none',
      bearer: { token: '' },
      basic: { username: '', password: '' },
      apikey: { key: '', value: '', addTo: 'header' },
    },
    body: {
      type: 'none',
      raw: '',
      formData: [],
    },
    collectionId,
    folderId: folderId || null,
    updatedAt: Date.now(),
  };
}

export const defaultGuestProfile = {
  id: 'guest',
  name: 'Guest User',
  isGuest: true,
  avatarColor: '#64748b',
  createdAt: Date.now(),
};

export function createFreshEmptyState(): AppStateData {
  const colId = `col-${Date.now()}`;
  return {
    collections: [
      {
        id: colId,
        name: 'My APIs',
        description: 'New clean workspace collection',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    folders: [],
    requests: [],
    environments: [
      {
        id: `env-${Date.now()}`,
        name: 'Development',
        variables: [
          { id: `v-${Date.now()}`, key: 'baseUrl', value: 'https://', enabled: true },
        ],
      },
    ],
    activeEnvironmentId: null,
    theme: 'dark',
  };
}
