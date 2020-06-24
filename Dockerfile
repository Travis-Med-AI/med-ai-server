FROM docker:dind
FROM node:12.8.0

RUN apt-get update
RUN apt-get install 
WORKDIR /opt

ADD . /opt/
RUN npm install
RUN npm run build


CMD npm start
