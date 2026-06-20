# API Documentation Setup

## 📖 Strapi Documentation Plugin

The `@strapi/plugin-documentation` (OpenAPI 3.0) is now enabled and will auto-generate full API documentation.

### Accessing the Documentation

Once Strapi is running (`npm run develop`), access the interactive documentation at:

- **Swagger UI (Interactive)**: http://localhost:1337/documentation
- **OpenAPI JSON**: http://localhost:1337/documentation/openapi.json
- **OpenAPI YAML**: http://localhost:1337/documentation/openapi.yaml

### Features

✅ **Automatic Generation**: All API endpoints, parameters, and response types are auto-generated from Strapi schemas  
✅ **Interactive Testing**: Try API endpoints directly from the Swagger UI  
✅ **Token Support**: Include your API token (from bootstrap startup) to test authenticated endpoints  
✅ **CORS Configured**: Frontend can fetch OpenAPI spec for dynamic integration  

### Example: Using the Frontend Token

The `Frontend-ReadOnly` token is created automatically on first startup. To use it:

1. Open http://localhost:1337/documentation
2. Click "Authorize" button (top-right)
3. Paste your token: `Bearer <YOUR_ACCESS_KEY>`
4. Try any endpoint marked as public-readable

### OpenAPI Export

To export OpenAPI spec for external tools (e.g., Postman, Code Generators):

```bash
# Fetch and save OpenAPI JSON
curl http://localhost:1337/documentation/openapi.json > openapi.json

# Fetch OpenAPI YAML
curl http://localhost:1337/documentation/openapi.yaml > openapi.yaml
```

### Customization

Edit `config/plugins.ts` to customize:
- API title & description
- Servers (dev/prod URLs)
- External documentation links
- Authentication config

See full plugin documentation:  
https://docs.strapi.io/dev-docs/plugins/documentation

---

## 🚀 Next: Frontend Integration

With the token and OpenAPI docs ready, frontend can:

1. **Fetch API Token** from `.env`:
   ```javascript
   const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
   const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
   ```

2. **Fetch Content Types**:
   ```bash
   curl -H "Authorization: Bearer $TOKEN" http://localhost:1337/api/articles
   ```

3. **Generate Client SDK** (optional, using Strapi TypeScript SDK or similar):
   ```bash
   npm install @strapi/sdk-js
   ```

See `media-frontend/` for Next.js integration example.
