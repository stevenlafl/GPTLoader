FROM node:latest

# Install app dependencies
COPY package.json package-lock.json /tmp/
RUN npm install --prefix /tmp

COPY ./ /tmp
RUN npm run build --prefix /tmp \
  && mv /tmp/dist /opt/gptloader \
  && mv /tmp/node_modules /opt/gptloader/node_modules

WORKDIR /app
CMD ["node", "/opt/gptloader/app.js"]