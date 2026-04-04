/** Saída para consola apenas em desenvolvimento (produção fica limpa). */
export function devLog(...args) {
    if (process.env.NODE_ENV === 'development') {
        console.log(...args);
    }
}

export function devError(...args) {
    if (process.env.NODE_ENV === 'development') {
        console.error(...args);
    }
}
