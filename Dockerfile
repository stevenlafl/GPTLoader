FROM node:latest AS builder

WORKDIR /tmp
# Install app dependencies
COPY package.json package-lock.json /tmp/
RUN npm install

COPY ./ /tmp
RUN npm run build

FROM node:latest AS production

ENV NODE_ENV=production
ENV LOG_LEVEL=silent
ENV OPENAI_API_KEY=
ENV OPENAI_ORGANIZATION=

# Create app directory
RUN mkdir -p /opt/gptloader
COPY --from=builder /tmp/dist /opt/gptloader
COPY package.json package-lock.json /opt/gptloader/
COPY entrypoint.sh /opt/gptloader/
RUN npm install --prefix /opt/gptloader

# The user's app will be mounted here
VOLUME /app
WORKDIR /app
ENTRYPOINT ["/opt/gptloader/entrypoint.sh"]