FROM node:12.8.0

WORKDIR /opt

ADD . /opt/
RUN npm install
RUN npm run build


CMD npm start
