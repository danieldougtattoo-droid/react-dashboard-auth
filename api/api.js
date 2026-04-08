import { devLog } from '../utils/devLog';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

function normalizeToken(raw) {
    if (raw == null || typeof raw !== 'string') return null;
    let t = raw.trim().replace(/^["']|["']$/g, '');
    if (!t) return null;
    t = t.replace(/^Bearer\s+/i, '').trim();
    return t || null;
}

function jwtIsExpired(accessToken) {
    if (!accessToken || typeof accessToken !== 'string') return false;
    const parts = accessToken.split('.');
    if (parts.length !== 3) return false;
    try {
        let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const pad = b64.length % 4;
        if (pad) b64 += '='.repeat(4 - pad);
        const payload = JSON.parse(atob(b64));
        if (typeof payload.exp !== 'number') return false;
        return Date.now() / 1000 >= payload.exp - 30;
    } catch {
        return false;
    }
}

function getAccessToken() {
    return normalizeToken(localStorage.getItem('access_token'));
}

function setSession(data) {
    if (!data?.access_token) return false;
    const at = normalizeToken(String(data.access_token)) ?? String(data.access_token).trim();
    if (!at) return false;
    localStorage.setItem('access_token', at);

    if (data.refresh_token) {
        localStorage.setItem('refresh_token', String(data.refresh_token).trim());
    }
    return true;
}

function clearSession() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

export async function login(email, password) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            username: email,
            password: password,
        }),
    });

    const data = await response.json().catch(() => ({}));
    return {
        ok: response.ok,
        data,
    };
}

export async function register(email, password) {
    const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password }),
    });
};
        const data = await response.json().catch(() => ({}));
    return {
        ok: response.ok,
        data,
    };

export async function createUser(userCreate) {
    const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userCreate),
    });
    const data = await response.json().catch(() => ({}));
    return {
        ok: response.ok,
        data,
        status: response.status,
    };
}

let refreshPromise = null;

export async function refreshAccessToken() {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        const refresh = localStorage.getItem('refresh_token')?.trim() ?? '';
        if (!refresh) {
            return null;
        }

        const response = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refresh }),
        });

        if (!response.ok) {
            clearSession();
            return null;
        }

        const data = await response.json().catch(() => ({}));
        if (!data?.access_token) {
            clearSession();
            return null;
        }

        setSession(data);
        return normalizeToken(String(data.access_token)) ?? data.access_token;
    })().finally(() => {
        refreshPromise = null;
    });

    return refreshPromise;
}

export async function fetchWithAuth(url, options = {}, retry = false) {
    let token = getAccessToken();

    if (token && !retry && jwtIsExpired(token)) {
        devLog('[auth] JWT expirado no cliente — refresh antes do pedido');
        await refreshAccessToken();
        token = getAccessToken();
    }

    const merged = { ...(options.headers || {}) };
    const headers = {
        Accept: 'application/json',
        ...merged,
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401 && !retry) {
        devLog('401 detectado tentando refresh');
        const newToken = await refreshAccessToken();
        if (newToken) {
            devLog('[auth] Refresh OK — repetindo pedido');
            return fetchWithAuth(url, options, true);
        }
        devLog('[auth] Refresh falhou ou sem refresh_token');
    }

    return response;
}

async function authenticatedGet(url) {
    return fetchWithAuth(url, { method: 'GET' });
}

export async function getMe() {
    const res = await authenticatedGet(`${BASE_URL}/auth/me`);
    if (!res.ok) {
        return null;
    }
    return res.json();
}

export function hasStoredAccessToken() {
    return !!getAccessToken();
}

export { setSession, clearSession, setSession as saveAuthSession };
