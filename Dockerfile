# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.10.0

FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app

COPY package.json .
COPY npm-shrinkwrap.json .
RUN npm ci --omit=dev

USER node

COPY .env .
COPY src src

CMD node src/index.js
