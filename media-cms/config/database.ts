import path from 'path';

export default ({ env }: { env: any }) => {
  const isProduction = env('NODE_ENV') === 'production';

  return {
    connection: {
      client: 'sqlite', // On force le client SQLite pour le développement et Render
      connection: {
        filename: isProduction
          ? '/data/data.db' // Le chemin absolu vers ton disque dur Render
          : path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')), // Ton SQLite local
      },
      useNullAsDefault: true,
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};