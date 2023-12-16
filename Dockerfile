FROM node:20-alpine

RUN apk add --no-cache tini

RUN mkdir /app
WORKDIR /app
COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

USER node
CMD ["tini", "--", "yarn", "start"]
