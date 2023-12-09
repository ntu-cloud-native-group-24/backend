FROM node:20-alpine

RUN apk add --no-cache tini

RUN mkdir /app
WORKDIR /app
COPY package.json yarn.lock /app
RUN yarn install --frozen-lockfile
COPY . /app
RUN yarn build

CMD ["tini", "--", "yarn", "start"]
