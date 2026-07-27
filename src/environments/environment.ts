// Em desenvolvimento a base é vazia: o dev-server (ng serve) faz proxy de /api
// para http://localhost:8080 via proxy.conf.json, evitando bloqueio de CORS.
export const environment = {
  production: false,
  apiBaseUrl: '',
};
