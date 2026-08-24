import api from "./api";

export const incidentService = {
  list: (params) => api.get("/incidents", { params }),
  get: (id) => api.get(`/incidents/${id}`),
  create: (payload) => api.post("/incidents", payload),
  update: (id, payload) => api.put(`/incidents/${id}`, payload),
  remove: (id) => api.delete(`/incidents/${id}`),
  listComments: (id) => api.get(`/incidents/${id}/comments`),
  addComment: (id, comment) => api.post(`/incidents/${id}/comments`, { comment }),
  listActivity: (id) => api.get(`/incidents/${id}/activity`),
};

export const dashboardService = {
  get: () => api.get("/dashboard"),
};

export const userService = {
  list: () => api.get("/users"),
  get: (id) => api.get(`/users/${id}`),
};
