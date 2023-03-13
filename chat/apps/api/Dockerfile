# Base image
FROM node:18-alpine as base

# Create app directory
WORKDIR /usr/src/app

# Copy metadata files
COPY --chown=node:node /*.json ./

# Install app dependencies
RUN npm ci 

# Bundle app source
COPY --chown=node:node /apps/api/ ./apps/api/



FROM base as dev

ENV NODE_ENV=development

# Launch 
CMD ["npm", "run", "start:dev", "api"]



FROM base as prod

# Optimizations
ENV NODE_ENV=production

RUN npm run build api

# Launch 
CMD ["node", "dist/apps/api/main.js"]

