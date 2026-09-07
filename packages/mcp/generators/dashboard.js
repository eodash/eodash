import {
  DEFAULT_STAC_ENDPOINT,
  DEFAULT_BRAND_NAME,
  getEodashVersion,
  getAvailableTemplates,
} from "../helpers.js";
import { generateSpaFiles } from "./dashboard/spa.js";
import { generateVitepressFiles } from "./dashboard/vitepress.js";
import { generateWebcomponentFiles } from "./dashboard/webcomponent.js";

const DOCKERFILE_SPA = `FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;

const DOCKERFILE_VITEPRESS = `FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run docs:build

FROM nginx:alpine
COPY --from=builder /app/docs/.vitepress/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;

const NGINX_CONF = `server {
  listen 80;
  server_name localhost;
  location / {
    root /usr/share/nginx/html;
    index index.html;
    try_files $uri $uri/ /index.html;
  }
}
`;

const GITIGNORE = `node_modules
dist
.eodash
.env
.DS_Store
*.local
`;

/**
 * Scaffold eodash dashboard projects: SPA, VitePress Narratives, or Web Component.
 */
export function scaffoldDashboard({
  name = "my-eo-dashboard",
  projectType = "standalone-spa",
  stacEndpoint = DEFAULT_STAC_ENDPOINT,
  template = "lite",
  brandName = DEFAULT_BRAND_NAME,
  brandColor = "#002742",
} = {}) {
  const eodashVersion = getEodashVersion();
  const availableTemplates = getAvailableTemplates();
  const templateImportList = availableTemplates.join(", ");

  const context = {
    name,
    stacEndpoint,
    template,
    brandName,
    brandColor,
    eodashVersion,
    templateImportList,
  };

  let files = {};
  if (projectType === "standalone-spa") {
    files = generateSpaFiles(context);
  } else if (projectType === "vitepress-narratives") {
    files = generateVitepressFiles(context);
  } else if (projectType === "web-component") {
    files = generateWebcomponentFiles(context);
  }

  files[".gitignore"] = GITIGNORE;
  files["Dockerfile"] =
    projectType === "vitepress-narratives"
      ? DOCKERFILE_VITEPRESS
      : DOCKERFILE_SPA;
  files["nginx.conf"] = NGINX_CONF;

  return {
    status: "generated_in_memory",
    filesWrittenToDisk: false,
    actionRequired: `IMPORTANT: Files are generated in memory and NOT written to disk yet. You MUST iterate over 'files' and write each file to disk under '${name}/' using your file-writing tool.`,
    projectType,
    name,
    files,
    instructions: `Project '${name}' generated with ${Object.keys(files).length} files. Write files to disk, then run 'cd ${name} && npm install && npm run ${projectType === "vitepress-narratives" ? "docs:dev" : "dev"}'.`,
  };
}
