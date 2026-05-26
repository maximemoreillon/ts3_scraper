FROM ghcr.io/puppeteer/puppeteer:21.2.1
USER root

WORKDIR /usr/src/app
COPY . .
RUN npm install
CMD [ "npm", "run", "start"]
