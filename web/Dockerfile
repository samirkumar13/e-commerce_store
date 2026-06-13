# --- Build stage: produce the static production bundle ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# API base URL is baked in at build time (CRA inlines REACT_APP_* vars).
ARG REACT_APP_API_URL=http://localhost:5000/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
# Don't let CRA treat lint warnings as build-breaking errors.
ENV CI=false
RUN npm run build

# --- Runtime stage: serve the bundle with nginx ---
FROM nginx:alpine AS runtime
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
