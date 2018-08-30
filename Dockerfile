FROM node:10.9.0-alpine

RUN mkdir -p /opt/app

# set node enviroment, default to production
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# default to port 3000, 9229 for debug
# use port 3000 because of non root 'node' user
ARG PORT=3000
ENV PORT $PORT
EXPOSE $PORT 9229

# instal latest npm version for speed and fixes
RUN npm i npm@latest -g

WORKDIR /opt
COPY package.json package-lock.json* ./
RUN npm install && npm cache clean --force
ENV PATH /opt/node_modules/.bin:$PATH

# check every 30s to ensure this service returns HTTP 200
HEALTHCHECK --interval=30s CMD node healthcheck.js

# copy in source code
WORKDIR /opt/app
COPY . /opt/app

USER node

CMD [ "node", "src/index.js" ]
