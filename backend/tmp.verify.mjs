// Temporary: verifies the import graph loads and every new route is mounted.
process.env.JWT_SECRET = 'test';
const app = (await import('./src/app.js')).default;

const routes = [];
const walk = (stack, prefix = '') => {
    for (const layer of stack) {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase());
            routes.push(`${methods.join(',')} ${prefix}${layer.route.path}`);
        } else if (layer.name === 'router' && layer.handle?.stack) {
            const src = layer.regexp?.source ?? '';
            const base = src
                .replace('^\\/', '/')
                .replace('(?=\\/|$)', '')
                .replace(/\\\//g, '/')
                .replace(/\$$/, '');
            walk(layer.handle.stack, prefix + base);
        }
    }
};
walk(app.router.stack);
console.log(routes.join('\n'));
