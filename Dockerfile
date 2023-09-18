FROM ghcr.io/puppeteer/puppeteer:16.1.0
USER root

WORKDIR /usr/src/app
COPY . .
RUN npm install
CMD [ "npm", "run", "start"]
