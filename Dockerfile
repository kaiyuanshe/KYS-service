FROM ghcr.io/puppeteer/puppeteer:latest

USER root

RUN mkdir /home/pptruser/app
WORKDIR /home/pptruser/app

COPY package.json /home/pptruser/app
RUN npm i --force

COPY . /home/pptruser/app
RUN npm run build

EXPOSE 8080
CMD ["npm", "start"]