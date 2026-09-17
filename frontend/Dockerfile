FROM node:20-alpine AS build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM nginx:alpine
ENV PORT=80
ENV BACKEND_URL=http://backend:8080
ENV NGINX_ENVSUBST_FILTER="^(PORT|BACKEND_URL)$"
COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/templates/default.conf.template
RUN printf '#!/bin/sh\nexport BACKEND_URL=$(echo "$BACKEND_URL" | sed "s:/*$::")\n' > /docker-entrypoint.d/05-clean-url.sh && chmod +x /docker-entrypoint.d/05-clean-url.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
