# syntax=docker/dockerfile:1
# --- Build stage: produce the static production bundle ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps

COPY . .

ARG REACT_APP_API_URL=http://localhost:5000/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV CI=false
ENV BROWSERSLIST_IGNORE_OLD_DATA=true
RUN npm run build

# --- Runtime stage: serve the bundle with nginx ---
FROM nginx:alpine AS runtime
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
