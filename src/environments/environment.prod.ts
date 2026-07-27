// Em produção o nginx do container proxeia /api para o backend (ver
// docker/default.conf.template) — mesma estratégia same-origin do desenvolvimento.
export const environment = {
  production: true,
  apiBaseUrl: '',
};
