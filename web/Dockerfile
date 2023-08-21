FROM node:lts-alpine
WORKDIR /opt/app/
COPY . .
RUN npm ci
RUN npm run build

FROM node:lts-alpine
EXPOSE 3000
WORKDIR /opt/app/
COPY --from=0 /opt/app/package*.json ./
RUN npm ci --prod
COPY --from=0 /opt/app/.dist/ ./
CMD npm run start