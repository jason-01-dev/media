import type { Core } from '@strapi/strapi';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    // Empty
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Bootstrap temporarily disabled for debugging
    strapi.log.info('Bootstrap disabled - Strapi loading...');
  },
};
