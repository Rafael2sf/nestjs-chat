# Base image
FROM node:18-alpine as dev

# Create app directory
WORKDIR /usr/src/app

# Copy metadata files
COPY --chown=node:node /*.json ./

# Install app dependencies
RUN npm ci

# Bundle app source
COPY --chown=node:node /apps/chat/ ./apps/chat/

# Launch
CMD ["npm", "run","start:dev", "chat"]

