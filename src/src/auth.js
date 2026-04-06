export function isAuthenticated() {
    return !!localStorage.getItem('access_token');
}

export async function logout() {
    localStorage.clear();
    window.location.href = '/';
}